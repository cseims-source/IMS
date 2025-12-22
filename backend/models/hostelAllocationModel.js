import mongoose from 'mongoose';

const hostelAllocationSchema = mongoose.Schema({
    studentName: { type: String, required: true },
    roomNumber: { type: String, required: true },
    date: { type: Date, default: Date.now },
}, {
    timestamps: true
});

const HostelAllocation = mongoose.model('HostelAllocation', hostelAllocationSchema);
export default HostelAllocation;
