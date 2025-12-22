import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    credits: { type: Number, required: true },
});

const semesterSchema = mongoose.Schema({
    semesterNumber: { type: Number, required: true },
    subjects: [subjectSchema]
});

const streamSchema = mongoose.Schema({
    name: { type: String, required: true },
    level: { type: String, required: true, enum: ['Bachelors', 'Masters'] },
    duration: { type: String },
    description: { type: String },
    semesters: [semesterSchema]
}, {
    timestamps: true
});

const Stream = mongoose.model('Stream', streamSchema);
export default Stream;