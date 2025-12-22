
import express from 'express';
import { getAttendance, saveAttendance, getMyAttendance, getAttendanceForStudent, getAttendanceAnalytics } from '../controllers/attendanceController.js';
import { protect, teacherOrAdmin, checkStreamAssignment, canViewStudentProfile, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/analytics').get(protect, teacherOrAdmin, getAttendanceAnalytics);
router.route('/my-records').get(protect, getMyAttendance);
router.route('/student/:studentId').get(protect, canViewStudentProfile, getAttendanceForStudent);
router.route('/:streamName/:date').get(protect, teacherOrAdmin, checkStreamAssignment, getAttendance);
router.route('/').post(protect, teacherOrAdmin, checkStreamAssignment, saveAttendance);

export default router;