import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2, Cpu, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

// Complete AIET Institutional Logic Header Map
const HEADER_MAP = {
    "STUDENT NAME": "firstName", 
    "E-MAIL": "email",
    "STUDENT CONTACT NO": "phone",
    "REGISTRATION  No.": "registrationNumber",
    "ADMISSION YEAR": "academicYear",
    "REPORTING DATE": "admissionDate",
    "COURSE ": "course",
    "BRANCH": "branch",
    "GENDER": "gender",
    "DATE OF BIRTH": "dob",
    "AADHAR NO": "aadharNumber",
    "STUDENT WhatsApp NO": "whatsappNumber",
    "RELIGION": "religion",
    "CATEGORY": "category",
    "BLOOD GROUP": "bloodGroup",
    "Facebook ID": "facebookId",
    "Name Of Staff": "staffName",
    "APPEAR ENTRANCE": "appearedInEntrance",
    "ENTRANCE ROLL NO": "entranceRollNo",
    "PRESENT ADDRESS": "presentAddress.address",
    "POST OFFICE": "presentAddress.postOffice",
    "POLICE STATION": "presentAddress.policeStation",
    "VIA": "presentAddress.via",
    "BLOCK": "presentAddress.block",
    "DISTRICT": "presentAddress.district",
    "STATE": "presentAddress.state",
    "PINCODE": "presentAddress.pincode",
    "PERMANENT ADDRESS": "permanentAddress.address",
    "POST OFFICE2": "permanentAddress.postOffice",
    "POLICE STATION3": "permanentAddress.policeStation",
    "VIA4": "permanentAddress.via",
    "BLOCK5": "permanentAddress.block",
    "DISTRICT6": "permanentAddress.district",
    "STATE7": "permanentAddress.state",
    "PINCODE8": "permanentAddress.pincode",
    "FATHER NAME": "family.father.name",
    "FATHER OCCUPATION": "family.father.occupation",
    "FATHER CONTACT NO": "family.father.phone",
    "FATHER WhatsApp NO": "family.father.whatsapp",
    "MOTHER NAME": "family.mother.name",
    "MOTHERS OCCUPATION": "family.mother.occupation",
    "MOTHER CONTACT NO.": "family.mother.phone",
    "MOTHER WhatsApp NO": "family.mother.whatsapp",
    "GUARDIANS CONTACT NO": "family.guardianPhone",
    "EMERGENCY CASE OF CONTACT": "emergencyContactPhone",
    "1st Year Course Fee": "yearFees.y1",
    "2nd Year Course Fee": "yearFees.y2",
    "3rd Year Course Fee": "yearFees.y3",
    "4th Year Course Fee": "yearFees.y4",
    "Hostel/Bus Fee": "yearFees.hostelBus",
    "EXAMINATION NAME": "education10th.examName",
    "INSTITUTE NAME": "education10th.schoolName",
    "PASS OUT": "education10th.passingYear",
    "Total Marks": "education10th.totalMarks",
    "Marks Secured": "education10th.marksSecured",
    "Percent(%)": "education10th.percentage",
    "LAST EXAMINATION": "lastExam.examType",
    "INSTITUTE NAME9": "lastExam.instituteName",
    "Total Marks13": "lastExam.totalMarks",
    "Marks Secured14": "lastExam.marksSecured",
    "Percent(%)15": "lastExam.percentage",
    "PHOTO": "photo"
};

