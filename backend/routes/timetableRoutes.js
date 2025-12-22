
import express from 'express';
import { getTimetable, updateTimetable, suggestTimetable, getTeacherScheduleByDate } from '../controllers/timetableController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// New route for AI suggestion
router.post('/suggest/:streamName/:semester', protect, admin, suggestTimetable);

// Route for teachers to get their daily schedule for attendance
router.get('/teacher/daily-schedule', protect, teacherOrAdmin, getTeacherScheduleByDate);

router.route('/:streamName/:semester')
    .get(protect, getTimetable)
    .put(protect, admin, updateTimetable);

export default router;
