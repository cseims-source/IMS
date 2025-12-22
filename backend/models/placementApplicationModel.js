import mongoose from 'mongoose';

const placementApplicationSchema = mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'PlacementJob' },
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    status: { type: String, required: true, default: 'Applied' },
}, {
    timestamps: true
});

const PlacementApplication = mongoose.model('PlacementApplication', placementApplicationSchema);
export default PlacementApplication;
