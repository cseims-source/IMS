import express from 'express';
import multer from 'multer';
import { 
    getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
    placeOrder, getMyOrders, getAllOrders, updateOrderStatus,
    getCanteenStats, exportMenuItems, exportOrders, importMenuItems
} from '../controllers/canteenController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

// --- Menu Item Routes ---
router.route('/items')
    .get(protect, getMenuItems) // All authenticated users can view
    .post(protect, admin, addMenuItem); // Admin can add

router.route('/items/:id')
    .put(protect, admin, updateMenuItem) // Admin can update
    .delete(protect, admin, deleteMenuItem); // Admin can delete

router.route('/items/export').get(protect, admin, exportMenuItems);
router.route('/items/import').post(protect, admin, upload.single('file'), importMenuItems);

router.route('/stats').get(protect, admin, getCanteenStats);

// --- Order Routes ---
router.route('/orders')
    .get(protect, admin, getAllOrders) // Admin gets all orders
    .post(protect, placeOrder); // Student places order (role checked in controller)

router.route('/orders/my').get(protect, getMyOrders); // Student gets their orders

router.route('/orders/export').get(protect, admin, exportOrders);

router.route('/orders/:id/status').put(protect, admin, updateOrderStatus); // Admin updates order status

export default router;