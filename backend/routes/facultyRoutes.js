import express from 'express';
import { 
    getFaculty, 
    getFacultyStats, 
    addFaculty, 
    updateFaculty, 
    deleteFaculty, 
    importFaculty 
} from '../controllers/facultyController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats', protect, teacherOrAdmin, getFacultyStats);
router.route('/import').post(protect, admin, importFaculty);

router.route('/')
    .get(protect, teacherOrAdmin, getFaculty)
    .post(protect, admin, addFaculty);

router.route('/:id')
    .put(protect, admin, updateFaculty)
    .delete(protect, admin, deleteFaculty);

export default router;