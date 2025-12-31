import React, { useEffect, useRef } from 'react';
import { 
    X, Phone, Mail, MapPin, Calendar, Printer, ShieldCheck, 
    Database, Smartphone, Users, CreditCard, ClipboardCheck, 
    BookOpen, Fingerprint, MessageSquare, Landmark, Trophy, 
    UserCog, AlertCircle, Bus, Clock, Sparkles
} from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const SectionHeader = ({ icon: Icon, title, color = "text-primary-500" }) => (
    <div className="flex items-center gap-3 mb-5 border-b dark:border-gray-800 pb-3 print:border-gray-200">
        <Icon size={18} className={color} />
        <h3 className={`text-[0.7rem] font-black uppercase tracking-[0.3em] ${color}`}>{title}</h3>
    </div>
);

const InfoBit = ({ label, value, icon: Icon }) => (
    <div className="space-y-1.5 group">
        <div className="flex items-center gap-2">
            {Icon && <Icon size={10} className="text-gray-400" />}
            <span className="text-[0.55rem] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary-500 transition-colors">{label}</span>
        </div>
        <p className="text-[0.7rem] font-bold text-gray-800 dark:text-gray-100 break-words">{value || '---'}</p>
    </div>
);

export default function StudentDetailModal({ student, onClose }) {
    useEffect(() => {
        if (student?._shouldPrint) {
            const timer = setTimeout(() => window.print(), 800);
            return () => clearTimeout(timer);
        }
    }, [student]);

    if (!student) return null;

    const photoUrl = student.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}%20${student.lastName}`;

    return (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl flex justify-center items-center z-[250] p-4 print:p-0 print:bg-white print:static print:inset-auto">
            <div className="bg-white dark:bg-gray-950 rounded-[3rem] shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col border border-white/10 overflow-hidden animate-scale-in print:h-auto print:shadow-none print:border-none print:rounded-none print:w-full">
                
                {/* Dossier Hub Header */}
                <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-950 z-20 print:hidden">
                    <div className="flex items-center gap-6">
                        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-primary-600 shadow-inner"><Fingerprint size={28} /></div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Identity <span className="text-primary-600">Dossier</span></h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2"><Database size={12} /> Registry Node: {student._id?.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => window.print()} className="flex items-center gap-3 px-6 py-3 bg-accent-500 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] shadow-xl hover:bg-accent-600 transition active:scale-95 group"><Printer size={16} /> Print Node</button>
                        <button onClick={onClose} className="p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-red-500 rounded-2xl transition-all"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-12 print:p-0 print:overflow-visible">
                    
                    {/* Top Profile Cluster */}
                    <section className="flex flex-col md:flex-row gap-10 items-start">
                        <div className="relative">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-gray-50 dark:bg-gray-900 border-4 border-white dark:border-gray-800 shadow-2xl overflow-hidden relative group print:w-32 print:h-32">
                                <img src={photoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Identity" />
                            </div>
                            <div className="absolute -bottom-4 -right-4 bg-primary-600 text-white p-2.5 rounded-xl shadow-xl animate-float print:hidden"><ShieldCheck size={18} /></div>
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">{student.firstName} {student.lastName}</h1>
                                <div className="flex flex-wrap gap-3">
                                    <span className="px-4 py-1.5 bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-[0.65rem] font-black uppercase tracking-widest rounded-xl border border-primary-200/50 print:border-gray-100">{student.course}</span>
                                    <span className="px-4 py-1.5 bg-accent-100 dark:bg-accent-900/50 text-accent-700 dark:text-accent-300 text-[0.65rem] font-black uppercase tracking-widest rounded-xl border border-accent-200/50 print:border-gray-100">{student.branch}</span>
                                    <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[0.65rem] font-black uppercase tracking-widest rounded-xl">Node: {student.section || 'A'}</span>
                                    <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[0.65rem] font-black uppercase tracking-widest rounded-xl flex items-center gap-2 border border-gray-200/50 shadow-inner"><Clock size={12}/> {student.academicYear || 'Not Logged'}</span>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border text-center flex flex-col justify-center print:border-none">
                                <p className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest mb-1">Registry Status</p>
                                <p className={`text-lg font-black uppercase tracking-tighter ${student.status === 'Approved' ? 'text-accent-500' : 'text-yellow-500'}`}>{student.status || 'Pending Cycle'}</p>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        
                        {/* Connectivity */}
                        <div className="space-y-6">
                            <SectionHeader icon={Smartphone} title="Connectivity Nodes" />
                            <div className="grid grid-cols-1 gap-6">
                                <InfoBit label="Primary Phone" value={student.phone} icon={Phone} />
                                <InfoBit label="WhatsApp Node" value={student.whatsappNumber} icon={MessageSquare} />
                                <InfoBit label="Registry Email" value={student.email} icon={Mail} />
                                <InfoBit label="Emergency SOS" value={`${student.emergencyContactName} (${student.emergencyContactPhone})`} icon={AlertCircle} />
                            </div>
                        </div>

                        {/* Entrance Credentials */}
                        <div className="space-y-6">
                            <SectionHeader icon={Trophy} title="Entrance Credentials" color="text-indigo-500" />
                            <div className="grid grid-cols-1 gap-6 bg-indigo-50/20 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 print:bg-transparent print:border-gray-200">
                                <InfoBit label="Exam Module" value={student.appearedInEntrance} />
                                <InfoBit label="Roll Sequence" value={student.entranceRollNo} />
                                <InfoBit label="Aadhar UID" value={student.aadharNumber} />
                                <InfoBit label="Social Identity" value={student.facebookId} />
                            </div>
                        </div>

                        {/* Institutional Services */}
                        <div className="space-y-6">
                            <SectionHeader icon={Bus} title="Institutional Services" color="text-accent-500" />
                            <div className="grid grid-cols-1 gap-6">
                                <InfoBit label="Accommodation Logic" value={student.accommodationRequired} />
                                <InfoBit label="Staff Referral Hub" value={student.staffName} icon={UserCog} />
                                <InfoBit label="Admission Node" value={formatDate(student.admissionDate)} />
                            </div>
                        </div>

                        {/* Education Legacy */}
                        <div className="space-y-6">
                            <SectionHeader icon={BookOpen} title="Legacy Node (10th)" color="text-primary-500" />
                            <div className="grid grid-cols-1 gap-6">
                                <InfoBit label="Board Protocol" value={student.education10th?.board} />
                                <InfoBit label="School Name" value={student.education10th?.schoolName} />
                                <div className="flex justify-between items-center pr-4">
                                    <InfoBit label="Marks" value={student.education10th?.marksSecured} />
                                    <p className="text-xl font-black text-primary-500">{student.education10th?.percentage || '0'}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Family Lattice */}
                        <div className="space-y-6">
                            <SectionHeader icon={Users} title="Family Lattice" color="text-gray-900 dark:text-white" />
                            <div className="grid grid-cols-1 gap-6 bg-gray-50 dark:bg-gray-900/30 p-6 rounded-3xl border border-gray-100 print:bg-transparent print:border-gray-200">
                                <InfoBit label="Father Node" value={`${student.family?.father?.name} (${student.family?.father?.occupation})`} />
                                <InfoBit label="Mother Node" value={`${student.family?.mother?.name} (${student.family?.mother?.occupation})`} />
                                <InfoBit label="Guardian SOS" value={student.family?.guardianPhone} />
                            </div>
                        </div>

                        {/* Additional Details */}
                        <div className="space-y-6">
                            <SectionHeader icon={Sparkles} title="Identity Modifiers" color="text-secondary-500" />
                            <div className="grid grid-cols-1 gap-6">
                                <InfoBit label="Date of Logic (DOB)" value={formatDate(student.dob)} icon={Calendar} />
                                <InfoBit label="Blood Group Node" value={student.bloodGroup} />
                                <InfoBit label="Category Status" value={student.category} />
                                <InfoBit label="Religion Node" value={student.religion} />
                            </div>
                        </div>

                        {/* Spatial Logic */}
                        <div className="lg:col-span-3">
                            <SectionHeader icon={MapPin} title="Spatial Logic (Addresses)" color="text-primary-600" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 bg-primary-50 dark:bg-primary-900/10 rounded-3xl border border-primary-100 print:bg-transparent print:border-gray-200">
                                    <h4 className="text-[0.6rem] font-black uppercase text-primary-700 tracking-widest mb-4">Present Spatial Link</h4>
                                    <p className="text-[0.75rem] font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                                        {student.presentAddress?.address}, {student.presentAddress?.city}, {student.presentAddress?.district}, {student.presentAddress?.state} - {student.presentAddress?.pincode}
                                        <br/><span className="text-[0.6rem] text-primary-400 font-bold uppercase mt-2 block">PO: {student.presentAddress?.postOffice} | PS: {student.presentAddress?.policeStation}</span>
                                    </p>
                                </div>
                                <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 print:bg-transparent print:border-gray-200">
                                    <h4 className="text-[0.6rem] font-black uppercase text-gray-500 tracking-widest mb-4">Permanent Core Link</h4>
                                    <p className="text-[0.75rem] font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {student.isAddressSame ? "SYNCED WITH PRESENT NODE" : `${student.permanentAddress?.address || 'Not Logged'}, ${student.permanentAddress?.city || ''}, ${student.permanentAddress?.state || ''}`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Document Audit */}
                        <div className="lg:col-span-3">
                            <SectionHeader icon={ClipboardCheck} title="Document Asset Audit" color="text-indigo-600" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <p className="text-[0.6rem] font-black uppercase text-gray-400">Original Logic Logged</p>
                                    <div className="flex flex-wrap gap-2">
                                        {student.documents?.original?.length > 0 ? student.documents.original.map(doc => (
                                            <span key={doc} className="px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-[0.55rem] font-black rounded-lg border border-primary-100 print:border-gray-200">{doc}</span>
                                        )) : <span className="text-[0.6rem] italic text-gray-400">Empty Record.</span>}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-[0.6rem] font-black uppercase text-gray-400">Xerox Logic Logged</p>
                                    <div className="flex flex-wrap gap-2">
                                        {student.documents?.xerox?.length > 0 ? student.documents.xerox.map(doc => (
                                            <span key={doc} className="px-3 py-1 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[0.55rem] font-black rounded-lg border border-gray-100 print:border-gray-200">{doc}</span>
                                        )) : <span className="text-[0.6rem] italic text-gray-400">Empty Record.</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Ledger */}
                    <section className="bg-gradient-to-br from-gray-900 to-primary-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden print:text-black print:bg-transparent print:shadow-none print:border print:border-gray-200">
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-5 gap-10">
                            <div className="md:col-span-5 flex items-center gap-4 mb-2">
                                <CreditCard size={24} className="text-primary-400 print:text-primary-600" />
                                <h3 className="text-xl font-black uppercase tracking-tighter">11. Financial Ledger Matrix</h3>
                            </div>
                            <InfoBit label="Pattern" value={student.paymentPattern} />
                            <InfoBit label="Cycle 1 (Y1)" value={`₹${student.yearFees?.y1?.toLocaleString()}`} />
                            <InfoBit label="Cycle 2 (Y2)" value={`₹${student.yearFees?.y2?.toLocaleString()}`} />
                            <InfoBit label="Cycle 3 (Y3)" value={`₹${student.yearFees?.y3?.toLocaleString()}`} />
                            <InfoBit label="Campus (Bus/Hostel)" value={`₹${student.yearFees?.hostelBus?.toLocaleString()}`} />
                        </div>
                    </section>
                </div>

                <div className="p-6 border-t dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl flex justify-end gap-5 z-20 print:flex print:static print:border-t print:mt-10 shadow-3xl print:shadow-none">
                    <p className="mr-auto self-center text-[0.55rem] font-black uppercase tracking-[0.4em] text-gray-400 ml-4 hidden md:block">Institutional Registry Node • AIET Bhubaneswar</p>
                    <button onClick={onClose} className="px-10 py-3.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[0.6rem] font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-transform shadow-xl print:hidden">Exit Session</button>
                </div>
            </div>
        </div>
    );
}