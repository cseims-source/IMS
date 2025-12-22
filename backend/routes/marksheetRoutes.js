import express from 'express';
import { getMarksheet, saveMarksheet, getMyMarksheets, getMarksheetsForStudent } from '../controllers/marksheetController.js';
import { protect, teacherOrAdmin, canViewStudentProfile } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/my-marksheets').get(protect, getMyMarksheets);
router.route('/student/:studentId').get(protect, canViewStudentProfile, getMarksheetsForStudent);
router.route('/:studentId/:exam/:semester').get(protect, getMarksheet);
router.route('/').post(protect, teacherOrAdmin, saveMarksheet);

export default router;