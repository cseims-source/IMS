import mongoose from 'mongoose';

const marksEntrySchema = mongoose.Schema({
    subjectName: { type: String, required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
});

const marksheetSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    markedAt: { type: Date },
    exam: { type: String, required: true },
    examDate: { type: String }, // YYYY-MM-DD
    status: { type: String, enum: ['draft', 'published'], default: 'published' },
    remarks: { type: String, default: '' },
    stream: { type: String, required: true },
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
    academicYear: { type: String },
    semester: { type: Number, required: true },
    section: { type: String, default: 'A' },
    marks: [marksEntrySchema],
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
}, {
    timestamps: true
});

marksheetSchema.index({ student: 1, exam: 1, semester: 1, academicYear: 1 }, { unique: true });

const Marksheet = mongoose.model('Marksheet', marksheetSchema);
export default Marksheet;