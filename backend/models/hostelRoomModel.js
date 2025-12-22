import mongoose from 'mongoose';

const hostelRoomSchema = mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    block: { type: String, required: true },
    type: { type: String, required: true, enum: ['Single', 'Double', 'Dormitory'] },
    status: { type: String, required: true, enum: ['Occupied', 'Available', 'Maintenance'], default: 'Available' }
}, {
    timestamps: true
});

const HostelRoom = mongoose.model('HostelRoom', hostelRoomSchema);
export default HostelRoom;
