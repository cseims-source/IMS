import CanteenItem from '../models/canteenItemModel.js';
import CanteenOrder from '../models/canteenOrderModel.js';
import XLSX from 'xlsx';

const getMenuItems = async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice } = req.query;
        const query = {};
        if (category && category !== 'All') query.category = category;
        if (search) query.name = { $regex: search, $options: 'i' };
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const items = await CanteenItem.find(query).sort({ createdAt: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const addMenuItem = async (req, res) => {
    try {
        const { name, category, price, img } = req.body;
        const item = new CanteenItem({ name, category, price, img });
        const createdItem = await item.save();
        res.status(201).json(createdItem);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { name, category, price, img } = req.body;
        const item = await CanteenItem.findById(req.params.id);
        if (item) {
            item.name = name || item.name;
            item.category = category || item.category;
            item.price = price || item.price;
            item.img = img || item.img;
            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const item = await CanteenItem.findById(req.params.id);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Item removed' });
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// --- Order Controllers ---

const placeOrder = async (req, res) => {
    try {
        if (req.user.role !== 'Student') {
            return res.status(403).json({ message: 'Only students can place orders.' });
        }
        const { items, totalAmount } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const orderItems = items.map(item => ({
            menuItem: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        }));

        const order = new CanteenOrder({
            user: req.user._id,
            items: orderItems,
            totalAmount,
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await CanteenOrder.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.menuItem', 'img');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { status, startDate, endDate } = req.query;
        const query = {};
        if (status && status !== 'All') query.status = status;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const orders = await CanteenOrder.find(query)
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const getCanteenStats = async (req, res) => {
    try {
        const totalOrders = await CanteenOrder.countDocuments();
        const pending = await CanteenOrder.countDocuments({ status: 'Pending' });
        const preparing = await CanteenOrder.countDocuments({ status: 'Preparing' });
        const ready = await CanteenOrder.countDocuments({ status: 'Ready for Pickup' });
        const completed = await CanteenOrder.countDocuments({ status: 'Completed' });
        const cancelled = await CanteenOrder.countDocuments({ status: 'Cancelled' });

        const revenueAgg = await CanteenOrder.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = revenueAgg[0]?.total || 0;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrders = await CanteenOrder.countDocuments({ createdAt: { $gte: todayStart } });

        res.json({ totalOrders, pending, preparing, ready, completed, cancelled, revenue, todayOrders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to load canteen stats.' });
    }
};

const exportMenuItems = async (req, res) => {
    try {
        const items = await CanteenItem.find({}).lean();
        const rows = items.map(i => ({
            name: i.name,
            category: i.category,
            price: i.price,
            img: i.img || ''
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="canteen-menu.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const exportOrders = async (req, res) => {
    try {
        const orders = await CanteenOrder.find({})
            .populate('user', 'name email')
            .lean();
        const rows = orders.map(o => ({
            orderId: o._id,
            customer: o.user?.name || '',
            email: o.user?.email || '',
            items: o.items?.map(i => `${i.name} x${i.quantity}`).join('; '),
            totalAmount: o.totalAmount,
            status: o.status,
            createdAt: o.createdAt
        }));
        const worksheet = XLSX.utils.json_to_sheet(rows);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="canteen-orders.csv"');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Export failed.' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await CanteenOrder.findById(req.params.id);
        if (order) {
            order.status = status;
            await order.save();
            // Repopulate user details for the response
            const updatedOrder = await CanteenOrder.findById(req.params.id).populate('user', 'name email');
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Invalid data' });
    }
};

const importMenuItems = async (req, res) => {
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
            const name = row.name || row.Name;
            const category = row.category || row.Category || 'General';
            const price = parseFloat(row.price || row.Price || 0);

            if (!name || !price) {
                errors.push({ row: index + 2, reason: 'Item name and price are required.' });
                return;
            }

            inserts.push({ name, category, price });
        });

        if (inserts.length > 0) {
            await CanteenItem.insertMany(inserts, { ordered: false });
        }
        res.status(201).json({ imported: inserts.length, errorCount: errors.length, errors });
    } catch (error) {
        res.status(400).json({ message: 'Import failed.', error: error.message });
    }
};

export { 
    getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
    placeOrder, getMyOrders, getAllOrders, updateOrderStatus,
    getCanteenStats, exportMenuItems, exportOrders, importMenuItems
};