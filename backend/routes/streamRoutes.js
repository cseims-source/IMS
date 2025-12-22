import express from 'express';
import { 
    getStreams, getStreamByName, addStream, updateStream, deleteStream, 
    addSemester, deleteSemester,
    addSubject, updateSubject, deleteSubject, 
    getAllSubjects, getSubjectsForSemester
} from '../controllers/streamController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public or Semi-Public Routes ---
router.route('/all-subjects').get(protect, admin, getAllSubjects);
router.route('/name/:name').get(protect, teacherOrAdmin, getStreamByName);
router.route('/:streamName/:semester/subjects').get(protect, teacherOrAdmin, getSubjectsForSemester);


// --- Admin-Only Routes ---

// Stream routes
router.route('/').get(protect, getStreams).post(protect, admin, addStream);
router.route('/:id').put(protect, admin, updateStream).delete(protect, admin, deleteStream);

// Semester routes nested under streams
router.route('/:streamId/semesters').post(protect, admin, addSemester);
router.route('/:streamId/semesters/:semesterId').delete(protect, admin, deleteSemester);

// Subject routes nested under semesters
router.route('/:streamId/semesters/:semesterId/subjects').post(protect, admin, addSubject);
router.route('/:streamId/semesters/:semesterId/subjects/:subjectId').put(protect, admin, updateSubject).delete(protect, admin, deleteSubject);

export default router;