import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, Users, RefreshCw, UserX } from 'lucide-react';
import { formatDateTime } from '../../utils/dateFormatter';
import Spinner from '../../components/Spinner';

export default function UserApproval() {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState({}); // e.g. { 'userId': 'approve'/'deny' }
    const [error, setError] = useState('');
    const { api } = useAuth();

    const fetchPendingUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await api('/api/users/pending');
            setPendingUsers(data);
        } catch (err) {
            setError('Failed to fetch pending users. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchPendingUsers();
    }, [fetchPendingUsers]);

    const handleAction = async (userId, action) => {
        setActionLoading(prev => ({ ...prev, [userId]: action }));
        try {
            if (action === 'approve') {
                await api(`/api/users/${userId}/approve`, { method: 'PUT' });
            } else if (action === 'deny') {
                await api(`/api/users/${userId}/deny`, { method: 'DELETE' });
            }
            // Refresh the list optimistically or by refetching
            setPendingUsers(prev => prev.filter(user => user._id !== userId));
        } catch (err) {
            alert(`Failed to ${action} user.`);
        } finally {
            setActionLoading(prev => {
                const newState = { ...prev };
                delete newState[userId];
                return newState;
            });
        }
    };

    const handleApprove = (userId) => {
        handleAction(userId, 'approve');
    };

    const handleDeny = (userId) => {
        if (window.confirm('Are you sure you want to deny and delete this user? This action cannot be undone.')) {
            handleAction(userId, 'deny');
        }
    };
    
    const roleColor = {
        Student: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
        Teacher: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <Users size={28} className="mr-3 text-primary-500" />
                    Pending User Approvals
                </h1>
                <button
                    onClick={fetchPendingUsers}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50"
                >
                    <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {error && <div className="text-center p-4 text-red-500 bg-red-50 dark:bg-red-900/30 rounded-md">{error}</div>}

            {loading ? (
                <div className="text-center py-16">
                    <p>Loading pending users...</p>
                </div>
            ) : pendingUsers.length === 0 ? (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <UserX size={48} className="mx-auto text-gray-400"/>
                    <p className="mt-4 font-semibold text-lg text-gray-700 dark:text-gray-200">No Pending Approvals</p>
                    <p className="mt-1 text-gray-500 dark:text-gray-400">All new user registrations have been reviewed.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Registered On</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingUsers.map(user => (
                                <tr key={user._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                                    <td className="p-4">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColor[user.role]}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{formatDateTime(user.createdAt)}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleApprove(user._id)}
                                            disabled={!!actionLoading[user._id]}
                                            className="p-2 w-9 h-9 flex items-center justify-center bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Approve User"
                                        >
                                            {actionLoading[user._id] === 'approve' ? <Spinner size="sm" /> : <Check size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDeny(user._id)}
                                            disabled={!!actionLoading[user._id]}
                                            className="p-2 w-9 h-9 flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Deny & Delete User"
                                        >
                                            {actionLoading[user._id] === 'deny' ? <Spinner size="sm" /> : <X size={18} />}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}