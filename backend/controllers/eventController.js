import Event from '../models/eventModel.js';
import XLSX from 'xlsx';

const getEvents = async (req, res) => {
    try {
        const { category, startDate, endDate, format } = req.query;
        const query = {};
        if (category && category !== 'All') query.category = category;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = startDate;
            if (endDate) query.date.$lte = endDate;
        }

        const events = await Event.find(query).sort({ date: 1 });

        if (format === 'flat') {
            return res.json(events);
        }

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

const updateEvent = async (req, res) => {
    try {
        const { date, title, category } = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        event.date = date || event.date;
        event.title = title || event.title;
        event.category = category || event.category;
        const updated = await event.save();
        res.json(updated);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        await event.deleteOne();
        res.json({ message: 'Event removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getEventStats = async (req, res) => {
    try {
        const total = await Event.countDocuments();
        const upcoming = await Event.countDocuments({ date: { $gte: new Date().toISOString().split('T')[0] } });
        res.json({ total, upcoming });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const exportEvents = async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 }).lean();
        const rows = events.map(e => ({ date: e.date, title: e.title, category: e.category }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="events.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const importEvents = async (req, res) => {
    try {
        if (!req.file?.buffer) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const inserts = [];
        const errors = [];

        rows.forEach((row, index) => {
            const title = row.title || row.Title;
            const description = row.description || row.Description || '';
            const startDate = row.startDate || row.start_date || row.Start_Date;
            const endDate = row.endDate || row.end_date || row.End_Date;

            if (!title || !startDate) {
                errors.push({ row: index + 2, reason: 'Title and start date are required.' });
                return;
            }

            inserts.push({ title, description, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : undefined });
        });

        if (inserts.length > 0) {
            await Event.insertMany(inserts, { ordered: false });
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { getEvents, addEvent, updateEvent, deleteEvent, getEventStats, exportEvents, importEvents };
