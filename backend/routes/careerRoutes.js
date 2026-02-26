import express from 'express';
import { getCareerAdvice, getCareerMetrics } from '../controllers/careerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is for students, so we just need `protect`
router.post('/ask-ai', protect, getCareerAdvice);
router.get('/metrics', protect, getCareerMetrics);

export default router;