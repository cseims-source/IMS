import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
    date: { type: String, required: true }, // YYYY-MM-DD
    stream: { type: String, required: true }, // e.g., 'B.Tech CSE'
    semester: { type: Number, required: true },
    subject: { type: String, required: false }, // Made optional for backward compatibility, but UI will enforce it
    status: { type: String, required: true, enum: ['present', 'absent'] },
}, {
    timestamps: true
});

// Update index to ensure unique attendance per student, per subject, per date
attendanceSchema.index({ student: 1, date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;