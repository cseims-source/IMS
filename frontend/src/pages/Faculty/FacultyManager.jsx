import React, { useState, useEffect, useMemo } from 'react';
import { 
    Edit, Trash2, Search, Upload, Database, 
    Users, Cpu, RefreshCw, Filter, UserPlus, 
    X, Layers, FileDown, Printer, Eye, ChevronDown,
    ShieldCheck, Briefcase, UserCog, CheckSquare, Square, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as XLSX from 'xlsx';
import FacultyForm from './FacultyForm';
import FacultyImportModal from './FacultyImportModal';
import FacultyDetailModal from './FacultyDetailModal';
import { formatDate } from '../../utils/dateFormatter';
import { normalizePhotoUrl } from '../../utils/photoUtils';

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
    const [discontinueData, setDiscontinueData] = useState({ dateOfLeave: '', serialNo: '', caste: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('active');
    const [staffTypeFilter, setStaffTypeFilter] = useState('All');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [bulkDiscontinueDate, setBulkDiscontinueDate] = useState(new Date().toISOString().split('T')[0]);
    const { api, user } = useAuth();
    const { addToast } = useNotification();

    const isAdmin = ['admin', 'super admin', 'superadmin'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        fetchAll();
    }, [api, viewMode]);

    const fetchAll = () => {
        fetchFaculty();
        fetchStats();
        setSelectedIds(new Set());
    };

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const query = viewMode === 'discontinued' ? '?status=Discontinued' : '?excludeStatus=Discontinued';
            const data = await api(`/api/faculty${query}`);
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
        const exportData = viewMode === 'discontinued'
            ? facultyList.map(f => ({
                'SL.NO': f.serialNo,
                'DATE OF LEAVE': f.dateOfLeave,
                'DESIGNATION': f.designation,
                'NAME OF THE STAFF': f.name,
                'DEPARTMENT': f.department,
                "FATHER'S NAME": f.fatherName,
                "MOTHER'S NAME": f.motherName,
                'CONTACT NO': f.phone,
                'WHATSAAP NO': f.whatsappNo,
                'AADHAR CARD NO': f.aadharNo,
                'PAN CARD NO': f.panNo,
                'E-MAIL ID': f.email,
                'CASTE': f.caste,
                'BLOOD GROUP': f.bloodGroup,
                'RELIGION': f.religion,
                'DATE OF JOINING (D.O.J.)': f.joiningDate,
                'DATE OF BIRTH (D.O.B.)': f.dateOfBirth,
                'PERMANENT ADDRESS (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/STATE)': f.address?.permanent,
                'PRESENT ADDRESS (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/ STATE)': f.address?.current,
                'HIGHEST QUALIFICATION WITH PASS OUT YEAR': f.highestQualification || f.qualification,
                'TEACHER ID (BPUT)': f.teacherId,
                'PASS PORT SIZE PHOTO': f.photo
            }))
            : facultyList.map(f => ({
                'Username': f.username,
                'Designation': f.designation,
                'Name of the Staff': f.name,
                'Department': f.department,
                "Father's Name": f.fatherName,
                "Mother's Name": f.motherName,
                'Contact No': f.phone,
                'WhatsApp No': f.whatsappNo,
                'Aadhar Card No': f.aadharNo,
                'PAN Card No': f.panNo,
                'E-mail ID': f.email,
                'Blood Group': f.bloodGroup,
                'Religion': f.religion,
                'Date of Joining (D.O.J.)': f.joiningDate,
                'Date of Birth (D.O.B.)': f.dateOfBirth,
                'Permanent Address': f.address?.permanent,
                'Present Address': f.address?.current,
                'Highest Qualification with Pass Out Year': f.highestQualification || f.qualification,
                'Teacher ID (BPUT)': f.teacherId,
                'Status': f.status
            }));
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Faculty_Registry');
        XLSX.writeFile(wb, `AIET_Faculty_Lattice_${new Date().getFullYear()}.xlsx`);
        addToast('Lattice exported successfully.', 'success');
    };

    const filteredFaculty = useMemo(() => {
        return facultyList.filter(f => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = (
                f.name?.toLowerCase().includes(term) ||
                f.department?.toLowerCase().includes(term) ||
                f.designation?.toLowerCase().includes(term) ||
                f.email?.toLowerCase().includes(term) ||
                f.username?.toLowerCase().includes(term) ||
                f.subject?.toLowerCase().includes(term)
            );
            const matchesType = staffTypeFilter === 'All' || f.staffType === staffTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [facultyList, searchTerm, staffTypeFilter]);

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

    const handleOpenRemove = (faculty) => {
        setDeletingFaculty(faculty);
        setDiscontinueData({
            dateOfLeave: new Date().toISOString().split('T')[0],
            serialNo: faculty?.serialNo || '',
            caste: faculty?.caste || ''
        });
    };

    const confirmDiscontinue = async () => {
        try {
            await api(`/api/faculty/${deletingFaculty._id}/discontinue`, {
                method: 'PUT',
                body: JSON.stringify({
                    dateOfLeave: discontinueData.dateOfLeave,
                    serialNo: discontinueData.serialNo,
                    caste: discontinueData.caste
                })
            });
            setDeletingFaculty(null);
            fetchAll();
            addToast('Faculty moved to discontinued registry.', 'success');
        } catch (error) {
            addToast('Discontinue sequence aborted.', 'error');
        }
    };

    const confirmDelete = async () => {
        try {
            await api(`/api/faculty/${deletingFaculty._id}`, { method: 'DELETE' });
            setDeletingFaculty(null);
            fetchAll();
            addToast('Expert node purged.', 'success');
        } catch (error) { addToast('Purge sequence aborted.', 'error'); }
    };

    const handleSelectOne = (id) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
    };

    const handleSelectAll = () => {
        if (selectedIds.size === filteredFaculty.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredFaculty.map(f => f._id)));
        }
    };

    const handleBulkDelete = async () => {
        try {
            await api('/api/faculty/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds) })
            });
            addToast(`${selectedIds.size} nodes purged from registry.`, 'success');
            setIsBulkDeleteOpen(false);
            fetchAll();
        } catch (error) {
            addToast(error?.message || 'Bulk purge failed.', 'error');
        }
    };

    const handleBulkDiscontinue = async () => {
        try {
            await api('/api/faculty/bulk-discontinue', {
                method: 'POST',
                body: JSON.stringify({ ids: Array.from(selectedIds), dateOfLeave: bulkDiscontinueDate })
            });
            addToast(`${selectedIds.size} nodes moved to discontinued registry.`, 'success');
            setIsBulkDeleteOpen(false);
            fetchAll();
        } catch (error) {
            addToast(error?.message || 'Bulk discontinue failed.', 'error');
        }
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
                    {isAdmin && selectedIds.size > 0 && (
                        <button onClick={() => setIsBulkDeleteOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-4 bg-red-500 text-white rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-widest hover:bg-red-600 transition-all shadow-xl active:scale-95 group">
                            <Trash2 size={18} className="mr-2" /> Purge {selectedIds.size} Nodes
                        </button>
                    )}
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

            <div className="flex flex-wrap gap-4">
                <button
                    onClick={() => setViewMode('active')}
                    className={`px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest border shadow-sm transition-all ${
                        viewMode === 'active'
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'
                    }`}
                >
                    Active Faculty
                </button>
                <button
                    onClick={() => setViewMode('discontinued')}
                    className={`px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest border shadow-sm transition-all ${
                        viewMode === 'discontinued'
                            ? 'bg-red-600 text-white border-red-600'
                            : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'
                    }`}
                >
                    Discontinued Faculty
                </button>
                <div className="flex items-center gap-3 ml-auto">
                    <span className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400">Staff Type</span>
                    <button
                        onClick={() => setStaffTypeFilter('All')}
                        className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border ${
                            staffTypeFilter === 'All'
                                ? 'bg-gray-900 text-white border-gray-900'
                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setStaffTypeFilter('Teaching')}
                        className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border ${
                            staffTypeFilter === 'Teaching'
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        Teaching
                    </button>
                    <button
                        onClick={() => setStaffTypeFilter('Non-Teaching')}
                        className={`px-4 py-2 rounded-xl text-[0.6rem] font-black uppercase tracking-widest border ${
                            staffTypeFilter === 'Non-Teaching'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-100 dark:border-gray-700'
                        }`}
                    >
                        Non-Teaching
                    </button>
                </div>
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
                                {viewMode === 'discontinued' ? (
                                    <tr className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 border-b dark:border-gray-700">
                                        <th className="p-10 pl-14">
                                            {isAdmin && (
                                                <button onClick={handleSelectAll} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                    {selectedIds.size === filteredFaculty.length ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                                </button>
                                            )}
                                        </th>
                                        <th className="p-10 pl-14">SL.NO</th>
                                        <th className="p-10">Date of Leave</th>
                                        <th className="p-10">Designation</th>
                                        <th className="p-10">Name of the Staff</th>
                                        <th className="p-10">Department</th>
                                        <th className="p-10">Staff Type</th>
                                        <th className="p-10">Contact</th>
                                        <th className="p-10">Email</th>
                                        <th className="p-10">Caste</th>
                                        <th className="p-10">Teacher ID</th>
                                        <th className="p-10">Status</th>
                                        <th className="p-10 text-right pr-14">Operations</th>
                                    </tr>
                                ) : (
                                    <tr className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 border-b dark:border-gray-700">
                                        <th className="p-10 pl-14">
                                            {isAdmin && (
                                                <button onClick={handleSelectAll} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                    {selectedIds.size === filteredFaculty.length ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                                </button>
                                            )}
                                        </th>
                                        <th className="p-10 pl-14">Staff Profile</th>
                                        <th className="p-10">Designation</th>
                                        <th className="p-10">Department</th>
                                        <th className="p-10">Staff Type</th>
                                        <th className="p-10">Contact</th>
                                        <th className="p-10">Email</th>
                                        <th className="p-10">Teacher ID</th>
                                        <th className="p-10">Status</th>
                                        <th className="p-10 text-right pr-14">Operations</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredFaculty.map((faculty, idx) => (
                                    <tr key={faculty._id} className="hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 30}ms` }}>
                                        {viewMode === 'discontinued' ? (
                                            <>
                                                <td className="p-8 pl-14">
                                                    {isAdmin && (
                                                        <button onClick={() => handleSelectOne(faculty._id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                            {selectedIds.has(faculty._id) ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-8 pl-14"><p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.serialNo || '---'}</p></td>
                                                <td className="p-8"><p className="text-[0.65rem] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest">{formatDate(faculty.dateOfLeave)}</p></td>
                                                <td className="p-8"><p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.designation || '---'}</p></td>
                                                <td className="p-8"><p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-base">{faculty.name}</p></td>
                                                <td className="p-8"><span className="text-[0.7rem] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{faculty.department || '---'}</span></td>
                                                <td className="p-8"><span className="text-[0.65rem] font-black uppercase tracking-widest text-amber-600">{faculty.staffType || '---'}</span></td>
                                                <td className="p-8">
                                                    <p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.phone || '---'}</p>
                                                    <p className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest">WA: {faculty.whatsappNo || '---'}</p>
                                                </td>
                                                <td className="p-8"><p className="text-[0.65rem] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest break-all">{faculty.email || '---'}</p></td>
                                                <td className="p-8"><p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.caste || '---'}</p></td>
                                                <td className="p-8"><p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.teacherId || '---'}</p></td>
                                                <td className="p-8">
                                                    <span className="px-4 py-1.5 rounded-xl text-[0.55rem] font-black uppercase tracking-widest shadow-sm bg-red-100 text-red-700">
                                                        {faculty.status || '---'}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right pr-14">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => setViewingFaculty(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Neural Dossier"><Eye size={18}/></button>
                                                        <button onClick={() => setViewingFaculty({...faculty, _shouldPrint: true})} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-accent-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Physical Protocol"><Printer size={18}/></button>
                                                        {isAdmin && (
                                                            <>
                                                                <button onClick={() => { setEditingFaculty(faculty); setIsFormOpen(true); }} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Calibrate Node"><Edit size={18}/></button>
                                                                <button onClick={() => handleOpenRemove(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Purge Node"><Trash2 size={18}/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="p-8 pl-14">
                                                    {isAdmin && (
                                                        <button onClick={() => handleSelectOne(faculty._id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                            {selectedIds.has(faculty._id) ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-8 pl-14">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-gray-950 border-2 border-gray-100 dark:border-gray-800 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                            <img
                                                                src={normalizePhotoUrl(faculty.photo) || `https://api.dicebear.com/8.x/initials/svg?seed=${faculty.name}`}
                                                                onError={(e) => {
                                                                    e.currentTarget.onerror = null;
                                                                    e.currentTarget.src = `https://api.dicebear.com/8.x/initials/svg?seed=${faculty.name}`;
                                                                }}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-base group-hover:text-primary-600 transition-colors">{faculty.name}</p>
                                                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">{faculty.designation}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.designation || '---'}</p>
                                                    <p className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest">{faculty.username || '---'}</p>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="text-[0.7rem] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                                                            <Layers size={14} /> {faculty.department || '---'}
                                                        </span>
                                                        <span className="text-[0.6rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{faculty.subject || '---'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-amber-600">{faculty.staffType || '---'}</span>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.phone || '---'}</p>
                                                    <p className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-widest">WA: {faculty.whatsappNo || '---'}</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[0.65rem] font-black text-gray-600 dark:text-gray-300 uppercase tracking-widest break-all">{faculty.email || '---'}</p>
                                                </td>
                                                <td className="p-8">
                                                    <p className="text-[0.7rem] font-black text-gray-900 dark:text-white uppercase tracking-widest">{faculty.teacherId || '---'}</p>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[0.55rem] font-black uppercase tracking-widest shadow-sm ${
                                                        faculty.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {faculty.status || '---'}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right pr-14">
                                                    <div className="flex justify-end gap-3">
                                                        <button onClick={() => setViewingFaculty(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Neural Dossier"><Eye size={18}/></button>
                                                        <button onClick={() => setViewingFaculty({...faculty, _shouldPrint: true})} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-accent-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Physical Protocol"><Printer size={18}/></button>
                                                        {isAdmin && (
                                                            <>
                                                                <button onClick={() => { setEditingFaculty(faculty); setIsFormOpen(true); }} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Calibrate Node"><Edit size={18}/></button>
                                                                <button onClick={() => handleOpenRemove(faculty)} className="p-3.5 bg-gray-50 dark:bg-gray-900 text-gray-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90" title="Purge Node"><Trash2 size={18}/></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </>
                                        )}
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

            {deletingFaculty && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 w-full max-w-xl shadow-2xl">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Remove Faculty</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Choose to move this faculty to the discontinued list or delete permanently.</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                            <div className="sm:col-span-2">
                                <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Date of Leave</label>
                                <input type="date" value={discontinueData.dateOfLeave} onChange={(e) => setDiscontinueData({ ...discontinueData, dateOfLeave: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl font-bold" />
                            </div>
                            <div>
                                <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">SL.NO</label>
                                <input value={discontinueData.serialNo} onChange={(e) => setDiscontinueData({ ...discontinueData, serialNo: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl font-bold" />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Caste</label>
                                <input value={discontinueData.caste} onChange={(e) => setDiscontinueData({ ...discontinueData, caste: e.target.value })} className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl font-bold" />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-8 justify-end">
                            <button onClick={() => setDeletingFaculty(null)} className="px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">Cancel</button>
                            {viewMode !== 'discontinued' && (
                                <button onClick={confirmDiscontinue} className="px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest bg-amber-500 text-white">Move to Discontinued</button>
                            )}
                            <button onClick={confirmDelete} className="px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest bg-red-600 text-white">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            {isBulkDeleteOpen && (
                <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-2xl flex justify-center items-center z-[500] p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-3xl w-full max-w-lg border border-red-500/20 text-center animate-scale-in">
                        <div className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-pulse">
                            <AlertTriangle size={48} />
                        </div>
                        <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Mass Purge</h2>
                        <p className="text-[0.75rem] text-gray-400 mb-6 font-bold uppercase tracking-widest leading-loose">
                            Choose to permanently delete or move <span className="text-red-500 font-black text-lg">{selectedIds.size}</span> faculty nodes to the discontinued registry.
                        </p>
                        <div className="text-left mb-8">
                            <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Date of Leave (for Discontinued)</label>
                            <input type="date" value={bulkDiscontinueDate} onChange={(e) => setBulkDiscontinueDate(e.target.value)} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl font-bold" />
                        </div>
                        <div className="flex flex-wrap gap-6">
                            <button onClick={() => setIsBulkDeleteOpen(false)} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-3xl">Abort Protocol</button>
                            <button onClick={handleBulkDiscontinue} className="flex-1 py-5 bg-amber-500 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl shadow-amber-500/40">Move to Discontinued</button>
                            <button onClick={handleBulkDelete} className="flex-1 py-5 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl shadow-red-500/40">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
