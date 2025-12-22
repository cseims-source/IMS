import PlacementCompany from '../models/placementCompanyModel.js';
import PlacementJob from '../models/placementJobModel.js';
import PlacementApplication from '../models/placementApplicationModel.js';

// --- Company Controllers ---
const getCompanies = async (req, res) => {
    const companies = await PlacementCompany.find({});
    res.json(companies);
};
const addCompany = async (req, res) => {
    const { name, sector } = req.body;
    const company = await PlacementCompany.create({ name, sector });
    res.status(201).json(company);
};
const updateCompany = async (req, res) => {
    const company = await PlacementCompany.findById(req.params.id);
    if(company) {
        company.name = req.body.name || company.name;
        company.sector = req.body.sector || company.sector;
        const updated = await company.save();
        res.json(updated);
    } else { res.status(404).json({ message: 'Company not found' }); }
};
const deleteCompany = async (req, res) => {
    const company = await PlacementCompany.findById(req.params.id);
    if(company) {
        // Add cleanup logic here if needed (e.g., delete associated jobs)
        await company.deleteOne();
        res.json({ message: 'Company removed' });
    } else { res.status(404).json({ message: 'Company not found' }); }
};


// --- Job Controllers ---
const getJobs = async (req, res) => {
    const jobs = await PlacementJob.find({}).populate('company', 'name');
    res.json(jobs);
};
const addJob = async (req, res) => {
    const { title, company, status } = req.body;
    const job = await PlacementJob.create({ title, company, status });
    const populatedJob = await PlacementJob.findById(job._id).populate('company', 'name');
    res.status(201).json(populatedJob);
};
const updateJob = async (req, res) => {
    const job = await PlacementJob.findById(req.params.id);
    if(job) {
        job.title = req.body.title || job.title;
        job.company = req.body.company || job.company;
        job.status = req.body.status || job.status;
        const updated = await job.save();
        const populated = await PlacementJob.findById(updated._id).populate('company', 'name');
        res.json(populated);
    } else { res.status(404).json({ message: 'Job not found' }); }
};
const deleteJob = async (req, res) => {
    const job = await PlacementJob.findById(req.params.id);
    if(job) {
        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } else { res.status(404).json({ message: 'Job not found' }); }
};


// --- Application Controllers ---
const getApplications = async (req, res) => {
    let query = {};
    if (req.user.role === 'Student') {
        query = { student: req.user._id };
    }
    
    let populateChain = [
        {
            path: 'job',
            populate: {
                path: 'company',
                model: 'PlacementCompany'
            }
        },
    ];

    if (req.user.role === 'Admin') {
        populateChain.push({
            path: 'student',
            select: 'name email'
        });
    }

    const applications = await PlacementApplication.find(query).populate(populateChain);
    res.json(applications);
};

const addApplication = async (req, res) => {
    const { job } = req.body;
    const studentId = req.user._id;

    // Check if already applied
    const existingApplication = await PlacementApplication.findOne({ job, student: studentId });
    if (existingApplication) {
        return res.status(400).json({ message: 'You have already applied for this job.' });
    }

    const application = await PlacementApplication.create({ job, student: studentId });
    res.status(201).json(application);
};

export { 
    getCompanies, addCompany, updateCompany, deleteCompany,
    getJobs, addJob, updateJob, deleteJob,
    getApplications, addApplication 
};