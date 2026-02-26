import express from 'express';
import { getExams, createExam, updateExam, deleteExam, autoScheduleExams } from '../controllers/examController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getExams).post(protect, teacherOrAdmin, createExam);
router.route('/auto-schedule').post(protect, admin, autoScheduleExams);
router.route('/:id').put(protect, teacherOrAdmin, updateExam).delete(protect, admin, deleteExam);

export default router;
