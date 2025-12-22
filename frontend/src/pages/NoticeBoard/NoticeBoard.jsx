import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, X, Tag, Calendar, Edit, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import ConfirmationModal from '../../components/ConfirmationModal';

const priorityColor = {
    High: 'border-red-500',
    Medium: 'border-yellow-500',
    Low: 'border-primary-500',
}
const priorityBgColor = {
    High: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Low: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
}


const NoticeModal = ({ notice, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100"><X/></button>
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">{notice.title}</h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4 mb-4">
                <span className="flex items-center"><Calendar size={14} className="mr-1" /> {formatDate(notice.date)}</span>
                <span className="flex items-center"><Tag size={14} className="mr-1" /> {notice.category}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${priorityBgColor[notice.priority]}`}>{notice.priority} Priority</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{notice.content}</p>
        </div>
    </div>
);

const NoticeForm = ({ notice, onSave, onCancel }) => {
    const [formData, setFormData] = useState(notice || { title: '', content: '', category: 'Academic', priority: 'Medium'});
    const handleChange = e => setFormData({...formData, [e.target.name]: e.target.value});
    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-lg space-y-4">
                <h2 className="text-xl font-bold">{notice ? 'Edit Notice' : 'Create New Notice'}</h2>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" required />
                <textarea name="content" value={formData.content} onChange={handleChange} placeholder="Content" className="w-full p-2 border rounded h-32" required/>
                <div className="grid grid-cols-2 gap-4">
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded">
                        <option>Academic</option><option>Administrative</option><option>Event</option>
                    </select>
                     <select name="priority" value={formData.priority} onChange={handleChange} className="w-full p-2 border rounded">
                        <option>Low</option><option>Medium</option><option>High</option>
                    </select>
                </div>
                 <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button><button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Post Notice</button></div>
            </form>
        </div>
    )
}


export default function NoticeBoard() {
  const { user, api } = useAuth();
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [editingNotice, setEditingNotice] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, [api]);

  const fetchNotices = async () => {
      setLoading(true);
      try {
        const data = await api('/api/notices');
        setNotices(data);
      } catch (error) {
          console.error("Failed to fetch notices", error);
      } finally {
          setLoading(false);
      }
  };
  
  const handleSaveNotice = async (noticeData) => {
    try {
        const url = editingNotice ? `/api/notices/${editingNotice._id}` : '/api/notices';
        const method = editingNotice ? 'PUT' : 'POST';
        await api(url, {
            method: method,
            body: JSON.stringify(noticeData)
        });
        setIsFormOpen(false);
        setEditingNotice(null);
        fetchNotices();
    } catch(error) {
        console.error("Failed to save notice", error);
    }
  }

  const handleAddClick = () => {
      setEditingNotice(null);
      setIsFormOpen(true);
  }

  const handleEditClick = (notice) => {
      setEditingNotice(notice);
      setIsFormOpen(true);
  }

  const handleDeleteClick = (notice) => {
    setConfirmAction({
        title: 'Delete Notice',
        message: `Are you sure you want to delete the notice titled "${notice.title}"? This action cannot be undone.`,
        onConfirm: async () => {
            try {
                await api(`/api/notices/${notice._id}`, { method: 'DELETE' });
                fetchNotices();
            } catch(error) {
                console.error("Failed to delete notice", error);
            } finally {
                setConfirmAction(null);
            }
        }
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Digital Notice Board</h1>
        {user?.role === 'Admin' && (
            <button onClick={handleAddClick} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                <Plus size={20} className="mr-2" /> Create Notice
            </button>
        )}
      </div>

      {loading ? <div className="text-center p-8">Loading notices...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notices.map(notice => (
                <div key={notice._id} className={`p-5 bg-white dark:bg-gray-800/50 rounded-lg shadow border-l-4 ${priorityColor[notice.priority]} hover:shadow-xl transition-shadow flex flex-col`}>
                    <div onClick={() => setSelectedNotice(notice)} className="cursor-pointer flex-grow">
                        <div className="flex justify-between items-start">
                            <h2 className="font-bold text-lg mb-2 text-gray-800 dark:text-gray-100">{notice.title}</h2>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${priorityBgColor[notice.priority]}`}>{notice.priority}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{notice.content}</p>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t dark:border-gray-700">
                        <span>{notice.category} | {formatDate(notice.date)}</span>
                        {user?.role === 'Admin' && (
                            <div className="flex gap-2">
                                <button onClick={() => handleEditClick(notice)} className="p-1.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-gray-700 rounded-full"><Edit size={14}/></button>
                                <button onClick={() => handleDeleteClick(notice)} className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-gray-700 rounded-full"><Trash2 size={14}/></button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
      )}

      {selectedNotice && <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />}
      {isFormOpen && <NoticeForm notice={editingNotice} onSave={handleSaveNotice} onCancel={() => setIsFormOpen(false)} />}
      <ConfirmationModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={confirmAction?.onConfirm}
        title={confirmAction?.title}
        message={confirmAction?.message}
      />
    </div>
  );
}