import express from 'express';
import { 
    getQuestionPapers, 
    getQuestionPaperMetadata,
    addQuestionPaper, 
    deleteQuestionPaper,
    generateAIQuestions
} from '../controllers/questionPaperController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, getQuestionPapers)
    .post(protect, teacherOrAdmin, addQuestionPaper);

router.get('/metadata', protect, getQuestionPaperMetadata);
router.route('/generate-ai').post(protect, teacherOrAdmin, generateAIQuestions);
router.route('/:id').delete(protect, teacherOrAdmin, deleteQuestionPaper);

export default router;