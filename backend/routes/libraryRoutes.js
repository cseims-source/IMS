import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
    getBooks, addBook, updateBook, deleteBook, 
    getIssuedBooks, issueBook, returnBook,
    getAllTransactions
} from '../controllers/libraryController.js';

const router = express.Router();

router.route('/books').get(protect, admin, getBooks).post(protect, admin, addBook);
router.route('/books/:id').put(protect, admin, updateBook).delete(protect, admin, deleteBook);

router.route('/transactions/issued').get(protect, admin, getIssuedBooks);
router.route('/transactions/issue').post(protect, admin, issueBook);
router.route('/transactions/return').post(protect, admin, returnBook);
router.route('/transactions/all').get(protect, admin, getAllTransactions);


export default router;