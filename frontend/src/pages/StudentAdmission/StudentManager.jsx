import React, { useState, useEffect, useMemo } from 'react';
import { 
    Edit, Trash2, Upload, Eye, Search, Printer,
    FileDown, Sparkles, Database, Users, Activity, Clock, 
    RefreshCw, Filter, ShieldCheck, UserPlus, GraduationCap,
    CheckSquare, Square, AlertTriangle, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import * as XLSX from 'xlsx';
import StudentForm from './StudentAdmissionForm';
import StudentImportModal from './StudentImportModal';
import StudentDetailModal from './StudentDetailModal';
import Spinner from '../../components/Spinner';

const StatCard = ({ title, value, icon, color, delay }) => (
    <div 
        className={`bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-xl border border-white dark:border-gray-700/50 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[70px] opacity-10 group-hover:opacity-30 transition-opacity ${color}`}></div>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-500 group-hover:text-primary-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm border border-gray-100 dark:border-gray-700`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
        </div>
    </div>
);

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, weeklyGrowth: 0 });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const { api, user } = useAuth();
  const { addToast } = useNotification();

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    fetchAll();
  }, [api]);

  const fetchAll = async () => {
      fetchStudents();
      fetchStats();
      setSelectedIds(new Set());
  }

  const fetchStudents = async () => {
    try {
        setLoading(true);
        const data = await api('/api/students');
        setStudents(data);
    } catch (error) {
        addToast('Registry sync interrupted.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
        setStatsLoading(true);
        const data = await api('/api/students/stats');
        setStats(data);
    } catch (error) {
        console.error("Stats aggregation failure", error);
    } finally {
        setStatsLoading(false);
    }
  }
  
  const handleExportExcel = () => {
      if (students.length === 0) return addToast('No records to compile.', 'info');
      const exportData = students.map(s => ({
          'Identity': `${s.firstName} ${s.lastName}`,
          'Registry Email': s.email,
          'Course': s.course,
          'Branch': s.branch,
          'Academic Module': s.stream,
          'Registration ID': s.registrationNumber,
          'Section': s.section || 'A',
          'Phone': s.phone,
          'Status': s.status
      }));
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Registry_Snapshot');
      XLSX.writeFile(wb, `AIET_Registry_${new Date().getFullYear()}.xlsx`);
      addToast('Data Snapshot exported successfully.', 'success');
  };

  const processedStudents = useMemo(() => {
    return students
        .filter(student =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.registrationNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.phone || '').includes(searchTerm) ||
            student.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.branch?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const regA = a.registrationNumber || '';
            const regB = b.registrationNumber || '';
            // Natural Alphanumeric Sort (e.g., F1 comes before F10)
            return regA.localeCompare(regB, undefined, { numeric: true, sensitivity: 'base' });
        });
  }, [students, searchTerm]);

  const handleSelectOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === processedStudents.length) {
        setSelectedIds(new Set());
    } else {
        setSelectedIds(new Set(processedStudents.map(s => s._id)));
    }
  };

  const handleAddNew = () => { setEditingStudent(null); setIsFormOpen(true); }
  const handleEdit = (student) => { setEditingStudent(student); setIsFormOpen(true); }

  const handleSave = async (studentData) => {
    try {
        const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
        const method = editingStudent ? 'PUT' : 'POST';
        await api(url, { method, body: JSON.stringify(studentData) });
        addToast(`Node ${editingStudent ? 'updated' : 'initialized'} successfully!`, 'success');
        setIsFormOpen(false);
        fetchAll();
    } catch (error) {
        addToast(error.message, 'error');
    }
  };
  
  const confirmDelete = async () => {
      try {
          await api(`/api/students/${deletingStudent._id}`, { method: 'DELETE' });
          fetchAll();
          addToast('Node purged from registry.', 'success');
      } catch(error) {
          addToast('Purge failed.', 'error');
      } finally {
          setDeletingStudent(null);
      }
  }

  const handleBulkDelete = async () => {
      try {
          await api('/api/students/bulk-delete', {
              method: 'POST',
              body: JSON.stringify({ ids: Array.from(selectedIds) })
          });
          addToast(`${selectedIds.size} nodes purged from registry.`, 'success');
          setIsBulkDeleteOpen(false);
          fetchAll();
      } catch (error) {
          addToast('Bulk purge failed.', 'error');
      }
  };

  const handleImportSuccess = () => {
      setIsImportModalOpen(false);
      fetchAll();
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1700px] mx-auto pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 px-2">
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                    Registry <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>Matrix</span>
                </h1>
                <p className="text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                    <Database size={12} className="text-accent-500 animate-pulse" /> CLOUD INFRASTRUCTURE // NODE SYNC: ACTIVE
                </p>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                {isAdmin && selectedIds.size > 0 && (
                    <button onClick={() => setIsBulkDeleteOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-2xl font-black uppercase text-[0.6rem] tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-red-500/30 active:scale-95 animate-pulse">
                        <Trash2 size={16} className="mr-2" /> Purge {selectedIds.size} Nodes
                    </button>
                )}
                <button onClick={handleExportExcel} className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700 rounded-2xl font-black uppercase text-[0.6rem] tracking-[0.2em] hover:bg-gray-50 transition-all shadow-xl active:scale-95 group">
                    <FileDown size={16} className="mr-2 group-hover:translate-y-1 transition-transform" /> Registry Export
                </button>
                {isAdmin && (
                    <>
                        <button onClick={() => setIsImportModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3 bg-indigo-600/10 text-indigo-600 border border-indigo-600/20 rounded-2xl font-black uppercase text-[0.6rem] tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 group">
                            <Upload size={16} className="mr-2 group-hover:-translate-y-1 transition-transform" /> Bulk Node Sync
                        </button>
                        <button onClick={handleAddNew} className="flex-1 lg:flex-none flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 active:scale-95 group">
                            <UserPlus size={16} className="mr-2 group-hover:rotate-12 transition-transform" /> New Admission
                        </button>
                    </>
                )}
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsLoading ? (
                Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-white dark:bg-gray-800 rounded-[2.5rem] animate-pulse border dark:border-gray-700"></div>)
            ) : (
                <>
                    <StatCard title="Total Enrolled" value={stats.total} icon={<Users />} color="bg-primary-500" delay={100} />
                    <StatCard title="Active Cycle" value={stats.active} icon={<Activity />} color="bg-accent-500" delay={200} />
                    <StatCard title="Validation Required" value={stats.pending} icon={<Clock />} color="bg-yellow-500" delay={300} />
                    <StatCard title="Growth Protocol" value={`+${stats.weeklyGrowth}`} icon={<RefreshCw />} color="bg-indigo-500" delay={400} />
                </>
            )}
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3 ml-2">
                    <Filter size={14} className="text-primary-500" /> Neural Filter Node
                </h2>
                <div className="flex items-center gap-4 px-4 py-1.5 bg-primary-500/5 border border-primary-500/10 rounded-xl">
                    <ShieldCheck className="text-primary-500 animate-pulse" size={12} />
                    <span className="text-[0.5rem] font-black uppercase tracking-widest text-primary-600">Access: {user?.role} Mode</span>
                </div>
            </div>
            <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                <input 
                    type="text"
                    placeholder="Scan Identity Markers (Name, Reg No, Phone, Course, Branch)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-8 py-4 bg-gray-50 dark:bg-gray-950 border-0 rounded-3xl focus:ring-4 focus:ring-primary-500/5 text-[0.85rem] font-bold shadow-inner transition-all"
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-3xl border border-gray-100 dark:border-gray-800 overflow-hidden relative min-h-[500px]">
            {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <Spinner size="lg" />
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Syncing matrix node...</p>
                </div>
            ) : processedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center animate-scale-in">
                    <div className="w-24 h-24 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-200 dark:text-gray-700 shadow-inner mb-6">
                        <Users size={40} />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Node Trace Empty</h2>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/80 sticky top-0 z-10">
                            <tr className="text-[0.55rem] font-black uppercase tracking-[0.25em] text-gray-500 border-b dark:border-gray-800">
                                <th className="p-5 pl-8">
                                    {isAdmin && (
                                        <button onClick={handleSelectAll} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                            {selectedIds.size === processedStudents.length ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                        </button>
                                    )}
                                </th>
                                <th className="p-5">SI No</th>
                                <th className="p-5">Photo</th>
                                <th className="p-5">Student Name</th>
                                <th className="p-5">Reg. No</th>
                                <th className="p-5">Phone</th>
                                <th className="p-5">Course / Branch</th>
                                <th className="p-5">Academic Year</th>
                                <th className="p-5 text-center">Status</th>
                                <th className="p-5 text-right pr-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-800">
                            {processedStudents.map((student, idx) => (
                                <tr key={student._id} className={`hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-all group animate-fade-in-up ${selectedIds.has(student._id) ? 'bg-primary-50/10' : ''}`} style={{ animationDelay: `${idx * 20}ms` }}>
                                    <td className="p-4 pl-8">
                                        {isAdmin && (
                                            <button onClick={() => handleSelectOne(student._id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                                {selectedIds.has(student._id) ? <CheckSquare className="text-primary-500" size={16} /> : <Square size={16} />}
                                            </button>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-[0.7rem] font-black text-gray-400 group-hover:text-primary-600 transition-colors">{idx + 1}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                                            {student.photo ? <img src={student.photo} className="w-full h-full object-cover" /> : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-primary-600 text-[0.6rem] bg-primary-50 dark:bg-primary-900/30">
                                                    {student.firstName[0]}{student.lastName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-[0.7rem] group-hover:text-primary-600 transition-colors">{student.firstName} {student.lastName}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-[0.65rem] text-gray-500 dark:text-gray-400 font-bold">{student.registrationNumber || '---'}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[0.65rem] text-gray-600 dark:text-gray-300 font-black">{student.phone}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 text-[0.55rem] font-black uppercase rounded-md border border-primary-200/50 w-fit">{student.course}</span>
                                            <span className="text-[0.55rem] text-gray-400 font-bold uppercase tracking-widest">{student.branch}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-[0.6rem] text-gray-500 font-black uppercase tracking-widest">{student.academicYear}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-lg text-[0.5rem] font-black uppercase tracking-[0.2em] shadow-sm ${
                                            student.status === 'Approved' ? 'bg-green-100 text-green-700 border border-green-200' : 
                                            student.status === 'Rejected' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                        }`}>
                                            {student.status || 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right pr-10">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => setViewingStudent(student)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-primary-600 hover:text-white rounded-xl transition-all shadow-sm" title="View Dossier"><Eye size={15}/></button>
                                            <button onClick={() => setViewingStudent({...student, _shouldPrint: true})} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-accent-600 hover:text-white rounded-xl transition-all shadow-sm" title="Print Sequence"><Printer size={15}/></button>
                                            
                                            {isAdmin && (
                                                <>
                                                    <button onClick={() => handleEdit(student)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all shadow-sm" title="Modify Matrix"><Edit size={15}/></button>
                                                    <button onClick={() => setDeletingStudent(student)} className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm" title="Wipe Node"><Trash2 size={15}/></button>
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

        {isFormOpen && <StudentForm student={editingStudent} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
        {isImportModalOpen && <StudentImportModal onClose={() => setIsImportModalOpen(false)} onImportSuccess={handleImportSuccess} />}
        {viewingStudent && <StudentDetailModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
        
        {/* Single Delete Confirmation */}
        {deletingStudent && (
            <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl flex justify-center items-center z-[500] p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-3xl w-full max-w-md border border-white/10 text-center animate-scale-in">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                        <Trash2 size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Registry Wipe</h2>
                    <p className="text-[0.7rem] text-gray-500 dark:text-gray-400 mb-8 font-bold uppercase tracking-widest leading-loose px-4">
                        Confirm permanent decommissioning of student node <span className="text-red-500 font-black">"{deletingStudent.firstName}"</span> from institutional logic.
                    </p>
                    <div className="flex gap-4">
                        <button onClick={() => setDeletingStudent(null)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-[0.65rem] tracking-[0.3em] rounded-2xl active:scale-95 transition-all">Abort Sequence</button>
                        <button onClick={confirmDelete} className="flex-1 py-4 bg-red-600 text-white font-black uppercase text-[0.65rem] tracking-[0.3em] rounded-2xl shadow-xl shadow-red-500/30 active:scale-95 transition-all">Wipe Node</button>
                    </div>
                </div>
            </div>
        )}

        {/* Bulk Delete Confirmation */}
        {isBulkDeleteOpen && (
            <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-2xl flex justify-center items-center z-[500] p-4 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-3xl w-full max-w-lg border border-red-500/20 text-center animate-scale-in">
                    <div className="w-24 h-24 bg-red-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_60px_rgba(239,68,68,0.4)] animate-pulse">
                        <AlertTriangle size={48} />
                    </div>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Mass Purge</h2>
                    <p className="text-[0.75rem] text-gray-400 mb-10 font-bold uppercase tracking-widest leading-loose">
                        You are about to permanently disconnect <span className="text-red-500 font-black text-lg">{selectedIds.size}</span> student nodes from the institutional cloud registry. This action cannot be reversed.
                    </p>
                    <div className="flex gap-6">
                        <button onClick={() => setIsBulkDeleteOpen(false)} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-3xl">Abort Protocol</button>
                        <button onClick={handleBulkDelete} className="flex-1 py-5 bg-red-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-2xl shadow-red-500/40">Execute Purge</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}