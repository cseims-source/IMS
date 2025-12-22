import express from 'express';
import { getRooms, addRoom, getAllocations, addAllocation } from '../controllers/hostelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/rooms').get(protect, admin, getRooms).post(protect, admin, addRoom);
router.route('/allocations').get(protect, admin, getAllocations).post(protect, admin, addAllocation);

export default router;