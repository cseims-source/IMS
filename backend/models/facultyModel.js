import mongoose from 'mongoose';

const facultySchema = mongoose.Schema({
    // Identity Node
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    photo: { type: String }, // Base64 Identity Image
    designation: { type: String, default: 'Assistant Professor' },
    department: { type: String, default: 'CSE' },
    
    // Academic Matrix
    subject: { type: String, required: true }, // Primary Expertise
    qualification: { type: String, required: true }, // e.g., PhD, M.Tech
    experienceYears: { type: Number, default: 0 },
    
    // Institutional Logic
    joiningDate: { type: Date, default: Date.now },
    employeeId: { type: String, unique: true, sparse: true },
    status: { type: String, enum: ['Active', 'On Leave', 'Resigned'], default: 'Active' },
    
    // Allocation Lattice
    assignedStreams: [{ type: String }], // Array of Stream Names
    assignedSubjects: [{ type: String }], // Array of Subject Names
    
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