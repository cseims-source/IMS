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
            setMessage(result.message + ' Redirecting...');
            setTimeout(() => navigate('/login'), 3000);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mx-auto mb-4">
                        <img src="/logo.png" alt="Aryan Logo" className="h-20 w-auto object-contain animate-float-hero" />
                    </div>
                    <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Set New Password</h1>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-300 font-medium">Create a strong password for your account.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1>New Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                                <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200 transition-all" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1>Confirm Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                                <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200 transition-all" />
                            </div>
                        </div>

                        {error && <p className="text-sm font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
                        {message && <p className="text-sm font-bold text-green-600 text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">{message}</p>}
                        
                        <div>
                            <button type="submit"
                                disabled={loading || !!message}
                                className="w-full flex items-center justify-center py-4 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:bg-gray-400">
                                {loading ? <Spinner /> : 'Save New Password'}
                            </button>
                        </div>
                    </form>
                </div>
                 <div className="text-center mt-8">
                    <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center group transition-all">
                        <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}