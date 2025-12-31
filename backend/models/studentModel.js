import mongoose from 'mongoose';

const studentSchema = mongoose.Schema({
    // 1. Personal Information
    enquiryId: { type: String },
    status: { type: String, default: 'Pending' },
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    dob: { type: Date },
    gender: { type: String, default: 'Select Gender' },
    registrationNumber: { type: String },
    section: { type: String, default: 'A' },
    photo: { type: String },

    // 2. Contact Information
    phone: { type: String }, // Made optional for initial registration
    whatsappNumber: { type: String },
    isWhatsappSameAsPhone: { type: Boolean, default: false },
    email: { type: String, required: true, unique: true },
    emergencyContactName: { type: String },
    emergencyContactPhone: { type: String },

    // 3. Academic Information
    academicYear: { type: String },
    course: { type: String },
    branch: { type: String },
    batchYear: { type: String },
    admissionDate: { type: Date },
    currentSemester: { type: Number, default: 1 },
    stream: { type: String, default: 'Unassigned' },

    // 4. Entrance & Identification
    appearedInEntrance: { type: String, default: 'No' },
    entranceRollNo: { type: String },
    aadharNumber: { type: String },
    facebookId: { type: String },

    // 5. Institutional Services
    accommodationRequired: { type: String, default: 'No' },
    staffName: { type: String },

    // 6. Previous Education
    education10th: {
        examName: { type: String, default: 'HSC' },
        board: { type: String },
        schoolName: { type: String },
        place: { type: String },
        passingYear: { type: String },
        totalMarks: { type: Number, default: 0 },
        marksSecured: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    },
    lastExam: {
        examType: { type: String },
        boardUniversity: { type: String },
        instituteName: { type: String },
        passingYear: { type: String },
        totalMarks: { type: Number, default: 0 },
        marksSecured: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 }
    },

    // 7. Family Information
    family: {
        father: {
            name: { type: String },
            occupation: { type: String },
            phone: { type: String },
            whatsapp: { type: String }
        },
        mother: {
            name: { type: String },
            occupation: { type: String },
            phone: { type: String },
            whatsapp: { type: String }
        },
        guardianPhone: { type: String }
    },

    // 8. Additional Information
    religion: { type: String },
    category: { type: String },
    bloodGroup: { type: String },

    // 9. Address Information
    presentAddress: {
        address: { type: String },
        city: { type: String },
        postOffice: { type: String },
        policeStation: { type: String },
        via: { type: String },
        block: { type: String },
        district: { type: String },
        state: { type: String, default: 'Odisha' },
        pincode: { type: String }
    },
    permanentAddress: {
        address: { type: String },
        city: { type: String },
        postOffice: { type: String },
        policeStation: { type: String },
        via: { type: String },
        block: { type: String },
        district: { type: String },
        state: { type: String, default: 'Odisha' },
        pincode: { type: String }
    },
    isAddressSame: { type: Boolean, default: false },

    // 10. Document Tracking
    documents: {
        original: [String],
        xerox: [String]
    },

    // 11. Fee Information
    paymentPattern: { type: String },
    yearFees: {
        y1: { type: Number, default: 0 },
        y2: { type: Number, default: 0 },
        y3: { type: Number, default: 0 },
        y4: { type: Number, default: 0 },
        hostelBus: { type: Number, default: 0 }
    }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;