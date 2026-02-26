import express from 'express';
import multer from 'multer';
import { getNotices, addNotice, updateNotice, deleteNotice, getNoticeStats, exportNotices, importNotices } from '../controllers/noticeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.route('/').get(protect, getNotices).post(protect, admin, addNotice);
router.route('/stats').get(protect, admin, getNoticeStats);
router.route('/export').get(protect, admin, exportNotices);
router.route('/import').post(protect, admin, upload.single('file'), importNotices);
router.route('/:id').put(protect, admin, updateNotice).delete(protect, admin, deleteNotice);

export default router;