import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getVehicles, addVehicle, updateVehicle, deleteVehicle,
    getRoutes, addRoute, updateRoute, deleteRoute,
    getAllocations, allocateStudent, deallocateStudent
} from '../controllers/transportController.js';

const router = express.Router();

// All routes in this file are admin-protected
router.use(protect, admin);

// Vehicle routes
router.route('/vehicles').get(getVehicles).post(addVehicle);
router.route('/vehicles/:id').put(updateVehicle).delete(deleteVehicle);

// Route routes
router.route('/routes').get(getRoutes).post(addRoute);
router.route('/routes/:id').put(updateRoute).delete(deleteRoute);

// Allocation routes
router.route('/allocations').get(getAllocations).post(allocateStudent);
router.route('/allocations/:id').delete(deallocateStudent);

export default router;