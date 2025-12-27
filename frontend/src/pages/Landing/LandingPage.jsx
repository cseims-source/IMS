import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, UserCog, Shield, ArrowRight, Sparkles, 
  Cpu, Globe, Zap, Fingerprint, LayoutDashboard
} from 'lucide-react';

const PortalCard = ({ role, icon, description, path, color, delay }) => (
    <Link 
        to={path} 
        className={`group relative overflow-hidden p-8 rounded-[2.5rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${color}`}></div>
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/30 rounded-[2.5rem] transition-colors pointer-events-none"></div>

        <div className="relative z-10">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${color} text-white shadow-lg`}>
                {icon}
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3">{role} Portal</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {description}
            </p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                Enter Node <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
            </div>
        </div>
    </Link>
);

const FeatureBadge = ({ icon, label }) => (
    <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-primary-200">
        <div className="text-primary-500">{icon}</div>
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">{label}</span>
    </div>
);

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-primary-400 rounded-full blur-[140px] opacity-20 animate-hero-glow"></div>
          <div className="absolute bottom-20 right-10 w-[40rem] h-[40rem] bg-purple-400 rounded-full blur-[160px] opacity-20 animate-hero-glow" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="container mx-auto px-4 pt-24 pb-32 relative z-10 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-600/10 dark:bg-primary-400/10 rounded-full border border-primary-500/30 mb-12 animate-float shadow-[0_0_15px_rgba(124,58,237,0.1)] hover:bg-primary-500/20 transition-colors cursor-default">
            <Sparkles size={18} className="text-primary-600 dark:text-primary-400 animate-pulse" />
            <span className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-primary-700 dark:text-primary-300">
                Core Digital Infrastructure
            </span>
        </div>
        
        <div className="max-w-6xl mx-auto mb-16">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-[0.95] flex flex-col items-center">
                <span className="flex flex-wrap justify-center gap-x-4 mb-2">
                    <span className="animate-blur-in opacity-0 inline-block" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                        Modern
                    </span>
                    <span className="animate-blur-in opacity-0 inline-block text-primary-600" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                        Education.
                    </span>
                </span>
                <span className="animate-blur-in opacity-0 inline-block" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
                    <span className="flex flex-wrap justify-center items-baseline gap-x-2 md:gap-x-4">
                        <span className="text-gray-400 dark:text-gray-600 italic lowercase font-medium tracking-normal text-xl md:text-2xl lg:text-3xl mr-2">is now</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-purple-600 to-primary-500 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>
                            Smarter.
                        </span>
                    </span>
                </span>
            </h1>
        </div>

        <p className="text-sm md:text-xl font-black text-gray-800 dark:text-gray-100 max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-in opacity-0 uppercase tracking-tighter" style={{ animationDelay: '1500ms', animationFillMode: 'forwards' }}>
            "Smart Systems for Smarter Education."
        </p>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-24 animate-fade-in opacity-0 uppercase tracking-widest font-bold" style={{ animationDelay: '1700ms', animationFillMode: 'forwards' }}>
            Aryan Institute: Optimized for high-performance institutional logic.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
            <PortalCard 
                role="Student" 
                icon={<User size={32} />} 
                description="Access your academic timeline, check results, and explore placement opportunities."
                path="/login/student"
                color="bg-primary-500"
                delay={1800}
            />
            <PortalCard 
                role="Faculty" 
                icon={<UserCog size={32} />} 
                description="Manage class sequences, biometric attendance, and AI-driven student performance analytics."
                path="/login/teacher"
                color="bg-secondary-500"
                delay={1950}
            />
            <PortalCard 
                role="Admin" 
                icon={<Shield size={32} />} 
                description="High-level institutional control hub. Global registry management and system monitoring."
                path="/login/admin"
                color="bg-gray-900 dark:bg-gray-800"
                delay={2100}
            />
        </div>

        <div className="flex flex-wrap justify-center gap-4 animate-fade-in opacity-0 mb-32" style={{ animationDelay: '2300ms', animationFillMode: 'forwards' }}>
            <FeatureBadge icon={<Cpu size={18} />} label="Modular AI Logic" />
            <FeatureBadge icon={<Fingerprint size={18} />} label="Secure Authentication" />
            <FeatureBadge icon={<Globe size={18} />} label="Cloud-Edge Sync" />
            <FeatureBadge icon={<LayoutDashboard size={18} />} label="Reactive Dashboard" />
            <FeatureBadge icon={<Zap size={18} />} label="Lavender Protocol" />
        </div>

        <div className="max-w-5xl mx-auto relative group animate-fade-in opacity-0" style={{ animationDelay: '2500ms', animationFillMode: 'forwards' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative p-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-gray-800 text-center shadow-2xl">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Request Access</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto font-medium">New student or faculty? Initialize your registration to request system onboarding.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/register/student" className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl">Student Onboarding</Link>
                    <Link to="/register/teacher" className="px-10 py-5 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-primary-500/30">Faculty Application</Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}