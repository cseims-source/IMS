import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { DollarSign, Search, Plus, CheckCircle, Clock, X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter.js';
import Spinner from '../../components/Spinner.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const AddFeeForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({ type: 'Tuition', amount: '', dueDate: '', status: 'Pending' });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-xl font-bold">Add New Fee</h2>
                    <input name="type" value={formData.type} onChange={handleChange} placeholder="Fee Type" className="w-full p-2 border rounded" required />
                    <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Amount" className="w-full p-2 border rounded" required />
                    <input name="dueDate" type="date" value={formData.dueDate} onChange={handleChange} className="w-full p-2 border rounded" required />
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded">
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                    </select>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Add Fee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ConfirmationDialog = ({ fee, onConfirm, onCancel, isLoading }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AlertTriangle className="h-6 w-6 text-green-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                        Confirm Payment
                    </h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Are you sure you want to mark the <strong>{fee.type}</strong> fee of <strong>₹{fee.amount.toLocaleString()}</strong> as 'Paid'? This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:bg-green-300"
                    onClick={onConfirm}
                    disabled={isLoading}
                >
                    {isLoading ? <Spinner size="sm" /> : 'Confirm Payment'}
                </button>
                <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-500 shadow-sm px-4 py-2 bg-white dark:bg-gray-700 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={onCancel}
                >
                    Cancel
                </button>
            </div>
        </div>
    </div>
);

export default function FeesManagement() {
    const { api } = useAuth();
    const { addToast } = useNotification();
    const [allStudents, setAllStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [confirmingFee, setConfirmingFee] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return allStudents.filter(s =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [searchTerm, allStudents]);

    const filteredFees = useMemo(() => {
        if (!selectedStudent?.fees) return [];
        
        return selectedStudent.fees.filter(fee => {
            if (statusFilter !== 'All' && fee.status !== statusFilter) {
                return false;
            }
            const feeDueDate = new Date(fee.dueDate);
            if (dateFilter.start && feeDueDate < new Date(dateFilter.start + 'T00:00:00')) {
                return false;
            }
            if (dateFilter.end && feeDueDate > new Date(dateFilter.end + 'T23:59:59')) {
                return false;
            }
            return true;
        }).sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate));
    }, [selectedStudent?.fees, statusFilter, dateFilter]);

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchTerm('');
        setStatusFilter('All');
        setDateFilter({ start: '', end: '' });
    };
    
    const confirmMarkAsPaid = async () => {
        if (!selectedStudent || !confirmingFee) return;

        setActionLoading(true);
        try {
            const updatedFees = await api(`/api/students/${selectedStudent._id}/fees/${confirmingFee._id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: 'Paid' }),
            });
            setSelectedStudent(prev => ({ ...prev, fees: updatedFees }));
            addToast('Fee status updated to Paid.', 'success');
        } catch (error) {
            console.error('Failed to update fee status', error);
            addToast('Failed to update fee status.', 'error');
        } finally {
            setActionLoading(false);
            setConfirmingFee(null);
        }
    };


    const handleAddFee = async (feeData) => {
        if (!selectedStudent) return;
        try {
            const updatedFees = await api(`/api/students/${selectedStudent._id}/fees`, {
                method: 'POST',
                body: JSON.stringify(feeData),
            });
            setSelectedStudent(prev => ({ ...prev, fees: updatedFees }));
            setIsFormOpen(false);
            addToast('New fee record added.', 'success');
        } catch (error) {
            console.error('Failed to add fee', error);
            addToast('Failed to add new fee.', 'error');
        }
    };

    useEffect(() => {
        const fetchAllStudents = async () => {
            setLoading(true);
            try {
                const data = await api('/api/students');
                setAllStudents(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            }
            setLoading(false);
        };
        fetchAllStudents();
    }, [api]);

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
                <DollarSign className="mr-3 text-primary-500" /> Fees Management
            </h1>

            <div className="max-w-xl mx-auto mb-8">
                <label htmlFor="student-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search for a Student</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        id="student-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="by name or email..."
                        className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg"
                        autoComplete="off"
                    />
                    {searchResults.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg">
                            {searchResults.map(s => (
                                <li key={s._id} onClick={() => handleSelectStudent(s)} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                                    {s.firstName} {s.lastName} ({s.stream})
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {selectedStudent ? (
                <div className="mt-6 border-t dark:border-gray-700 pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            Fee History for {selectedStudent.firstName} {selectedStudent.lastName}
                        </h2>
                        <button onClick={() => setIsFormOpen(true)} className="flex items-center text-sm px-3 py-1.5 bg-primary-600 text-white rounded-md">
                            <Plus size={16} className="mr-1" /> Add Fee
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-4 items-end mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                            <label htmlFor="status-filter" className="block text-sm font-medium">Status</label>
                            <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 p-2 border rounded-md">
                                <option value="All">All</option>
                                <option value="Paid">Paid</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="start-date" className="block text-sm font-medium">Due After</label>
                            <input type="date" id="start-date" value={dateFilter.start} onChange={e => setDateFilter(prev => ({...prev, start: e.target.value}))} className="mt-1 p-2 border rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="end-date" className="block text-sm font-medium">Due Before</label>
                            <input type="date" id="end-date" value={dateFilter.end} onChange={e => setDateFilter(prev => ({...prev, end: e.target.value}))} className="mt-1 p-2 border rounded-md" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="p-3 font-semibold">Type</th>
                                    <th className="p-3 font-semibold">Amount</th>
                                    <th className="p-3 font-semibold">Due Date</th>
                                    <th className="p-3 font-semibold">Status</th>
                                    <th className="p-3 font-semibold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredFees.map(fee => (
                                    <tr key={fee._id} className={`border-b dark:border-gray-600 ${fee.status === 'Paid' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
                                        <td className="p-3">{fee.type}</td>
                                        <td className="p-3">₹{fee.amount.toLocaleString()}</td>
                                        <td className="p-3">{formatDate(fee.dueDate)}</td>
                                        <td className="p-3">
                                            {fee.status === 'Paid' ? (
                                                <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                                                    <CheckCircle size={14} className="mr-1.5" /> Paid
                                                </span>
                                            ) : (
                                                <span className="flex items-center text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                                    <Clock size={14} className="mr-1.5" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {fee.status === 'Pending' && (
                                                <button
                                                    onClick={() => setConfirmingFee(fee)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 disabled:bg-green-300"
                                                >
                                                     Mark as Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    {loading ? <Spinner /> : <p className="text-gray-500">Search and select a student to view and manage their fees.</p>}
                </div>
            )}
            {isFormOpen && <AddFeeForm onSave={handleAddFee} onCancel={() => setIsFormOpen(false)} />}
            {confirmingFee && <ConfirmationDialog fee={confirmingFee} onConfirm={confirmMarkAsPaid} onCancel={() => setConfirmingFee(null)} isLoading={actionLoading} />}
        </div>
    );
}