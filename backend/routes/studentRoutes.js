import express from 'express';
import { 
    getStudents, 
    getStudentStats,
    getStudentsByStream, 
    addStudent, 
    updateStudent, 
    deleteStudent, 
    getStudentProfile, 
    getStudentByIdForView, 
    updateStudentProfilePhoto, 
    importStudents,
    getStudentFees, 
    addStudentFee, 
    updateFeeStatus, 
    getMyFees, 
    payMyFee,
    getAcademicAdvice
} from '../controllers/studentController.js';
import { protect, admin, teacherOrAdmin, canViewStudentProfile } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Profile Routes ---
router.route('/profile').get(protect, getStudentProfile);
router.route('/profile/photo').put(protect, updateStudentProfilePhoto);
router.route('/profile/fees').get(protect, getMyFees);
router.route('/profile/fees/:feeId/pay').put(protect, payMyFee);

router.post('/academic-advisor', protect, getAcademicAdvice);

// --- Admin/Teacher Routes ---
router.get('/stats', protect, teacherOrAdmin, getStudentStats);
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