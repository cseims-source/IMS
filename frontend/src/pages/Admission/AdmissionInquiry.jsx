import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Send, RefreshCw, CheckCircle, User, BookOpen, MapPin, Users, ChevronRight, ChevronLeft, Sparkles, GraduationCap } from 'lucide-react';
import { Link } from 'react-router-dom';

const courses = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Diploma'];
const branches = {
    'B.Tech': ['Computer Science', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Electronics & Comm.'],
    'M.Tech': ['Computer Science', 'Power Systems', 'Structural Engineering', 'VLSI Design'],
    'MBA': ['Marketing', 'Finance', 'HR', 'Operations'],
    'MCA': ['General'],
    'Diploma': ['Civil', 'Electrical', 'Mechanical']
};
const states = ['Odisha', 'West Bengal', 'Bihar', 'Jharkhand', 'Andhra Pradesh', 'Telangana', 'Other'];

export default function AdmissionInquiry() {
    const { api } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '', mobile: '', email: '', gender: '', dob: '',
        course: '', branch: '', state: '', city: '', address: '',
        education10th: { board: '', schoolName: '', percentage: '' },
        lastExam: { examType: '', instituteName: '', percentage: '' },
        parentName: '', parentPhone: '', captcha: ''
    });
    
    const [captchaCode, setCaptchaCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const generateCaptcha = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setCaptchaCode(code);
    };

    useEffect(() => {
        generateCaptcha();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [section]: { ...prev[section], [field]: value }
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.captcha !== captchaCode) {
            setError('Invalid Captcha. Please try again.');
            generateCaptcha();
            setFormData(prev => ({ ...prev, captcha: '' }));
            return;
        }

        setLoading(true);
        try {
            await api('/api/admission/inquiry', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center items-center p-4">
                <div className="bg-white dark:bg-gray-900 p-12 rounded-[3rem] shadow-3xl max-w-lg w-full text-center border border-white/10 animate-scale-in">
                    <div className="mx-auto w-24 h-24 bg-accent-500/10 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                        <CheckCircle className="w-12 h-12 text-accent-500 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Request Logged</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-10">
                        Your onboarding dossier has been transmitted to the Admin Registry. You will receive a node activation notice via email.
                    </p>
                    <Link to="/" className="inline-flex items-center justify-center px-10 py-4 bg-primary-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-primary-700 transition shadow-xl shadow-primary-500/30">
                        <ArrowLeft size={18} className="mr-3" /> Back to AIET
                    </Link>
                </div>
            </div>
        );
    }

    const StepIndicator = () => (
        <div className="flex justify-center items-center gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 shadow-lg ${
                        step === i ? 'bg-primary-600 text-white scale-110 rotate-3' : 
                        step > i ? 'bg-accent-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                        {step > i ? <CheckCircle size={16} /> : i}
                    </div>
                    {i < 4 && <div className={`h-1 w-8 rounded-full transition-colors duration-500 ${step > i ? 'bg-accent-500' : 'bg-gray-100 dark:bg-gray-800'}`} />}
                </React.Fragment>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-20 px-4 transition-colors duration-500">
            <div className="max-w-4xl mx-auto">
                
                <div className="flex justify-between items-center mb-10">
                    <Link to="/" className="flex items-center gap-3 px-6 py-2.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-primary-600 transition-all shadow-xl group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Exit Onboarding
                    </Link>
                    <div className="flex items-center gap-2 px-5 py-2 bg-primary-600/10 rounded-full border border-primary-500/20 shadow-sm">
                        <Sparkles size={14} className="text-primary-600 animate-pulse" />
                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-primary-600">Secure Onboarding Portal</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 shadow-3xl rounded-[3.5rem] overflow-hidden border border-white/10 relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/5 blur-[80px] -mr-32 -mt-32"></div>
                    
                    <div className="p-12 pb-6 border-b dark:border-gray-800 text-center">
                        <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-4">
                            Registry <span className="text-primary-600">Application</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.3em] text-[0.65rem]">Node Onboarding Sequence {step}/4</p>
                    </div>

                    <div className="p-12 pt-10">
                        <StepIndicator />

                        <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
                            {/* Step 1: Personal Node */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <User className="text-primary-500" />
                                        <h3 className="text-lg font-black uppercase tracking-tight">Identity Node</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Full Legal Name</label>
                                            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="Enter name as per 10th cert" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Identity Email</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="you@example.com" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Direct Mobile</label>
                                            <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="10-digit mobile" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Date of Birth</label>
                                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Gender Node</label>
                                            <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner cursor-pointer">
                                                <option value="">Select</option>
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Academic Intent */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <BookOpen className="text-secondary-500" />
                                        <h3 className="text-lg font-black uppercase tracking-tight">Academic Protocol</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Course Node</label>
                                            <select name="course" required value={formData.course} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner cursor-pointer">
                                                <option value="">Select Course</option>
                                                {courses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Branch Hub</label>
                                            <select name="branch" value={formData.branch} onChange={handleChange} disabled={!formData.course} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner disabled:opacity-50 cursor-pointer">
                                                <option value="">Select Branch</option>
                                                {formData.course && branches[formData.course]?.map(b => <option key={b} value={b}>{b}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">10th Percentage</label>
                                            <input type="number" name="education10th.percentage" value={formData.education10th.percentage} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="00.00" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Last Qual. Institute</label>
                                            <input type="text" name="lastExam.instituteName" value={formData.lastExam.instituteName} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="College Name" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Location & Family */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <MapPin className="text-accent-500" />
                                        <h3 className="text-lg font-black uppercase tracking-tight">Spatial & Family Node</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">State Node</label>
                                            <select name="state" required value={formData.state} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner cursor-pointer">
                                                <option value="">Select State</option>
                                                {states.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">City Hub</label>
                                            <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" placeholder="Enter City" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Father/Guardian Name</label>
                                            <input type="text" name="parentName" value={formData.parentName} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" />
                                        </div>
                                        <div>
                                            <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Parent Phone Node</label>
                                            <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-sm shadow-inner" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Verification */}
                            {step === 4 && (
                                <div className="space-y-8">
                                    <div className="p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700">
                                        <h4 className="text-sm font-black uppercase tracking-widest text-primary-600 mb-4">Onboarding Summary</h4>
                                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                                            <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 font-bold">Node</span><span className="font-black text-gray-900 dark:text-white uppercase">{formData.name}</span></div>
                                            <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 font-bold">Protocol</span><span className="font-black text-gray-900 dark:text-white">{formData.course} - {formData.branch}</span></div>
                                            <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 font-bold">Spatial</span><span className="font-black text-gray-900 dark:text-white uppercase">{formData.city}, {formData.state}</span></div>
                                            <div className="flex justify-between border-b dark:border-gray-700 pb-2"><span className="text-gray-400 font-bold">Cycle</span><span className="font-black text-gray-900 dark:text-white">2025-2026</span></div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="block text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Registry Captcha</label>
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-2xl font-mono text-2xl font-black tracking-[0.4em] text-primary-600 select-none line-through decoration-gray-400">
                                                {captchaCode}
                                            </div>
                                            <button type="button" onClick={generateCaptcha} className="p-3 text-gray-400 hover:text-primary-600 transition-all"><RefreshCw size={24} /></button>
                                            <input type="text" name="captcha" required value={formData.captcha} onChange={handleChange} className="flex-grow p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 font-bold text-center text-lg" placeholder="0000" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-xs font-black text-red-500 text-center uppercase tracking-widest bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl animate-shake">{error}</p>}

                            <div className="flex gap-4 pt-6">
                                {step > 1 && (
                                    <button type="button" onClick={prevStep} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-[0.65rem] tracking-widest rounded-2xl active:scale-95 transition-all">
                                        <ChevronLeft size={18} className="inline mr-2" /> Previous
                                    </button>
                                )}
                                {step < 4 ? (
                                    <button type="button" onClick={nextStep} className="flex-[2] py-4 bg-primary-600 text-white font-black uppercase text-[0.65rem] tracking-[0.2em] rounded-2xl shadow-xl shadow-primary-500/20 active:scale-95 transition-all group">
                                        Continue Sequence <ChevronRight size={18} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={loading} className="flex-[2] py-5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl active:scale-95 transition-all disabled:opacity-50">
                                        {loading ? <RefreshCw className="animate-spin inline mr-2" /> : <Send className="inline mr-2" />} 
                                        {loading ? 'Initializing Node...' : 'Commit Registry Request'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}