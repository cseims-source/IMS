import CanteenItem from '../models/canteenItemModel.js';
import CanteenOrder from '../models/canteenOrderModel.js';

const getMenuItems = async (req, res) => {
    try {
        const items = await CanteenItem.find({});
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
        const orders = await CanteenOrder.find({})
            .sort({ createdAt: -1 })
            .populate('user', 'name email');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
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

export { 
    getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem,
    placeOrder, getMyOrders, getAllOrders, updateOrderStatus
};