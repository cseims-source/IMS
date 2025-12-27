import React, { useState, useEffect, useMemo } from 'react';
import { 
    Edit, Trash2, Search, Upload, Database, 
    Users, Cpu, RefreshCw, Filter, UserPlus, 
    X, Layers, FileDown, Printer, Eye, ChevronDown,
    ShieldCheck, Briefcase, UserCog
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as XLSX from 'xlsx';
import FacultyForm from './FacultyForm';
import FacultyImportModal from './FacultyImportModal';
import FacultyDetailModal from './FacultyDetailModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const StatCard = ({ title, value, icon, color, delay }) => (
    <div 
        className={`bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-white dark:border-gray-700/50 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[70px] opacity-10 group-hover:opacity-30 transition-opacity ${color}`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-500 group-hover:text-primary-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-gray-100 dark:border-gray-700`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
        </div>
    </div>
);

export default function FacultyManager() {
    const [facultyList, setFacultyList] = useState([]);
    const [stats, setStats] = useState({ total: 0, activeNodes: 0, deptClusters: 0, seniorAssets: 0 });
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [viewingFaculty, setViewingFaculty] = useState(null);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [deletingFaculty, setDeletingFaculty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { api, user } = useAuth();
    const { addToast } = useNotification();

    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        fetchAll();
    }, [api]);

    const fetchAll = () => {
        fetchFaculty();
        fetchStats();
    };

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const data = await api('/api/faculty');
            setFacultyList(data);
        } catch (error) {
            addToast('Registry sync failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api('/api/faculty/stats');
            setStats(data);
        } catch (error) { console.error(error); }
    };

    const handleExport = () => {
        if (facultyList.length === 0) return addToast('Registry empty.', 'info');
        const exportData = facultyList.map(f => ({
            'Expert Name': f.name,
            'Registry Email': f.email,
            'Dept Hub': f.department,
            'Designation': f.designation,
            'Logic Expertise': f.subject,
            'Exp (Yrs)': f.experienceYears,
            'Status': f.status
        }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Faculty_Registry');
        XLSX.writeFile(wb, `AIET_Faculty_Lattice_${new Date().getFullYear()}.xlsx`);
        addToast('Lattice exported successfully.', 'success');
    };

    const filteredFaculty = useMemo(() => {
        return facultyList.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [facultyList, searchTerm]);

    const handleSave = async (facultyData) => {
        const method = editingFaculty ? 'PUT' : 'POST';
        const url = editingFaculty ? `/api/faculty/${editingFaculty._id}` : '/api/faculty';
        try {
            await api(url, { method, body: JSON.stringify(facultyData) });
            setIsFormOpen(false);
            setEditingFaculty(null);
            fetchAll();
            addToast(`Node committed to registry.`, 'success');
        } catch (error) { addToast('Transmission failed.', 'error'); }
    };

    const confirmDelete = async () => {
        try {
            await api(`/api/faculty/${deletingFaculty._id}`, { method: 'DELETE' });
            setDeletingFaculty(null);
            fetchAll();
            addToast('Expert node purged.', 'success');
        } catch (error) { addToast('Purge sequence aborted.', 'error'); }
    };

    return (
        <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-24 px-4 sm:px-0">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                        Faculty <span className="text-primary-600">Matrix</span>
                    </h1>
                    <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                        <Cpu size={14} className="text-accent-500 animate-pulse" /> CORE REGISTRY INFRASTRUCTURE
                    </p>
                </div>
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <button onClick={handleExport} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-widest hover:bg-gray-50 transition-all shadow-xl active:scale-95 group">
                        <FileDown size={18} className="mr-2 group-hover:translate-y-1 transition-transform" /> Sync Excel
                    </button>
                    {isAdmin && (
                        <>
                            <button onClick={() => setIsImportOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-4 bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 group">
                                <Upload size={18} className="mr-2 group-hover:-translate-y-1 transition-transform" /> Bulk Inject
                            </button>
                            <button onClick={() => { setEditingFaculty(null); setIsFormOpen(true); }} className="flex-1 lg:flex-none flex items-center justify-center px-10 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-widest hover:bg-primary-700 transition shadow-2xl shadow-primary-500/30 active:scale-95 group">
                                <UserPlus size={18} className="mr-2 group-hover:rotate-12 transition-transform" /> Initialize Node
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Expert Nodes" value={stats.total} icon={<Users />} color="bg-primary-500" delay={100} />
                <StatCard title="Dept Clusters" value={stats.deptClusters} icon={<Layers />} color="bg-accent-500" delay={200} />
                <StatCard title="Senior Assets" value={stats.seniorAssets} icon={<Briefcase />} color="bg-secondary-500" delay={300} />
                <StatCard title="Registry Node" value="Optimal" icon={<ShieldCheck />} color="bg-green-500" delay={400} />
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-4 ml-2">
                    <h2 className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-gray-400 flex items-center gap-3">
                        <Filter className="text-primary-500" size={18} /> Neural Sequence Filter
                    </h2>
                </div>
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Scan Registry Identifiers (Name, Dept, Subject)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-gray-50 dark:bg-gray-950 border-0 rounded-[2rem] text-[0.85rem] font-bold focus:ring-4 focus:ring-primary-500/10 shadow-inner transition-all"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden relative min-h-[450px]">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                        <RefreshCw className="animate-spin text-primary-500" size={48} />
                        <p className="text-[0.75rem] font-black uppercase tracking-[0.5em] text-gray-400 animate-pulse">Syncing neural pool...</p>
                    </div>
                ) : filteredFaculty.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center animate-scale-in">
                        <UserCog size={54} className="text-gray-200 dark:text-gray-700 mb-8" />
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Node Trace Empty</h2>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-md">
                                <tr className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 border-b dark:border-gray-700">
                                    <th className="p-10 pl-14">Expert Profile</th>
                                    <th className="p-10">Academic Hub</th>
                                    <th className="p-10">Lattice Status</th>
                                    <th className="p-10 text-right pr-14">Operations Node</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredFaculty.map((faculty, idx) => (
                                    <tr key={faculty._id} className="hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                                        <td className="p-8 pl-14">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                    <img src={faculty.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${faculty.name}`} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-base group-hover:text-primary-600 transition-colors">{faculty.name}</p>
                                                    <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">{faculty.designation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <div className="flex flex-col gap-1.5">
                                                <span className="text-[0.7rem] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                    <Layers size={14} /> {faculty.department} Hub
                                                </span>
                                                <span className="text-[0.6rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{faculty.subject} Expertise</span>
                                            </div>
                                        </td>
                                        <td className="p-8">
                                            <span className={`px-4 py-1.5 rounded-xl text-[0.55rem] font-black uppercase tracking-widest shadow-sm ${
                                                faculty.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                                Registry: {faculty.status}
                                            </span>
                                        </td>
                                        <td className="p-8 text-right pr-14">
                                            <div className="flex justify-end gap-3">
                                                <button onClick={() => setViewingFaculty(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Neural Dossier"><Eye size={18}/></button>
                                                <button onClick={() => setViewingFaculty({...faculty, _shouldPrint: true})} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-accent-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Physical Protocol"><Printer size={18}/></button>
                                                {isAdmin && (
                                                    <>
                                                        <button onClick={() => { setEditingFaculty(faculty); setIsFormOpen(true); }} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Calibrate Node"><Edit size={18}/></button>
                                                        <button onClick={() => setDeletingFaculty(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Purge Node"><Trash2 size={18}/></button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isFormOpen && <FacultyForm faculty={editingFaculty} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
            {isImportOpen && <FacultyImportModal onImportSuccess={() => { setIsImportOpen(false); fetchAll(); }} onClose={() => setIsImportOpen(false)} />}
            {viewingFaculty && <FacultyDetailModal faculty={viewingFaculty} onClose={() => setViewingFaculty(null)} />}

            <ConfirmationModal
                isOpen={!!deletingFaculty}
                onClose={() => setDeletingFaculty(null)}
                onConfirm={confirmDelete}
                title="Wipe Node Logic"
                message={`Disconnect "${deletingFaculty?.name}" from institutional grid? Access keys will be terminated.`}
            />
        </div>
    );
}
