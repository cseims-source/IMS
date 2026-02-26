import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, User, Mail, Smartphone, Layers, Save, Cpu, Briefcase, MapPin, Calendar, Clock, UserPlus, ChevronDown, Plus, Trash2, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const labelClasses = "block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1";
const inputClasses = "w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-gray-900 dark:text-white shadow-inner transition-all";

export default function FacultyForm({ faculty, onSave, onCancel }) {
    const [formData, setFormData] = useState({ 
        username: '',
        staffType: 'Teaching',
        designation: 'Assistant Professor',
        name: '',
        department: '',
        fatherName: '',
        motherName: '',
        phone: '',
        whatsappNo: '',
        aadharNo: '',
        panNo: '',
        email: '',
        bloodGroup: '',
        caste: '',
        religion: '',
        joiningDate: new Date().toISOString().split('T')[0],
        dateOfBirth: '',
        address: { current: '', permanent: '' },
        highestQualification: '',
        teacherId: '',
        photo: null,
        // legacy/optional
        subject: '',
        qualification: '',
        experienceYears: 0,
        workload: [],
        status: 'Active'
    });
    
    const [allStreams, setAllStreams] = useState([]);
    const { api } = useAuth();
    const fileInputRef = useRef(null);

    // Temp state for adding a new workload node
    const [newWork, setNewWork] = useState({ stream: '', semester: 1, section: 'A', subject: '' });
    const [streamSubjects, setStreamSubjects] = useState([]);

    useEffect(() => {
        if (faculty) {
            setFormData({
                ...faculty,
                address: faculty.address || { current: '', permanent: '' },
                workload: faculty.workload || []
            });
        }
        api('/api/streams').then(data => setAllStreams(data || [])).catch(console.error);
    }, [faculty, api]);

    useEffect(() => {
        if (newWork.stream) {
            api(`/api/streams/${encodeURIComponent(newWork.stream)}/${newWork.semester}/subjects`)
                .then(setStreamSubjects)
                .catch(() => setStreamSubjects([]));
        } else {
            setStreamSubjects([]);
        }
    }, [newWork.stream, newWork.semester, api]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setFormData(prev => ({ ...prev, photo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const addWorkloadNode = () => {
        if (!newWork.stream || !newWork.subject) return;
        setFormData(prev => ({ 
            ...prev, 
            workload: [...prev.workload, { ...newWork }] 
        }));
        setNewWork(prev => ({ ...prev, subject: '' }));
    };

    const removeWorkloadNode = (idx) => {
        setFormData(prev => ({ ...prev, workload: prev.workload.filter((_, i) => i !== idx) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl flex justify-center items-center z-[300] p-4">
            <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-3xl w-full max-w-5xl h-[92vh] flex flex-col border border-white/10 animate-scale-in">
                
                <div className="p-10 border-b dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-primary-600 rounded-3xl text-white shadow-2xl">
                            <UserPlus size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                Expert <span className="text-primary-600">Calibration</span>
                            </h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3">Structured Workload Protocol</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-3xl transition-all active:scale-90"><X size={28} /></button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-12 pb-32">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-gray-50/50 dark:bg-gray-950/30 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                        <div className="lg:col-span-3 flex flex-col items-center gap-6">
                            <div className="w-48 h-48 rounded-[3rem] bg-white dark:bg-gray-950 border-4 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden group relative shadow-2xl">
                                {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Node Preview" /> : <User size={64} className="text-gray-200" />}
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-primary-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white">
                                    <Upload size={28} />
                                    <span className="text-[0.5rem] font-black uppercase tracking-widest mt-2">Sync Identity</span>
                                </button>
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        
                        <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div><label className={labelClasses}>Username</label><input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className={inputClasses} placeholder="faculty001" /></div>
                            <div>
                                <label className={labelClasses}>Staff Type</label>
                                <select value={formData.staffType} onChange={e => setFormData({...formData, staffType: e.target.value})} className={inputClasses}>
                                    <option value="Teaching">Teaching</option>
                                    <option value="Non-Teaching">Non-Teaching</option>
                                </select>
                            </div>
                            <div><label className={labelClasses}>Designation</label><input value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} className={inputClasses} placeholder="Assistant Professor" /></div>
                            <div className="sm:col-span-2"><label className={labelClasses}>Name of the Staff</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClasses} placeholder="Dr. Sarah Connor" required /></div>
                            <div><label className={labelClasses}>Department</label><input value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className={inputClasses} placeholder="Mechanical / Admin / Accounts" /></div>
                            <div><label className={labelClasses}>Father's Name</label><input value={formData.fatherName} onChange={e => setFormData({...formData, fatherName: e.target.value})} className={inputClasses} placeholder="John Connor" /></div>
                            <div><label className={labelClasses}>Mother's Name</label><input value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} className={inputClasses} placeholder="Sarah Connor" /></div>
                            <div><label className={labelClasses}>Contact No</label><input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className={inputClasses} placeholder="+91 9876543210" /></div>
                            <div><label className={labelClasses}>WhatsApp No</label><input value={formData.whatsappNo} onChange={e => setFormData({...formData, whatsappNo: e.target.value})} className={inputClasses} placeholder="+91 9876543210" /></div>
                            <div><label className={labelClasses}>Aadhar Card No</label><input value={formData.aadharNo} onChange={e => setFormData({...formData, aadharNo: e.target.value})} className={inputClasses} placeholder="XXXX-XXXX-XXXX" /></div>
                            <div><label className={labelClasses}>PAN Card No</label><input value={formData.panNo} onChange={e => setFormData({...formData, panNo: e.target.value})} className={inputClasses} placeholder="ABCDE1234F" /></div>
                            <div><label className={labelClasses}>E-mail ID</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClasses} placeholder="staff@aiet.ac.in" required /></div>
                            <div><label className={labelClasses}>Blood Group</label><input value={formData.bloodGroup} onChange={e => setFormData({...formData, bloodGroup: e.target.value})} className={inputClasses} placeholder="B+" /></div>
                            <div><label className={labelClasses}>Caste</label><input value={formData.caste} onChange={e => setFormData({...formData, caste: e.target.value})} className={inputClasses} placeholder="General / OBC / SC / ST" /></div>
                            <div><label className={labelClasses}>Religion</label><input value={formData.religion} onChange={e => setFormData({...formData, religion: e.target.value})} className={inputClasses} placeholder="Hindu" /></div>
                            <div className="sm:col-span-2"><label className={labelClasses}>Photo URL (optional)</label><input value={formData.photo || ''} onChange={e => setFormData({...formData, photo: e.target.value})} className={inputClasses} placeholder="https://..." /></div>
                            <div><label className={labelClasses}>Date of Joining (D.O.J.)</label><input type="date" value={formData.joiningDate ? String(formData.joiningDate).slice(0, 10) : ''} onChange={e => setFormData({...formData, joiningDate: e.target.value})} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Date of Birth (D.O.B.)</label><input type="date" value={formData.dateOfBirth ? String(formData.dateOfBirth).slice(0, 10) : ''} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} className={inputClasses} /></div>
                            <div><label className={labelClasses}>Highest Qualification with Pass Out Year</label><input value={formData.highestQualification} onChange={e => setFormData({...formData, highestQualification: e.target.value})} className={inputClasses} placeholder="M.Tech (2021)" /></div>
                            <div><label className={labelClasses}>Teacher ID (BPUT)</label><input value={formData.teacherId} onChange={e => setFormData({...formData, teacherId: e.target.value})} className={inputClasses} placeholder="BPUT/2024/1234" /></div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div>
                            <label className={labelClasses}>Permanent Address (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/ STATE)</label>
                            <textarea value={formData.address?.permanent || ''} onChange={e => setFormData({...formData, address: { ...formData.address, permanent: e.target.value }})} className={`${inputClasses} min-h-[120px]`} placeholder="Permanent address" />
                        </div>
                        <div>
                            <label className={labelClasses}>Present Address (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/ STATE)</label>
                            <textarea value={formData.address?.current || ''} onChange={e => setFormData({...formData, address: { ...formData.address, current: e.target.value }})} className={`${inputClasses} min-h-[120px]`} placeholder="Present address" />
                        </div>
                    </div>

                    {/* Sectional Workload Lattice Builder */}
                    <div className="p-10 rounded-[3rem] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between mb-8 px-2">
                             <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                                <Layers className="text-primary-500" /> Sectional Workload Lattice
                            </h3>
                            <div className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
                                <span className="text-[0.6rem] font-black text-primary-600 uppercase tracking-widest">{formData.workload.length} Active Assignments</span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 p-8 bg-gray-50 dark:bg-gray-950/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Stream Hub</label>
                                <select value={newWork.stream} onChange={e => setNewWork({...newWork, stream: e.target.value})} className={inputClasses}>
                                    <option value="">Select Stream</option>
                                    {allStreams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClasses}>Semester</label>
                                <input type="number" min="1" max="8" value={newWork.semester} onChange={e => setNewWork({...newWork, semester: parseInt(e.target.value)})} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Section</label>
                                <select value={newWork.section} onChange={e => setNewWork({...newWork, section: e.target.value})} className={inputClasses}>
                                    {['A', 'B', 'C', 'D', 'E'].map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Subject Node</label>
                                <select value={newWork.subject} onChange={e => setNewWork({...newWork, subject: e.target.value})} className={inputClasses}>
                                    <option value="">Select Module</option>
                                    {streamSubjects.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button type="button" onClick={addWorkloadNode} className="w-full p-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[0.6rem] tracking-widest hover:bg-primary-700 transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20">
                                    <Plus size={16}/> Inject Logic
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {formData.workload.map((work, idx) => (
                                <div key={idx} className="p-6 bg-gray-50 dark:bg-gray-950 rounded-[2rem] border border-gray-100 dark:border-gray-800 group relative hover:border-primary-500/40 transition-all hover:shadow-xl hover:-translate-y-1">
                                    <button type="button" onClick={() => removeWorkloadNode(idx)} className="absolute top-4 right-4 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-primary-500 text-white rounded-lg shadow-md"><Bookmark size={14}/></div>
                                        <p className="text-[0.65rem] font-black uppercase text-gray-400 tracking-widest">Assignment {idx+1}</p>
                                    </div>
                                    <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-tight mb-4">{work.subject}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[0.55rem] font-black uppercase tracking-widest bg-white dark:bg-gray-900 text-primary-500 px-3 py-1.5 rounded-xl border dark:border-gray-800 shadow-sm">{work.stream}</span>
                                        <div className="flex gap-1.5">
                                            <span className="text-[0.55rem] font-black uppercase tracking-widest bg-indigo-500 text-white px-3 py-1.5 rounded-xl">Sem {work.semester}</span>
                                            <span className="text-[0.55rem] font-black uppercase tracking-widest bg-accent-500 text-white px-3 py-1.5 rounded-xl">Sec {work.section}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {formData.workload.length === 0 && (
                                <div className="col-span-full py-16 text-center border-4 border-dashed border-gray-50 dark:border-gray-800/50 rounded-[3rem]">
                                    <Layers className="mx-auto text-gray-100 dark:text-gray-800 mb-4" size={48} />
                                    <p className="text-[0.7rem] font-black uppercase tracking-widest text-gray-300">No sectional assignments mapped.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                <div className="p-10 border-t dark:border-gray-800 flex justify-end gap-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-b-[3.5rem] z-20">
                    <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-500 font-black uppercase text-[0.7rem] tracking-widest hover:text-red-500 transition-all">Abort</button>
                    <button onClick={handleSubmit} className="px-14 py-4 bg-primary-600 text-white font-black uppercase text-[0.7rem] tracking-[0.3em] rounded-3xl hover:bg-primary-700 shadow-2xl shadow-primary-500/30 active:scale-95 transition-all flex items-center gap-3">
                        <Save size={18} /> Commit Calibration
                    </button>
                </div>
            </div>
        </div>
    );
}