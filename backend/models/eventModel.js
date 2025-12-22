import mongoose from 'mongoose';

const eventSchema = mongoose.Schema({
    date: { type: String, required: true }, // YYYY-MM-DD format
    title: { type: String, required: true },
    category: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
