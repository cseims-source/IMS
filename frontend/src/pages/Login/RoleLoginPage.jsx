
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap, LogIn, Mail, KeyRound, ArrowLeft } from 'lucide-react';
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
                <div className={`flex justify-center items-center mx-auto w-20 h-20 ${config.classes.bg} rounded-full`}>
                    <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">{role} Login</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                            <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className={`w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200`} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <div className="text-sm">
                                <Link to="/forgot-password" className={`font-medium ${config.classes.text} ${config.classes.hoverText}`}>Forgot your password?</Link>
                            </div>
                        </div>
                         <div className="mt-1 relative">
                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyRound className="h-5 w-5 text-gray-400" /></div>
                            <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className={`w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 ${config.classes.ring} text-gray-900 dark:text-gray-200`} />
                        </div>
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    
                    <div>
                        <button type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center py-3 px-4 ${config.classes.bg} ${config.classes.hoverBg} text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Spinner /> : <LogIn className="mr-2" size={20} />}
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </div>
                </form>

                {config.register && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        Don't have an account?{' '}
                        <Link to={`/register/${role.toLowerCase()}`} className={`font-medium ${config.classes.text} ${config.classes.hoverText}`}>
                            Register here
                        </Link>
                    </p>
                )}
            </div>
            <div className="text-center mt-6">
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white flex items-center justify-center">
                    <ArrowLeft size={16} className="mr-1" />
                    Back to role selection
                </Link>
            </div>
        </div>
    </div>
  );
}