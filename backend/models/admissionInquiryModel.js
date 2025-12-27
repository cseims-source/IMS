import mongoose from 'mongoose';

const admissionInquirySchema = mongoose.Schema({
    // Core Identity
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    gender: { type: String },
    dob: { type: Date },
    
    // Academic Intent
    course: { type: String, required: true },
    branch: { type: String },
    academicYear: { type: String, default: '2025-26' },
    
    // Geographical Node
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String },
    
    // Educational History
    education10th: {
        board: { type: String },
        schoolName: { type: String },
        percentage: { type: Number }
    },
    lastExam: {
        examType: { type: String },
        instituteName: { type: String },
        percentage: { type: Number }
    },
    
    // Family Node
    parentName: { type: String },
    parentPhone: { type: String },
    
    // Registry Logic
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