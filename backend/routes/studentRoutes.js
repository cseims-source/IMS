import express from 'express';
import { 
    getStudents, 
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

// --- Profile Routes (for logged-in student) ---
router.route('/profile').get(protect, getStudentProfile);
router.route('/profile/photo').put(protect, updateStudentProfilePhoto);
router.route('/profile/fees').get(protect, getMyFees);
router.route('/profile/fees/:feeId/pay').put(protect, payMyFee);

// Route for AI Advisor
router.post('/academic-advisor', protect, getAcademicAdvice);


// --- Admin/Teacher Routes ---
router.route('/import').post(protect, admin, importStudents);
router.route('/').get(protect, teacherOrAdmin, getStudents).post(protect, admin, addStudent);
router.route('/stream/:streamName').get(protect, teacherOrAdmin, getStudentsByStream);

// Admin-only student modification and deletion, plus view for authorized users
router.route('/:id')
    .get(protect, canViewStudentProfile, getStudentByIdForView)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

// --- Fee Management Routes ---
router.route('/:id/fees')
    .get(protect, admin, getStudentFees) 
    .post(protect, admin, addStudentFee); 

router.route('/:id/fees/:feeId').put(protect, admin, updateFeeStatus);

export default router;