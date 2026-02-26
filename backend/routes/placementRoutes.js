import express from 'express';
import multer from 'multer';
import { 
    getCompanies, addCompany, updateCompany, deleteCompany,
    getJobs, addJob, updateJob, deleteJob,
    getApplications, addApplication,
    updateApplicationStatus,
    getPlacementStats,
    exportCompanies, exportJobs, exportApplications,
    importCompanies, importJobs
} from '../controllers/placementController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.route('/stats').get(protect, admin, getPlacementStats);

router.route('/export/companies').get(protect, admin, exportCompanies);
router.route('/export/jobs').get(protect, admin, exportJobs);
router.route('/export/applications').get(protect, admin, exportApplications);
router.route('/import/companies').post(protect, admin, upload.single('file'), importCompanies);
router.route('/import/jobs').post(protect, admin, upload.single('file'), importJobs);

router.route('/companies').get(protect, getCompanies).post(protect, admin, addCompany);
router.route('/companies/:id').put(protect, admin, updateCompany).delete(protect, admin, deleteCompany);

router.route('/jobs').get(protect, getJobs).post(protect, admin, addJob);
router.route('/jobs/:id').put(protect, admin, updateJob).delete(protect, admin, deleteJob);

router.route('/applications').get(protect, getApplications).post(protect, addApplication);
router.route('/applications/:id/status').put(protect, admin, updateApplicationStatus);

export default router;