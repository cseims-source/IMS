import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, ArrowUp, ArrowDown, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FacultyForm from './FacultyForm';
import FacultyImportModal from './FacultyImportModal';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationModal from '../../components/ConfirmationModal';


const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (
        sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
    ) : null;

    return (
        <th className="p-4">
            <button
                type="button"
                onClick={() => requestSort(sortKey)}
                className="flex items-center gap-1 font-semibold hover:text-gray-900 dark:hover:text-gray-200"
            >
                {children}
                {directionIcon}
            </button>
        </th>
    );
};


export default function FacultyManager() {
    const [facultyList, setFacultyList] = useState([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [deletingFaculty, setDeletingFaculty] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
    const { api, user } = useAuth();
    const { addToast } = useNotification();

    useEffect(() => {
        fetchFaculty();
    }, [api]);

    const fetchFaculty = async () => {
        setLoading(true);
        try {
            const data = await api('/api/faculty');
            setFacultyList(data);
        } catch (error) {
            console.error("Failed to fetch faculty", error);
            addToast('Failed to fetch faculty list.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const processedFaculty = useMemo(() => {
        let filteredItems = facultyList.filter(f =>
            f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig.key) {
            filteredItems.sort((a, b) => {
                const aValue = a[sortConfig.key] || '';
                const bValue = b[sortConfig.key] || '';
                
                const comparison = aValue.localeCompare(bValue, undefined, { sensitivity: 'base' });
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        
        return filteredItems;
    }, [facultyList, searchTerm, sortConfig]);


    const handleAdd = () => {
        setEditingFaculty(null);
        setIsFormOpen(true);
    };

    const handleEdit = (faculty) => {
        setEditingFaculty(faculty);
        setIsFormOpen(true);
    };

    const handleDelete = (faculty) => {
        setDeletingFaculty(faculty);
    };

    const confirmDelete = async () => {
        try {
            await api(`/api/faculty/${deletingFaculty._id}`, { method: 'DELETE' });
            setDeletingFaculty(null);
            fetchFaculty();
            addToast('Faculty member deleted.', 'success');
        } catch (error) {
            console.error("Failed to delete faculty", error);
            addToast('Failed to delete faculty.', 'error');
        }
    };

    const handleSave = async (facultyData) => {
        const method = editingFaculty ? 'PUT' : 'POST';
        const url = editingFaculty ? `/api/faculty/${editingFaculty._id}` : '/api/faculty';
        
        try {
            await api(url, {
                method,
                body: JSON.stringify(facultyData)
            });
            setIsFormOpen(false);
            setEditingFaculty(null);
            fetchFaculty();
            addToast(`Faculty member ${editingFaculty ? 'updated' : 'added'}.`, 'success');
        } catch (error) {
            console.error("Failed to save faculty", error);
            addToast('Failed to save faculty.', 'error');
        }
    };

    const handleImportSuccess = () => {
        setIsImportOpen(false);
        fetchFaculty();
        addToast('Bulk import successful.', 'success');
    };
    
    const isAdmin = user?.role === 'Admin';

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tighter">Faculty Management</h1>
                {isAdmin && (
                    <div className="flex gap-4">
                        <button onClick={() => setIsImportOpen(true)} className="flex items-center px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/20">
                            <Upload size={18} className="mr-2" /> Import Faculty
                        </button>
                        <button onClick={handleAdd} className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg shadow-primary-500/20">
                            <Plus size={18} className="mr-2" /> Add Faculty
                        </button>
                    </div>
                )}
            </div>
            
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name or subject expertise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest w-20">Photo</th>
                            <SortableHeader sortKey="name" sortConfig={sortConfig} requestSort={requestSort}>
                                <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Name</span>
                            </SortableHeader>
                            <SortableHeader sortKey="subject" sortConfig={sortConfig} requestSort={requestSort}>
                                <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Expertise</span>
                            </SortableHeader>
                            <th className="p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest">Assigned Streams</th>
                            <th className="p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest">Assigned Subjects</th>
                            {isAdmin && <th className="p-4 font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-widest text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="text-center p-12">
                                <div className="flex flex-col items-center gap-3">
                                    <ArrowUp className="animate-bounce text-primary-500" />
                                    <p className="text-gray-500">Retrieving faculty data...</p>
                                </div>
                            </td></tr>
                        ) : processedFaculty.length === 0 ? (
                            <tr><td colSpan={isAdmin ? 6 : 5} className="text-center p-12 text-gray-500">No faculty members found.</td></tr>
                        ) : processedFaculty.map(faculty => (
                            <tr key={faculty._id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                                <td className="p-4">
                                    <img src={faculty.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${faculty.name}`} alt={faculty.name} className="w-12 h-12 rounded-2xl object-cover border border-gray-100 dark:border-gray-700 shadow-sm"/>
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-gray-800 dark:text-gray-100">{faculty.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{faculty.email}</div>
                                </td>
                                <td className="p-4 font-medium text-primary-600 dark:text-primary-400">{faculty.subject}</td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(faculty.assignedStreams || []).length > 0 ? (
                                            faculty.assignedStreams.map((s, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[0.65rem] font-bold text-gray-600 dark:text-gray-300">{s}</span>)
                                        ) : <span className="text-gray-300 dark:text-gray-600">--</span>}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(faculty.assignedSubjects || []).length > 0 ? (
                                            faculty.assignedSubjects.map((s, i) => <span key={i} className="px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 rounded text-[0.65rem] font-bold text-primary-600 dark:text-primary-400">{s}</span>)
                                        ) : <span className="text-gray-300 dark:text-gray-600">--</span>}
                                    </div>
                                </td>
                                {isAdmin && (
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEdit(faculty)} className="p-2.5 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-xl transition-all" title="Edit Profile"><Edit size={18}/></button>
                                            <button onClick={() => handleDelete(faculty)} className="p-2.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-all" title="Delete Profile"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isFormOpen && <FacultyForm faculty={editingFaculty} onSave={handleSave} onCancel={() => setIsFormOpen(false)} />}
            {isImportOpen && <FacultyImportModal onImportSuccess={handleImportSuccess} onClose={() => setIsImportOpen(false)} />}

            <ConfirmationModal
                isOpen={!!deletingFaculty}
                onClose={() => setDeletingFaculty(null)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete ${deletingFaculty?.name}? This action cannot be undone and will remove their access to the system.`}
            />
        </div>
    );
}