import express from 'express';
import { 
    getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
    placeOrder, getMyOrders, getAllOrders, updateOrderStatus 
} from '../controllers/canteenController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Menu Item Routes ---
router.route('/items')
    .get(protect, getMenuItems) // All authenticated users can view
    .post(protect, admin, addMenuItem); // Admin can add

router.route('/items/:id')
    .put(protect, admin, updateMenuItem) // Admin can update
    .delete(protect, admin, deleteMenuItem); // Admin can delete

// --- Order Routes ---
router.route('/orders')
    .get(protect, admin, getAllOrders) // Admin gets all orders
    .post(protect, placeOrder); // Student places order (role checked in controller)

router.route('/orders/my').get(protect, getMyOrders); // Student gets their orders

router.route('/orders/:id/status').put(protect, admin, updateOrderStatus); // Admin updates order status

export default router;