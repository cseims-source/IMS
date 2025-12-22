
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import Spinner from '../../components/Spinner';

const Card = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full">
        <div className="flex items-center text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {React.cloneElement(icon, { className: "mr-3 text-primary-500"})}
            {title}
        </div>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const PasswordChangeForm = () => {
    const { api } = useAuth();
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword !== formData.confirmPassword) {
            return setError('New passwords do not match.');
        }
        if (formData.newPassword.length < 6) {
            return setError('New password must be at least 6 characters long.');
        }

        setLoading(true);
        try {
            const result = await api('/api/users/profile/password', {
                method: 'PUT',
                body: JSON.stringify({
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }),
            });
            setSuccess(result.message || 'Password changed successfully!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.message || 'Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                <input
                    type="password"
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-2 border rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-2 border rounded-md"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 w-full p-2 border rounded-md"
                />
            </div>
            {error && (
                <div className="flex items-center text-sm text-red-600">
                    <AlertCircle size={16} className="mr-2" /> {error}
                </div>
            )}
            {success && (
                <div className="flex items-center text-sm text-green-600">
                    <CheckCircle size={16} className="mr-2" /> {success}
                </div>
            )}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-primary-400"
                >
                    {loading && <Spinner size="sm" />}
                    <span className={loading ? 'ml-2' : ''}>Update Password</span>
                </button>
            </div>
        </form>
    );
};

export default function UserProfile() {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading user data...</div>;
    }
    
    const photoUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`;


    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <div className="flex flex-col sm:flex-row items-center">
                    <img src={photoUrl} alt="User" className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-primary-200" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">{user.name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-center sm:text-left">{user.role}</p>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Account Details" icon={<User />}>
                    <div className="space-y-2">
                        <div>
                            <p className="text-xs text-gray-500">Full Name</p>
                            <p>{user.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Email Address</p>
                            <p>{user.email}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Role</p>
                            <p>{user.role}</p>
                        </div>
                    </div>
                </Card>
                <Card title="Security" icon={<KeyRound />}>
                    <PasswordChangeForm />
                </Card>
            </div>
        </div>
    );
}