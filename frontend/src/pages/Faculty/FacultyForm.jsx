import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Mail, Smartphone, Layers, Save, Cpu, Briefcase, MapPin, Calendar, Clock, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const labelClasses = "block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1";
const inputClasses = "w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-gray-900 dark:text-white shadow-inner transition-all";

export default function FacultyForm({ faculty, onSave, onCancel }) {
    const [formData, setFormData] = useState(faculty || { 
        name: '', email: '', phone: '', subject: '', qualification: '', designation: 'Assistant Professor',
        department: 'CSE', experienceYears: 0, photo: null, assignedStreams: [], assignedSubjects: [],
        status: 'Active', joiningDate: new Date().toISOString().split('T')[0],
        address: { current: '', permanent: '' }
    });
    
    const [allStreams, setAllStreams] = useState([]);
    const { api } = useAuth();
    const fileInputRef = useRef(null);

    useEffect(() => {
        api('/api/streams').then(setAllStreams).catch(console.error);
    }, [api]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleToggle = (listName, item) => {
        setFormData(prev => {
            const list = [...(prev[listName] || [])];
            const idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
            return { ...prev, [listName]: list };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl flex justify-center items-center z-[300] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-3xl w-full max-w-5xl h-[92vh] flex flex-col border border-white/10 animate-scale-in">
                
                <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-20">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary-600 rounded-3xl text-white shadow-2xl shadow-primary-500/40">
                            <UserPlus size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                Expert <span className="text-primary-600">Calibration</span>
                            </h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3">Neural Asset Onboarding Sequence</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-3xl transition-all active:scale-90"><X size={28} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-12 pb-32">
                    
                    {/* Layer 01: Core Identity */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-gray-50/50 dark:bg-gray-950/30 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                        <div className="lg:col-span-3 flex flex-col items-center gap-6">
                            <div className="w-48 h-48 rounded-[3rem] bg-white dark:bg-gray-950 border-4 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden group relative shadow-2xl">
                                {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <User size={64} className="text-gray-200" />}
                                <button type="button" onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-primary-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white">
                                    <Upload size={28} />
                                    <span className="text-[0.5rem] font-black uppercase tracking-widest mt-2">Sync Identity</span>
                                </button>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        
                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="sm:col-span-2">
                                <label className={labelClasses}>Full Legal Name</label>
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} placeholder="Dr. Sarah Connor" required />
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClasses}>Primary Expertise</label>
                                    <input value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className={inputClasses} placeholder="Quantum Mechanics" required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Institutional Email</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} placeholder="sarah@aiet.ac.in" required />
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClasses}>Mobile Node</label>
                                    <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClasses} placeholder="+91 9876543210" required />
                                </div>
                                <div>
                                    <label className={labelClasses}>Credentials</label>
                                    <input value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} className={inputClasses} placeholder="PhD in Neural Networks" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Layer 02: Professional Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <label className={labelClasses}>Designation</label>
                            <select value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className={inputClasses}>
                                <option>Assistant Professor</option>
                                <option>Associate Professor</option>
                                <option>Professor</option>
                                <option>Head of Department</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Department Hub</label>
                            <select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={inputClasses}>
                                <option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>CIVIL</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Exp Node (Years)</label>
                            <input type="number" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} className={inputClasses} />
                        </div>
                    </div>

                    {/* Layer 03: Allocation Lattice */}
                    <div className="p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                            <Layers className="text-primary-500" /> Assigned Stream Matrix
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {allStreams.map(stream => (
                                <button
                                    key={stream._id}
                                    type="button"
                                    onClick={() => handleToggle('assignedStreams', stream.name)}
                                    className={`px-6 py-3 rounded-2xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                                        formData.assignedStreams.includes(stream.name)
                                        ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/30'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200'
                                    }`}
                                >
                                    {stream.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Layer 04: Spatial Data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <label className={labelClasses}>Present Coordinate (Address)</label>
                            <textarea value={formData.address.current} onChange={e => setFormData({...formData, address: {...formData.address, current: e.target.value}})} className={`${inputClasses} h-32 resize-none`} placeholder="Bhubaneswar HQ..." />
                        </div>
                        <div>
                            <label className={labelClasses}>Registry Status</label>
                            <div className="flex gap-4 mb-6">
                                {['Active', 'On Leave', 'Resigned'].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setFormData({...formData, status: s})}
                                        className={`flex-1 py-3 rounded-xl text-[0.6rem] font-black uppercase tracking-widest transition-all ${
                                            formData.status === s ? 'bg-accent-500 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <label className={labelClasses}>Node Activation Date</label>
                            <input type="date" value={formData.joiningDate} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className={inputClasses} />
                        </div>
                    </div>
                </form>

                <div className="p-10 border-t dark:border-gray-800 flex justify-end gap-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-b-[3.5rem] z-20 shadow-3xl">
                    <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-500 font-black uppercase text-[0.7rem] tracking-widest hover:text-red-500 transition-all">Abort Sequence</button>
                    <button onClick={handleSubmit} className="px-14 py-4 bg-primary-600 text-white font-black uppercase text-[0.7rem] tracking-[0.3em] rounded-3xl hover:bg-primary-700 shadow-2xl shadow-primary-500/40 active:scale-95 transition-all flex items-center gap-3 group">
                        <Save size={18} className="group-hover:rotate-12 transition-transform" /> Commit Update
                    </button>
                </div>
            </div>
        </div>
    );
}