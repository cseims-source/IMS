import mongoose from 'mongoose';

const subjectSchema = mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    credits: { type: Number, required: true },
});

const courseSchema = mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: String },
    credits: { type: Number },
    description: { type: String },
    subjects: [subjectSchema]
}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);
export default Course;