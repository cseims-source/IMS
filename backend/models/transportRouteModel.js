import mongoose from 'mongoose';

const transportRouteSchema = mongoose.Schema({
    routeName: { type: String, required: true, unique: true },
    stops: { type: [String], required: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
}, {
    timestamps: true
});

const TransportRoute = mongoose.model('TransportRoute', transportRouteSchema);
export default TransportRoute;