import express from 'express';
import multer from 'multer';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
    getVehicles, addVehicle, updateVehicle, deleteVehicle,
    getRoutes, addRoute, updateRoute, deleteRoute,
    getAllocations, allocateStudent, deallocateStudent,
    getMyAllocation, exportAllocations, importAllocations
} from '../controllers/transportController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Student access
router.get('/routes', protect, getRoutes);
router.get('/my-allocation', protect, getMyAllocation);

// All routes below are admin-protected
router.use(protect, admin);

// Vehicle routes
router.route('/vehicles').get(getVehicles).post(addVehicle);
router.route('/vehicles/:id').put(updateVehicle).delete(deleteVehicle);

// Route routes
router.route('/routes').post(addRoute);
router.route('/routes/:id').put(updateRoute).delete(deleteRoute);

// Allocation routes
router.route('/allocations').get(getAllocations).post(allocateStudent);
router.route('/allocations/:id').delete(deallocateStudent);
router.route('/allocations/export').get(exportAllocations);
router.route('/allocations/import').post(upload.single('file'), importAllocations);

export default router;