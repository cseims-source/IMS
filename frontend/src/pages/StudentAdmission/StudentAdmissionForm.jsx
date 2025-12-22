import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const initialFormData = {
  firstName: '', lastName: '', email: '', phone: '', dob: '',
  gender: 'Male', address: '', stream: '', currentSemester: 1, photo: null
};

const inputClasses = "w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 text-gray-900 dark:text-gray-200 transition-colors";
const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const StudentForm = ({ student, onSave, onCancel }) => {
    const [formData, setFormData] = useState(student ? 
        { ...student, dob: student.dob ? new Date(student.dob).toISOString().split('T')[0] : '' } 
        : initialFormData
    );
    const [errors, setErrors] = useState({});
    const [isFormValid, setIsFormValid] = useState(false);
    const fileInputRef = useRef(null);
    const [photoPreview, setPhotoPreview] = useState(student?.photo || null);
    const [streams, setStreams] = useState([]);
    const { api } = useAuth();

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const data = await api('/api/streams');
                setStreams(data);
            } catch (error) {
                console.error("Failed to fetch streams", error);
            }
        };
        fetchStreams();
    }, [api]);

    const validate = (data) => {
        const newErrors = {};
        if (!data.firstName.trim()) newErrors.firstName = 'First name is required.';
        if (!data.lastName.trim()) newErrors.lastName = 'Last name is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            newErrors.email = 'Please enter a valid email address.';
        }
        if (data.phone && !/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/.test(data.phone)) {
            newErrors.phone = 'Please enter a valid phone number.';
        }
        if (!data.dob) {
            newErrors.dob = 'Date of birth is required.';
        } else if (new Date(data.dob) > new Date()) {
            newErrors.dob = 'Date of birth cannot be in the future.';
        }
        if (!data.stream) newErrors.stream = 'Stream is required.';
        return newErrors;
    };

    useEffect(() => {
        const validationErrors = validate(formData);
        setErrors(validationErrors);
        setIsFormValid(Object.keys(validationErrors).length === 0);
    }, [formData]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFormValid) {
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b dark:border-gray-700 pb-4">
                    {student ? 'Edit Student Details' : 'New Student Admission'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                             <label className={labelClasses}>Profile Photo</label>
                             <div className="mt-2 flex items-center gap-4">
                                 <img 
                                     src={photoPreview || `https://api.dicebear.com/8.x/initials/svg?seed=${formData.firstName || 'A'}`} 
                                     alt="Profile preview" 
                                     className="w-20 h-20 rounded-full object-cover bg-gray-200 dark:bg-gray-700"
                                 />
                                 <input 
                                     type="file" 
                                     ref={fileInputRef} 
                                     onChange={handleFileChange} 
                                     accept="image/*" 
                                     className="hidden" 
                                 />
                                 <button 
                                     type="button" 
                                     onClick={() => fileInputRef.current?.click()} 
                                     className="py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                                 >
                                     Change
                                 </button>
                                 {photoPreview && (
                                     <button 
                                         type="button" 
                                         onClick={handleRemovePhoto}
                                         className="py-2 px-3 border border-transparent rounded-md text-sm font-medium text-red-700 hover:bg-red-50 dark:hover:bg-red-900/40"
                                     >
                                         Remove
                                     </button>
                                 )}
                             </div>
                        </div>
                        <div>
                            <label htmlFor="firstName" className={labelClasses}>First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} className={`${inputClasses} ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`} placeholder="John" required />
                            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className={labelClasses}>Last Name</label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} className={`${inputClasses} ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`} placeholder="Doe" required />
                            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className={labelClasses}>Email Address</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClasses} ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`} placeholder="john.doe@example.com" required />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className={labelClasses}>Phone Number</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={`${inputClasses} ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`} placeholder="+1 234 567 890" />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label htmlFor="dob" className={labelClasses}>Date of Birth</label>
                            <input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} className={`${inputClasses} ${errors.dob ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`} required />
                            {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
                        </div>
                        <div>
                            <label htmlFor="gender" className={labelClasses}>Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={`${inputClasses} focus:ring-primary-500`}>
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="stream" className={labelClasses}>Stream</label>
                            <select id="stream" name="stream" value={formData.stream} onChange={handleChange} className={`${inputClasses} ${errors.stream ? 'border-red-500 focus:ring-red-500' : 'focus:ring-primary-500'}`}>
                                <option value="">-- Select a Stream --</option>
                                {streams.map(s => <option key={s._id} value={s.name}>{s.name} ({s.level})</option>)}
                            </select>
                            {errors.stream && <p className="text-red-500 text-xs mt-1">{errors.stream}</p>}
                        </div>
                        <div>
                            <label htmlFor="currentSemester" className={labelClasses}>Current Semester</label>
                            <input type="number" id="currentSemester" name="currentSemester" value={formData.currentSemester} onChange={handleChange} min="1" max="10" className={`${inputClasses} focus:ring-primary-500`} disabled={!formData.stream} />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="address" className={labelClasses}>Address</label>
                             <textarea id="address" name="address" value={formData.address} onChange={handleChange} className={`${inputClasses} focus:ring-primary-500`} rows="3" placeholder="123 Main St, Anytown, USA"></textarea>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end gap-4">
                        <button type="button" onClick={onCancel} className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none">
                            Cancel
                        </button>
                        <button type="submit" disabled={!isFormValid} className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Save Details
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentForm;