import mongoose from 'mongoose';

const marksEntrySchema = mongoose.Schema({
    subjectName: { type: String, required: true },
    marksObtained: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
});

const marksheetSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Student' },
    exam: { type: String, required: true },
    stream: { type: String, required: true },
    semester: { type: Number, required: true },
    marks: [marksEntrySchema],
    total: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: { type: String, required: true },
}, {
    timestamps: true
});

marksheetSchema.index({ student: 1, exam: 1, stream: 1, semester: 1 }, { unique: true });

const Marksheet = mongoose.model('Marksheet', marksheetSchema);
export default Marksheet;