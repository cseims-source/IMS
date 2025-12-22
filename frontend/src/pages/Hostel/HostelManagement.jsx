import React, { useState, useEffect } from 'react';
import { Building, BedDouble, UserCheck, DollarSign, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/dateFormatter';

const RoomForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({ roomNumber: '', block: 'A', type: 'Single' });
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">Add New Room</h2>
                <input name="roomNumber" value={formData.roomNumber} onChange={handleChange} placeholder="Room Number (e.g., C101)" className="w-full p-2 border rounded" required/>
                <select name="block" value={formData.block} onChange={handleChange} className="w-full p-2 border rounded"><option>A</option><option>B</option><option>C</option></select>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border rounded"><option>Single</option><option>Double</option><option>Dormitory</option></select>
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    );
};

const AllocationForm = ({ rooms, onSave, onCancel }) => {
    const [formData, setFormData] = useState({ studentName: '', roomNumber: ''});
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = e => { e.preventDefault(); onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm space-y-4">
                <h2 className="text-xl font-bold">New Student Allocation</h2>
                <input name="studentName" value={formData.studentName} onChange={handleChange} placeholder="Student Name" className="w-full p-2 border rounded" required/>
                <select name="roomNumber" value={formData.roomNumber} onChange={handleChange} className="w-full p-2 border rounded" required>
                    <option value="">-- Select an available room --</option>
                    {rooms.filter(r => r.status === 'Available').map(r => <option key={r._id} value={r.roomNumber}>{r.roomNumber} ({r.type})</option>)}
                </select>
                <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Save</button></div>
            </form>
        </div>
    );
};


const TabButton = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
            active
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        {children}
    </button>
);

const statusColor = {
    Occupied: 'bg-red-100 text-red-800',
    Available: 'bg-green-100 text-green-800',
    Maintenance: 'bg-yellow-100 text-yellow-800',
};

const Table = ({ headers, data, renderRow }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="bg-gray-50"><tr>{headers.map(h => <th key={h} className="p-3 font-semibold text-sm">{h}</th>)}</tr></thead>
            <tbody>{data.map(renderRow)}</tbody>
        </table>
    </div>
);

export default function HostelManagement() {
  const [activeTab, setActiveTab] = useState('rooms');
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [isAllocationFormOpen, setIsAllocationFormOpen] = useState(false);
  const { api } = useAuth();

  useEffect(() => {
    fetchRooms();
    fetchAllocations();
  }, [api]);

  const fetchRooms = async () => {
    const data = await api('/api/hostel/rooms');
    setRooms(data);
  };
  
  const fetchAllocations = async () => {
    const data = await api('/api/hostel/allocations');
    setAllocations(data);
  };

  const handleSaveRoom = async (roomData) => {
    await api('/api/hostel/rooms', {
        method: 'POST',
        body: JSON.stringify(roomData)
    });
    setIsRoomFormOpen(false);
    fetchRooms();
  };
  
  const handleSaveAllocation = async (allocationData) => {
    try {
        await api('/api/hostel/allocations', {
            method: 'POST',
            body: JSON.stringify(allocationData)
        });
        setIsAllocationFormOpen(false);
        fetchRooms();
        fetchAllocations();
    } catch(error) {
        alert(`Allocation failed: ${error.message}`);
    }
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Hostel Management</h1>
      
      <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            <TabButton active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')}>
                <BedDouble size={16} className="mr-2"/> Room Management
            </TabButton>
             <TabButton active={activeTab === 'allocations'} onClick={() => setActiveTab('allocations')}>
                <UserCheck size={16} className="mr-2"/> Student Allocation
            </TabButton>
          </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'rooms' && (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Rooms List</h2>
                    <button onClick={() => setIsRoomFormOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1" />Add Room</button>
                </div>
                <Table 
                    headers={['Room No.', 'Block', 'Type', 'Status']}
                    data={rooms}
                    renderRow={(room) => (
                        <tr key={room._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{room.roomNumber}</td>
                            <td className="p-3">{room.block}</td>
                            <td className="p-3">{room.type}</td>
                            <td className="p-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[room.status]}`}>{room.status}</span></td>
                        </tr>
                    )}
                />
            </div>
        )}
        {activeTab === 'allocations' && (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Student Allocations</h2>
                    <button onClick={() => setIsAllocationFormOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md"><Plus size={16} className="mr-1" />New Allocation</button>
                </div>
                <Table
                    headers={['Student Name', 'Room No.', 'Allocation Date']}
                    data={allocations}
                    renderRow={(alloc) => (
                        <tr key={alloc._id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{alloc.studentName}</td>
                            <td className="p-3">{alloc.roomNumber}</td>
                            <td className="p-3">{formatDate(alloc.date)}</td>
                        </tr>
                    )}
                />
            </div>
        )}
      </div>

      {isRoomFormOpen && <RoomForm onSave={handleSaveRoom} onCancel={() => setIsRoomFormOpen(false)} />}
      {isAllocationFormOpen && <AllocationForm rooms={rooms} onSave={handleSaveAllocation} onCancel={() => setIsAllocationFormOpen(false)} />}
    </div>
  );
}