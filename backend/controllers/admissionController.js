import AdmissionInquiry from '../models/admissionInquiryModel.js';
import Student from '../models/studentModel.js';
import XLSX from 'xlsx';

// @desc    Submit a full admission request
// @route   POST /api/admission/inquiry
// @access  Public
const submitInquiry = async (req, res) => {
    try {
        const inquiryData = req.body;

        if (!inquiryData.name || !inquiryData.mobile || !inquiryData.email || !inquiryData.course) {
            return res.status(400).json({ message: 'Core identity markers are mandatory.' });
        }

        const inquiry = await AdmissionInquiry.create(inquiryData);

        res.status(201).json({
            success: true,
            message: 'Onboarding request initialized. Our admissions team will review your dossier.',
            data: inquiry
        });
    } catch (error) {
        console.error("Admission Request Error:", error);
        res.status(500).json({ message: 'Server Protocol Error.' });
    }
};

// @desc    Get all admission requests
// @route   GET /api/admission/requests
// @access  Admin
const getInquiries = async (req, res) => {
    try {
        const { status, course, branch, academicYear, search, fromDate, toDate } = req.query;
        const filter = {};
        if (status && status !== 'All') filter.status = status;
        if (course && course !== 'All') filter.course = course;
        if (branch && branch !== 'All') filter.branch = branch;
        if (academicYear && academicYear !== 'All') filter.academicYear = academicYear;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } }
            ];
        }
        if (fromDate || toDate) {
            filter.createdAt = {};
            if (fromDate) filter.createdAt.$gte = new Date(fromDate);
            if (toDate) filter.createdAt.$lte = new Date(toDate);
        }

        const inquiries = await AdmissionInquiry.find(filter).sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Registry fetch failed.' });
    }
};

const getInquiryStats = async (req, res) => {
    try {
        const total = await AdmissionInquiry.countDocuments();
        const newCount = await AdmissionInquiry.countDocuments({ status: 'New' });
        const accepted = await AdmissionInquiry.countDocuments({ status: 'Accepted' });
        const rejected = await AdmissionInquiry.countDocuments({ status: 'Rejected' });
        const waiting = await AdmissionInquiry.countDocuments({ status: 'Waiting List' });
        const recent = await AdmissionInquiry.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });

        res.json({ total, newCount, accepted, rejected, waiting, recent });
    } catch (error) {
        res.status(500).json({ message: 'Stats aggregation failed.' });
    }
};

// @desc    Accept/Reject Inquiry and Sync with Registry
// @route   PUT /api/admission/requests/:id
// @access  Admin
const updateInquiry = async (req, res) => {
    try {
        const inquiry = await AdmissionInquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

        const { status, notes } = req.body;
        
        // LOGIC SYNC: If accepted, update OR create student node
        if (status === 'Accepted' && inquiry.status !== 'Accepted') {
            const email = inquiry.email.toLowerCase();
            const student = await Student.findOne({ email });

            if (student) {
                // Node exists (added via manual registry as Pending), upgrade to Approved
                student.status = 'Approved';
                await student.save();
            } else {
                // New lead from public form, initialize student profile
                const nameParts = inquiry.name.trim().split(/\s+/);
                const firstName = nameParts[0];
                const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

                await Student.create({
                    firstName,
                    lastName,
                    email: email,
                    phone: inquiry.mobile,
                    gender: inquiry.gender,
                    dob: inquiry.dob,
                    course: inquiry.course,
                    branch: inquiry.branch,
                    academicYear: inquiry.academicYear,
                    presentAddress: {
                        city: inquiry.city,
                        state: inquiry.state,
                        address: inquiry.address
                    },
                    education10th: inquiry.education10th,
                    lastExam: inquiry.lastExam,
                    status: 'Approved' // Synced with inquiry 'Accepted'
                });
            }
        }

        // Handle Rejection Sync
        if (status === 'Rejected' && inquiry.status !== 'Rejected') {
            const student = await Student.findOne({ email: inquiry.email.toLowerCase() });
            if (student) {
                student.status = 'Rejected';
                await student.save();
            }
        }

        inquiry.status = status || inquiry.status;
        inquiry.notes = notes !== undefined ? notes : inquiry.notes;
        await inquiry.save();

        res.json(inquiry);
    } catch (error) {
        console.error("Update Inquiry Error:", error);
        res.status(400).json({ message: 'Update protocol failed.' });
    }
};

const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await AdmissionInquiry.findById(req.params.id);
        if (inquiry) {
            await inquiry.deleteOne();
            res.json({ message: 'Request purged.' });
        } else {
            res.status(404).json({ message: 'Request not identified.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Purge error.' });
    }
};

const exportInquiries = async (req, res) => {
    try {
        const inquiries = await AdmissionInquiry.find({}).sort({ createdAt: -1 }).lean();
        const rows = inquiries.map(i => ({
            name: i.name,
            email: i.email,
            mobile: i.mobile,
            course: i.course,
            branch: i.branch,
            academicYear: i.academicYear,
            status: i.status,
            createdAt: i.createdAt ? new Date(i.createdAt).toISOString() : ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="admissions.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importInquiries = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const inserts = [];

        const incomingEmails = rows.map(r => (r.email || r.Email || '').toString().toLowerCase()).filter(Boolean);
        const existing = await AdmissionInquiry.find({ email: { $in: incomingEmails } }).select('email').lean();
        const existingEmails = new Set(existing.map(e => e.email.toLowerCase()));

        rows.forEach((row, index) => {
            const rowIndex = index + 2;
            const name = row.name || row.Name;
            const mobile = row.mobile || row.Mobile;
            const email = (row.email || row.Email || '').toString().toLowerCase();
            const course = row.course || row.Course;
            const branch = row.branch || row.Branch;
            const academicYear = row.academicYear || row.AcademicYear || row.academic_year;
            const state = row.state || row.State;
            const city = row.city || row.City;
            const address = row.address || row.Address;

            if (!name || !mobile || !email || !course || !state || !city) {
                errors.push({ row: rowIndex, reason: 'Missing required fields.' });
                return;
            }
            if (existingEmails.has(email)) {
                errors.push({ row: rowIndex, reason: 'Duplicate email.' });
                return;
            }

            inserts.push({
                name,
                mobile,
                email,
                gender: row.gender || row.Gender,
                dob: row.dob || row.DOB,
                course,
                branch,
                academicYear,
                state,
                city,
                address,
                parentName: row.parentName || row.ParentName,
                parentPhone: row.parentPhone || row.ParentPhone,
                status: row.status || 'New',
                notes: row.notes || ''
            });
            existingEmails.add(email);
        });

        if (inserts.length > 0) {
            await AdmissionInquiry.insertMany(inserts, { ordered: false });
        }

        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { submitInquiry, getInquiries, updateInquiry, deleteInquiry, getInquiryStats, exportInquiries, importInquiries };