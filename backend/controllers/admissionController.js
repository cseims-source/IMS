import AdmissionInquiry from '../models/admissionInquiryModel.js';

// @desc    Submit a new admission inquiry
// @route   POST /api/admission/inquiry
// @access  Public
const submitInquiry = async (req, res) => {
    try {
        const { name, mobile, email, course, branch, state, city } = req.body;

        if (!name || !mobile || !email || !course || !state || !city) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        const inquiry = await AdmissionInquiry.create({
            name,
            mobile,
            email,
            course,
            branch,
            state,
            city
        });

        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully! Our admissions team will contact you soon.',
            data: inquiry
        });
    } catch (error) {
        console.error("Admission Inquiry Error:", error);
        res.status(500).json({ message: 'Server Error. Please try again later.' });
    }
};

// @desc    Get all admission inquiries
// @route   GET /api/admission/requests
// @access  Admin
const getInquiries = async (req, res) => {
    try {
        const inquiries = await AdmissionInquiry.find({}).sort({ createdAt: -1 });
        res.json(inquiries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update an inquiry status or notes
// @route   PUT /api/admission/requests/:id
// @access  Admin
const updateInquiry = async (req, res) => {
    try {
        const inquiry = await AdmissionInquiry.findById(req.params.id);
        if (inquiry) {
            inquiry.status = req.body.status || inquiry.status;
            inquiry.notes = req.body.notes !== undefined ? req.body.notes : inquiry.notes;
            const updatedInquiry = await inquiry.save();
            res.json(updatedInquiry);
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

// @desc    Delete an inquiry
// @route   DELETE /api/admission/requests/:id
// @access  Admin
const deleteInquiry = async (req, res) => {
    try {
        const inquiry = await AdmissionInquiry.findById(req.params.id);
        if (inquiry) {
            await inquiry.deleteOne();
            res.json({ message: 'Inquiry removed' });
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { submitInquiry, getInquiries, updateInquiry, deleteInquiry };