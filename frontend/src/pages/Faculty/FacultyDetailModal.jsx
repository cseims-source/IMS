import React, { useEffect } from 'react';
import { X, Printer, Fingerprint, Database, Cpu, Mail, Smartphone, Layers, GraduationCap, ShieldCheck, UserCheck, Briefcase, MapPin, Calendar, Clock, UserCog } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const InfoBit = ({ label, value, icon: Icon, color = "text-primary-500" }) => (
    <div className="flex items-start text-gray-600 dark:text-gray-300 p-5 bg-white dark:bg-gray-900/50 rounded-[2rem] border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all group">
        <div className={`mr-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-inner ${color} group-hover:scale-110 transition-transform`}>
            {Icon && <Icon size={18} />}
        </div>
        <div>
            <p className="text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-bold text-gray-900 dark:text-gray-100">{value || '---'}</p>
        </div>
    </div>
);

export default function FacultyDetailModal({ faculty, onClose }) {
    useEffect(() => {
        if (faculty?._shouldPrint) {
            const timer = setTimeout(() => window.print(), 800);
            return () => clearTimeout(timer);
        }
    }, [faculty]);

    if (!faculty) return null;

    const photoUrl = faculty.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${faculty.name}`;

    return (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-3xl flex justify-center items-center z-[250] p-4 print:p-0 print:bg-white print:static print:inset-auto">
            <div className="bg-white dark:bg-gray-950 rounded-[4rem] shadow-[0_0_80px_rgba(0,0,0,0.5)] w-full max-w-6xl h-[95vh] flex flex-col border border-white/10 overflow-hidden animate-scale-in print:h-auto print:border-none print:shadow-none print:rounded-none print:w-full">
                
                <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 z-20 print:hidden shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary-600 rounded-3xl text-white shadow-2xl shadow-primary-500/40 animate-pulse"><Fingerprint size={32} /></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Expert <span className="text-primary-600">Dossier</span></h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3 flex items-center gap-2"><Database size={14} /> Registry-ID: {faculty._id?.slice(-10).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="flex items-center gap-3 px-8 py-4 bg-accent-500 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-accent-600 transition active:scale-95 group relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                            <Printer size={18} className="relative z-10" /> <span className="relative z-10">Export Identity</span>
                        </button>
                        <button onClick={onClose} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-3xl transition-all active:scale-90"><X size={28} /></button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-16 print:p-0 print:overflow-visible">
                    
                    <section className="flex flex-col md:flex-row gap-12 items-center md:items-start text-center md:text-left relative">
                        <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 print:hidden">
                            <Cpu size={200} className="text-primary-600" />
                        </div>
                        <div className="relative">
                            <div className="w-48 h-48 rounded-[4rem] bg-gray-50 dark:bg-gray-800 border-8 border-white dark:border-gray-700 shadow-3xl overflow-hidden relative group print:w-32 print:h-32">
                                <img src={photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-3 rounded-2xl shadow-2xl border-4 border-white dark:border-gray-950 animate-float print:hidden">
                                <UserCheck size={20} />
                            </div>
                        </div>
                        <div className="flex-grow space-y-6 relative z-10">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                                    <span className="px-5 py-1.5 bg-accent-100 text-accent-700 rounded-full text-[0.55rem] font-black uppercase tracking-[0.2em] shadow-sm print:border print:border-accent-200">Verified Faculty Cluster</span>
                                    <span className={`px-5 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-[0.2em] ${faculty.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>Node: {faculty.status}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.9]">{faculty.name}</h1>
                                <p className="text-lg font-black text-gray-400 uppercase tracking-[0.2em]">{faculty.designation} • {faculty.department} HUB</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-3 px-8 py-3 bg-primary-50/50 dark:bg-primary-900/10 rounded-2xl border border-primary-100 dark:border-primary-800">
                                    <Cpu size={16} className="text-primary-500" />
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-primary-600">{faculty.subject} Matrix</span>
                                </div>
                                <div className="flex items-center gap-3 px-8 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-500">{faculty.experienceYears} Years Logic Trace</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InfoBit icon={Mail} label="Institutional Protocol (Email)" value={faculty.email} color="text-indigo-500" />
                            <InfoBit icon={Smartphone} label="Direct Lattice Link" value={faculty.phone} color="text-accent-500" />
                            <div className="sm:col-span-2">
                                <InfoBit icon={GraduationCap} label="Academic Credentials & Bio" value={faculty.qualification} color="text-secondary-500" />
                            </div>
                            <InfoBit icon={Calendar} label="Sequence Activation Date" value={formatDate(faculty.joiningDate)} color="text-green-500" />
                            <InfoBit icon={MapPin} label="Spatial Coordinate" value={faculty.address?.current} color="text-red-500" />
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 flex flex-col gap-8 shadow-inner print:border-none print:shadow-none">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-primary-500 border-b dark:border-gray-800 pb-3 print:border-gray-200">
                                    <Layers size={18} />
                                    <h4 className="text-[0.6rem] font-black uppercase tracking-widest">Stream Matrix</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {faculty.assignedStreams?.length > 0 ? faculty.assignedStreams.map(s => (
                                        <span key={s} className="px-4 py-2 bg-white dark:bg-gray-800 text-[0.5rem] font-black uppercase tracking-widest rounded-xl border dark:border-gray-700 shadow-sm transition-all hover:scale-110 print:border-gray-100">{s}</span>
                                    )) : <span className="text-[0.5rem] italic text-gray-400 uppercase tracking-widest">Logic: Unlinked</span>}
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 text-accent-500 border-b dark:border-gray-800 pb-3 print:border-gray-200">
                                    <ShieldCheck size={18} />
                                    <h4 className="text-[0.6rem] font-black uppercase tracking-widest">Subject Expertise</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {faculty.assignedSubjects?.length > 0 ? faculty.assignedSubjects.map(s => (
                                        <span key={s} className="px-4 py-2 bg-white dark:bg-gray-800 text-[0.5rem] font-black uppercase tracking-widest rounded-xl border dark:border-gray-700 shadow-sm transition-all hover:scale-110 print:border-gray-100">{s}</span>
                                    )) : <span className="text-[0.5rem] italic text-gray-400 uppercase tracking-widest">Nodes: Unassigned</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-10 border-t dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl flex justify-between items-center z-20 print:flex print:static print:border-t print:mt-10 shadow-3xl print:shadow-none">
                     <div className="flex items-center gap-4">
                        <UserCog size={20} className="text-gray-400" />
                        <p className="text-[0.55rem] font-black uppercase tracking-[0.8em] text-gray-400">AIET INSTITUTIONAL LATTICE ALPHA • CLOUD VERSION</p>
                     </div>
                    <button onClick={onClose} className="px-14 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[0.65rem] font-black uppercase tracking-[0.3em] rounded-3xl active:scale-95 transition-transform shadow-2xl print:hidden">Terminal Exit</button>
                </div>
            </div>
        </div>
    );
}