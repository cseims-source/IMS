import Book from '../models/bookModel.js';
import User from '../models/userModel.js';
import LibraryTransaction from '../models/libraryTransactionModel.js';
import mongoose from 'mongoose';

// Book Controllers
export const getBooks = async (req, res) => {
    const books = await Book.find({});
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