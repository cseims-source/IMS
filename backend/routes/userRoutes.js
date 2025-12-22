
import express from 'express';
import { getPendingUsers, approveUser, denyUser, changeUserPassword } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for users to manage their own profile details
router.route('/profile/password').put(protect, changeUserPassword);

// Admin-only routes for managing other users
router.use(protect, admin);

router.get('/pending', getPendingUsers);
router.put('/:id/approve', approveUser);
router.delete('/:id/deny', denyUser);

export default router;
