import mongoose from 'mongoose';

const questionPaperSchema = mongoose.Schema({
    title: { type: String, required: true },
    course: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    subject: { type: String, required: true },
    academicYear: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String }, // Placeholder for actual file storage path or base64
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, {
    timestamps: true
});

const QuestionPaper = mongoose.model('QuestionPaper', questionPaperSchema);
export default QuestionPaper;