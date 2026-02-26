import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';
import { normalizePhotoUrl } from '../../utils/photoUtils';

// AIET Expert Logic Mapping Sequence
const HEADER_MAP = {
    "USERNAME": "username",
    "STAFF TYPE": "staffType",
    "STAFF CATEGORY": "staffType",
    "TYPE": "staffType",
    "NAME": "name",
    "FACULTY NAME": "name",
    "NAME OF THE STAFF": "name",
    "EMAIL": "email",
    "OFFICIAL EMAIL": "email",
    "E-MAIL ID": "email",
    "PHONE": "phone",
    "MOBILE": "phone",
    "CONTACT": "phone",
    "CONTACT NO": "phone",
    "CONTACT NO ": "phone",
    "WHATSAAP NO": "whatsappNo",
    "WHATSAPP NO": "whatsappNo",
    "WHATSAPP NUMBER": "whatsappNo",
    "DEPARTMENT": "department",
    "DEPT": "department",
    "DEPT HUB": "department",
    "DESIGNATION": "designation",
    "TITLE": "designation",
    "POSITION": "designation",
    "FATHER'S NAME": "fatherName",
    "MOTHER'S NAME": "motherName",
    "AADHAR CARD NO": "aadharNo",
    "PAN CARD NO": "panNo",
    "CASTE": "caste",
    "BLOOD GROUP": "bloodGroup",
    "BLOOD GROUP ": "bloodGroup",
    "RELIGION": "religion",
    "SUBJECT": "subject",
    "EXPERTISE": "subject",
    "QUALIFICATION": "qualification",
    "CREDENTIALS": "qualification",
    "HIGHEST QUALIFICATION WITH PASS OUT YEAR": "highestQualification",
    "TEACHER ID (BPUT)": "teacherId",
    "PASS PORT SIZE PHOTO": "photo",
    "EXPERIENCE": "experienceYears",
    "EXP": "experienceYears",
    "JOINING DATE": "joiningDate",
    "DATE  OF JOINING (D.O.J.)": "joiningDate",
    "DATE OF JOINING (D.O.J.)": "joiningDate",
    "DATE OF BIRTH (D.O.B.)": "dateOfBirth",
    "DATE OF LEAVE": "dateOfLeave",
    "SL.NO": "serialNo",
    "SL. NO": "serialNo",
    "SL NO": "serialNo",
    "PERMANENT ADDRESS (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/STATE)": "address.permanent",
    "PRESENT ADDRESS (AT/ POST/ POLICE STATION/ VIA/ DIST/ PIN/ STATE)": "address.current"
};

