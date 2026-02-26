import express from 'express';
import multer from 'multer';
import { getEvents, addEvent, updateEvent, deleteEvent, getEventStats, exportEvents, importEvents } from '../controllers/eventController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.route('/').get(protect, getEvents).post(protect, admin, addEvent);
router.route('/stats').get(protect, admin, getEventStats);
router.route('/export').get(protect, admin, exportEvents);
router.route('/import').post(protect, admin, upload.single('file'), importEvents);
router.route('/:id').put(protect, admin, updateEvent).delete(protect, admin, deleteEvent);

export default router;