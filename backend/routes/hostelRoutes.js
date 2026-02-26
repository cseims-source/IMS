import express from 'express';
import multer from 'multer';
import { 
	getRooms, addRoom, updateRoom, deleteRoom,
	getAllocations, addAllocation, deleteAllocation,
	getMyAllocation,
	getHostelStats,
	exportRooms, exportAllocations, importRooms
} from '../controllers/hostelController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.get('/allocations/my', protect, getMyAllocation);

router.route('/stats').get(protect, admin, getHostelStats);
router.route('/rooms/export').get(protect, admin, exportRooms);
router.route('/rooms/import').post(protect, admin, upload.single('file'), importRooms);
router.route('/allocations/export').get(protect, admin, exportAllocations);

router.route('/rooms')
	.get(protect, admin, getRooms)
	.post(protect, admin, addRoom);
router.route('/rooms/:id')
	.put(protect, admin, updateRoom)
	.delete(protect, admin, deleteRoom);

router.route('/allocations')
	.get(protect, admin, getAllocations)
	.post(protect, admin, addAllocation);
router.route('/allocations/:id')
	.delete(protect, admin, deleteAllocation);

export default router;