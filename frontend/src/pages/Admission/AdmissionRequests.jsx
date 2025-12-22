import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    Search, Filter, Trash2, CheckCircle, XCircle, Clock, 
    MessageSquare, Phone, Mail, MapPin, Calendar, 
    ChevronDown, Edit3, Loader2, UserPlus, GraduationCap
} from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';
import ConfirmationModal from '../../components/ConfirmationModal';
import Spinner from '../../components/Spinner';

const statusColors = {
    New: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
    Accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Waiting List': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};

const statusIcons = {
    New: <MessageSquare size={14} />,
    Accepted: <CheckCircle size={14} />,
    Rejected: <XCircle size={14} />,
    'Waiting List': <Clock size={14} />,
};

const AdmissionInquiryCard = ({ inquiry, onUpdate, onDelete }) => {
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [notes, setNotes] = useState(inquiry.notes || '');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        await onUpdate(inquiry._id, { status: newStatus });
        setIsUpdating(false);
    };

    const handleNotesSave = async () => {
        setIsUpdating(true);
        await onUpdate(inquiry._id, { notes });
        setIsUpdating(false);
        setIsEditingNotes(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 animate-fade-in-up group relative overflow-hidden">
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 w-full h-1.5 ${inquiry.status === 'New' ? 'bg-primary-500' : inquiry.status === 'Accepted' ? 'bg-green-500' : inquiry.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>

            <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${statusColors[inquiry.status]}`}>
                            <UserPlus size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">{inquiry.name}</h3>
                            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                                <Calendar size={12} /> {formatDateTime(inquiry.createdAt)}
                            </p>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest shadow-sm ${statusColors[inquiry.status]}`}>
                        {isUpdating ? <Loader2 size={12} className="animate-spin" /> : statusIcons[inquiry.status]}
                        {inquiry.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <GraduationCap size={16} className="text-primary-500" />
                            <span className="font-bold">{inquiry.course}</span> {inquiry.branch && <span className="text-gray-400">• {inquiry.branch}</span>}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Mail size={16} className="text-primary-500" />
                            <span className="truncate">{inquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Phone size={16} className="text-primary-500" />
                            <span className="font-mono">{inquiry.mobile}</span>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <MapPin size={16} className="text-primary-500" />
                            <span>{inquiry.city}, {inquiry.state}</span>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="flex-grow mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-[0.65rem] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <Edit3 size={12} /> Admin Notes
                        </label>
                        {!isEditingNotes && (
                            <button onClick={() => setIsEditingNotes(true)} className="text-[0.6rem] font-bold text-primary-600 hover:underline">
                                Edit
                            </button>
                        )}
                    </div>
                    {isEditingNotes ? (
                        <div className="space-y-2">
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl text-xs focus:ring-2 focus:ring-primary-500 h-20 resize-none"
                                placeholder="Add follow-up notes..."
                            />
                            <div className="flex justify-end gap-2">
                                <button onClick={() => setIsEditingNotes(false)} className="px-3 py-1 text-[0.6rem] font-bold text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button onClick={handleNotesSave} className="px-3 py-1 text-[0.6rem] font-bold text-white bg-primary-600 rounded-lg shadow-lg">Save Note</button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[60px]">
                            {inquiry.notes || "No notes added yet..."}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2">
                    <button onClick={() => handleStatusChange('Accepted')} disabled={isUpdating} className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2 bg-green-500/10 text-green-600 text-[0.65rem] font-black uppercase tracking-widest rounded-xl hover:bg-green-500 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                        Accept
                    </button>
                    <button onClick={() => handleStatusChange('Waiting List')} disabled={isUpdating} className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2 bg-yellow-500/10 text-yellow-600 text-[0.65rem] font-black uppercase tracking-widest rounded-xl hover:bg-yellow-500 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                        Waitlist
                    </button>
                    <button onClick={() => handleStatusChange('Rejected')} disabled={isUpdating} className="flex-grow flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-600 text-[0.65rem] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50">
                        Reject
                    </button>
                    <button onClick={() => onDelete(inquiry)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function AdmissionRequests() {
    const { api } = useAuth();
    const { addToast } = useNotification();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [confirmDelete, setConfirmDelete] = useState(null);

    const fetchInquiries = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api('/api/admission/requests');
            setInquiries(data);
        } catch (error) {
            console.error("Failed to fetch inquiries", error);
            addToast("Could not load admission requests.", "error");
        } finally {
            setLoading(false);
        }
    }, [api, addToast]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const handleUpdate = async (id, updateData) => {
        try {
            await api(`/api/admission/requests/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updateData),
            });
            setInquiries(prev => prev.map(item => item._id === id ? { ...item, ...updateData } : item));
            addToast("Inquiry updated successfully.", "success");
        } catch (error) {
            addToast("Failed to update inquiry.", "error");
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api(`/api/admission/requests/${confirmDelete._id}`, { method: 'DELETE' });
            setInquiries(prev => prev.filter(item => item._id !== confirmDelete._id));
            addToast("Inquiry deleted.", "success");
        } catch (error) {
            addToast("Failed to delete inquiry.", "error");
        } finally {
            setConfirmDelete(null);
        }
    };

    const filteredInquiries = useMemo(() => {
        return inquiries.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.course.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [inquiries, searchTerm, filterStatus]);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-wrap justify-between items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/20 dark:border-gray-700/30 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Admission <span className="text-primary-600">Portal</span></h1>
                    <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Candidate Enrollment Tracking</p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search requests..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-6 py-3 bg-gray-50 dark:bg-gray-900 rounded-2xl border-0 focus:ring-2 focus:ring-primary-500 font-bold text-sm w-64 shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border-0 shadow-inner">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 font-bold text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300"
                        >
                            <option value="All">All Status</option>
                            <option value="New">New</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Waiting List">Waitlist</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[400px] bg-white dark:bg-gray-800 rounded-3xl animate-pulse border border-gray-100 dark:border-gray-700/50"></div>
                    ))}
                </div>
            ) : filteredInquiries.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="p-8 bg-gray-50 dark:bg-gray-900 inline-block rounded-full mb-6">
                        <MessageSquare size={64} className="text-gray-300 mx-auto" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No inquiries found</h2>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Awaiting new admission candidates</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {filteredInquiries.map(inquiry => (
                        <AdmissionInquiryCard 
                            key={inquiry._id} 
                            inquiry={inquiry} 
                            onUpdate={handleUpdate} 
                            onDelete={setConfirmDelete} 
                        />
                    ))}
                </div>
            )}

            <ConfirmationModal 
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Delete Admission Inquiry"
                message={`Are you sure you want to permanently delete the inquiry for "${confirmDelete?.name}"? This record will be lost forever.`}
            />
        </div>
    );
}