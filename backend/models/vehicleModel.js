import mongoose from 'mongoose';

const vehicleSchema = mongoose.Schema({
    vehicleNumber: { type: String, required: true, unique: true },
    model: { type: String },
    capacity: { type: Number },
    driverName: { type: String, required: true },
    driverContact: { type: String, required: true },
}, {
    timestamps: true
});

const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;