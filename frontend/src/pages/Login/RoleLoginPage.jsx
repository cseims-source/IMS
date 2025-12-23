import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Spinner from '../../components/Spinner';

const roleConfig = {
    Admin: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        },
        register: false
    },
    Teacher: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        },
        register: true
    },
    Student: {
        classes: {
            bg: 'bg-primary-600', hoverBg: 'hover:bg-primary-700', ring: 'focus:ring-primary-500',
            text: 'text-primary-600', hoverText: 'hover:text-primary-500',
        },
        register: true
    }
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RoleLoginPage() {
  const { role: roleParam } = useParams();
  const role = capitalize(roleParam);
  const navigate = useNavigate();
  const { login } = useAuth();
  const config = roleConfig[role];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prefill for demo purposes
  useEffect(() => {
    if (role === 'Admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    } else {
      setEmail('');
      setPassword('');
    }
  }, [role]);

  if (!config) {
    // Handle invalid role in URL
    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold">Invalid Role</h1>
            <p>The role "{role}" does not exist.</p>
            <Link to="/login" className="text-primary-500 hover:underline mt-4 inline-block">Back to login selection</Link>
        </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password, role });
    setLoading(false);

    if (result.success) {
        if (result.user.role === 'Teacher') {
            navigate('/app/teacher-dashboard');
        } else if (result.user.role === 'Student') {
            navigate('/app/student-dashboard');
        } else { // Admin
            navigate('/app/dashboard');
        }
    } else {
        setError(result.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center mx-auto mb-4">
                    <img src="/logo.png" alt="Aryan Logo" className="h-20 w-auto object-contain animate-float-hero" />
                </div>
                <h1 className="mt-4 text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{role} Login</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-gray-700/50">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-2 ml-1">Email Address</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className={`w-full p-4 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-2 ml-1">
                            <label htmlFor="password" className="block text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Password</label>
                            <div className="text-xs">
                                <Link to="/forgot-password" className={`font-black uppercase tracking-widest ${config.classes.text} ${config.classes.hoverText}`}>Forgot?</Link>
                            </div>
                        </div>
                         <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                            <input 
                                id="password" 
                                name="password" 
                                type={showPassword ? "text" : "password"} 
                                autoComplete="current-password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full p-4 pl-10 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200 transition-all`} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-sm font-bold text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">{error}</p>}
                    
                    <div>
                        <button type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-4 px-4 ${config.classes.bg} ${config.classes.hoverBg} text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Spinner /> : <LogIn className="mr-2" size={20} />}
                            {loading ? 'Logging in...' : 'Enter Portal'}
                        </button>
                    </div>
                </form>

                {config.register && (
                    <p className="text-center text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mt-8">
                        New here?{' '}
                        <Link to={`/register/${role.toLowerCase()}`} className={`font-black ${config.classes.text} ${config.classes.hoverText} border-b-2 border-current pb-0.5 ml-1`}>
                            Register Account
                        </Link>
                    </p>
                )}
            </div>
            <div className="text-center mt-8">
                <Link to="/login" className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center group transition-all">
                    <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
                    Switch Portal Role
                </Link>
            </div>
        </div>
    </div>
  );
}