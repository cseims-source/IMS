import express from 'express';
import { 
    getDashboardStats, 
    getTeacherDashboardStats, 
    getDashboardCharts, 
    getStudentDashboardSummary, 
    getTeacherInsights, 
    generateQuiz, 
    globalSearch 
} from '../controllers/dashboardController.js';
import { protect, admin, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Publicly authenticated routes
router.get('/global-search', protect, globalSearch);

// Admin routes
router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/charts').get(protect, admin, getDashboardCharts);

// Teacher routes
router.route('/teacher-stats').get(protect, teacherOrAdmin, getTeacherDashboardStats);
router.route('/teacher-insights').get(protect, teacherOrAdmin, getTeacherInsights);
router.route('/teacher-tools/generate-quiz').post(protect, teacherOrAdmin, generateQuiz);

// Student routes
router.route('/student-summary').get(protect, getStudentDashboardSummary);

export default router;