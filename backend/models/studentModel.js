import mongoose from 'mongoose';

const feeSchema = mongoose.Schema({
    type: { type: String, required: true, default: 'Tuition' },
    amount: { type: Number, required: true },
    status: { type: String, required: true, enum: ['Paid', 'Pending'], default: 'Pending' },
    dueDate: { type: Date }
});

const studentSchema = mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    dob: { type: Date },
    gender: { type: String, default: 'Not Specified' },
    address: { type: String },
    stream: { type: String, default: 'Unassigned' }, // e.g., 'Bachelor of Computer Applications'
    currentSemester: { type: Number, default: 1 },
    photo: { type: String }, // Path to photo
    fees: [feeSchema],
}, {
    timestamps: true
});

// Seed some initial fee data for existing students when the model is used.
// This is a simple way to add demo data. In a real app, this would be a separate script.
studentSchema.post('find', async function(docs) {
    if (!Array.isArray(docs)) return;

    for (const doc of docs) {
        // Ensure doc is a Mongoose document (has .save) and 'fees' is loaded (not excluded by projection)
        // queries with .lean() return POJOs which lack .save()
        if (doc && typeof doc.save === 'function' && Array.isArray(doc.fees)) {
            if (doc.fees.length === 0) {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + 30); // Due in 30 days
                doc.fees.push({ amount: 50000, type: 'Semester Fee', status: 'Pending', dueDate });
                await doc.save();
            }
        }
    }
});


const Student = mongoose.model('Student', studentSchema);
export default Student;