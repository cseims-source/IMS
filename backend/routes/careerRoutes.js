import express from 'express';
import { getCareerAdvice } from '../controllers/careerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// This route is for students, so we just need `protect`
router.post('/ask-ai', protect, getCareerAdvice);

export default router;