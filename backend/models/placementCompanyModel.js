import mongoose from 'mongoose';

const placementCompanySchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    sector: { type: String, required: true },
}, {
    timestamps: true
});

const PlacementCompany = mongoose.model('PlacementCompany', placementCompanySchema);
export default PlacementCompany;
