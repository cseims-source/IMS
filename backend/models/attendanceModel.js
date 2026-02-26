import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedAt: { type: Date },
    date: { type: String, required: true }, // YYYY-MM-DD
    stream: { type: String, required: true }, // e.g., 'B.Tech CSE'
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
    academicYear: { type: String, required: true }, // e.g., '2024-25'
    semester: { type: Number, required: true },
    section: { type: String, required: true, default: 'A' }, // Added Section Hub
    subject: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, required: true, enum: ['present', 'absent', 'late'] },
}, {
    timestamps: true
});

// CRITICAL: Ensure unique attendance per student, per subject, per section, per date
attendanceSchema.index({ student: 1, date: 1, subject: 1, section: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;