const StudentImportModal = ({ onClose, onImportSuccess }) => {
    const { api } = useAuth();
    const [file, setFile] = useState(null);
    const [mappedData, setMappedData] = useState(null);
    const [status, setStatus] = useState('idle');
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');

    const setDeepValue = (obj, path, value) => {
        const keys = path.split('.');
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
    };

    const processLatticeData = (rawJson) => {
        return rawJson.map(row => {
            const student = {
                yearFees: { y1: 0, y2: 0, y3: 0, y4: 0, hostelBus: 0 },
                presentAddress: { state: 'Odisha' },
                permanentAddress: { state: 'Odisha' },
                family: { father: {}, mother: {} },
                education10th: {},
                lastExam: {},
                documents: { original: [], xerox: [] }
            };

            Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = key.trim();
                const targetPath = HEADER_MAP[normalizedKey];

                if (targetPath) {
                    if (normalizedKey === "STUDENT NAME") {
                        const parts = String(value).trim().split(/\s+/);
                        student.firstName = parts[0];
                        student.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
                    } else if (normalizedKey === "Original Documnet Received") {
                        student.documents.original = String(value).split(',').map(s => s.trim());
                    } else if (normalizedKey === "Xerox Documnet Received") {
                        student.documents.xerox = String(value).split(',').map(s => s.trim());
                    } else if (targetPath.includes('yearFees') || targetPath.includes('Marks') || targetPath.includes('percentage')) {
                        setDeepValue(student, targetPath, Number(value) || 0);
                    } else {
                        setDeepValue(student, targetPath, value);
                    }
                }
            });

            student.stream = `${student.course || ''} ${student.branch || ''}`.trim() || 'Unassigned';
            student.status = 'Approved';
            return student;
        });
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError('');
        }
    };

    const parseFile = useCallback(() => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
                if (json.length === 0) return setError('Buffer empty.');
                const translated = processLatticeData(json);
                setMappedData(translated);
                setStatus('preview');
            } catch (err) {
                setError('Neural Decryption Failed.');
            }
        };
        reader.readAsArrayBuffer(file);
    }, [file]);

    const handleImport = async () => {
        setStatus('importing');
        try {
            const result = await api('/api/students/import', {
                method: 'POST',
                body: JSON.stringify({ students: mappedData }),
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
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Neural <span className="text-indigo-600">Sync</span></h2>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3">AIET Legacy Ledger Protocol</p>
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
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> Every AIET column mapped correctly.</li>
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> Registry Photos: Syncing via URL.</li>
                                        <li className="flex items-center gap-3"><ArrowRight size={12}/> 4-Year Course Fees: Initialized.</li>
                                    </ul>
                                </div>
                                <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group overflow-hidden bg-gray-50/50 dark:bg-gray-950/30">
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadCloud className={`w-16 h-16 mb-4 ${file ? 'text-indigo-500 animate-bounce' : 'text-gray-200 group-hover:text-indigo-400'}`} />
                                        <p className="text-[0.65rem] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{file ? file.name : 'Inject AIET Institutional Excel'}</p>
                                    </div>
                                    <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                                </label>
                            </div>
                            <button onClick={parseFile} disabled={!file} className="w-full py-5 bg-primary-600 text-white font-black uppercase text-xs tracking-[0.4em] rounded-3xl shadow-2xl shadow-primary-500/30">
                                Initialize Translation Protocol
                            </button>
                        </>
                    )}

                    {status === 'preview' && (
                        <>
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-gray-400 ml-2">Logical Preview // {mappedData?.length} Nodes Decrypted</h3>
                                <div className="overflow-x-auto rounded-[2.5rem] border dark:border-gray-800 max-h-72 shadow-inner bg-gray-50 dark:bg-gray-950">
                                    <table className="w-full text-[0.6rem] text-left">
                                        <thead className="bg-gray-100 dark:bg-gray-900 sticky top-0 font-black uppercase tracking-widest text-gray-500">
                                            <tr>
                                                <th className="p-5 pl-8">Registry Identity</th>
                                                <th className="p-5">Course Node</th>
                                                <th className="p-5">Branch Hub</th>
                                                <th className="p-5">Registry ID</th>
                                                <th className="p-5 pr-8">Photo URL</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-800">
                                            {mappedData && mappedData.slice(0, 10).map((row, i) => (
                                                <tr key={i} className="text-gray-600 dark:text-gray-300 font-bold hover:bg-primary-500/5 transition-colors">
                                                    <td className="p-5 pl-8">{row.firstName} {row.lastName}</td>
                                                    <td className="p-5"><span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-md text-[0.55rem]">{row.course}</span></td>
                                                    <td className="p-5 text-indigo-500">{row.branch}</td>
                                                    <td className="p-5">{row.registrationNumber}</td>
                                                    <td className="p-5 pr-8 opacity-60 italic truncate max-w-xs">{row.photo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-3xl">Abort Cache</button>
                                <button onClick={handleImport} className="flex-[2] py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-3xl shadow-2xl shadow-indigo-500/30">
                                    Commit {mappedData?.length} Nodes to Registry
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'importing' && (
                        <div className="text-center py-20">
                            <Loader2 className="w-20 h-20 text-indigo-500 animate-spin mx-auto mb-10" />
                            <p className="font-black uppercase tracking-[0.8em] text-gray-400 text-xs animate-pulse">Synchronizing Nodes with Core Lattice...</p>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div className="text-center py-6">
                            <div className="w-24 h-24 bg-accent-500/10 rounded-full flex items-center justify-center mx-auto mb-10">
                                <CheckCircle className="w-12 h-12 text-accent-500 animate-bounce" />
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Sync Success</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 font-bold uppercase tracking-widest">
                                Valid Nodes Integrated: <span className="text-accent-500 text-lg">{importResult?.importedCount || 0}</span>
                            </p>
                            <button onClick={onImportSuccess} className="w-full py-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase text-xs tracking-[0.5em] rounded-3xl shadow-2xl">Return to Registry Hub</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentImportModal;