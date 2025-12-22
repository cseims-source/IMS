import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    menuItem: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'CanteenItem' },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const canteenOrderSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { 
        type: String, 
        required: true, 
        enum: ['Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'], 
        default: 'Pending' 
    },
}, {
    timestamps: true
});

const CanteenOrder = mongoose.model('CanteenOrder', canteenOrderSchema);
export default CanteenOrder;