import express from 'express';
import multer from 'multer';
import { getAttendance, saveAttendance, getMyAttendance, getAttendanceAnalytics, getStudentAttendanceSummary, updateAttendanceRecord, uploadAttendance, downloadAttendance } from '../controllers/attendanceController.js';
import { protect, teacherOrAdmin, checkStreamAssignment, canViewStudentProfile, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.route('/analytics').get(protect, teacherOrAdmin, getAttendanceAnalytics);
router.route('/summary/:studentId').get(protect, canViewStudentProfile, getStudentAttendanceSummary);
router.route('/my-records').get(protect, getMyAttendance);
router.route('/download').get(protect, admin, downloadAttendance);
router.route('/upload').post(protect, admin, upload.single('file'), uploadAttendance);
router.route('/:id').put(protect, admin, updateAttendanceRecord);
router.route('/:streamName/:date').get(protect, teacherOrAdmin, checkStreamAssignment, getAttendance);
router.route('/').post(protect, teacherOrAdmin, checkStreamAssignment, saveAttendance);

export default router;