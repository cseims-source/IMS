import express from 'express';
import { 
    getStudents, 
    getStudentStats,
    getStudentsByStream, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    bulkDeleteStudents,
    getStudentProfile, 
    getStudentByIdForView, 
    updateStudentProfilePhoto, 
    importStudents,
    getStudentFees, 
    addStudentFee, 
    updateFeeStatus, 
    getMyFees, 
    payMyFee,
    getAcademicAdvice,
    getFeesStats,
    exportFees,
    importFees
} from '../controllers/studentController.js';
import multer from 'multer';
import { protect, admin, teacherOrAdmin, canViewStudentProfile } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// --- Profile Routes ---
router.route('/profile').get(protect, getStudentProfile);
router.route('/profile/photo').put(protect, updateStudentProfilePhoto);
router.route('/profile/fees').get(protect, getMyFees);
router.route('/profile/fees/:feeId/pay').put(protect, payMyFee);

router.route('/fees/stats').get(protect, admin, getFeesStats);
router.route('/fees/export').get(protect, admin, exportFees);
router.route('/fees/import').post(protect, admin, upload.single('file'), importFees);

router.post('/academic-advisor', protect, getAcademicAdvice);

// --- Admin/Teacher Routes ---
router.get('/stats', protect, teacherOrAdmin, getStudentStats);
router.route('/bulk-delete').post(protect, admin, bulkDeleteStudents);
router.route('/import').post(protect, admin, importStudents);
router.route('/').get(protect, teacherOrAdmin, getStudents).post(protect, admin, addStudent);
router.route('/stream/:streamName').get(protect, teacherOrAdmin, getStudentsByStream);

router.route('/:id')
    .get(protect, canViewStudentProfile, getStudentByIdForView)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

router.route('/:id/fees')
    .get(protect, admin, getStudentFees) 
    .post(protect, admin, addStudentFee); 

router.route('/:id/fees/:feeId').put(protect, admin, updateFeeStatus);

export default router;