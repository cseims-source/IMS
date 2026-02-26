import express from 'express';
import multer from 'multer';
import { submitInquiry, getInquiries, updateInquiry, deleteInquiry, getInquiryStats, exportInquiries, importInquiries } from '../controllers/admissionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Public submission
router.post('/inquiry', submitInquiry);

// Admin management
router.route('/requests')
    .get(protect, admin, getInquiries);

router.route('/stats').get(protect, admin, getInquiryStats);
router.route('/export').get(protect, admin, exportInquiries);
router.route('/import').post(protect, admin, upload.single('file'), importInquiries);

router.route('/requests/:id')
    .put(protect, admin, updateInquiry)
    .delete(protect, admin, deleteInquiry);

export default router;