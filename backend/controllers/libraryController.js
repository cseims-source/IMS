import Book from '../models/bookModel.js';
import User from '../models/userModel.js';
import LibraryTransaction from '../models/libraryTransactionModel.js';
import mongoose from 'mongoose';
import XLSX from 'xlsx';

// Book Controllers
export const getBooks = async (req, res) => {
    const { search, category, status } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;
    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { isbn: { $regex: search, $options: 'i' } }
        ];
    }
    const books = await Book.find(filter);
    res.json(books);
};

export const addBook = async (req, res) => {
    const { title, author, isbn, category } = req.body;
    const book = await Book.create({ title, author, isbn, category });
    res.status(201).json(book);
};

export const updateBook = async (req, res) => {
    const { title, author, isbn, category } = req.body;
    const book = await Book.findById(req.params.id);
    if (book) {
        book.title = title;
        book.author = author;
        book.isbn = isbn;
        book.category = category;
        const updatedBook = await book.save();
        res.json(updatedBook);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

export const deleteBook = async (req, res) => {
    const book = await Book.findById(req.params.id);
    if (book) {
        if (book.status === 'Issued') {
            return res.status(400).json({ message: 'Cannot delete an issued book' });
        }
        await book.deleteOne();
        res.json({ message: 'Book removed' });
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
};

// Transaction Controllers
export const getIssuedBooks = async (req, res) => {
    // Find all currently issued books (status is 'Issued')
    const issuedBooks = await Book.find({ status: 'Issued' });
    
    // Find the latest "Issue" transaction for each of these books
    const transactions = await LibraryTransaction.find({
      book: { $in: issuedBooks.map(b => b._id) },
      type: 'Issue',
    })
    .sort({ createdAt: -1 })
    .populate('book', 'title author')
    .populate('user', 'name email');

    // Deduplicate transactions to get only the latest one per book
    const latestTransactions = transactions.reduce((acc, current) => {
      const bookId = current.book._id.toString();
      if (!acc[bookId]) {
        acc[bookId] = current;
      }
      return acc;
    }, {});

    res.json(Object.values(latestTransactions));
};

export const getAllTransactions = async (req, res) => {
    try {
        const transactions = await LibraryTransaction.find({})
            .sort({ createdAt: -1 }) // Show most recent first
            .populate('book', 'title')
            .populate('user', 'name');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMyTransactions = async (req, res) => {
    try {
        const transactions = await LibraryTransaction.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('book', 'title author');
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMyIssuedBooks = async (req, res) => {
    try {
        const issuedBooks = await Book.find({ status: 'Issued' });
        const transactions = await LibraryTransaction.find({
            book: { $in: issuedBooks.map(b => b._id) },
            type: 'Issue',
            user: req.user._id
        })
            .sort({ createdAt: -1 })
            .populate('book', 'title author')
            .populate('user', 'name email');

        const latestTransactions = transactions.reduce((acc, current) => {
            const bookId = current.book._id.toString();
            if (!acc[bookId]) {
                acc[bookId] = current;
            }
            return acc;
        }, {});

        res.json(Object.values(latestTransactions));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const issueBook = async (req, res) => {
    const { bookId, userId } = req.body;
    
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const book = await Book.findById(bookId).session(session);
        if (!book || book.status !== 'Available') {
            throw new Error('Book not available');
        }
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new Error('User not found');
        }

        book.status = 'Issued';
        await book.save({ session });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14); // 14-day loan period

        const transaction = await LibraryTransaction.create([{
            book: bookId,
            user: userId,
            type: 'Issue',
            dueDate,
        }], { session });

        await session.commitTransaction();
        res.status(201).json(transaction);

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

export const returnBook = async (req, res) => {
    const { transactionId } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const issueTransaction = await LibraryTransaction.findById(transactionId).session(session);
        if (!issueTransaction || issueTransaction.type !== 'Issue') {
            throw new Error('Invalid issue transaction ID');
        }
        
        const book = await Book.findById(issueTransaction.book).session(session);
        if (!book || book.status !== 'Issued') {
             throw new Error('Book is not currently issued');
        }

        book.status = 'Available';
        await book.save({ session });

        await LibraryTransaction.create([{
            book: issueTransaction.book,
            user: issueTransaction.user,
            type: 'Return'
        }], { session });

        await session.commitTransaction();
        res.json({ message: 'Book returned successfully' });

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message });
    } finally {
        session.endSession();
    }
};

export const exportBooks = async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        const rows = books.map(b => ({
            title: b.title,
            author: b.author,
            isbn: b.isbn,
            category: b.category,
            status: b.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="library-books.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

export const exportTransactions = async (req, res) => {
    try {
        const transactions = await LibraryTransaction.find({})
            .populate('book', 'title')
            .populate('user', 'name email')
            .lean();
        const rows = transactions.map(t => ({
            book: t.book?.title || '',
            user: t.user?.name || '',
            email: t.user?.email || '',
            type: t.type,
            dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : '',
            createdAt: t.createdAt ? new Date(t.createdAt).toISOString() : ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="library-transactions.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

export const importBooks = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const inserts = [];

        rows.forEach((row, index) => {
            const rowIndex = index + 2;
            const title = row.title || row.Title;
            const author = row.author || row.Author;
            const isbn = row.isbn || row.ISBN || '';
            const category = row.category || row.Category || '';

            if (!title || !author) {
                errors.push({ row: rowIndex, reason: 'Missing title or author.' });
                return;
            }

            inserts.push({ title, author, isbn: isbn || undefined, category });
        });

        if (inserts.length > 0) {
            await Book.insertMany(inserts, { ordered: false });
        }

        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};