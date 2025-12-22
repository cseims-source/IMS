
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, RefreshCw, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const courses = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Diploma'];
const branches = {
    'B.Tech': ['Computer Science', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Electronics & Comm.'],
    'M.Tech': ['Computer Science', 'Power Systems', 'Structural Engineering', 'VLSI Design'],
    'MBA': ['Marketing', 'Finance', 'HR', 'Operations'],
    'MCA': ['General'],
    'Diploma': ['Civil', 'Electrical', 'Mechanical']
};
const states = ['Odisha', 'West Bengal', 'Bihar', 'Jharkhand', 'Andhra Pradesh', 'Telangana', 'Other'];

export default function AdmissionInquiry() {
    const { api } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        course: '',
        branch: '',
        state: '',
        city: '',
        captcha: ''
    });
    
    const [captchaCode, setCaptchaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const generateCaptcha = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setCaptchaCode(code);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.captcha !== captchaCode) {
            setError('Invalid Captcha. Please try again.');
            generateCaptcha();
            setFormData(prev => ({ ...prev, captcha: '' }));
            return;
        }

        setLoading(true);
        try {
            await api('/api/admission/inquiry', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-lg w-full text-center">
                    <div className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Thank You!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8">
                        Your admission inquiry has been submitted successfully. Our counseling team will get in touch with you shortly.
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                        <ArrowLeft size={18} className="mr-2" /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <div className="mb-8 flex justify-end items-center">
                    <Link to="/" className="inline-flex items-center px-6 py-2 bg-yellow-500 text-gray-900 font-bold rounded-full hover:bg-yellow-400 transition-colors shadow-lg">
                        Back to AIET
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border-t-8 border-primary-600">
                    <div className="bg-gray-50 dark:bg-gray-700/30 px-8 py-6 border-b dark:border-gray-700">
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">Admission Inquiry Form</h1>
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-2">Fill in your details to start your journey with Aryan Institute</p>
                    </div>
                    
                    <div className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-8 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">Name of the Candidate</label>
                                    <div className="mt-1">
                                        <input type="text" name="name" id="name" required value={formData.name} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border"
                                            placeholder="Enter full name" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">Mobile Number</label>
                                    <div className="mt-1">
                                        <input type="tel" name="mobile" id="mobile" required value={formData.mobile} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border"
                                            placeholder="10 digit mobile number" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">Email ID</label>
                                    <div className="mt-1">
                                        <input type="email" name="email" id="email" required value={formData.email} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border"
                                            placeholder="you@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">Course Interested</label>
                                    <div className="mt-1">
                                        <select id="course" name="course" required value={formData.course} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border">
                                            <option value="">Select Course</option>
                                            {courses.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="branch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Branch Interested</label>
                                    <div className="mt-1">
                                        <select id="branch" name="branch" value={formData.branch} onChange={handleChange} disabled={!formData.course}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border disabled:bg-gray-100 disabled:dark:bg-gray-800">
                                            <option value="">Select Branch</option>
                                            {formData.course && branches[formData.course]?.map(b => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">State</label>
                                    <div className="mt-1">
                                        <select id="state" name="state" required value={formData.state} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border">
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">City</label>
                                    <div className="mt-1">
                                        <input type="text" name="city" id="city" required value={formData.city} onChange={handleChange}
                                            className="block w-full rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border"
                                            placeholder="Enter City" />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="captcha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 required-asterisk">Verify Captcha</label>
                                    <div className="mt-1 flex items-center space-x-4">
                                        <div className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 px-4 py-3 rounded-md font-mono text-xl font-bold tracking-widest text-gray-800 dark:text-white select-none line-through decoration-gray-400">
                                            {captchaCode}
                                        </div>
                                        <button type="button" onClick={generateCaptcha} className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                                            <RefreshCw size={20} />
                                        </button>
                                        <input type="text" name="captcha" id="captcha" required value={formData.captcha} onChange={handleChange}
                                            className="block w-full sm:w-48 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white p-3 border"
                                            placeholder="Enter code" />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{error}</h3>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button type="submit" disabled={loading}
                                    className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-bold text-white bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 transform transition hover:-translate-y-1">
                                    {loading ? 'Submitting...' : 'Submit Inquiry'}
                                    {!loading && <Send className="ml-2 h-5 w-5" />}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
