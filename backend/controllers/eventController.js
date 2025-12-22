import Event from '../models/eventModel.js';

const getEvents = async (req, res) => {
    try {
        const events = await Event.find({});
        // Group events by date for easier frontend consumption
        const eventsByDate = events.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({ title: event.title, category: event.category });
            return acc;
        }, {});
        res.json(eventsByDate);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addEvent = async (req, res) => {
    try {
        const { date, title, category } = req.body;
        const event = new Event({ date, title, category });
        const createdEvent = await event.save();
        res.status(201).json(createdEvent);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

export { getEvents, addEvent };
