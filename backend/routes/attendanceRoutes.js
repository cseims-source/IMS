import express from 'express';
import { getAttendance, saveAttendance, getMyAttendance, getAttendanceAnalytics, getStudentAttendanceSummary } from '../controllers/attendanceController.js';
import { protect, teacherOrAdmin, checkStreamAssignment, canViewStudentProfile } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, teacherOrAdmin, getAttendanceAnalytics);
router.route('/summary/:studentId').get(protect, canViewStudentProfile, getStudentAttendanceSummary);
router.route('/my-records').get(protect, getMyAttendance);
router.route('/:streamName/:date').get(protect, teacherOrAdmin, checkStreamAssignment, getAttendance);
router.route('/').post(protect, teacherOrAdmin, checkStreamAssignment, saveAttendance);

export default router;