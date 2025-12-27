import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    User, KeyRound, CheckCircle, Fingerprint, Database, 
    Cpu, Mail, Smartphone, Briefcase, RefreshCw, Loader2, ShieldCheck, 
    Lock, Save, ShieldAlert
} from 'lucide-react';
import Spinner from '../../components/Spinner';
import { useNotification } from '../../contexts/NotificationContext';

const InfoBit = ({ icon: Icon, label, value, color = "text-primary-500" }) => (
    <div className="flex items-start text-gray-600 dark:text-gray-300 p-5 bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all group">
        <div className={`mr-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div>
            <p className="text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{value || '---'}</p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-[0.2em] transition-all duration-500 relative overflow-hidden ${
            active 
            ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/30 -translate-y-1' 
            : 'bg-white dark:bg-gray-900 text-gray-400 hover:text-primary-600 border border-gray-100 dark:border-gray-800'
        }`}
    >
        {active && <div className="absolute inset-0 bg-white/10 animate-pulse-glow" />}
        <Icon size={16} className="relative z-10" />
        <span className="relative z-10">{label}</span>
    </button>
);

export default function UserProfile() {
    const { user, api } = useAuth();
    const { addToast } = useNotification();
    const [facultyData, setFacultyData] = useState(null);
    const [activeTab, setActiveTab] = useState('DOSSIER');
    const [loading, setLoading] = useState(true);
    
    // Security States
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [updatingSecurity, setUpdatingSecurity] = useState(false);

    useEffect(() => {
        if (user?.role === 'Teacher') {
            api(`/api/faculty`).then(list => {
                const found = list.find(f => f.email === user.email);
                setFacultyData(found);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, api]);

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return addToast('New passwords mismatch.', 'error');
        }
        if (passwords.new.length < 6) {
            return addToast('Password must be at least 6 characters.', 'error');
        }

        setUpdatingSecurity(true);
        try {
            await api('/api/users/profile/password', {
                method: 'PUT',
                body: JSON.stringify({ oldPassword: passwords.old, newPassword: passwords.new })
            });
            addToast('Access keys rotated successfully!', 'success');
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (err) {
            addToast(err.message, 'error');
        } finally {
            setUpdatingSecurity(false);
        }
    };

    if (loading) return <div className="h-[50vh] flex items-center justify-center"><Spinner size="lg" /></div>;
    
    const photoUrl = facultyData?.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${user?.name}`;

    return (
        <div className="space-y-10 animate-fade-in max-w-[1400px] mx-auto pb-20 px-4 sm:px-0">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-2xl border border-white/20 dark:border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] -mr-32 -mt-32" />
                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="relative">
                        <div className="w-36 h-36 rounded-[3rem] bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                            <img src={photoUrl} className="w-full h-full object-cover" alt="Avatar" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-primary-500 text-white p-2.5 rounded-[1.2rem] shadow-2xl border-4 border-white dark:border-gray-900 animate-float">
                            <Fingerprint size={20} />
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <p className="text-[0.65rem] font-black text-primary-500 uppercase tracking-widest mb-2">Authenticated Node: {user?.role}</p>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight">{user?.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.3em] mt-3 text-xs flex items-center justify-center md:justify-start gap-2">
                            <Database size={14} /> Node-ID: AIET-{user?._id?.slice(-6).toUpperCase()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <TabButton active={activeTab === 'DOSSIER'} onClick={() => setActiveTab('DOSSIER')} icon={Briefcase} label="Institutional Dossier" />
                <TabButton active={activeTab === 'SECURITY'} onClick={() => setActiveTab('SECURITY')} icon={Lock} label="Security Rotation" />
            </div>

            <div className="animate-fade-in-up">
                {activeTab === 'DOSSIER' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 px-2">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-500 mr-4">
                                    <User size={22} />
                                </div>
                                Core Identity
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoBit icon={Mail} label="Institutional Email" value={user?.email} color="text-indigo-500" />
                                <InfoBit icon={Smartphone} label="Direct Lattice Link" value={facultyData?.phone || 'Not Logged'} color="text-accent-500" />
                                {facultyData && (
                                    <>
                                        <InfoBit icon={Database} label="Department Cluster" value={facultyData.department} color="text-primary-500" />
                                        <InfoBit icon={Cpu} label="Expertise Node" value={facultyData.subject} color="text-secondary-500" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                             <div className="flex items-center text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 px-2">
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-2xl text-primary-500 mr-4">
                                    <ShieldCheck size={22} />
                                </div>
                                Access Privileges
                            </div>
                            <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl flex flex-col gap-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[0.6rem] font-black uppercase text-gray-400 tracking-widest">Global Admin Access</span>
                                    <span className={`px-3 py-1 rounded-lg text-[0.55rem] font-black uppercase ${user?.role === 'Admin' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                        {user?.role === 'Admin' ? 'Enabled' : 'Restricted'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[0.6rem] font-black uppercase text-gray-400 tracking-widest">Academic Logging</span>
                                    <span className={`px-3 py-1 rounded-lg text-[0.55rem] font-black uppercase ${['Admin', 'Teacher'].includes(user?.role) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                        Enabled
                                    </span>
                                </div>
                                <div className="pt-6 border-t dark:border-gray-800 flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-accent-500 animate-ping" />
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-accent-600">Private SSL Lattice Sync Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'SECURITY' && (
                    <div className="max-w-xl mx-auto space-y-10 animate-fade-in">
                        <div className="text-center space-y-4">
                            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary-600 shadow-inner">
                                <Lock size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Credential Rotation</h2>
                            <p className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-[0.3em]">Reset Institutional Access Protocols</p>
                        </div>
                        
                        <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
                            <div>
                                <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Current Sequence (Password)</label>
                                <input 
                                    type="password" 
                                    value={passwords.old} 
                                    onChange={e => setPasswords({...passwords, old: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" 
                                    placeholder="••••••••" 
                                    required 
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">New Logic Node</label>
                                    <input 
                                        type="password" 
                                        value={passwords.new} 
                                        onChange={e => setPasswords({...passwords, new: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Confirm Sequence</label>
                                    <input 
                                        type="password" 
                                        value={passwords.confirm} 
                                        onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={updatingSecurity} className="w-full py-5 bg-primary-600 text-white font-black uppercase text-[0.65rem] tracking-[0.3em] rounded-2xl shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                                {updatingSecurity ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                                {updatingSecurity ? 'Rotating Keys...' : 'Initialize Key Rotation'}
                            </button>
                            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl border border-yellow-100 dark:border-yellow-900/30">
                                <ShieldAlert size={18} className="text-yellow-600 shrink-0" />
                                <p className="text-[0.55rem] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-widest leading-relaxed">Safety Note: Changing your password will invalidate existing session tokens on other devices.</p>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}