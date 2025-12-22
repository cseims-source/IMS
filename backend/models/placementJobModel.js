import mongoose from 'mongoose';

const placementJobSchema = mongoose.Schema({
    title: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'PlacementCompany' },
    status: { type: String, required: true, enum: ['Open', 'Closed'], default: 'Open' }
}, {
    timestamps: true
});

const PlacementJob = mongoose.model('PlacementJob', placementJobSchema);
export default PlacementJob;
