import mongoose from 'mongoose';
import Vehicle from '../models/vehicleModel.js';
import TransportRoute from '../models/transportRouteModel.js';
import StudentTransport from '../models/studentTransportModel.js';
import XLSX from 'xlsx';
import Student from '../models/studentModel.js';

// --- Vehicle Controllers ---
const getVehicles = async (req, res) => res.json(await Vehicle.find({}));
const addVehicle = async (req, res) => res.status(201).json(await Vehicle.create(req.body));
const updateVehicle = async (req, res) => res.json(await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true }));
const deleteVehicle = async (req, res) => {
    // Optional: Check if vehicle is assigned to a route before deleting
    await Vehicle.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted' });
};

// --- Route Controllers ---
const getRoutes = async (req, res) => res.json(await TransportRoute.find({}).populate('vehicle'));
const addRoute = async (req, res) => res.status(201).json(await TransportRoute.create(req.body));
const updateRoute = async (req, res) => res.json(await TransportRoute.findByIdAndUpdate(req.params.id, req.body, { new: true }));
const deleteRoute = async (req, res) => {
    // Optional: Disassociate students from this route before deleting
    await TransportRoute.findByIdAndDelete(req.params.id);
    res.json({ message: 'Route deleted' });
};

// --- Allocation Controllers ---
const getAllocations = async (req, res) => res.json(await StudentTransport.find({}).populate('student').populate('route'));
const allocateStudent = async (req, res) => {
    const existing = await StudentTransport.findOne({ student: req.body.student });
    if (existing) {
        return res.status(400).json({ message: 'Student is already allocated to a route.' });
    }
    res.status(201).json(await StudentTransport.create(req.body));
};
const deallocateStudent = async (req, res) => {
    await StudentTransport.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deallocated' });
};

const getMyAllocation = async (req, res) => {
    try {
        const allocation = await StudentTransport.findOne({ student: req.user.profileId })
            .populate('route')
            .populate('student');
        res.json(allocation || null);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch allocation.' });
    }
};

const exportAllocations = async (req, res) => {
    try {
        const allocations = await StudentTransport.find({})
            .populate('student', 'firstName lastName registrationNumber stream')
            .populate('route', 'routeName')
            .lean();
        const rows = allocations.map(a => ({
            student: a.student ? `${a.student.firstName} ${a.student.lastName}` : '',
            registrationNumber: a.student?.registrationNumber || '',
            stream: a.student?.stream || '',
            route: a.route?.routeName || '',
            stop: a.stop,
            feesStatus: a.feesStatus
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="transport-allocations.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importAllocations = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const errors = [];
        const inserts = [];

        for (const [index, row] of rows.entries()) {
            const rowIndex = index + 2;
            const studentId = row.studentId || row.student || row.student_id || '';
            const registrationNumber = row.registrationNumber || row.registration_no || '';
            const routeId = row.routeId || row.route_id || '';
            const routeName = row.routeName || row.route || '';
            const stop = row.stop || row.Stop;
            const feesStatus = row.feesStatus || row.fees_status || 'Pending';

            let student = null;
            if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
                student = await Student.findById(studentId);
            } else if (registrationNumber) {
                student = await Student.findOne({ registrationNumber });
            }
            if (!student) {
                errors.push({ row: rowIndex, reason: 'Student not found.' });
                continue;
            }

            let route = null;
            if (routeId && mongoose.Types.ObjectId.isValid(routeId)) {
                route = await TransportRoute.findById(routeId);
            } else if (routeName) {
                route = await TransportRoute.findOne({ routeName });
            }
            if (!route) {
                errors.push({ row: rowIndex, reason: 'Route not found.' });
                continue;
            }
            if (!stop) {
                errors.push({ row: rowIndex, reason: 'Stop is required.' });
                continue;
            }

            const exists = await StudentTransport.findOne({ student: student._id });
            if (exists) {
                errors.push({ row: rowIndex, reason: 'Student already allocated.' });
                continue;
            }

            inserts.push({
                student: student._id,
                route: route._id,
                stop,
                feesStatus: feesStatus === 'Paid' ? 'Paid' : 'Pending'
            });
        }

        if (inserts.length > 0) {
            await StudentTransport.insertMany(inserts, { ordered: false });
        }

        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};


export {
    getVehicles, addVehicle, updateVehicle, deleteVehicle,
    getRoutes, addRoute, updateRoute, deleteRoute,
    getAllocations, allocateStudent, deallocateStudent,
    getMyAllocation,
    exportAllocations,
    importAllocations
};