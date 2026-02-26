import PlacementCompany from '../models/placementCompanyModel.js';
import PlacementJob from '../models/placementJobModel.js';
import PlacementApplication from '../models/placementApplicationModel.js';
import XLSX from 'xlsx';

// --- Company Controllers ---
const getCompanies = async (req, res) => {
    const { search, sector } = req.query;
    const query = {};
    if (sector && sector !== 'All') query.sector = sector;
    if (search) query.name = { $regex: search, $options: 'i' };
    const companies = await PlacementCompany.find(query).sort({ name: 1 });
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
    const { status, company, search } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (company) query.company = company;
    if (search) query.title = { $regex: search, $options: 'i' };
    const jobs = await PlacementJob.find(query).populate('company', 'name');
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
    const { status, job } = req.query;
    if (status && status !== 'All') query.status = status;
    if (job) query.job = job;
    
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

const updateApplicationStatus = async (req, res) => {
    const { status } = req.body;
    const application = await PlacementApplication.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    application.status = status || application.status;
    const updated = await application.save();
    const populated = await PlacementApplication.findById(updated._id)
        .populate({ path: 'job', populate: { path: 'company', model: 'PlacementCompany' } })
        .populate({ path: 'student', select: 'name email' });
    res.json(populated);
};

const getPlacementStats = async (req, res) => {
    try {
        const companies = await PlacementCompany.countDocuments();
        const jobs = await PlacementJob.countDocuments();
        const applications = await PlacementApplication.countDocuments();
        const applied = await PlacementApplication.countDocuments({ status: 'Applied' });
        const shortlisted = await PlacementApplication.countDocuments({ status: 'Shortlisted' });
        const selected = await PlacementApplication.countDocuments({ status: 'Selected' });
        const rejected = await PlacementApplication.countDocuments({ status: 'Rejected' });
        res.json({ companies, jobs, applications, applied, shortlisted, selected, rejected });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load placement stats.' });
    }
};

const exportCompanies = async (req, res) => {
    try {
        const companies = await PlacementCompany.find({}).lean();
        const rows = companies.map(c => ({ name: c.name, sector: c.sector }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="placement-companies.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const exportJobs = async (req, res) => {
    try {
        const jobs = await PlacementJob.find({}).populate('company', 'name').lean();
        const rows = jobs.map(j => ({
            title: j.title,
            company: j.company?.name || '',
            status: j.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="placement-jobs.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const exportApplications = async (req, res) => {
    try {
        const applications = await PlacementApplication.find({})
            .populate({ path: 'job', populate: { path: 'company', model: 'PlacementCompany' } })
            .populate({ path: 'student', select: 'name email' })
            .lean();
        const rows = applications.map(a => ({
            student: a.student?.name || '',
            email: a.student?.email || '',
            job: a.job?.title || '',
            company: a.job?.company?.name || '',
            status: a.status,
            appliedAt: a.createdAt
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="placement-applications.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importCompanies = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const inserts = [];
        const errors = [];
        const incomingNames = rows.map(r => (r.name || r.Name || '').trim().toLowerCase()).filter(Boolean);
        const existing = await PlacementCompany.find({ name: { $regex: incomingNames.join('|'), $options: 'i' } }).select('name').lean();
        const existingNames = new Set(existing.map(e => e.name.toLowerCase()));

        rows.forEach((row, index) => {
            const name = row.name || row.Name;
            const sector = row.sector || row.Sector;
            if (!name) {
                errors.push({ row: index + 2, reason: 'Company name is required.' });
                return;
            }
            if (existingNames.has(name.toLowerCase())) {
                errors.push({ row: index + 2, reason: 'Company already exists.' });
                return;
            }
            inserts.push({ name, sector });
            existingNames.add(name.toLowerCase());
        });

        if (inserts.length > 0) {
            await PlacementCompany.insertMany(inserts);
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

const importJobs = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const inserts = [];
        const errors = [];

        for (const [index, row] of rows.entries()) {
            const title = row.title || row.Title;
            const companyName = row.company || row.Company;
            const status = row.status || row.Status || 'Open';

            if (!title || !companyName) {
                errors.push({ row: index + 2, reason: 'Title and company are required.' });
                continue;
            }

            const company = await PlacementCompany.findOne({ name: companyName });
            if (!company) {
                errors.push({ row: index + 2, reason: `Company "${companyName}" not found.` });
                continue;
            }

            inserts.push({ title, company: company._id, status });
        }

        if (inserts.length > 0) {
            await PlacementJob.insertMany(inserts);
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { 
    getCompanies, addCompany, updateCompany, deleteCompany,
    getJobs, addJob, updateJob, deleteJob,
    getApplications, addApplication,
    updateApplicationStatus,
    getPlacementStats,
    exportCompanies, exportJobs, exportApplications,
    importCompanies, importJobs
};