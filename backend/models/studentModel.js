import mongoose from 'mongoose';

const feeSchema = mongoose.Schema({
    type: { type: String, required: true, default: 'Tuition' },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Paid', 'Pending'], default: 'Pending' },
    dueDate: { type: Date }
});

const studentSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: false }, // Made optional to support single names
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String, default: 'Not Specified' },
    address: { type: String },
    stream: { type: String, default: 'Unassigned' },
    currentSemester: { type: Number, default: 1 },
    photo: { type: String },
    fees: { type: [feeSchema], default: [] }, // Default empty array is safer
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;