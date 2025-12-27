import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { ShoppingCart, Plus, Edit, Trash2, Utensils, ClipboardList, Settings, CheckCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';

const categories = ['All', 'Snacks', 'Lunch', 'Beverages'];
const orderStatuses = ['Pending', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Preparing: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
    'Ready for Pickup': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300',
    Completed: 'bg-accent-100 text-accent-800 dark:bg-accent-900/50 dark:text-accent-300',
    Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const TabButton = ({ active, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            active
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {icon}
        <span className="ml-2">{children}</span>
    </button>
);

const MenuItemForm = ({ item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(item || { name: '', category: 'Snacks', price: '', img: ''});
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = e => {
        e.preventDefault();
        onSave({...formData, price: Number(formData.price) });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">{item ? 'Edit' : 'Add'} Menu Item</h2>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Item Name" className="w-full p-2 border rounded" required />
                <input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="w-full p-2 border rounded" required />
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                    {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
                <input name="img" value={formData.img} onChange={handleChange} placeholder="Image URL (optional)" className="w-full p-2 border rounded" />
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    )
}

const StudentMenuTab = ({ menu, filter, setFilter, cart, setCart, onOrderPlaced }) => {
    const { api } = useAuth();
    const { addToast } = useNotification();
    const [orderStatus, setOrderStatus] = useState('idle'); // idle, placing, success

    const addToCart = (item) => {
        setCart(prev => {
            const existing = prev.find(i => i._id === item._id);
            if (existing) {
                return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1 }];
        });
    };
    
    const placeOrder = async () => {
        setOrderStatus('placing');
        try {
            await api('/api/canteen/orders', {
                method: 'POST',
                body: JSON.stringify({ items: cart, totalAmount: total })
            });
            setOrderStatus('success');
            setTimeout(() => {
                setCart([]);
                setOrderStatus('idle');
                onOrderPlaced();
            }, 3000); // Reset after 3 seconds
        } catch(err) {
            addToast(err.message || 'Failed to place order.', 'error');
            setOrderStatus('idle');
        }
    };
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const filteredMenu = filter === 'All' ? menu : menu.filter(item => item.category === filter);

    return (
        <>
            <div className="mb-6 flex space-x-2 border-b dark:border-gray-700">
                {categories.map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 text-sm font-medium ${filter === cat ? 'border-b-2 border-primary-500 text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredMenu.map(item => (
                        <div key={item._id} className="border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden group">
                            <img src={item.img || 'https://via.placeholder.com/150?text=No+Image'} alt={item.name} className="w-full h-32 object-cover"/>
                            <div className="p-4">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                <div className="flex justify-between items-center mt-3">
                                    <p className="font-bold text-lg">₹{item.price}</p>
                                    <button onClick={() => addToCart(item)} className="px-3 py-1 bg-primary-500 text-white text-sm rounded-md hover:bg-primary-600">Add</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-1 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {orderStatus === 'success' ? (
                        <div className="text-center py-8">
                            <CheckCircle className="h-16 w-16 mx-auto text-accent-500" />
                            <h3 className="mt-4 text-xl font-bold">Order Confirmed!</h3>
                            <p className="mt-2 text-gray-600 dark:text-gray-300">Sequence initiated. Track status in 'My Orders'.</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-bold flex items-center mb-4"><ShoppingCart size={22} className="mr-2"/> Your Order</h2>
                            {cart.length === 0 ? <p className="text-gray-500 text-center py-8">Your cart is empty.</p> : (
                                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                                    {cart.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                            </div>
                                            <p>₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-6 border-t dark:border-gray-700 pt-4">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{total}</span>
                                </div>
                                <button onClick={placeOrder} disabled={cart.length === 0 || orderStatus === 'placing'} className="w-full mt-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md disabled:bg-gray-400">
                                    {orderStatus === 'placing' ? 'Placing Order...' : 'Confirm Checkout'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

const StudentOrdersTab = ({ key }) => {
    const { api } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await api('/api/canteen/orders/my');
                setOrders(data);
            } catch(err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [api, key]);

    if (loading) return <p>Loading your orders...</p>;
    if (orders.length === 0) return <p className="text-center text-gray-500 py-10">You haven't placed any orders yet.</p>

    return (
        <div className="space-y-4">
            {orders.map(order => (
                <div key={order._id} className="p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <p className="font-semibold">Order ID: #{order._id.slice(-6)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateTime(order.createdAt)}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                    <ul className="text-sm space-y-1 mb-3">
                        {order.items.map(item => (
                           <li key={item.menuItem} className="flex justify-between">
                               <span>{item.name} x {item.quantity}</span>
                               <span>₹{item.price * item.quantity}</span>
                           </li>
                        ))}
                    </ul>
                    <div className="text-right font-bold border-t dark:border-gray-600 pt-2">
                        Total: ₹{order.totalAmount}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AdminMenuTab = ({ menu, fetchMenu }) => {
    const { api } = useAuth();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const handleAddItem = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    }
    const handleEditItem = (item) => {
        setEditingItem(item);
        setIsFormOpen(true);
    }
    const handleDeleteItem = async (itemId) => {
        if(window.confirm('Are you sure?')) {
          await api(`/api/canteen/items/${itemId}`, { method: 'DELETE' });
          fetchMenu();
        }
    }
    const handleSaveItem = async (itemData) => {
        const method = editingItem ? 'PUT' : 'POST';
        const url = editingItem ? `/api/canteen/items/${editingItem._id}` : '/api/canteen/items';
        await api(url, {
            method,
            body: JSON.stringify(itemData)
        });
        setIsFormOpen(false);
        fetchMenu();
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Menu Items</h2>
                <button onClick={handleAddItem} className="flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-md text-sm"><Plus size={16} className="mr-1"/>Add Item</button>
            </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 font-semibold">Name</th>
                            <th className="p-3 font-semibold">Category</th>
                            <th className="p-3 font-semibold">Price</th>
                            <th className="p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {menu.map(item => (
                            <tr key={item._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.category}</td>
                                <td className="p-3">₹{item.price}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => handleEditItem(item)} className="p-2 text-primary-600 hover:bg-primary-100 rounded-full"><Edit size={16}/></button>
                                    <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {isFormOpen && <MenuItemForm item={editingItem} onSave={handleSaveItem} onCancel={() => setIsFormOpen(false)} />}
        </div>
    );
};

const AdminOrdersTab = () => {
    const { api } = useAuth();
    const { addToast } = useNotification();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api('/api/canteen/orders');
                setOrders(data);
            } catch(err) {
                console.error("Failed to fetch orders", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [api]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const updatedOrder = await api(`/api/canteen/orders/${orderId}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });
            setOrders(prev => prev.map(o => o._id === orderId ? updatedOrder : o));
        } catch (err) {
            addToast('Failed to update status.', 'error');
        }
    };
    
    const filteredOrders = useMemo(() => {
        if (statusFilter === 'All') return orders;
        return orders.filter(o => o.status === statusFilter);
    }, [orders, statusFilter]);

    if (loading) return <p>Loading orders...</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Manage Orders</h2>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-md">
                    <option>All</option>
                    {orderStatuses.map(s => <option key={s}>{s}</option>)}
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 font-semibold">Order ID</th>
                            <th className="p-3 font-semibold">Customer</th>
                            <th className="p-3 font-semibold">Total</th>
                            <th className="p-3 font-semibold">Date</th>
                            <th className="p-3 font-semibold">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(order => (
                             <tr key={order._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3 font-mono text-xs">#{order._id.slice(-6)}</td>
                                <td className="p-3">{order.user?.name || 'N/A'}</td>
                                <td className="p-3">₹{order.totalAmount}</td>
                                <td className="p-3 text-sm">{formatDateTime(order.createdAt)}</td>
                                <td className="p-3">
                                    <select value={order.status} onChange={e => handleStatusChange(order._id, e.target.value)} className={`p-1.5 text-xs rounded-md border-0 focus:ring-2 focus:ring-primary-500 ${statusColors[order.status]}`}>
                                        {orderStatuses.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default function CanteenManagement() {
  const { user, api } = useAuth();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [orderPlacedKey, setOrderPlacedKey] = useState(0);
  
  const studentInitialTab = 'menu';
  const adminInitialTab = 'manage-orders';
  const [activeTab, setActiveTab] = useState(user?.role === 'Admin' ? adminInitialTab : studentInitialTab);

  const fetchMenu = async () => {
      setLoading(true);
      try {
          const data = await api('/api/canteen/items');
          setMenu(data);
      } catch (error) {
          console.error("Failed to fetch menu", error);
      } finally {
          setLoading(false);
      }
  }

  useEffect(() => {
      fetchMenu();
  }, [api]);

  const handleOrderPlaced = () => {
      setOrderPlacedKey(prev => prev + 1); // Trigger re-fetch in StudentOrdersTab
  }

  const studentTabs = [
      { id: 'menu', label: 'Menu & Cart', icon: <Utensils size={16}/> },
      { id: 'my-orders', label: 'My Orders', icon: <ClipboardList size={16}/> },
  ];
  const adminTabs = [
      { id: 'manage-orders', label: 'Manage Orders', icon: <ClipboardList size={16}/> },
      { id: 'menu-items', label: 'Menu Items', icon: <Settings size={16}/> },
  ];
  const TABS = user?.role === 'Admin' ? adminTabs : studentTabs;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Institute Canteen</h1>
      
      <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {TABS.map(tab => (
                <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} icon={tab.icon}>{tab.label}</TabButton>
            ))}
          </nav>
      </div>

      <div className="mt-6">
        {loading ? <p>Loading canteen data...</p> : (
            <>
                {user?.role !== 'Admin' && activeTab === 'menu' && <StudentMenuTab menu={menu} filter={filter} setFilter={setFilter} cart={cart} setCart={setCart} onOrderPlaced={handleOrderPlaced}/>}
                {user?.role !== 'Admin' && activeTab === 'my-orders' && <StudentOrdersTab key={orderPlacedKey} />}
                {user?.role === 'Admin' && activeTab === 'menu-items' && <AdminMenuTab menu={menu} fetchMenu={fetchMenu} />}
                {user?.role === 'Admin' && activeTab === 'manage-orders' && <AdminOrdersTab />}
            </>
        )}
      </div>
    </div>
  );
}