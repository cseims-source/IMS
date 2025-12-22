import mongoose from 'mongoose';

const admissionInquirySchema = mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    branch: { type: String },
    state: { type: String, required: true },
    city: { type: String, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['New', 'Accepted', 'Rejected', 'Waiting List'], 
        default: 'New' 
    },
    notes: { type: String },
    date: { type: Date, default: Date.now }
}, {
    timestamps: true
});

const AdmissionInquiry = mongoose.model('AdmissionInquiry', admissionInquirySchema);
export default AdmissionInquiry;