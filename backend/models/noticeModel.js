import mongoose from 'mongoose';

const noticeSchema = mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true, enum: ['High', 'Medium', 'Low'] },
    date: { type: Date, default: Date.now },
}, {
    timestamps: true
});

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
