import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    Search, Filter, Trash2, CheckCircle, XCircle, Clock, 
    MessageSquare, Phone, Mail, MapPin, Calendar, 
    ChevronDown, Edit3, Loader2, UserPlus, GraduationCap,
    Eye, X, Database, Users, Fingerprint, Award
} from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/dateFormatter';
import ConfirmationModal from '../../components/ConfirmationModal';
import Spinner from '../../components/Spinner';

const statusColors = {
    New: 'bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300',
    Accepted: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Rejected: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    'Waiting List': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};

const AdmissionInquiryCard = ({ inquiry, onUpdate, onDelete, onView }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus) => {
        setIsUpdating(true);
        await onUpdate(inquiry._id, { status: newStatus });
        setIsUpdating(false);
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 animate-fade-in-up group relative overflow-hidden">
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
                        {inquiry.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-6 text-sm">
                    <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl">
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <GraduationCap size={16} className="text-primary-500" />
                            <span className="font-bold text-[0.7rem] uppercase">{inquiry.course}</span> {inquiry.branch && <span className="text-gray-400">• {inquiry.branch}</span>}
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Mail size={16} className="text-primary-500" />
                            <span className="truncate text-xs font-bold">{inquiry.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
                            <Phone size={16} className="text-primary-500" />
                            <span className="font-mono text-xs">{inquiry.mobile}</span>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-2 mt-auto">
                    <button onClick={() => onView(inquiry)} className="flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[0.6rem] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all active:scale-95">
                        <Eye size={14} /> Full Dossier
                    </button>
                    {inquiry.status !== 'Accepted' && (
                        <button onClick={() => handleStatusChange('Accepted')} disabled={isUpdating} className="px-4 py-2 bg-green-500 text-white text-[0.6rem] font-black uppercase tracking-widest rounded-xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50">
                            Accept
                        </button>
                    )}
                    <button onClick={() => onDelete(inquiry)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const PreviewModal = ({ inquiry, onClose, onAccept }) => {
    if (!inquiry) return null;
    return (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-2xl flex justify-center items-center z-[250] p-4">
            <div className="bg-white dark:bg-gray-950 rounded-[4rem] shadow-3xl w-full max-w-4xl h-[90vh] flex flex-col border border-white/10 overflow-hidden animate-scale-in">
                <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary-600 rounded-3xl text-white shadow-xl animate-pulse"><Fingerprint size={28} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Pre-Admission <span className="text-primary-600">Dossier</span></h2>
                            <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">External Onboarding Lead</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-3xl hover:text-red-500 transition-all"><X size={24}/></button>
                </div>

                <div className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-12">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase text-primary-500 tracking-[0.3em] flex items-center gap-3"><Users size={16}/> Identity markers</h3>
                            <div className="grid grid-cols-1 gap-4 p-6 bg-gray-50 dark:bg-gray-900 rounded-[2.5rem]">
                                <div className="space-y-1">
                                    <p className="text-[0.55rem] font-black uppercase text-gray-400">Full Node Name</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white uppercase">{inquiry.name}</p>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <div className="space-y-1 flex-1"><p className="text-[0.55rem] font-black uppercase text-gray-400">Gender</p><p className="font-bold">{inquiry.gender || 'N/A'}</p></div>
                                    <div className="space-y-1 flex-1"><p className="text-[0.55rem] font-black uppercase text-gray-400">DOB</p><p className="font-bold">{formatDate(inquiry.dob)}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-xs font-black uppercase text-secondary-500 tracking-[0.3em] flex items-center gap-3"><Database size={16}/> Academic protocol</h3>
                            <div className="grid grid-cols-1 gap-4 p-6 bg-primary-50/50 dark:bg-primary-900/10 rounded-[2.5rem] border border-primary-100 dark:border-primary-800">
                                <div className="space-y-1">
                                    <p className="text-[0.55rem] font-black uppercase text-primary-400">Intent Sequence</p>
                                    <p className="text-lg font-black text-primary-600 uppercase">{inquiry.course} - {inquiry.branch}</p>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <div className="space-y-1 flex-1"><p className="text-[0.55rem] font-black uppercase text-primary-400">10th Score</p><p className="font-bold text-lg">{inquiry.education10th?.percentage}%</p></div>
                                    <div className="space-y-1 flex-1"><p className="text-[0.55rem] font-black uppercase text-primary-400">Last Inst.</p><p className="text-[0.65rem] font-black line-clamp-2 uppercase">{inquiry.lastExam?.instituteName || 'N/A'}</p></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h3 className="text-xs font-black uppercase text-accent-500 tracking-[0.3em] flex items-center gap-3"><MapPin size={16}/> Spatial logic</h3>
                        <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800">
                            <p className="text-base font-bold leading-relaxed">{inquiry.address || 'No specific address provided.'}</p>
                            <p className="text-xs font-black uppercase text-accent-500 mt-4 tracking-[0.2em]">{inquiry.city}, {inquiry.state} Coordinate Cluster</p>
                        </div>
                    </section>
                </div>

                <div className="p-10 border-t dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl flex justify-between items-center">
                    <p className="text-[0.55rem] font-black uppercase tracking-[0.5em] text-gray-400 ml-4 hidden md:block">Verification Session Active • Pre-Registry Phase</p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-10 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-[0.6rem] tracking-widest rounded-2xl">Exit Review</button>
                        {inquiry.status !== 'Accepted' && (
                            <button onClick={() => onAccept(inquiry._id)} className="px-14 py-4 bg-primary-600 text-white font-black uppercase text-[0.65rem] tracking-[0.3em] rounded-3xl shadow-2xl shadow-primary-500/40 hover:scale-105 transition-all">Commit to Registry</button>
                        )}
                    </div>
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
    const [viewingInquiry, setViewingInquiry] = useState(null);

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
            addToast("Registry status updated.", "success");
            setViewingInquiry(null);
        } catch (error) {
            addToast("Registry sync failed.", "error");
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api(`/api/admission/requests/${confirmDelete._id}`, { method: 'DELETE' });
            setInquiries(prev => prev.filter(item => item._id !== confirmDelete._id));
            addToast("Lead purged.", "success");
        } catch (error) {
            addToast("Purge sequence failed.", "error");
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
        <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 rounded-[3rem] shadow-xl border border-white/20 dark:border-gray-700/30 gap-8">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">Onboarding <span className="text-primary-600">Requests</span></h1>
                    <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.3em] mt-3 flex items-center gap-3">
                        <Users size={14} className="text-accent-500 animate-pulse" /> CLOUD IDENTITY REVIEW HUB
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                    <div className="relative flex-grow lg:flex-grow-0">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Scan identities..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full lg:w-72 pl-12 pr-6 py-4 bg-gray-50 dark:bg-gray-950 rounded-2xl border-0 focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-950 rounded-2xl shadow-inner border border-gray-100 dark:border-gray-800">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 font-black text-[0.6rem] uppercase tracking-widest text-gray-600 dark:text-gray-300 cursor-pointer"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-[450px] bg-white dark:bg-gray-800 rounded-[3rem] animate-pulse border border-gray-100 dark:border-gray-700/50 shadow-sm"></div>
                    ))}
                </div>
            ) : filteredInquiries.length === 0 ? (
                <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[4rem] shadow-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <div className="p-10 bg-gray-50 dark:bg-gray-900 inline-block rounded-full mb-8">
                        <MessageSquare size={80} className="text-gray-200 mx-auto" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Identity Lead Silence</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[0.6rem] mt-4">Awaiting incoming onboarding dossiers</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12 px-2">
                    {filteredInquiries.map(inquiry => (
                        <AdmissionInquiryCard 
                            key={inquiry._id} 
                            inquiry={inquiry} 
                            onUpdate={handleUpdate} 
                            onDelete={setConfirmDelete} 
                            onView={setViewingInquiry}
                        />
                    ))}
                </div>
            )}

            <PreviewModal 
                inquiry={viewingInquiry} 
                onClose={() => setViewingInquiry(null)} 
                onAccept={(id) => handleUpdate(id, { status: 'Accepted' })}
            />

            <ConfirmationModal 
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleDelete}
                title="Wipe Enrollment Lead"
                message={`Confirm permanent decommissioning of the request from "${confirmDelete?.name}"? This node history will be purged.`}
            />
        </div>
    );
}