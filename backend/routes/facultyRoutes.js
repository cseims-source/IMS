import express from 'express';
import multer from 'multer';
import { 
    getFaculty, 
    getFacultyStats, 
    addFaculty, 
    updateFaculty, 
    deleteFaculty, 
    importFaculty,
    exportFaculty,
    discontinueFaculty,
    bulkDeleteFaculty,
    bulkDiscontinueFaculty
} from '../controllers/facultyController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/stats', protect, teacherOrAdmin, getFacultyStats);
router.route('/export').get(protect, admin, exportFaculty);
router.route('/import').post(protect, admin, upload.single('file'), importFaculty);
router.route('/bulk-delete').post(protect, admin, bulkDeleteFaculty);
router.route('/bulk-discontinue').post(protect, admin, bulkDiscontinueFaculty);

router.route('/')
    .get(protect, teacherOrAdmin, getFaculty)
    .post(protect, admin, addFaculty);

router.route('/:id')
    .put(protect, admin, updateFaculty)
    .delete(protect, admin, deleteFaculty);

router.route('/:id/discontinue')
    .put(protect, admin, discontinueFaculty);

export default router;