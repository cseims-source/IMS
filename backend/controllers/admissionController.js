import AdmissionInquiry from '../models/admissionInquiryModel.js';
import Student from '../models/studentModel.js';

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
        const inquiries = await AdmissionInquiry.find({}).sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Registry fetch failed.' });
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

export { submitInquiry, getInquiries, updateInquiry, deleteInquiry };