import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, Upload, Eye, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import StudentForm from './StudentAdmissionForm';
import StudentImportModal from './StudentImportModal';
import StudentDetailModal from './StudentDetailModal';

const SortableHeader = ({ children, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (
        sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
    ) : null;

    return (
        <th className="p-3">
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

export default function StudentManager() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const { api } = useAuth();
  const { addToast } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for ?action=new in URL to auto-open the form (e.g. from Dashboard)
  useEffect(() => {
      if (searchParams.get('action') === 'new') {
          handleAddNew();
      }
  }, [searchParams]);

  useEffect(() => {
    fetchStudents();
  }, [api]);

  const fetchStudents = async () => {
    try {
        setLoading(true);
        const data = await api('/api/students');
        setStudents(data);
    } catch (error) {
        console.error("Failed to fetch students:", error);
        addToast('Failed to fetch students.', 'error');
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

  const processedStudents = useMemo(() => {
    let filteredItems = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig.key) {
        filteredItems.sort((a, b) => {
            let aValue, bValue;

            if (sortConfig.key === 'name') {
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
            } else {
                aValue = a[sortConfig.key] || '';
                bValue = b[sortConfig.key] || '';
            }
            
            if (aValue.localeCompare && bValue.localeCompare) {
                 const comparison = aValue.localeCompare(bValue, undefined, { numeric: true, sensitivity: 'base' });
                 return sortConfig.direction === 'ascending' ? comparison : -comparison;
            }
            
            // Fallback for non-string values
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }

    return filteredItems;
  }, [students, searchTerm, sortConfig]);

  const handleAddNew = () => {
      setEditingStudent(null);
      setIsFormOpen(true);
  }

  const handleCloseForm = () => {
      setIsFormOpen(false);
      // Remove query param if it exists to clean up URL
      if (searchParams.get('action')) {
          setSearchParams({});
      }
  }

  const handleEdit = (student) => {
      setEditingStudent(student);
      setIsFormOpen(true);
  }

  const handleSave = async (studentData) => {
    try {
        const url = editingStudent ? `/api/students/${editingStudent._id}` : '/api/students';
        const method = editingStudent ? 'PUT' : 'POST';

        await api(url, {
            method: method,
            body: JSON.stringify(studentData),
        });
        addToast(`Student ${editingStudent ? 'updated' : 'added'} successfully!`, 'success');
        handleCloseForm();
        setEditingStudent(null);
        fetchStudents();
    } catch (error) {
        console.error("Submission error:", error);
        addToast(error.message, 'error');
    }
  };
  
  const handleDelete = (student) => {
      setDeletingStudent(student);
  }

  const confirmDelete = async () => {
      if (!deletingStudent) return;
      try {
          await api(`/api/students/${deletingStudent._id}`, { method: 'DELETE' });
          fetchStudents();
          addToast('Student deleted successfully.', 'success');
      } catch(error) {
          console.error("Failed to delete student:", error);
          addToast('Failed to delete student.', 'error');
      } finally {
          setDeletingStudent(null);
      }
  }
  
  const handleImportSuccess = () => {
      setIsImportModalOpen(false);
      fetchStudents(); // Refresh the list
  }

  return (
    <div className="space-y-8">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Student Management</h1>
                 <div className="flex gap-4">
                    <button onClick={() => setIsImportModalOpen(true)} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold">
                        <Upload size={18} className="mr-2" />
                        Import Students
                    </button>
                    <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                        Add New Student
                    </button>
                 </div>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <SortableHeader sortKey="name" sortConfig={sortConfig} requestSort={requestSort}>Name</SortableHeader>
                            <SortableHeader sortKey="email" sortConfig={sortConfig} requestSort={requestSort}>Email</SortableHeader>
                            <SortableHeader sortKey="stream" sortConfig={sortConfig} requestSort={requestSort}>Stream</SortableHeader>
                            <SortableHeader sortKey="currentSemester" sortConfig={sortConfig} requestSort={requestSort}>Semester</SortableHeader>
                            <th className="p-3 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center p-4">Loading...</td></tr>
                        ) : processedStudents.map(student => (
                            <tr key={student._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td className="p-3">{student.firstName} {student.lastName}</td>
                                <td className="p-3">{student.email}</td>
                                <td className="p-3">{student.stream}</td>
                                <td className="p-3">{student.currentSemester}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => setViewingStudent(student)} className="p-2 text-green-600 hover:bg-green-100 rounded-full" title="View Details"><Eye size={18}/></button>
                                    <button onClick={() => handleEdit(student)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="Edit Student"><Edit size={18}/></button>
                                    <button onClick={() => handleDelete(student)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Delete Student"><Trash2 size={18}/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        {isFormOpen && <StudentForm student={editingStudent} onSave={handleSave} onCancel={handleCloseForm} />}
        {isImportModalOpen && <StudentImportModal onClose={() => setIsImportModalOpen(false)} onImportSuccess={handleImportSuccess} />}
        {viewingStudent && <StudentDetailModal student={viewingStudent} onClose={() => setViewingStudent(null)} />}
        {deletingStudent && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Confirm Deletion</h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Are you sure you want to delete the student{' '}
                        <strong>{deletingStudent.firstName} {deletingStudent.lastName}</strong>? This action cannot be undone.
                    </p>
                    <div className="mt-8 flex justify-end gap-4">
                        <button 
                            onClick={() => setDeletingStudent(null)} 
                            className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmDelete} 
                            className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                        >
                            Delete Student
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}