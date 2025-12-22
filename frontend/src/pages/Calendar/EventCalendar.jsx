
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const mockEvents = {
  '2024-10-05': [{ title: 'Annual Sports Day', category: 'Event' }],
  '2024-09-20': [{ title: 'Library Maintenance', category: 'Administrative' }],
  '2024-09-28': [{ title: 'Mid-Term Math Exam', category: 'Academic' }, { title: 'Mid-Term Science Exam', category: 'Academic' }],
};

const categoryColors = {
    Academic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    Administrative: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Event: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Holiday: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};


const AddEventModal = ({ onSave, onCancel, date }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Academic');
    
    const handleSubmit = () => {
        if(title) {
            onSave({ title, category });
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Add Event on {date.toDateString()}</h2>
                    <button onClick={onCancel}><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Event Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded"/>
                    <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border rounded">
                        <option>Academic</option>
                        <option>Administrative</option>
                        <option>Event</option>
                        <option>Holiday</option>
                    </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

export default function EventCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2024, 8, 1)); // Start with Sep 2024
  const [events, setEvents] = useState(mockEvents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };
  
  const handleAddEventClick = (day) => {
    if (user?.role === 'Admin') {
        setSelectedDate(new Date(year, month, day));
        setIsModalOpen(true);
    }
  };

  const saveEvent = (eventData) => {
    const dateString = selectedDate.toISOString().split('T')[0];
    setEvents(prev => ({
        ...prev,
        [dateString]: [...(prev[dateString] || []), eventData]
    }));
    setIsModalOpen(false);
    setSelectedDate(null);
  };
  
  const today = new Date();

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Event Calendar</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft/></button>
          <h2 className="text-xl font-semibold w-36 text-center">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100"><ChevronRight/></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-sm text-gray-600 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day}>{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="border rounded-md bg-gray-50"></div>)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvents = events[dateString] || [];
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          return (
            <div key={day} onClick={() => handleAddEventClick(day)} className={`border rounded-md h-28 p-2 flex flex-col ${user?.role === 'Admin' ? 'cursor-pointer hover:bg-blue-50' : ''}`}>
              <span className={`font-semibold ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>{day}</span>
              <div className="flex-grow overflow-y-auto text-xs mt-1 space-y-1">
                {dayEvents.map((event, idx) => {
                    const colorClass = categoryColors[event.category] || categoryColors.default;
                    return (
                        <div key={idx} className={`${colorClass} p-1 rounded truncate`}>{event.title}</div>
                    );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && <AddEventModal date={selectedDate} onSave={saveEvent} onCancel={() => setIsModalOpen(false)}/>}
    </div>
  );
}
