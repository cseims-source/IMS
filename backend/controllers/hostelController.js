import HostelRoom from '../models/hostelRoomModel.js';
import HostelAllocation from '../models/hostelAllocationModel.js';
import mongoose from 'mongoose';
import XLSX from 'xlsx';

// --- Room Controllers ---
const getRooms = async (req, res) => {
    try {
        const { status, block, type, search } = req.query;
        const query = {};
        if (status && status !== 'All') query.status = status;
        if (block && block !== 'All') query.block = block;
        if (type && type !== 'All') query.type = type;
        if (search) query.roomNumber = { $regex: search, $options: 'i' };

        const rooms = await HostelRoom.find(query).sort({ roomNumber: 1 });
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

const updateRoom = async (req, res) => {
    try {
        const { roomNumber, block, type, status } = req.body;
        const room = await HostelRoom.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        room.roomNumber = roomNumber || room.roomNumber;
        room.block = block || room.block;
        room.type = type || room.type;
        if (status) room.status = status;
        const updated = await room.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const room = await HostelRoom.findById(req.params.id);
        if (!room) return res.status(404).json({ message: 'Room not found' });
        await room.deleteOne();
        res.json({ message: 'Room removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// --- Allocation Controllers ---
const getAllocations = async (req, res) => {
    try {
        const { studentName, roomNumber, startDate, endDate } = req.query;
        const query = {};
        if (studentName) query.studentName = { $regex: studentName, $options: 'i' };
        if (roomNumber) query.roomNumber = roomNumber;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const allocations = await HostelAllocation.find(query).sort({ date: -1 });
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

const deleteAllocation = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const allocation = await HostelAllocation.findById(req.params.id).session(session);
        if (!allocation) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'Allocation not found' });
        }

        const room = await HostelRoom.findOne({ roomNumber: allocation.roomNumber }).session(session);
        if (room) {
            room.status = 'Available';
            await room.save({ session });
        }

        await allocation.deleteOne({ session });
        await session.commitTransaction();
        res.json({ message: 'Allocation removed' });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: 'Server Error' });
    } finally {
        session.endSession();
    }
};

const getMyAllocation = async (req, res) => {
    try {
        if (req.user.role !== 'Student') return res.status(403).json({ message: 'Not allowed' });
        const allocation = await HostelAllocation.findOne({ studentName: req.user.name }).sort({ date: -1 });
        res.json(allocation || null);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getHostelStats = async (req, res) => {
    try {
        const totalRooms = await HostelRoom.countDocuments();
        const available = await HostelRoom.countDocuments({ status: 'Available' });
        const occupied = await HostelRoom.countDocuments({ status: 'Occupied' });
        const maintenance = await HostelRoom.countDocuments({ status: 'Maintenance' });
        const totalAllocations = await HostelAllocation.countDocuments();
        res.json({ totalRooms, available, occupied, maintenance, totalAllocations });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const exportRooms = async (req, res) => {
    try {
        const rooms = await HostelRoom.find({}).lean();
        const rows = rooms.map(r => ({
            roomNumber: r.roomNumber,
            block: r.block,
            type: r.type,
            status: r.status
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="hostel-rooms.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const exportAllocations = async (req, res) => {
    try {
        const allocations = await HostelAllocation.find({}).lean();
        const rows = allocations.map(a => ({
            studentName: a.studentName,
            roomNumber: a.roomNumber,
            date: a.date
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="hostel-allocations.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importRooms = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const inserts = [];
        const errors = [];

        rows.forEach((row, index) => {
            const roomNumber = row.roomNumber || row.room_number || row.Room;
            const block = row.block || row.Block;
            const type = row.type || row.Type || 'Single';
            const status = row.status || row.Status || 'Available';

            if (!roomNumber || !block) {
                errors.push({ row: index + 2, reason: 'Room number and block are required.' });
                return;
            }

            inserts.push({ roomNumber, block, type, status });
        });

        if (inserts.length > 0) {
            await HostelRoom.insertMany(inserts, { ordered: false });
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { 
    getRooms, addRoom, updateRoom, deleteRoom,
    getAllocations, addAllocation, deleteAllocation,
    getMyAllocation,
    getHostelStats,
    exportRooms, exportAllocations, importRooms
};
