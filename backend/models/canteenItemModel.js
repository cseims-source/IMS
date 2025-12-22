import mongoose from 'mongoose';

const canteenItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    img: { type: String },
}, {
    timestamps: true
});

const CanteenItem = mongoose.model('CanteenItem', canteenItemSchema);
export default CanteenItem;
