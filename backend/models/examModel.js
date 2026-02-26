import mongoose from 'mongoose';

const examSchema = mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['mid-term', 'final', 'unit-test', 'surprise', 'practical', 'custom'], default: 'custom' },
    stream: { type: String, required: true },
    streamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stream' },
    semester: { type: Number, required: true },
    section: { type: String, default: 'A' },
    subject: { type: String },
    subjectId: { type: mongoose.Schema.Types.ObjectId },
    academicYear: { type: String },
    startDate: { type: String, required: true }, // YYYY-MM-DD
    endDate: { type: String }, // YYYY-MM-DD
    status: { type: String, enum: ['scheduled', 'ongoing', 'completed', 'cancelled'], default: 'scheduled' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdByFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }
}, {
    timestamps: true
});

examSchema.index({ name: 1, stream: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
