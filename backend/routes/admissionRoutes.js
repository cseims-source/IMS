import express from 'express';
import { submitInquiry, getInquiries, updateInquiry, deleteInquiry } from '../controllers/admissionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public submission
router.post('/inquiry', submitInquiry);

// Admin management
router.route('/requests')
    .get(protect, admin, getInquiries);

router.route('/requests/:id')
    .put(protect, admin, updateInquiry)
    .delete(protect, admin, deleteInquiry);

export default router;