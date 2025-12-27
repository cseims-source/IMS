import React, { useState, useRef, useEffect } from 'react';
import { 
    X, User, MapPin, GraduationCap, Phone, Heart, 
    FileText, Image as ImageIcon, CheckCircle2, 
    ChevronRight, Sparkles, Copy, Database,
    BookOpen, Landmark, UserPlus, Upload, Mail, ShieldAlert,
    Users, CreditCard, ClipboardCheck, Smartphone, AlertCircle,
    Bookmark, ShieldCheck, MessageSquare, PlusCircle, Trophy, Bus
} from 'lucide-react';

const COURSES = ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'Diploma'];
const BRANCHES = {
    'B.Tech': ['Computer Science', 'Civil Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Electronics & Comm.'],
    'M.Tech': ['Computer Science', 'Power Systems', 'Structural Engineering', 'VLSI Design'],
    'MBA': ['Marketing', 'Finance', 'HR', 'Operations'],
    'MCA': ['General'],
    'Diploma': ['Civil', 'Electrical', 'Mechanical']
};

const DOC_LIST = [
    '10th Class Certificate', '10th Class Mark sheet', 
    '12th/+2 or Equivalent Certificate', '12th/+2 or Equivalent Mark sheet',
    'Resident Certificate', 'C.L.C. / Conduct Certificate',
    'ITI Certificate', 'ITI Mark sheet', 'Diploma Certificate',
    'Diploma Mark sheet', 'Caste Certificate', 'Adhaar Card',
    'Graduation Certificate', 'Graduation Mark sheet',
    'Migration Certificate', 'Income Certificate'
];

const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Other'];
const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES = ['Odisha', 'West Bengal', 'Bihar', 'Jharkhand', 'Andhra Pradesh', 'Telangana', 'Other'];
const ENTRANCE_OPTIONS = ['OJEE', 'JEE', 'MAT', 'CAT', 'ATMA', 'Other'];
const ACCOMMODATION_OPTIONS = ['Hostel', 'Day Scholar', 'Local', 'Bus'];

const SectionHeader = ({ icon: Icon, num, title, subtitle }) => (
    <div className="flex items-center gap-4 mb-8 group mt-12 first:mt-0">
        <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-xl group-hover:scale-110 transition-all text-sm">
                {num}
            </div>
            <div className="w-0.5 h-full bg-primary-100 dark:bg-gray-800 mt-2 min-h-[1.5rem]"></div>
        </div>
        <div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Icon size={20} className="text-primary-500" /> {title}
            </h3>
            <p className="text-[0.6rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em]">{subtitle}</p>
        </div>
    </div>
);

