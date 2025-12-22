import express from 'express';
import { getCourses, getCourseByName, addCourse, updateCourse, deleteCourse, addSubject, updateSubject, deleteSubject, getAllSubjects } from '../controllers/courseController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all unique subjects
router.route('/all-subjects').get(protect, admin, getAllSubjects);

// Get course by name (for marksheet entry)
router.route('/name/:name').get(protect, teacherOrAdmin, getCourseByName);

// Course routes
router.route('/').get(protect, getCourses).post(protect, admin, addCourse);
router.route('/:id').put(protect, admin, updateCourse).delete(protect, admin, deleteCourse);

// Subject routes nested under courses
router.route('/:courseId/subjects').post(protect, admin, addSubject);
router.route('/:courseId/subjects/:subjectId').put(protect, admin, updateSubject).delete(protect, admin, deleteSubject);

export default router;