import express from 'express';
import { getAttendanceReport, getFeesReport, getAcademicReport, getAiInsights } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// All report routes are admin-only
router.use(protect, admin);

router.get('/attendance', getAttendanceReport);
router.get('/fees', getFeesReport);
router.get('/academic', getAcademicReport);
router.post('/ai-insights', getAiInsights);

export default router;