const Input = ({ label, name, type = "text", value, onChange, placeholder, required, icon: Icon, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
            {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <div className="relative group">
            {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={15} />}
            <input 
                type={type} 
                name={name} 
                value={value} 
                onChange={onChange} 
                placeholder={placeholder}
                disabled={disabled}
                className={`w-full p-3.5 ${Icon ? 'pl-11' : 'pl-5'} bg-gray-50 dark:bg-gray-950 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 text-[0.75rem] font-bold text-gray-800 dark:text-white transition-all shadow-inner disabled:opacity-50`}
            />
        </div>
    </div>
);

const Select = ({ label, name, value, onChange, options, required, disabled }) => (
    <div className="space-y-1.5">
        <label className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">
            {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
        <div className="relative">
            <select 
                name={name} 
                value={value} 
                onChange={onChange}
                disabled={disabled}
                className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border-0 rounded-2xl focus:ring-4 focus:ring-primary-500/10 text-[0.75rem] font-bold text-gray-800 dark:text-white transition-all shadow-inner cursor-pointer appearance-none disabled:opacity-50"
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" size={14} />
        </div>
    </div>
);

export default function StudentAdmissionForm({ student, onSave, onCancel }) {
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        enquiryId: `ENQ-${new Date().getTime().toString().slice(-6)}`,
        status: 'Pending',
        firstName: '', lastName: '', gender: '', dob: '', registrationNumber: '', section: 'A', staffName: '', appearedInEntrance: '', entranceRollNo: '', aadharNumber: '', facebookId: '', photo: '',
        email: '', phone: '', whatsappNumber: '', isWhatsappSameAsPhone: false, emergencyContactName: '', emergencyContactPhone: '',
        academicYear: '2025-26', course: '', branch: '', batchYear: '2025', admissionDate: new Date().toISOString().split('T')[0], currentSemester: 1,
        education10th: { examName: 'HSC', board: '', schoolName: '', place: '', passingYear: '', totalMarks: '', marksSecured: '', percentage: '' },
        lastExam: { examType: '', boardUniversity: '', instituteName: '', passingYear: '', totalMarks: '', marksSecured: '', percentage: '' },
        family: { 
            father: { name: '', occupation: '', phone: '', whatsapp: '' },
            mother: { name: '', occupation: '', phone: '', whatsapp: '' },
            guardianPhone: ''
        },
        religion: '', category: '', bloodGroup: '', accommodationRequired: '',
        presentAddress: { address: '', city: '', postOffice: '', policeStation: '', via: '', block: '', district: '', state: 'Odisha', pincode: '' },
        permanentAddress: { address: '', city: '', postOffice: '', policeStation: '', via: '', block: '', district: '', state: 'Odisha', pincode: '' },
        isAddressSame: false,
        documents: { original: [], xerox: [] },
        paymentPattern: 'Annual',
        yearFees: { y1: 0, y2: 0, y3: 0, y4: 0, hostelBus: 0 }
    });

    useEffect(() => {
        if (student) {
            setFormData({
                ...student,
                dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '',
                admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : '',
                education10th: student.education10th || formData.education10th,
                lastExam: student.lastExam || formData.lastExam,
                family: student.family || formData.family,
                presentAddress: student.presentAddress || formData.presentAddress,
                permanentAddress: student.permanentAddress || formData.permanentAddress,
                documents: student.documents || { original: [], xerox: [] },
                yearFees: student.yearFees || formData.yearFees
            });
        }
    }, [student]);

    const handleDeepChange = (e, path) => {
        const { name, value } = e.target;
        const keys = path.split('.');
        setFormData(prev => {
            let next = JSON.parse(JSON.stringify(prev));
            let current = next;
            for (let i = 0; i < keys.length; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[name] = value;
            if (path === 'education10th' || path === 'lastExam') {
                const total = Number(current.totalMarks) || 0;
                const secured = Number(current.marksSecured) || 0;
                if (total > 0) current.percentage = ((secured / total) * 100).toFixed(2);
            }
            return next;
        });
    };

    const handleSimpleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => {
            const next = { ...prev, [name]: val };
            if (name === 'isWhatsappSameAsPhone' && val) next.whatsappNumber = next.phone;
            if (name === 'isAddressSame' && val) next.permanentAddress = { ...next.presentAddress };
            return next;
        });
    };

    const handleDocToggle = (doc, type) => {
        setFormData(prev => {
            const list = [...(prev.documents?.[type] || [])];
            const idx = list.indexOf(doc);
            if (idx > -1) list.splice(idx, 1);
            else list.push(doc);
            return { ...prev, documents: { ...prev.documents, [type]: list } };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, stream: `${formData.course} ${formData.branch}`.trim() });
    };

    return (
        <div className="fixed inset-0 bg-gray-950/95 backdrop-blur-xl flex justify-center items-center z-[300] p-4 overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl w-full max-w-6xl h-[95vh] flex flex-col border border-white/10 animate-scale-in relative">
                
                {/* Header Sequence */}
                <div className="p-8 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 z-10 shadow-sm">
                    <div className="flex items-center gap-6">
                        <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-xl shadow-primary-500/30">
                            <UserPlus size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                                Student <span className="text-primary-600">Onboarding</span>
                            </h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-2">Institutional Registry Hub • Logic V4.5</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-2xl transition-all active:scale-90">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-12 scrollbar-hide space-y-16 pb-32">
                    
                    {/* 1. Personal Information */}
                    <section className="bg-gray-50/50 dark:bg-gray-950/30 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-inner">
                        <SectionHeader icon={User} num="01" title="Personal Information" subtitle="Primary Identity Verification" />
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                            <div className="md:col-span-3 flex flex-col items-center gap-6">
                                <div className="w-44 h-44 rounded-[2.5rem] bg-white dark:bg-gray-950 border-4 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden group relative shadow-inner">
                                    {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" /> : <ImageIcon size={48} className="text-gray-200" />}
                                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-primary-600/90 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center text-white">
                                        <Upload size={24} />
                                    </button>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                                    const reader = new FileReader();
                                    reader.onload = () => setFormData(p => ({ ...p, photo: reader.result }));
                                    reader.readAsDataURL(e.target.files[0]);
                                }} />
                                <div className="text-center bg-white dark:bg-gray-900 px-6 py-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                    <p className="text-[0.5rem] font-bold text-gray-400 uppercase tracking-widest">Enquiry Node</p>
                                    <p className="text-[0.75rem] font-mono font-black text-primary-600 mt-1">{formData.enquiryId}</p>
                                </div>
                            </div>
                            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Input label="Full Name" name="firstName" value={formData.firstName} onChange={handleSimpleChange} required />
                                <Select label="Registry Status" name="status" value={formData.status} onChange={handleSimpleChange} required options={['Pending', 'Approved', 'Rejected']} />
                                <Select label="Gender Marker" name="gender" value={formData.gender} onChange={handleSimpleChange} required options={['Male', 'Female', 'Other']} />
                                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleSimpleChange} required />
                                <Input label="Institutional Roll" name="registrationNumber" value={formData.registrationNumber} onChange={handleSimpleChange} />
                                <Select label="Assigned Section" name="section" value={formData.section} onChange={handleSimpleChange} options={['A', 'B', 'C', 'D']} />
                            </div>
                        </div>
                    </section>

                    {/* 2. Contact Information */}
                    <section className="p-10 rounded-[3rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={Smartphone} num="02" title="Contact Information" subtitle="Registry Communications" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Input label="Primary Mobile" name="phone" value={formData.phone} onChange={handleSimpleChange} required icon={Phone} />
                            <Input label="WhatsApp Node" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleSimpleChange} icon={MessageSquare} />
                            <Input label="Registry Email" name="email" type="email" value={formData.email} onChange={handleSimpleChange} required icon={Mail} />
                            <Input label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleSimpleChange} />
                            <Input label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleSimpleChange} icon={AlertCircle} />
                        </div>
                    </section>

                    {/* 3. Academic Information */}
                    <section className="p-10 rounded-[3rem] bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                        <SectionHeader icon={GraduationCap} num="03" title="Academic Information" subtitle="Course Stream Logic" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <Select label="Academic Year" name="academicYear" value={formData.academicYear} onChange={handleSimpleChange} required options={['2024-25', '2025-26', '2026-27']} />
                            <Select label="Course Node" name="course" value={formData.course} onChange={handleSimpleChange} required options={COURSES} />
                            <Select label="Branch Node" name="branch" value={formData.branch} onChange={handleSimpleChange} required options={formData.course ? BRANCHES[formData.course] : []} />
                            <Select label="Batch Cycle" name="batchYear" value={formData.batchYear} onChange={handleSimpleChange} options={['2023', '2024', '2025', '2026']} />
                            <Input label="Admission Date" name="admissionDate" type="date" value={formData.admissionDate} onChange={handleSimpleChange} />
                        </div>
                    </section>

                    {/* 4. Entrance & Identification (NEW) */}
                    <section className="p-10 rounded-[3rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={Trophy} num="04" title="Entrance & Identification" subtitle="Competitive Logic Trace" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Select label="Entrance Exam" name="appearedInEntrance" value={formData.appearedInEntrance} onChange={handleSimpleChange} options={ENTRANCE_OPTIONS} />
                            <Input label="Entrance Roll No" name="entranceRollNo" value={formData.entranceRollNo} onChange={handleSimpleChange} placeholder="Enter Roll" />
                            <Input label="Aadhar UID" name="aadharNumber" value={formData.aadharNumber} onChange={handleSimpleChange} icon={ShieldAlert} placeholder="12-digit number" />
                            <Input label="Social Hub (FB)" name="facebookId" value={formData.facebookId} onChange={handleSimpleChange} placeholder="@username" />
                        </div>
                    </section>

                    {/* 5. Institutional Services (NEW) */}
                    <section className="p-10 rounded-[3rem] bg-accent-50/30 dark:bg-accent-900/10 border border-accent-100 dark:border-accent-900/30">
                        <SectionHeader icon={Bus} num="05" title="Campus Services" subtitle="Logistics Preference" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Select label="Accommodation Logic" name="accommodationRequired" value={formData.accommodationRequired} onChange={handleSimpleChange} options={ACCOMMODATION_OPTIONS} />
                            <Input label="Staff Referral Name" name="staffName" value={formData.staffName} onChange={handleSimpleChange} placeholder="Assigned Staff" />
                        </div>
                    </section>

                    {/* 6. Previous Education */}
                    <section className="p-10 rounded-[3rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={BookOpen} num="06" title="Educational Trace" subtitle="History Audit" />
                        <div className="space-y-12">
                            <div>
                                <h4 className="text-[0.65rem] font-black text-primary-500 uppercase tracking-[0.3em] mb-6">10th Details Profile</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Input label="Board Protocol" name="board" value={formData.education10th.board} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                    <Input label="School Name" name="schoolName" value={formData.education10th.schoolName} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                    <Input label="Place Hub" name="place" value={formData.education10th.place} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                    <Input label="Passing Cycle" name="passingYear" value={formData.education10th.passingYear} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                    <Input label="Total Capacity" name="totalMarks" type="number" value={formData.education10th.totalMarks} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                    <Input label="Marks Secured" name="marksSecured" type="number" value={formData.education10th.marksSecured} onChange={(e) => handleDeepChange(e, 'education10th')} />
                                </div>
                            </div>
                            <div className="pt-10 border-t dark:border-gray-800">
                                <h4 className="text-[0.65rem] font-black text-secondary-500 uppercase tracking-[0.3em] mb-6">Last Exam Protocol</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Input label="Module Type" name="examType" value={formData.lastExam.examType} onChange={(e) => handleDeepChange(e, 'lastExam')} />
                                    <Input label="Board / University" name="boardUniversity" value={formData.lastExam.boardUniversity} onChange={(e) => handleDeepChange(e, 'lastExam')} />
                                    <Input label="Institute Node" name="instituteName" value={formData.lastExam.instituteName} onChange={(e) => handleDeepChange(e, 'lastExam')} />
                                    <Input label="Final Marks" name="marksSecured" type="number" value={formData.lastExam.marksSecured} onChange={(e) => handleDeepChange(e, 'lastExam')} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 7. Family Information */}
                    <section className="p-10 rounded-[3rem] bg-gray-50/50 dark:bg-gray-950/30 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={Users} num="07" title="Family Information" subtitle="Genealogical Data" />
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <h5 className="text-[0.6rem] font-black uppercase text-primary-600 tracking-widest px-1">Father's Node</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Input label="Name" name="name" value={formData.family.father.name} onChange={(e) => handleDeepChange(e, 'family.father')} />
                                        <Input label="Occupation" name="occupation" value={formData.family.father.occupation} onChange={(e) => handleDeepChange(e, 'family.father')} />
                                        <Input label="Phone" name="phone" value={formData.family.father.phone} onChange={(e) => handleDeepChange(e, 'family.father')} />
                                        <Input label="WhatsApp" name="whatsapp" value={formData.family.father.whatsapp} onChange={(e) => handleDeepChange(e, 'family.father')} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h5 className="text-[0.6rem] font-black uppercase text-secondary-600 tracking-widest px-1">Mother's Node</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <Input label="Name" name="name" value={formData.family.mother.name} onChange={(e) => handleDeepChange(e, 'family.mother')} />
                                        <Input label="Occupation" name="occupation" value={formData.family.mother.occupation} onChange={(e) => handleDeepChange(e, 'family.mother')} />
                                        <Input label="Phone" name="phone" value={formData.family.mother.phone} onChange={(e) => handleDeepChange(e, 'family.mother')} />
                                        <Input label="WhatsApp" name="whatsapp" value={formData.family.mother.whatsapp} onChange={(e) => handleDeepChange(e, 'family.mother')} />
                                    </div>
                                </div>
                            </div>
                            <Input label="Guardian Phone SOS" name="guardianPhone" value={formData.family.guardianPhone} onChange={(e) => handleDeepChange(e, 'family')} />
                        </div>
                    </section>

                    {/* 8. Additional Information */}
                    <section className="p-10 rounded-[3rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <SectionHeader icon={Sparkles} num="08" title="Additional Information" subtitle="Modifiers" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <Select label="Religion Node" name="religion" value={formData.religion} onChange={handleSimpleChange} options={RELIGIONS} />
                            <Select label="Category Status" name="category" value={formData.category} onChange={handleSimpleChange} options={CATEGORIES} />
                            <Select label="Blood Group Node" name="bloodGroup" value={formData.bloodGroup} onChange={handleSimpleChange} options={BLOOD_GROUPS} />
                        </div>
                    </section>

                    {/* 9. Address Information */}
                    <section className="p-10 rounded-[3rem] bg-gray-50/50 dark:bg-gray-950/30 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={MapPin} num="09" title="Address Information" subtitle="Coordinates" />
                        <div className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-6">
                                    <h5 className="text-[0.6rem] font-black uppercase text-primary-600 tracking-widest px-1">Present Spatial Node</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="sm:col-span-2"><Input label="Full Address" name="address" value={formData.presentAddress.address} onChange={(e) => handleDeepChange(e, 'presentAddress')} /></div>
                                        <Input label="City Hub" name="city" value={formData.presentAddress.city} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Input label="Post Office" name="postOffice" value={formData.presentAddress.postOffice} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Input label="Police Station" name="policeStation" value={formData.presentAddress.policeStation} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Input label="Logic Via" name="via" value={formData.presentAddress.via} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Input label="Block Node" name="block" value={formData.presentAddress.block} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Input label="District Node" name="district" value={formData.presentAddress.district} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                        <Select label="State Node" name="state" value={formData.presentAddress.state} onChange={(e) => handleDeepChange(e, 'presentAddress')} options={STATES} />
                                        <Input label="Pincode Node" name="pincode" value={formData.presentAddress.pincode} onChange={(e) => handleDeepChange(e, 'presentAddress')} />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <h5 className="text-[0.6rem] font-black uppercase text-secondary-600 tracking-widest">Permanent Core Node</h5>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" name="isAddressSame" checked={formData.isAddressSame} onChange={handleSimpleChange} className="w-3.5 h-3.5 rounded border-gray-300 text-secondary-600" />
                                            <span className="text-[0.5rem] font-bold text-gray-400 uppercase tracking-widest">Sync</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 opacity-80">
                                        <div className="sm:col-span-2"><Input label="Full Address" name="address" value={formData.permanentAddress.address} onChange={(e) => handleDeepChange(e, 'permanentAddress')} disabled={formData.isAddressSame} /></div>
                                        <Input label="City Hub" name="city" value={formData.permanentAddress.city} onChange={(e) => handleDeepChange(e, 'permanentAddress')} disabled={formData.isAddressSame} />
                                        <Input label="Post Office" name="postOffice" value={formData.permanentAddress.postOffice} onChange={(e) => handleDeepChange(e, 'permanentAddress')} disabled={formData.isAddressSame} />
                                        <Input label="District Node" name="district" value={formData.permanentAddress.district} onChange={(e) => handleDeepChange(e, 'permanentAddress')} disabled={formData.isAddressSame} />
                                        <Select label="State Node" name="state" value={formData.permanentAddress.state} onChange={(e) => handleDeepChange(e, 'permanentAddress')} options={STATES} disabled={formData.isAddressSame} />
                                        <Input label="Pincode Node" name="pincode" value={formData.permanentAddress.pincode} onChange={(e) => handleDeepChange(e, 'permanentAddress')} disabled={formData.isAddressSame} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 10. Document Tracking */}
                    <section className="p-10 rounded-[3rem] bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800">
                        <SectionHeader icon={ClipboardCheck} num="10" title="Document Tracking" subtitle="Asset Audit" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            {[
                                { title: 'Original Nodes Received', type: 'original', color: 'text-primary-600' },
                                { title: 'Xerox Nodes Received', type: 'xerox', color: 'text-secondary-600' }
                            ].map(sect => (
                                <div key={sect.type} className="space-y-6 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                                    <h5 className={`text-[0.65rem] font-black uppercase tracking-[0.2em] ${sect.color}`}>{sect.title}</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {DOC_LIST.map(doc => (
                                            <label key={doc} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer group">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(formData.documents[sect.type] || []).includes(doc)}
                                                    onChange={() => handleDocToggle(doc, sect.type)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 mt-0.5"
                                                />
                                                <span className="text-[0.65rem] font-bold text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{doc}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 11. Fee Information */}
                    <section className="p-10 rounded-[3.5rem] bg-gradient-to-br from-gray-900 to-primary-900 text-white shadow-2xl relative overflow-hidden">
                        <SectionHeader icon={CreditCard} num="11" title="Financial Matrix" subtitle="Institutional Ledger" />
                        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="sm:col-span-2 lg:col-span-1">
                                <Select label="Payment Pattern" name="paymentPattern" value={formData.paymentPattern} onChange={handleSimpleChange} options={['Annual', 'Semester', 'Monthly']} />
                            </div>
                            <Input label="1st Year Node" name="y1" type="number" value={formData.yearFees.y1} onChange={(e) => handleDeepChange(e, 'yearFees')} />
                            <Input label="2nd Year Node" name="y2" type="number" value={formData.yearFees.y2} onChange={(e) => handleDeepChange(e, 'yearFees')} />
                            <Input label="3rd Year Node" name="y3" type="number" value={formData.yearFees.y3} onChange={(e) => handleDeepChange(e, 'yearFees')} />
                            <Input label="4th Year Node" name="y4" type="number" value={formData.yearFees.y4} onChange={(e) => handleDeepChange(e, 'yearFees')} />
                            <div className="sm:col-span-2 lg:col-span-5"><Input label="Hostel / Bus Cycle Fee" name="hostelBus" type="number" value={formData.yearFees.hostelBus} onChange={(e) => handleDeepChange(e, 'yearFees')} icon={Landmark} /></div>
                        </div>
                    </section>

                </form>

                <div className="p-8 border-t dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl flex justify-end gap-6 z-10 shadow-2xl">
                    <button type="button" onClick={onCancel} className="px-10 py-4 text-gray-500 dark:text-gray-400 text-[0.7rem] font-black uppercase tracking-widest hover:text-red-500 transition-all">Cancel</button>
                    <button onClick={handleSubmit} className="px-12 py-4 bg-primary-600 text-white text-[0.7rem] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-primary-700 transition-all shadow-xl active:scale-95 group flex items-center gap-3">
                        {student ? 'Commit Update' : 'Initialize Registry'} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}