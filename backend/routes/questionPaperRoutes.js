import express from 'express';
import multer from 'multer';
import { 
    getQuestionPapers, 
    getQuestionPaperMetadata,
    addQuestionPaper, 
    deleteQuestionPaper,
    generateAIQuestions,
    exportQuestionPapers,
    importQuestionPapers
} from '../controllers/questionPaperController.js';
import { protect, teacherOrAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.route('/')
    .get(protect, getQuestionPapers)
    .post(protect, teacherOrAdmin, addQuestionPaper);

router.get('/metadata', protect, getQuestionPaperMetadata);
router.get('/export', protect, teacherOrAdmin, exportQuestionPapers);
router.post('/import', protect, teacherOrAdmin, upload.single('file'), importQuestionPapers);
router.route('/generate-ai').post(protect, teacherOrAdmin, generateAIQuestions);
router.route('/:id').delete(protect, teacherOrAdmin, deleteQuestionPaper);

export default router;