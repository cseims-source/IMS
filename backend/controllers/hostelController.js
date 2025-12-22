import HostelRoom from '../models/hostelRoomModel.js';
import HostelAllocation from '../models/hostelAllocationModel.js';
import mongoose from 'mongoose';

// --- Room Controllers ---
const getRooms = async (req, res) => {
    try {
        const rooms = await HostelRoom.find({});
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addRoom = async (req, res) => {
    try {
        const { roomNumber, block, type } = req.body;
        const room = new HostelRoom({ roomNumber, block, type });
        const createdRoom = await room.save();
        res.status(201).json(createdRoom);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};


// --- Allocation Controllers ---
const getAllocations = async (req, res) => {
    try {
        const allocations = await HostelAllocation.find({});
        res.json(allocations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addAllocation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { studentName, roomNumber } = req.body;

        const room = await HostelRoom.findOne({ roomNumber: roomNumber }).session(session);
        if (!room || room.status !== 'Available') {
            throw new Error('Room is not available for allocation.');
        }

        room.status = 'Occupied';
        await room.save({ session });

        const allocation = new HostelAllocation({ studentName, roomNumber });
        const createdAllocation = await allocation.save({ session });

        await session.commitTransaction();
        res.status(201).json(createdAllocation);

    } catch (error) {
        await session.abortTransaction();
        res.status(400).json({ message: error.message || 'Allocation failed' });
    } finally {
        session.endSession();
    }
};

export { getRooms, addRoom, getAllocations, addAllocation };
