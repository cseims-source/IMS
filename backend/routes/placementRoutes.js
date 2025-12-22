import express from 'express';
import { 
    getCompanies, addCompany, updateCompany, deleteCompany,
    getJobs, addJob, updateJob, deleteJob,
    getApplications, addApplication 
} from '../controllers/placementController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/companies').get(protect, getCompanies).post(protect, admin, addCompany);
router.route('/companies/:id').put(protect, admin, updateCompany).delete(protect, admin, deleteCompany);

router.route('/jobs').get(protect, getJobs).post(protect, admin, addJob);
router.route('/jobs/:id').put(protect, admin, updateJob).delete(protect, admin, deleteJob);

router.route('/applications').get(protect, getApplications).post(protect, addApplication);

export default router;