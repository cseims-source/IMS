import express from 'express';
import { getFaculty, addFaculty, updateFaculty, deleteFaculty, importFaculty } from '../controllers/facultyController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Allow both admins and teachers to get the faculty list
router.route('/').get(protect, teacherOrAdmin, getFaculty).post(protect, admin, addFaculty);

// Import route
router.route('/import').post(protect, admin, importFaculty);

// Keep modification routes admin-only
router.route('/:id').put(protect, admin, updateFaculty).delete(protect, admin, deleteFaculty);

export default router;