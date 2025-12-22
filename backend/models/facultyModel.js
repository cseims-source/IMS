import mongoose from 'mongoose';

const facultySchema = mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    qualification: { type: String },
    photo: { type: String }, // Path or base64 string for photo
    assignedStreams: [{ type: String }], // e.g., ['B.Tech CSE', 'MBA']
    assignedSubjects: [{ type: String }] // e.g., ['Data Structures', 'Algorithms']
}, {
    timestamps: true
});

const Faculty = mongoose.model('Faculty', facultySchema);
export default Faculty;