import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { 
    getBooks, addBook, updateBook, deleteBook, 
    getIssuedBooks, issueBook, returnBook,
    getAllTransactions, getMyTransactions, getMyIssuedBooks,
    exportBooks, exportTransactions, importBooks
} from '../controllers/libraryController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.route('/books').get(protect, getBooks).post(protect, admin, addBook);
router.route('/books/:id').put(protect, admin, updateBook).delete(protect, admin, deleteBook);

router.route('/transactions/issued').get(protect, admin, getIssuedBooks);
router.route('/transactions/issue').post(protect, admin, issueBook);
router.route('/transactions/return').post(protect, admin, returnBook);
router.route('/transactions/all').get(protect, admin, getAllTransactions);
router.route('/transactions/export').get(protect, admin, exportTransactions);
router.route('/books/export').get(protect, admin, exportBooks);
router.route('/books/import').post(protect, admin, upload.single('file'), importBooks);
router.route('/transactions/my').get(protect, getMyTransactions);
router.route('/transactions/my-issued').get(protect, getMyIssuedBooks);


export default router;