import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, KeyRound, ArrowLeft } from 'lucide-react';
import Spinner from '../../components/Spinner';

export default function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        const result = await forgotPassword(email);
        setLoading(false);
        if (result.success) {
            setMessage(result.message);
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
                    <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Forgot Password</h1>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Enter your email and we'll send you a reset link.</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                                <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200" />
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {message && <p className="text-sm text-green-600 text-center">{message}</p>}
                        
                        <div>
                            <button type="submit"
                                disabled={loading || !!message}
                                className="w-full flex items-center justify-center py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:bg-gray-400">
                                {loading ? <Spinner /> : 'Send Reset Link'}
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