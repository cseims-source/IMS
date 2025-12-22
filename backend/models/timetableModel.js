import mongoose from 'mongoose';

const timetableSchema = mongoose.Schema({
    stream: { type: String, required: true }, // e.g., 'B.Tech CSE'
    semester: { type: Number, required: true },
    schedule: { type: Map, of: Object } // Flexible structure: { Monday: { '9:00 AM': { ... } } }
}, {
    timestamps: true
});

timetableSchema.index({ stream: 1, semester: 1 }, { unique: true });


const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;