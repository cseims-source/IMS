import mongoose from 'mongoose';

const studentTransportSchema = mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    route: { type: mongoose.Schema.Types.ObjectId, ref: 'TransportRoute', required: true },
    stop: { type: String, required: true },
    feesStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' }
}, {
    timestamps: true
});

const StudentTransport = mongoose.model('StudentTransport', studentTransportSchema);
export default StudentTransport;