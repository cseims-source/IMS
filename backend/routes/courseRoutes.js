import express from 'express';
import multer from 'multer';
import { getCourses, getCourseByName, addCourse, updateCourse, deleteCourse, addSubject, updateSubject, deleteSubject, getAllSubjects, exportCourses, importCourses } from '../controllers/courseController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// Get all unique subjects
router.route('/all-subjects').get(protect, admin, getAllSubjects);
router.route('/export').get(protect, admin, exportCourses);
router.route('/import').post(protect, admin, upload.single('file'), importCourses);

// Get course by name (for marksheet entry)
router.route('/name/:name').get(protect, teacherOrAdmin, getCourseByName);

// Course routes
router.route('/').get(protect, getCourses).post(protect, admin, addCourse);
router.route('/:id').put(protect, admin, updateCourse).delete(protect, admin, deleteCourse);

// Subject routes nested under courses
router.route('/:courseId/subjects').post(protect, admin, addSubject);
router.route('/:courseId/subjects/:subjectId').put(protect, admin, updateSubject).delete(protect, admin, deleteSubject);

export default router;