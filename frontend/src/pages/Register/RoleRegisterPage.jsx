import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Mail, KeyRound, User, ArrowLeft } from 'lucide-react';
import Spinner from '../../components/Spinner';

const roleConfig = {
    Admin: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        }
    },
    Teacher: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        }
    },
    Student: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        }
    }
};

export default function RoleRegisterPage({ role }) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const config = roleConfig[role];
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        return;
    }
    if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    
    setLoading(true);
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...userData } = formData;
    const result = await register({ ...userData, role });
    setLoading(false);

    if (result.success) {
        navigate('/pending-approval');
    } else {
        setError(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center mx-auto mb-4">
                    <img src="/logo.png" alt="Aryan Logo" className="h-20 w-auto object-contain animate-float-hero" />
                </div>
                <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Register {role}</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Full Name</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                            <input id="name" name="name" type="text" required value={formData.name} onChange={handleChange}
                                className={`w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Email Address</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                            <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange}
                                className={`w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Password</label>
                         <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                            <input id="password" name="password" type="password" required value={formData.password} onChange={handleChange}
                                className={`w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">Confirm Password</label>
                         <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                            <input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange}
                                className={`w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} />
                        </div>
                    </div>

                    {error && <p className="text-sm font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
                    
                    <div>
                        <button type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-4 px-4 ${config.classes.bg} ${config.classes.hoverBg} text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:bg-gray-400`} >
                            {loading ? <Spinner /> : <UserPlus className="mr-2" size={20} />}
                            {loading ? 'Processing...' : 'Register Account'}
                        </button>
                    </div>
                </form>
                 <p className="text-center text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-8">
                    Already registered?{' '}
                    <Link to={`/login/${role.toLowerCase()}`} className={`font-black ${config.classes.text} ${config.classes.hoverText} border-b-2 border-current pb-0.5 ml-1`}>
                        Login here
                    </Link>
                </p>
            </div>
             <div className="text-center mt-8">
                <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center group transition-all">
                    <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Switch Role
                </Link>
            </div>
        </div>
    </div>
  );
}