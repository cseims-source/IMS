import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Spinner from '../../components/Spinner';

const roleConfig = {
    Admin: {
        label: 'Administrative Control',
        icon: <ShieldCheck size={24} className="text-primary-600" />
    },
    Teacher: {
        label: 'Faculty Node',
        icon: <KeyRound size={24} className="text-secondary-500" />
    },
    Student: {
        label: 'Student Academic Node',
        icon: <Mail size={24} className="text-primary-400" />
    }
};

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export default function RoleLoginPage() {
  const { role: roleParam } = useParams();
  const role = capitalize(roleParam);
  const navigate = useNavigate();
  const { login } = useAuth();
  const config = roleConfig[role] || roleConfig.Student;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === 'Admin') {
      setEmail('admin@example.com');
      setPassword('password123');
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login({ email, password, role });
    setLoading(false);

    if (result.success) {
        const paths = { Teacher: '/app/teacher-dashboard', Student: '/app/student-dashboard' };
        navigate(paths[result.user.role] || '/app/dashboard');
    } else {
        setError(result.message || 'Identity verification failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full mx-auto">
            <div className="text-center mb-10">
                <div className="flex justify-center items-center mx-auto mb-6">
                    <img src="/logo.png" alt="AIET" className="h-16 md:h-20 w-auto object-contain animate-float-hero" />
                </div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{role} Portal</h1>
                <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.3em] mt-2 flex items-center justify-center gap-2">
                    {config.icon} {config.label}
                </p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] shadow-2xl border border-white/20 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-3 ml-1">Identity (Email)</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500/30 text-gray-900 dark:text-gray-100 font-bold transition-all shadow-inner" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-3 ml-1">
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400">Access Key</label>
                            <Link to="/forgot-password" className="text-[0.6rem] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600 transition-colors">Recover</Link>
                        </div>
                         <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-800/50 border-0 rounded-2xl focus:ring-2 focus:ring-primary-500/30 text-gray-900 dark:text-gray-100 font-bold transition-all shadow-inner" 
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-xs font-black uppercase tracking-widest text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl animate-shake">{error}</p>}
                    
                    <button type="submit" disabled={loading}
                        className="w-full flex items-center justify-center py-5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? <Spinner /> : <LogIn className="mr-3" size={20} />}
                        {loading ? 'Verifying...' : 'Initialize Session'}
                    </button>
                </form>

                <p className="text-center text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mt-10">
                    New Academic Entity?{' '}
                    <Link to={`/register/${role.toLowerCase()}`} className="text-primary-600 hover:text-primary-700 border-b-2 border-primary-100 pb-1 ml-2 transition-all">
                        Register Node
                    </Link>
                </p>
            </div>
            <div className="text-center mt-10">
                <Link to="/login" className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-gray-500 hover:text-primary-600 flex items-center justify-center group transition-all">
                    <ArrowLeft size={16} className="mr-3 transition-transform group-hover:-translate-x-2" />
                    Switch Portal Logic
                </Link>
            </div>
        </div>
    </div>
  );
}