const FacultyImportModal = ({ onClose, onImportSuccess }) => {
    const { api } = useAuth();
    const [file, setFile] = useState(null);
    const [mappedData, setMappedData] = useState(null);
    const [status, setStatus] = useState('idle');
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const toIsoDateString = (value) => {
        if (!value) return '';
        if (value instanceof Date && !isNaN(value.getTime())) return value.toISOString();

        if (typeof value === 'number') {
            const dateCode = XLSX.SSF.parse_date_code(value);
            if (dateCode) {
                const { y, m, d } = dateCode;
                const date = new Date(y, m - 1, d);
                return isNaN(date.getTime()) ? '' : date.toISOString();
            }
        }

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (!trimmed) return '';
            const date = new Date(trimmed);
            return isNaN(date.getTime()) ? '' : date.toISOString();
        }

        return '';
    };

    const processFacultyLattice = (rawJson) => {
        let currentStaffType = 'Teaching';

        return rawJson.map(row => {
            const rawValues = Object.values(row)
                .filter(v => typeof v === 'string')
                .map(v => v.trim().toUpperCase());

            if (rawValues.some(v => v === 'NON - TEACHING STAFF' || v === 'NON-TEACHING STAFF' || v === 'NON TEACHING STAFF')) {
                currentStaffType = 'Non-Teaching';
                return null;
            }

            if (rawValues.some(v => v === 'TEACHING STAFF')) {
                currentStaffType = 'Teaching';
                return null;
            }

            const faculty = {
                status: 'Active',
                staffType: currentStaffType,
                assignedStreams: [],
                assignedSubjects: [],
                address: { current: '', permanent: '' }
            };

            Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = key.trim().toUpperCase();
                const targetField = HEADER_MAP[normalizedKey];

                if (targetField) {
                    if (targetField === 'experienceYears') {
                        faculty[targetField] = Number(value) || 0;
                    } else if (targetField === 'email') {
                        faculty[targetField] = String(value).toLowerCase().trim();
                    } else if (targetField === 'joiningDate' || targetField === 'dateOfBirth' || targetField === 'dateOfLeave') {
                        faculty[targetField] = toIsoDateString(value);
                    } else if (targetField === 'staffType') {
                        const normalized = String(value).trim().toLowerCase();
                        faculty.staffType = normalized.includes('non') ? 'Non-Teaching' : 'Teaching';
                    } else if (targetField === 'photo') {
                        faculty.photo = normalizePhotoUrl(String(value).trim());
                    } else if (targetField.startsWith('address.')) {
                        const addressKey = targetField.split('.')[1];
                        faculty.address[addressKey] = String(value).trim();
                    } else {
                        faculty[targetField] = String(value).trim();
                    }
                }
            });

            if (faculty.dateOfLeave) {
                faculty.status = 'Discontinued';
            }

            return faculty;
        }).filter(Boolean);
    };

    const parseFile = useCallback(async () => {
        if (!file) return;
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, dateNF: 'yyyy-mm-dd' });
            const allRows = workbook.SheetNames.flatMap((sheetName) => {
                const worksheet = workbook.Sheets[sheetName];
                return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
            });

            if (allRows.length === 0) return setError('Buffer empty. No node data found.');

            const translated = processFacultyLattice(allRows);
            
            const validRows = translated.filter(row => row.name && row.email);
            if (validRows.length === 0) {
                return setError('No valid rows found with both "Name" and "Email" across all sheets.');
            }

            setMappedData(validRows);
            setStatus('preview');
        } catch (err) {
            console.error('Excel parse error:', err);
            setError(`Neural Decryption Failed. ${err?.message || 'Check file integrity.'}`);
        }
    }, [file]);

    const handleImport = async () => {
        setStatus('importing');
        try {
            const result = await api('/api/faculty/import', {
                method: 'POST',
                body: JSON.stringify({ facultyMembers: mappedData }),
            });
            setImportResult(result);
            setStatus('complete');
        } catch (err) {
            setError(err.message);
            setStatus('preview');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl flex justify-center items-center z-[500] p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-3xl w-full max-w-4xl border border-white/10 animate-scale-in overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] -mr-32 -mt-32"></div>
                 
                 <div className="flex justify-between items-center mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-2xl">
                            <Cpu size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Expert <span className="text-indigo-600">Injection</span></h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3">Lattice Protocol v2.1 // Bulk Sync</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400"><X size={28} /></button>
                </div>

                <div className="space-y-10 relative z-10">
                    {status === 'idle' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-8 bg-indigo-50 dark:bg-indigo-900/10 rounded-[3rem] border border-indigo-100 dark:border-indigo-800/50">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-4">Neural Mapping Policy</h4>
                                    <ul className="text-[0.65rem] text-indigo-600 dark:text-indigo-400 space-y-3 font-bold uppercase tracking-wider">
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> XLS, XLSX, and CSV protocols supported.</li>
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> Departments & Designations: Auto-mapped.</li>
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> Emails: Unique identity key required.</li>
                                    </ul>
                                </div>
                                <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group overflow-hidden bg-gray-50/50 dark:bg-gray-950/30">
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadCloud className={`w-16 h-16 mb-4 ${file ? 'text-indigo-500 animate-bounce' : 'text-gray-200 group-hover:text-indigo-400'}`} />
                                        <p className="text-[0.65rem] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{file ? file.name : 'Inject Expert Logic Sheet'}</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                                </label>
                            </div>
                            {error && <p className="text-red-500 text-[0.65rem] font-black text-center uppercase tracking-widest bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl animate-shake">{error}</p>}
                            <button onClick={parseFile} disabled={!file} className="w-full py-5 bg-primary-600 text-white font-black uppercase text-xs tracking-[0.4em] rounded-3xl shadow-2xl shadow-primary-500/30 active:scale-95">
                                Initialize Translation Protocol
                            </button>
                        </>
                    )}

                    {status === 'preview' && (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 ml-2">Sequence Preview // {mappedData?.length} Expert Nodes Decrypted</h3>
                                <div className="overflow-x-auto rounded-[2.5rem] border dark:border-gray-800 max-h-72 shadow-inner bg-gray-50 dark:bg-gray-950">
                                    <table className="w-full text-[0.6rem] text-left">
                                        <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 font-black uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="p-5 pl-8">Name of the Staff</th>
                                                <th className="p-5">Department</th>
                                                <th className="p-5">Designation</th>
                                                <th className="p-5">Contact No</th>
                                                <th className="p-5 pr-8">E-mail ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-800">
                                            {mappedData && mappedData.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="text-gray-600 dark:text-gray-300 font-bold hover:bg-primary-500/5 transition-colors">
                                                    <td className="p-5 pl-8">{row.name}</td>
                                                    <td className="p-5"><span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-[0.55rem]">{row.department}</span></td>
                                                    <td className="p-5 text-indigo-500">{row.designation}</td>
                                                    <td className="p-5">{row.phone}</td>
                                                    <td className="p-5 pr-8 opacity-60 italic">{row.email}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-3xl">Abort Buffer</button>
                                <button onClick={handleImport} className="flex-[2] py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl shadow-2xl shadow-indigo-500/30">
                                    Commit {mappedData?.length} Experts to Lattice
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'importing' && (
                        <div className="text-center py-20">
                            <Loader2 className="w-20 h-20 text-indigo-500 animate-spin mx-auto mb-10" />
                            <p className="font-black uppercase tracking-[0.6em] text-gray-400 text-xs animate-pulse">Syncing expert nodes with institutional logic...</p>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div className="text-center py-6">
                            <div className="w-24 h-24 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
                                <CheckCircle className="w-12 h-12 text-accent-500 animate-bounce" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Lattice Updated</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 font-bold uppercase tracking-widest">
                                Valid Nodes Integrated: <span className="text-accent-500 text-lg">{importResult?.imported || 0}</span>
                            </p>
                            <button onClick={onImportSuccess} className="w-full py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase text-xs tracking-[0.5em] rounded-3xl shadow-2xl">Return to Matrix Hub</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyImportModal;