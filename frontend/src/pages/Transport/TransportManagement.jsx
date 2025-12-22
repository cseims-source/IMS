import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bus, Map, UserPlus, Plus, Edit, Trash2 } from 'lucide-react';

const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            active
                ? 'border-primary-500 text-primary-600 dark:text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300'
        }`}
    >
        {children}
    </button>
);

const VehicleForm = ({ vehicle, onSave, onCancel }) => {
    const [formData, setFormData] = useState(vehicle || { vehicleNumber: '', model: '', capacity: '', driverName: '', driverContact: '' });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
                <input name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} placeholder="Vehicle Number (e.g., UP78-1234)" className="w-full p-2 border rounded" required />
                <input name="model" value={formData.model} onChange={handleChange} placeholder="Model (e.g., Tata Starbus)" className="w-full p-2 border rounded" />
                <input name="capacity" type="number" value={formData.capacity} onChange={handleChange} placeholder="Capacity" className="w-full p-2 border rounded" />
                <input name="driverName" value={formData.driverName} onChange={handleChange} placeholder="Driver's Name" className="w-full p-2 border rounded" required />
                <input name="driverContact" value={formData.driverContact} onChange={handleChange} placeholder="Driver's Contact" className="w-full p-2 border rounded" required />
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    );
};

const RouteForm = ({ route, vehicles, onSave, onCancel }) => {
    const [formData, setFormData] = useState(route ? { ...route, stops: route.stops.join(', '), vehicle: route.vehicle?._id || '' } : { routeName: '', stops: '', vehicle: '' });
    const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = e => { 
        e.preventDefault(); 
        onSave({
            ...formData,
            stops: formData.stops.split(',').map(s => s.trim()).filter(Boolean)
        });
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">{route ? 'Edit Route' : 'Add New Route'}</h2>
                <input name="routeName" value={formData.routeName} onChange={handleChange} placeholder="Route Name (e.g., Downtown Loop)" className="w-full p-2 border rounded" required />
                <textarea name="stops" value={formData.stops} onChange={handleChange} placeholder="Stops (comma-separated, e.g., Central Station, City Park)" className="w-full p-2 border rounded h-24" required/>
                <select name="vehicle" value={formData.vehicle} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="">-- Assign a Vehicle (Optional) --</option>
                    {vehicles.map(v => <option key={v._id} value={v._id}>{v.vehicleNumber} ({v.model})</option>)}
                </select>
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    );
};

const AllocationForm = ({ students, routes, onSave, onCancel }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedStop, setSelectedStop] = useState('');

    const availableStops = routes.find(r => r._id === selectedRoute)?.stops || [];

    const handleSubmit = e => {
        e.preventDefault();
        if (!selectedStudent || !selectedRoute || !selectedStop) return alert('Please fill all fields.');
        onSave({ student: selectedStudent, route: selectedRoute, stop: selectedStop });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md space-y-4">
                <h2 className="text-xl font-bold">New Student Allocation</h2>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="w-full p-2 border rounded" required>
                    <option value="">-- Select Student --</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.stream})</option>)}
                </select>
                <select value={selectedRoute} onChange={e => { setSelectedRoute(e.target.value); setSelectedStop(''); }} className="w-full p-2 border rounded" required>
                    <option value="">-- Select Route --</option>
                    {routes.map(r => <option key={r._id} value={r._id}>{r.routeName}</option>)}
                </select>
                <select value={selectedStop} onChange={e => setSelectedStop(e.target.value)} className="w-full p-2 border rounded" required disabled={!selectedRoute}>
                    <option value="">-- Select Stop --</option>
                    {availableStops.map(stop => <option key={stop} value={stop}>{stop}</option>)}
                </select>
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Allocate</button></div>
            </form>
        </div>
    );
};

export default function TransportManagement() {
    const [activeTab, setActiveTab] = useState('vehicles');
    const { api } = useAuth();

    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [allocations, setAllocations] = useState([]);
    const [students, setStudents] = useState([]);

    const [isVehicleFormOpen, setIsVehicleFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);

    const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);

    const [isAllocationFormOpen, setIsAllocationFormOpen] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const [vehiclesData, routesData, allocationsData, studentsData] = await Promise.all([
                api('/api/transport/vehicles'),
                api('/api/transport/routes'),
                api('/api/transport/allocations'),
                api('/api/students'),
            ]);
            setVehicles(vehiclesData);
            setRoutes(routesData);
            setAllocations(allocationsData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Failed to fetch transport data", error);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Generic save/delete handlers
    const handleSave = async (type, data, id) => {
        const url = id ? `/api/transport/${type}/${id}` : `/api/transport/${type}`;
        const method = id ? 'PUT' : 'POST';
        await api(url, { method, body: JSON.stringify(data) });
        fetchData();
    };

    const handleDelete = async (type, id) => {
        if (window.confirm('Are you sure? This action cannot be undone.')) {
            await api(`/api/transport/${type}/${id}`, { method: 'DELETE' });
            fetchData();
        }
    };
    
    // UI rendering logic
    const renderContent = () => {
        switch(activeTab) {
            case 'vehicles':
                return <VehiclesTab data={vehicles} onAdd={() => { setEditingVehicle(null); setIsVehicleFormOpen(true); }} onEdit={v => { setEditingVehicle(v); setIsVehicleFormOpen(true); }} onDelete={id => handleDelete('vehicles', id)} />;
            case 'routes':
                return <RoutesTab data={routes} onAdd={() => { setEditingRoute(null); setIsRouteFormOpen(true); }} onEdit={r => { setEditingRoute(r); setIsRouteFormOpen(true); }} onDelete={id => handleDelete('routes', id)} />;
            case 'allocations':
                return <AllocationsTab data={allocations} onAdd={() => setIsAllocationFormOpen(true)} onDelete={id => handleDelete('allocations', id)} />;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Transport Management</h1>
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <TabButton active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')}><Bus className="mr-2" size={16} />Vehicles</TabButton>
                    <TabButton active={activeTab === 'routes'} onClick={() => setActiveTab('routes')}><Map className="mr-2" size={16} />Routes</TabButton>
                    <TabButton active={activeTab === 'allocations'} onClick={() => setActiveTab('allocations')}><UserPlus className="mr-2" size={16} />Student Allocation</TabButton>
                </nav>
            </div>
            <div className="mt-6">{renderContent()}</div>

            {isVehicleFormOpen && <VehicleForm vehicle={editingVehicle} onSave={data => handleSave('vehicles', data, editingVehicle?._id)} onCancel={() => setIsVehicleFormOpen(false)} />}
            {isRouteFormOpen && <RouteForm route={editingRoute} vehicles={vehicles} onSave={data => handleSave('routes', data, editingRoute?._id)} onCancel={() => setIsRouteFormOpen(false)} />}
            {isAllocationFormOpen && <AllocationForm students={students} routes={routes} onSave={data => handleSave('allocations', data)} onCancel={() => setIsAllocationFormOpen(false)} />}
        </div>
    );
}

const Table = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto"><table className="w-full text-left">
        <thead className="bg-gray-50 dark:bg-gray-700"><tr>{headers.map(h => <th key={h} className="p-3 font-semibold text-sm">{h}</th>)}</tr></thead>
        <tbody>{data.map(renderRow)}</tbody>
    </table></div>
);

const ActionButtons = ({ onEdit, onDelete }) => (
    <div className="flex gap-2">
        <button onClick={onEdit} className="p-2 text-primary-600 hover:bg-primary-100 rounded-full"><Edit size={16}/></button>
        <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button>
    </div>
);

const VehiclesTab = ({ data, onAdd, onEdit, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Vehicle Fleet</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1"/>Add Vehicle</button></div>
        <Table headers={['Vehicle No.', 'Model', 'Capacity', 'Driver', 'Contact', 'Actions']} data={data} renderRow={v => (
            <tr key={v._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3">{v.vehicleNumber}</td><td className="p-3">{v.model}</td><td className="p-3">{v.capacity}</td><td className="p-3">{v.driverName}</td><td className="p-3">{v.driverContact}</td>
                <td className="p-3"><ActionButtons onEdit={() => onEdit(v)} onDelete={() => onDelete(v._id)} /></td>
            </tr>
        )} />
    </div>
);

const RoutesTab = ({ data, onAdd, onEdit, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Transport Routes</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1"/>Add Route</button></div>
        <Table headers={['Route Name', 'Stops', 'Assigned Vehicle', 'Actions']} data={data} renderRow={r => (
            <tr key={r._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3">{r.routeName}</td><td className="p-3 text-xs">{r.stops.join(', ')}</td><td className="p-3">{r.vehicle?.vehicleNumber || 'N/A'}</td>
                <td className="p-3"><ActionButtons onEdit={() => onEdit(r)} onDelete={() => onDelete(r._id)} /></td>
            </tr>
        )} />
    </div>
);

const AllocationsTab = ({ data, onAdd, onDelete }) => (
    <div>
        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-semibold">Student Allocations</h2><button onClick={onAdd} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1"/>New Allocation</button></div>
        <Table headers={['Student', 'Stream', 'Route', 'Stop', 'Fees', 'Actions']} data={data} renderRow={a => (
            <tr key={a._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="p-3">{a.student?.firstName} {a.student?.lastName}</td><td className="p-3">{a.student?.stream}</td><td className="p-3">{a.route?.routeName}</td><td className="p-3">{a.stop}</td>
                <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${a.feesStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{a.feesStatus}</span></td>
                <td className="p-3"><button onClick={() => onDelete(a._id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16}/></button></td>
            </tr>
        )} />
    </div>
);