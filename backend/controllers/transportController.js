import Vehicle from '../models/vehicleModel.js';
import TransportRoute from '../models/transportRouteModel.js';
import StudentTransport from '../models/studentTransportModel.js';

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


export {
    getVehicles, addVehicle, updateVehicle, deleteVehicle,
    getRoutes, addRoute, updateRoute, deleteRoute,
    getAllocations, allocateStudent, deallocateStudent
};