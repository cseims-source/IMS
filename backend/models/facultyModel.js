import mongoose from 'mongoose';

const workloadSchema = mongoose.Schema({
    stream: { type: String, required: true },
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
    semester: { type: Number, required: true },
    section: { type: String, required: true, default: 'A' },
    subject: { type: String, required: true }
});

const facultySchema = mongoose.Schema({
    // Identity Node
    username: { type: String },
    staffType: { type: String, enum: ['Teaching', 'Non-Teaching'], default: 'Teaching' },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    whatsappNo: { type: String },
    photo: { type: String }, // Base64 Identity Image
    designation: { type: String, default: 'Assistant Professor' },
    department: { type: String, default: 'CSE' },

    // Family & Identity Records
    fatherName: { type: String },
    motherName: { type: String },
    aadharNo: { type: String },
    panNo: { type: String },
    caste: { type: String },
    bloodGroup: { type: String },
    religion: { type: String },

    // Academic Matrix (legacy + extended)
    subject: { type: String }, // Primary Expertise
    qualification: { type: String }, // e.g., PhD, M.Tech
    highestQualification: { type: String }, // Highest Qualification with Pass Out Year
    experienceYears: { type: Number, default: 0 },

    // Institutional Logic
    joiningDate: { type: Date, default: Date.now },
    dateOfBirth: { type: Date },
    dateOfLeave: { type: Date },
    serialNo: { type: String },
    employeeId: { type: String, unique: true, sparse: true },
    teacherId: { type: String },
    status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Discontinued'], default: 'Active' },

    // Allocation Lattice (DEPRECATED simple arrays in favor of structured workload)
    assignedStreams: [{ type: String }],
    assignedSubjects: [{ type: String }],
    assignedStreamIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stream' }],

    // NEW: Structured Workload Protocol
    workload: [workloadSchema],

    // Address Spatial Node
    address: {
        current: { type: String },
        permanent: { type: String }
    }
}, {
    timestamps: true
});

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;