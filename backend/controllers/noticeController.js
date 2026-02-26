import Notice from '../models/noticeModel.js';
import XLSX from 'xlsx';

const getNotices = async (req, res) => {
    try {
        const { category, priority, search, startDate, endDate } = req.query;
        const query = {};
        if (category && category !== 'All') query.category = category;
        if (priority && priority !== 'All') query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const notices = await Notice.find(query).sort({ date: -1 });
        res.json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addNotice = async (req, res) => {
    try {
        const { title, content, category, priority } = req.body;
        const notice = new Notice({ title, content, category, priority });
        const createdNotice = await notice.save();
        res.status(201).json(createdNotice);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateNotice = async (req, res) => {
    try {
        const { title, content, category, priority } = req.body;
        const notice = await Notice.findById(req.params.id);
        if (notice) {
            notice.title = title || notice.title;
            notice.content = content || notice.content;
            notice.category = category || notice.category;
            notice.priority = priority || notice.priority;
            const updatedNotice = await notice.save();
            res.json(updatedNotice);
        } else {
            res.status(404).json({ message: 'Notice not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};


const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findById(req.params.id);
        if (notice) {
            await notice.deleteOne();
            res.json({ message: 'Notice removed' });
        } else {
            res.status(404).json({ message: 'Notice not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getNoticeStats = async (req, res) => {
    try {
        const total = await Notice.countDocuments();
        const high = await Notice.countDocuments({ priority: 'High' });
        const medium = await Notice.countDocuments({ priority: 'Medium' });
        const low = await Notice.countDocuments({ priority: 'Low' });
        const last7 = await Notice.countDocuments({ date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
        res.json({ total, high, medium, low, last7 });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const exportNotices = async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ date: -1 }).lean();
        const rows = notices.map(n => ({
            title: n.title,
            category: n.category,
            priority: n.priority,
            date: n.date,
            content: n.content
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="notices.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};


const importNotices = async (req, res) => {
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
            const content = row.content || row.Content || '';
            const category = row.category || row.Category || 'General';

            if (!title) {
                errors.push({ row: index + 2, reason: 'Notice title is required.' });
                return;
            }

            inserts.push({ title, content, category });
        });

        if (inserts.length > 0) {
            await Notice.insertMany(inserts, { ordered: false });
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { getNotices, addNotice, updateNotice, deleteNotice, getNoticeStats, exportNotices, importNotices };