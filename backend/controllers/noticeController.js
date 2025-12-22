import Notice from '../models/noticeModel.js';

const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find({}).sort({ date: -1 });
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


export { getNotices, addNotice, updateNotice, deleteNotice };