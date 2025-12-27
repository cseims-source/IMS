import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
// Using direct ESM import to bypass local resolution issues
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const StudentImportModal = ({ onClose, onImportSuccess }) => {
    const { api } = useAuth();
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
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
    
    const parseFile = useCallback(() => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length === 0) {
                    setError('The file contains no data nodes.');
                    return;
                }

                // Check for core identity fields
                const firstRow = json[0];
                if (!firstRow.firstName || !firstRow.email) {
                    setError('Missing mandatory logic headers: firstName, email');
                    return;
                }

                setParsedData(json);
                setStatus('preview');
            } catch (err) {
                setError('Failed to decrypt data stream. Please check file format.');
            }
        };
        reader.readAsArrayBuffer(file);
    }, [file]);

    const handleImport = async () => {
        setStatus('importing');
        try {
            const result = await api('/api/students/import', {
                method: 'POST',
                body: JSON.stringify({ students: parsedData }),
            });
            setImportResult(result);
            setStatus('complete');
        } catch (err) {
            setError(err.message);
            setStatus('preview');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl w-full max-w-2xl border border-white/10 animate-scale-in">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Registry <span className="text-indigo-600">Sync</span></h2>
                        <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                            <UploadCloud size={12} className="text-indigo-400" /> Mass Data Transmission
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-6">
                    {status === 'idle' && (
                        <>
                            <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/50">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-2">Protocol Requirements</h4>
                                <ul className="text-[0.65rem] text-indigo-600 dark:text-indigo-400 space-y-1.5 font-bold">
                                    <li>• Accepts .csv or .xlsx (Excel) formats</li>
                                    <li>• Mandatory Fields: firstName, lastName, email, phone</li>
                                    <li>• Optional: course, branch, academicYear, gender</li>
                                </ul>
                            </div>
                            <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                                <div className="flex flex-col items-center justify-center">
                                    <FileText className={`w-14 h-14 mb-4 ${file ? 'text-indigo-500 animate-bounce' : 'text-gray-200 group-hover:text-indigo-400'} transition-colors`} />
                                    <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{file ? file.name : 'Initialize Data Stream'}</p>
                                </div>
                                <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
                            </label>
                            {error && <p className="text-red-500 text-[0.65rem] font-bold text-center uppercase tracking-widest">{error}</p>}
                            <button onClick={parseFile} disabled={!file} className="w-full py-4 bg-primary-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-primary-500/20 disabled:opacity-50 active:scale-95 transition-all">
                                Analyze Structure
                            </button>
                        </>
                    )}

                    {status === 'preview' && (
                        <>
                            <div className="overflow-x-auto rounded-2xl border dark:border-gray-700 max-h-60 shadow-inner">
                                <table className="w-full text-[0.65rem] text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 font-black uppercase tracking-widest text-gray-500">
                                        <tr>
                                            {parsedData && parsedData.length > 0 && Object.keys(parsedData[0]).map(h => <th key={h} className="p-3">{h}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-800">
                                        {parsedData && parsedData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="text-gray-600 dark:text-gray-300 font-bold">
                                                {Object.values(row).map((v, j) => <td key={j} className="p-3">{String(v)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-2xl">Reset</button>
                                <button onClick={handleImport} className="flex-[2] py-4 bg-indigo-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                                    Sync {parsedData ? parsedData.length : 0} Nodes
                                </button>
                            </div>
                        </>
                    )}

                    {status === 'importing' && (
                        <div className="text-center py-12">
                            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto mb-6" />
                            <p className="font-black uppercase tracking-[0.4em] text-gray-400 text-xs">Injecting Nodes into Core Registry...</p>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div className="text-center">
                            <CheckCircle className="w-20 h-20 text-indigo-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">Sync Complete</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-bold">
                                Successful Nodes: <span className="text-indigo-600">{importResult?.importedCount || 0}</span>
                            </p>
                            <button onClick={onImportSuccess} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Return to Registry</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentImportModal;