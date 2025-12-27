import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
    User, Mail, Phone, Home, GraduationCap, BarChart2, 
    CheckCircle, Calendar, X, Download, Eye, Award, 
    Image as ImageIcon, DollarSign, Bookmark, Shield, 
    Users, MapPin, Trophy, Fingerprint, KeyRound, 
    CheckCircle2, AlertCircle, Loader2, Smartphone,
    Bus, ClipboardCheck, MessageSquare, Save, RefreshCw, FileDown,
    Clock, ShieldCheck, UserCog, Database, BookOpen, ShieldAlert, Landmark, Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatDate } from '../../utils/dateFormatter';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

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

const SectionHeader = ({ icon: Icon, num, title, subtitle }) => (
    <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-xs shadow-lg">{num}</div>
        <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Icon size={20} className="text-primary-500" /> {title}
            </h3>
            <p className="text-[0.55rem] font-bold text-gray-400 uppercase tracking-[0.4em]">{subtitle}</p>
        </div>
    </div>
);

export default function StudentProfile() {
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('DOSSIER');
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();
  const { addToast } = useNotification();
  const dossierRef = useRef(null);

  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [updatingSecurity, setUpdatingSecurity] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [api]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await api('/api/students/profile');
      setStudent(data);
    } catch (error) {
      addToast("Failed to sync neural profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return addToast('New passwords mismatch.', 'error');
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
    } finally { setUpdatingSecurity(false); }
  };

  const downloadFullDossier = async () => {
      if (!dossierRef.current) return;
      addToast("Synthesizing PDF dossier...", "info");
      const canvas = await html2canvas(dossierRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AIET_Dossier_${student.firstName}.pdf`);
      addToast("Registry document generated!", "success");
  };

  if (loading) return (
    <div className="h-[70vh] flex flex-col items-center justify-center gap-6">
        <RefreshCw className="animate-spin text-primary-500" size={48} />
        <p className="font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse text-xs">Accessing Private Node Registry...</p>
    </div>
  );

  if (!student) return <div className="text-center p-20 font-black text-red-500 uppercase tracking-[0.5em]">Identity Trace Terminated. Contact Admin Node.</div>;

  const photoUrl = student.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}`;

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-24">
        {/* Profile Header Block */}
        <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-2xl border border-white/20 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] -mr-32 -mt-32" />
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="relative">
                    <div className="w-36 h-36 rounded-[3rem] bg-gray-50 dark:bg-gray-800 border-4 border-white dark:border-gray-700 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-700">
                        <img src={photoUrl} className="w-full h-full object-cover" alt="Node Avatar" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-accent-500 text-white p-2.5 rounded-[1.2rem] shadow-2xl border-4 border-white dark:border-gray-900 animate-float">
                        <Fingerprint size={20} />
                    </div>
                </div>
                <div className="text-center md:text-left flex-grow">
                    <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                        <span className={`px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest shadow-sm ${student.status === 'Approved' ? 'bg-accent-100 text-accent-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            Registry: {student.status}
                        </span>
                        <span className="text-[0.65rem] font-mono text-gray-400 font-bold uppercase">Node-ID: {student._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight mb-4">
                        {student.firstName} <span className="text-primary-600">{student.lastName}</span>
                    </h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-3 px-6 py-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <GraduationCap size={14} className="text-primary-500" />
                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">{student.course} • {student.branch}</span>
                        </div>
                        <div className="flex items-center gap-3 px-6 py-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <Clock size={14} className="text-primary-500" />
                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">Semester {student.currentSemester}</span>
                        </div>
                    </div>
                </div>
                <button onClick={downloadFullDossier} className="flex flex-col items-center gap-2 p-6 bg-primary-600/5 hover:bg-primary-600/10 rounded-[2.5rem] border border-primary-500/10 transition-all active:scale-95 group">
                    <FileDown size={28} className="text-primary-600 group-hover:translate-y-1 transition-transform" />
                    <span className="text-[0.55rem] font-black uppercase tracking-widest text-primary-700">Export Registry</span>
                </button>
            </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start px-2">
            <TabButton active={activeTab === 'DOSSIER'} onClick={() => setActiveTab('DOSSIER')} icon={Database} label="Registry Dossier" />
            <TabButton active={activeTab === 'ANALYTICS'} onClick={() => setActiveTab('ANALYTICS')} icon={BarChart2} label="Performance Matrix" />
            <TabButton active={activeTab === 'SECURITY'} onClick={() => setActiveTab('SECURITY')} icon={ShieldCheck} label="Security Protocol" />
        </div>

        {/* Dynamic Context Render */}
        <div className="animate-fade-in-up">
            {activeTab === 'DOSSIER' && (
                <div ref={dossierRef} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 01. Personal & 02. Contact */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                                <SectionHeader icon={User} num="01" title="Identity Nodes" subtitle="Verified Contact Credentials" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <InfoBit icon={Mail} label="Registry Email" value={student.email} />
                                    <InfoBit icon={Smartphone} label="Direct Line" value={student.phone} />
                                    <InfoBit icon={MessageSquare} label="WhatsApp Node" value={student.whatsappNumber} />
                                    <InfoBit icon={ShieldCheck} label="Aadhar UID" value={student.aadharNumber} />
                                    <InfoBit icon={Calendar} label="Date of Logic" value={formatDate(student.dob)} />
                                    <InfoBit icon={Award} label="Identity Type" value={student.gender} />
                                </div>
                            </div>

                            {/* 09. Spatial Logic */}
                            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                                <SectionHeader icon={MapPin} num="09" title="Spatial Coordinates" subtitle="Geographical Logic Hub" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-primary-50/50 dark:bg-primary-900/10 rounded-[2.5rem] border border-primary-100 dark:border-primary-800">
                                        <p className="text-[0.6rem] font-black uppercase text-primary-600 mb-3 tracking-widest">Present Node</p>
                                        <p className="text-sm font-bold leading-relaxed">{student.presentAddress?.address}, {student.presentAddress?.city}, {student.presentAddress?.district}, {student.presentAddress?.state} - {student.presentAddress?.pincode}</p>
                                        <p className="text-[0.55rem] text-gray-400 mt-2 font-black uppercase">Via: {student.presentAddress?.via} | Block: {student.presentAddress?.block}</p>
                                    </div>
                                    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                                        <p className="text-[0.6rem] font-black uppercase text-gray-400 mb-3 tracking-widest">Permanent Node</p>
                                        <p className="text-sm font-bold opacity-60 italic">{student.isAddressSame ? "Synchronized with Present Node" : `${student.permanentAddress?.address}, ${student.permanentAddress?.city}`}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Ledger Widget */}
                        <div className="bg-gradient-to-br from-gray-900 to-primary-900 p-10 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32" />
                            <div className="relative z-10 space-y-10">
                                <div className="flex items-center gap-4">
                                    <DollarSign size={28} className="text-primary-400" />
                                    <h3 className="text-xl font-black uppercase tracking-tighter">Registry Ledger</h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10">
                                        <p className="text-[0.55rem] font-black uppercase tracking-widest opacity-40 mb-1">Active Cycle (Y1)</p>
                                        <p className="text-2xl font-black tracking-tighter">₹{student.yearFees?.y1?.toLocaleString()}</p>
                                    </div>
                                    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10">
                                        <p className="text-[0.55rem] font-black uppercase tracking-widest opacity-40 mb-1">Campus Services Node</p>
                                        <p className="text-2xl font-black tracking-tighter">₹{student.yearFees?.hostelBus?.toLocaleString()}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <p className="text-[0.5rem] uppercase opacity-40 mb-1">Cycle 2</p>
                                            <p className="text-sm font-black">₹{student.yearFees?.y2?.toLocaleString()}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl">
                                            <p className="text-[0.5rem] uppercase opacity-40 mb-1">Cycle 3</p>
                                            <p className="text-sm font-black">₹{student.yearFees?.y3?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary-400">{student.paymentPattern} Protocol</span>
                                    <CheckCircle size={18} className="text-accent-500" />
                                </div>
                            </div>
                        </div>

                        {/* 07. Family Lattice */}
                        <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                             <SectionHeader icon={Users} num="07" title="Family Lattice" subtitle="Genealogical Logic Sync" />
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <div className="p-8 bg-primary-50/30 dark:bg-primary-900/10 rounded-[2.5rem] border border-primary-100 dark:border-primary-800">
                                    <h4 className="text-[0.65rem] font-black text-primary-600 uppercase mb-5 tracking-[0.2em]">Father Node</h4>
                                    <div className="space-y-4">
                                        <InfoBit icon={User} label="Legal Name" value={student.family?.father?.name} />
                                        <InfoBit icon={Smartphone} label="Contact Node" value={student.family?.father?.phone} />
                                    </div>
                                </div>
                                <div className="p-8 bg-secondary-50/30 dark:bg-secondary-900/10 rounded-[2.5rem] border border-secondary-100 dark:border-secondary-800">
                                    <h4 className="text-[0.65rem] font-black text-secondary-600 uppercase mb-5 tracking-[0.2em]">Mother Node</h4>
                                    <div className="space-y-4">
                                        <InfoBit icon={User} label="Legal Name" value={student.family?.mother?.name} />
                                        <InfoBit icon={Smartphone} label="Contact Node" value={student.family?.mother?.phone} />
                                    </div>
                                </div>
                                <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                                    <h4 className="text-[0.6rem] font-black text-gray-400 uppercase mb-4 tracking-[0.2em] text-center">Guardian SOS</h4>
                                    <p className="text-2xl font-black text-gray-900 dark:text-white text-center tracking-tighter">{student.family?.guardianPhone || 'NOT LOGGED'}</p>
                                    <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl flex items-center justify-between shadow-sm">
                                        <span className="text-[0.5rem] font-black uppercase text-gray-400">Sync Provider</span>
                                        <span className="text-[0.6rem] font-black text-primary-500 uppercase">{student.staffName || 'System'}</span>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'ANALYTICS' && (
                <div className="space-y-10 animate-fade-in">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-xl border border-gray-100 dark:border-gray-800">
                             <div className="flex items-center justify-between mb-10">
                                <h3 className="text-xl font-black uppercase tracking-tighter">Participation Matrix</h3>
                                <div className="flex items-center gap-3 px-6 py-2 bg-accent-500/5 border border-accent-500/10 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
                                    <span className="text-[0.6rem] font-black uppercase tracking-widest text-accent-600">Dynamic Registry</span>
                                </div>
                             </div>
                             <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[{day: 'M', p: 85}, {day: 'T', p: 92}, {day: 'W', p: 88}, {day: 'T', p: 95}, {day: 'F', p: 80}]}>
                                        <defs>
                                            <linearGradient id="colorP" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} />
                                        <YAxis hide />
                                        <Tooltip contentStyle={{borderRadius: '1rem', border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff'}} />
                                        <Area type="monotone" dataKey="p" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorP)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                             </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-xl border border-gray-100 dark:border-gray-800 text-center flex flex-col justify-center gap-4">
                            <p className="text-[0.7rem] font-black text-gray-400 uppercase tracking-[0.5em]">Cumulative GPA Node</p>
                            <h2 className="text-6xl font-black text-primary-600 tracking-tighter">3.82</h2>
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-50 dark:bg-primary-900/30 rounded-full mx-auto">
                                <Trophy size={16} className="text-yellow-500" />
                                <span className="text-[0.6rem] font-black uppercase text-primary-700 dark:text-primary-300">Top 5% Logic Stream</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Qualification Dossier Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                            <SectionHeader icon={BookOpen} num="06" title="Legacy Trace" subtitle="10th Qualification Audit" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBit icon={Database} label="Board" value={student.education10th?.board} />
                                <InfoBit icon={Trophy} label="Score" value={`${student.education10th?.percentage}%`} color="text-accent-500" />
                                <div className="col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                                    <p className="text-[0.5rem] font-black uppercase text-gray-400 mb-1">Institutional Node</p>
                                    <p className="text-sm font-bold">{student.education10th?.schoolName}</p>
                                </div>
                            </div>
                         </div>
                         <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-xl border border-gray-100 dark:border-gray-800">
                            <SectionHeader icon={Award} num="06" title="Qualification Alpha" subtitle="Last Exam Audit" />
                            <div className="grid grid-cols-2 gap-4">
                                <InfoBit icon={Database} label="Exam" value={student.lastExam?.examType} />
                                <InfoBit icon={Trophy} label="Score" value={`${student.lastExam?.percentage}%`} color="text-secondary-500" />
                                <div className="col-span-2 p-6 bg-gray-50 dark:bg-gray-800 rounded-3xl">
                                    <p className="text-[0.5rem] font-black uppercase text-gray-400 mb-1">Institutional Node</p>
                                    <p className="text-sm font-bold">{student.lastExam?.instituteName}</p>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            {activeTab === 'SECURITY' && (
                <div className="max-w-xl mx-auto space-y-10 animate-fade-in">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-[2rem] flex items-center justify-center mx-auto text-primary-600 shadow-inner">
                            <ShieldCheck size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Access Rotation</h2>
                        <p className="text-[0.65rem] text-gray-500 font-bold uppercase tracking-[0.3em]">Update Private Access Protocols</p>
                    </div>
                    
                    <form onSubmit={handleUpdatePassword} className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
                        <div>
                            <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Current Logic Sequence</label>
                            <input type="password" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-[1.2rem] focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" placeholder="••••••••" required />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">New Logic Node</label>
                                <input type="password" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-[1.2rem] focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" placeholder="••••••••" required />
                            </div>
                            <div>
                                <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 ml-2 mb-2 block">Confirm Node</label>
                                <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-[1.2rem] focus:ring-4 focus:ring-primary-500/10 font-bold shadow-inner" placeholder="••••••••" required />
                            </div>
                        </div>
                        <button type="submit" disabled={updatingSecurity} className="w-full py-4 bg-primary-600 text-white font-black uppercase text-[0.65rem] tracking-[0.3em] rounded-[1.2rem] shadow-xl shadow-primary-500/30 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-4">
                            {updatingSecurity ? <Loader2 className="animate-spin" /> : <RefreshCw size={18} />}
                            {updatingSecurity ? 'Rotating Keys...' : 'Initialize Access Rotation'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    </div>
  );
}