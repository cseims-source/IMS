import React from 'react';
import { Link } from 'react-router-dom';
import { UserCog, User, Shield, ArrowLeft, Sparkles, Fingerprint, ChevronRight } from 'lucide-react';

const RoleCard = ({ role, icon, description, color, path, delay, subtext }) => (
    <Link 
        to={path} 
        style={{ animationDelay: `${delay}ms` }}
        className={`group relative overflow-hidden p-8 rounded-[3rem] bg-white/10 dark:bg-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_30px_80px_rgba(0,0,0,0.3)] animate-fade-in-up flex flex-col items-center text-center`}
    >
        <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${color}`}></div>
        
        <div className={`w-20 h-20 rounded-[1.8rem] flex items-center justify-center mb-6 transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${color} text-white shadow-lg shadow-black/20 relative z-10`}>
            {React.cloneElement(icon, { size: 36, className: "group-hover:animate-float" })}
        </div>

        <div className="relative z-10">
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">{role}</h3>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary-500 mb-4">{subtext}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 px-4">
                {description}
            </p>
        </div>

        <div className="mt-auto flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[0.65rem] font-black uppercase tracking-widest rounded-full transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 shadow-xl">
            Access Node <ChevronRight size={14} />
        </div>
    </Link>
);

export default function LoginSelection() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
        
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-hero-glow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-500/20 rounded-full blur-[120px] animate-hero-glow" style={{ animationDelay: '-5s' }}></div>
        </div>

        <Link 
            to="/" 
            className="fixed top-8 left-8 z-50 flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105 transition-all shadow-xl group"
        >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Exit to Home
        </Link>

        <div className="max-w-6xl w-full mx-auto relative z-10">
            <div className="text-center mb-16 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/20 mb-4 animate-float">
                    <Sparkles size={14} className="text-primary-500 animate-pulse" />
                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary-600">Core Gateway Interface</span>
                </div>
                <div className="flex justify-center mb-8">
                    <img src="/logo.png" alt="AIET Logo" className="h-16 md:h-20 w-auto object-contain animate-blur-in" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                    Select <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>Access Mode</span>
                </h1>
                <p className="text-[0.7rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.5em] mt-4">
                    Authorized Personnel Only • Encrypted SSL Session
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <RoleCard 
                    role="Admin" 
                    subtext="System Overseer"
                    icon={<Shield />} 
                    description="Global registry control, system monitoring, and infrastructure management portal."
                    color="bg-gray-900 dark:bg-gray-800" 
                    path="/login/admin"
                    delay={100}
                />
                <RoleCard 
                    role="Teacher" 
                    subtext="Faculty Node"
                    icon={<UserCog />} 
                    description="Initialize academic sessions, track biometric attendance, and analyze student logic."
                    color="bg-secondary-500" 
                    path="/login/teacher"
                    delay={300}
                />
                <RoleCard 
                    role="Student" 
                    subtext="Academic Entity"
                    icon={<User />} 
                    description="View personalized timelines, track results hub, and sync with digital library nodes."
                    color="bg-primary-600" 
                    path="/login/student"
                    delay={500}
                />
            </div>

            <div className="mt-20 text-center">
                <p className="text-[0.55rem] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.8em] flex items-center justify-center gap-4">
                   <Fingerprint size={14} className="animate-pulse" /> 
                   Biometric verification required on next sequence
                </p>
            </div>
        </div>
    </div>
  );
}