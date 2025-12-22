import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const FacultyForm = ({ faculty, onSave, onCancel }) => {
    const [formData, setFormData] = useState(faculty || { name: '', subject: '', email: '', phone: '', qualification: '', photo: null, assignedStreams: [], assignedSubjects: [] });
    const [allStreams, setAllStreams] = useState([]);
    const { api } = useAuth();
    const [errors, setErrors] = useState({});
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(faculty?.photo || null);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const streamsData = await api('/api/streams');
                setAllStreams(streamsData);
            } catch (error) {
                console.error("Failed to fetch stream data", error);
            }
        };
        fetchStreams();
    }, [api]);
    
    // Calculate available subjects based on selected streams
    const availableSubjects = useMemo(() => {
        if (!formData.assignedStreams || formData.assignedStreams.length === 0 || allStreams.length === 0) {
            return []; 
        }
        const subjects = new Set();
        allStreams.forEach(stream => {
            if (formData.assignedStreams.includes(stream.name)) {
                stream.semesters.forEach(semester => {
                    semester.subjects.forEach(subject => {
                        subjects.add(subject.name);
                    });
                });
            }
        });
        return Array.from(subjects).sort();
    }, [allStreams, formData.assignedStreams]);


    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required.';
        if (!formData.subject.trim()) newErrors.subject = 'Primary subject is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (formData.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setFormData(prev => ({ ...prev, photo: null }));
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- Stream Handling ---
    const handleAddStream = (e) => {
        const newStream = e.target.value;
        if (newStream && !(formData.assignedStreams || []).includes(newStream)) {
            setFormData(prev => ({ 
                ...prev, 
                assignedStreams: [...(prev.assignedStreams || []), newStream] 
            }));
        }
        e.target.value = ""; 
    };

    const removeStream = (streamToRemove) => {
        setFormData(prev => {
            const newStreams = (prev.assignedStreams || []).filter(s => s !== streamToRemove);
            
            // Re-validate subjects: remove subjects that are no longer available in the remaining streams
            const validSubjects = new Set();
            allStreams.forEach(stream => {
                if (newStreams.includes(stream.name)) {
                    stream.semesters.forEach(semester => {
                        semester.subjects.forEach(subject => {
                            validSubjects.add(subject.name);
                        });
                    });
                }
            });
            
            const newAssignedSubjects = (prev.assignedSubjects || []).filter(assignedSub => 
                validSubjects.has(assignedSub)
            );
    
            return {
                ...prev,
                assignedStreams: newStreams,
                assignedSubjects: newAssignedSubjects,
            };
        });
    };

    // --- Subject Handling ---
    const handleAddSubject = (e) => {
        const newSubject = e.target.value;
        if (newSubject && !(formData.assignedSubjects || []).includes(newSubject)) {
            setFormData(prev => ({ 
                ...prev, 
                assignedSubjects: [...(prev.assignedSubjects || []), newSubject] 
            }));
        }
        e.target.value = "";
    };
    
    const removeSubject = (subjectToRemove) => {
        setFormData(prev => ({
            ...prev,
            assignedSubjects: (prev.assignedSubjects || []).filter(s => s !== subjectToRemove)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{faculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                             <label className={labelClasses}>Profile Photo</label>
                             <div className="mt-2 flex flex-col items-center gap-4">
                                 <img 
                                     src={photoPreview || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.name || 'A'}`} 
                                     alt="Profile preview" 
                                     className="w-24 h-24 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                                 />
                                 <input 
                                     type="file" 
                                     ref={fileInputRef} 
                                     onChange={handleFileChange} 
                                     accept="image/*" 
                                     className="hidden" 
                                 />
                                 <div className="flex gap-2">
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Change
                                    </button>
                                    {photoPreview && (
                                        <button 
                                            type="button" 
                                            onClick={handleRemovePhoto}
                                            className="py-1 px-3 border border-transparent rounded-md text-xs font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40"
                                        >
                                            Remove
                                        </button>
                                    )}
                                 </div>
                             </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                             <div>
                                <label className={labelClasses}>Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Primary Subject Expertise</label>
                                <input name="subject" value={formData.subject} onChange={handleChange} placeholder="e.g. Mathematics" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" required />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Email Address</label>
                                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelClasses}>Phone Number</label>
                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 890" className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className={labelClasses}>Qualifications</label>
                        <textarea name="qualification" value={formData.qualification} onChange={handleChange} placeholder="PhD in Computer Science..." className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700" rows="3"/>
                    </div>
                    
                    {/* Assigned Streams Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Streams</label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-700 items-start min-h-[50px] mb-2">
                            {(formData.assignedStreams || []).length > 0 ? (
                                formData.assignedStreams.map(c => (
                                    <span key={c} className="flex items-center gap-1.5 px-3 py-1 bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-200 text-sm rounded-full">
                                        {c}
                                        <button type="button" onClick={() => removeStream(c)} className="text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-100">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm italic py-1">No streams assigned.</span>
                            )}
                        </div>
                        <select 
                            onChange={handleAddStream} 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="">+ Add Stream...</option>
                            {allStreams
                                .filter(s => !(formData.assignedStreams || []).includes(s.name))
                                .map(s => <option key={s._id} value={s.name}>{s.name}</option>)
                            }
                        </select>
                        {errors.assignedStreams && <p className="text-red-500 text-xs mt-1">{errors.assignedStreams}</p>}
                    </div>

                    {/* Assigned Subjects Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Subjects</label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 dark:bg-gray-700 items-start min-h-[50px] mb-2">
                            {(formData.assignedSubjects || []).length > 0 ? (
                                formData.assignedSubjects.map(s => (
                                    <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 text-sm rounded-full">
                                        {s}
                                        <button type="button" onClick={() => removeSubject(s)} className="text-green-600 dark:text-green-300 hover:text-green-800 dark:hover:text-green-100">
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-400 text-sm italic py-1">No subjects assigned.</span>
                            )}
                        </div>
                        <select 
                            onChange={handleAddSubject} 
                            className="w-full p-2 border rounded bg-white dark:bg-gray-600 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            disabled={!formData.assignedStreams || formData.assignedStreams.length === 0}
                        >
                            <option value="">
                                {(!formData.assignedStreams || formData.assignedStreams.length === 0) 
                                    ? "Select a stream first to see subjects..." 
                                    : "+ Add Subject..."
                                }
                            </option>
                            {availableSubjects
                                .filter(s => !(formData.assignedSubjects || []).includes(s))
                                .map(s => <option key={s} value={s}>{s}</option>)
                            }
                        </select>
                        <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Subjects are filtered based on the assigned streams above.</p>
                        {errors.assignedSubjects && <p className="text-red-500 text-xs mt-1">{errors.assignedSubjects}</p>}
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-4 border-t dark:border-gray-700">
                        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-medium">Save Details</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FacultyForm;