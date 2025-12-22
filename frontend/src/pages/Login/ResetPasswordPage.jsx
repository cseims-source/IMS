import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { KeyRound, ArrowLeft } from 'lucide-react';
import Spinner from '../../components/Spinner';

export default function ResetPasswordPage() {
    const { resettoken } = useParams();
    const navigate = useNavigate();
    const { resetPassword } = useAuth();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        const result = await resetPassword(password, resettoken);
        setLoading(false);

        if (result.success) {
            setMessage(result.message + ' You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-600 rounded-full">
                        <KeyRound className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Reset Your Password</h1>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                                <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                        
                        <div>
                            <button type="submit"
                                disabled={loading || !!message}
                                className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:bg-gray-400">
                                {loading ? <Spinner /> : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                </div>
                 <div className="text-center mt-6">
                    <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center">
                        <ArrowLeft size={16} className="mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}