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
            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-3">{role} Portal</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
                {description}
            </p>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
                Enter <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
            </div>
        </div>
    </Link>
);

const FeatureBadge = ({ icon, label }) => (
    <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="text-primary-500">{icon}</div>
        <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-600 dark:text-gray-300">{label}</span>
    </div>
);

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-[30rem] h-[30rem] bg-primary-400 rounded-full blur-[140px] opacity-20 animate-hero-glow"></div>
          <div className="absolute bottom-20 right-10 w-[40rem] h-[40rem] bg-purple-400 rounded-full blur-[160px] opacity-20 animate-hero-glow" style={{ animationDelay: '-5s' }}></div>
      </div>

      <div className="container mx-auto px-4 pt-20 pb-32 relative z-10 text-center">
        {/* Top Floating Badge - Increased Font Size & Added Float Animation */}
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary-600/10 dark:bg-primary-400/10 rounded-full border border-primary-500/30 mb-12 animate-float shadow-[0_0_15px_rgba(22,163,74,0.1)] hover:bg-primary-500/20 transition-colors cursor-default">
            <Sparkles size={18} className="text-primary-600 dark:text-primary-400 animate-pulse" />
            <span className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-primary-700 dark:text-primary-300">
                Aryan Institute Digital Infrastructure
            </span>
        </div>
        
        {/* Main Hero Section with reduced font sizes */}
        <div className="max-w-6xl mx-auto mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-gray-900 dark:text-white uppercase leading-[1.1] flex flex-col items-center">
                {/* Line 1: Smart Systems */}
                <span className="flex flex-wrap justify-center gap-x-4 mb-2">
                    <span className="animate-blur-in opacity-0 inline-block" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                        Smart
                    </span>
                    <span className="animate-blur-in opacity-0 inline-block text-[#16a34a]" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                        Systems.
                    </span>
                </span>
                
                {/* Line 2: for Smarter Education */}
                <span className="animate-blur-in opacity-0 inline-block" style={{ animationDelay: '900ms', animationFillMode: 'forwards' }}>
                    <span className="flex flex-wrap justify-center items-baseline gap-x-2 md:gap-x-4">
                        <span className="text-gray-400 dark:text-gray-600 italic lowercase font-medium tracking-normal text-2xl md:text-3xl lg:text-4xl mr-2">for</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4f46e5] via-[#9333ea] to-[#db2777] animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>
                            Smarter Education.
                        </span>
                    </span>
                </span>
            </h1>
        </div>

        {/* Hero Subtext */}
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-24 animate-fade-in opacity-0" style={{ animationDelay: '1500ms', animationFillMode: 'forwards' }}>
            Experience the power of the Aryan IMS. Secure, AI-integrated, and optimized for high-performance institutional management.
        </p>

        {/* Portal Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-32">
            <PortalCard 
                role="Student" 
                icon={<User size={32} />} 
                description="Check your attendance, grades, and apply for placements. Your complete academic timeline."
                path="/login/student"
                color="bg-blue-600"
                delay={1700}
            />
            <PortalCard 
                role="Faculty" 
                icon={<UserCog size={32} />} 
                description="Manage classes, mark attendance, and generate AI student insights with advanced educator tools."
                path="/login/teacher"
                color="bg-primary-600"
                delay={1850}
            />
            <PortalCard 
                role="Admin" 
                icon={<Shield size={32} />} 
                description="Complete institutional control. Approve users, manage streams, and monitor real-time metrics."
                path="/login/admin"
                color="bg-gray-900 dark:bg-gray-700"
                delay={2000}
            />
        </div>

        {/* Dynamic Feature Highlights */}
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in opacity-0 mb-32" style={{ animationDelay: '2300ms', animationFillMode: 'forwards' }}>
            <FeatureBadge icon={<Cpu size={18} />} label="AI-Driven Insights" />
            <FeatureBadge icon={<Fingerprint size={18} />} label="Biometric Sync Ready" />
            <FeatureBadge icon={<Globe size={18} />} label="Cloud Infrastructure" />
            <FeatureBadge icon={<LayoutDashboard size={18} />} label="Modular Architecture" />
            <FeatureBadge icon={<Zap size={18} />} label="Ultra-Low Latency" />
        </div>

        {/* Registration CTA */}
        <div className="max-w-5xl mx-auto relative group animate-fade-in opacity-0" style={{ animationDelay: '2500ms', animationFillMode: 'forwards' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-primary-500/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative p-12 bg-white/50 dark:bg-gray-900/50 backdrop-blur-2xl rounded-[3rem] border border-white/20 dark:border-gray-800 text-center shadow-2xl">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Ready to contribute?</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto font-medium">New student or faculty member? Register now to request system access from the administrator.</p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link to="/register/student" className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl">Student Registration</Link>
                    <Link to="/register/teacher" className="px-8 py-4 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-transform active:scale-95 shadow-xl">Faculty Onboarding</Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}