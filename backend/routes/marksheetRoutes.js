import express from 'express';
import multer from 'multer';
import { getMarksheet, saveMarksheet, getMyMarksheets, getMarksheetsForStudent, getMarksheets, updateMarksheet, uploadMarksheets, downloadMarksheets, getMarksheetAnalytics } from '../controllers/marksheetController.js';
import { protect, teacherOrAdmin, canViewStudentProfile, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.route('/my-marksheets').get(protect, getMyMarksheets);
router.route('/student/:studentId').get(protect, canViewStudentProfile, getMarksheetsForStudent);
router.route('/analytics').get(protect, teacherOrAdmin, getMarksheetAnalytics);
router.route('/').get(protect, teacherOrAdmin, getMarksheets).post(protect, teacherOrAdmin, saveMarksheet);
router.route('/upload').post(protect, admin, upload.single('file'), uploadMarksheets);
router.route('/download').get(protect, admin, downloadMarksheets);
router.route('/:id').put(protect, admin, updateMarksheet);
router.route('/:studentId/:exam/:semester').get(protect, getMarksheet);

export default router;