import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'https://esm.sh/xlsx@0.18.5';

const FacultyImportModal = ({ onClose, onImportSuccess }) => {
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

                if (json.length === 0) return setError('The data stream contains no nodes.');
                
                // Verify mandatory headers
                const first = json[0];
                if (!first.name || !first.email || !first.subject) {
                    return setError('Missing mandatory identity nodes: name, email, subject');
                }

                setParsedData(json);
                setStatus('preview');
            } catch (err) {
                setError('Failed to decrypt data stream.');
            }
        };
        reader.readAsArrayBuffer(file);
    }, [file]);

    const handleImport = async () => {
        setStatus('importing');
        try {
            const result = await api('/api/faculty/import', {
                method: 'POST',
                body: JSON.stringify({ facultyMembers: parsedData }),
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
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-3xl w-full max-w-2xl border border-white/10 animate-scale-in">
                 <div className="flex justify-between items-center mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Lattice <span className="text-indigo-600">Injection</span></h2>
                        <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-3 flex items-center gap-2">
                            <UploadCloud size={14} className="text-indigo-400" /> Mass Identity Sync
                        </p>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-3xl transition"><X size={28} /></button>
                </div>

                <div className="space-y-8">
                    {status === 'idle' && (
                        <>
                            <div className="p-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-800/50">
                                <h4 className="text-[0.65rem] font-black uppercase tracking-widest text-indigo-700 dark:text-indigo-300 mb-3">CSV Schema Protocol</h4>
                                <ul className="text-[0.6rem] text-indigo-600 dark:text-indigo-400 space-y-2 font-bold uppercase tracking-wider">
                                    <li>• Identity Markers: name, email, subject</li>
                                    <li>• Modifiers: phone, qualification</li>
                                    <li>• Auto-skip duplicates by unique email logic</li>
                                </ul>
                            </div>
                            <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-[3rem] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group">
                                <div className="flex flex-col items-center justify-center">
                                    <FileText className={`w-16 h-16 mb-4 ${file ? 'text-indigo-500 animate-bounce' : 'text-gray-200 group-hover:text-indigo-400'}`} />
                                    <p className="text-[0.65rem] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">{file ? file.name : 'Initialize Data Feed'}</p>
                                </div>
                                <input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileChange} />
                            </label>
                            {error && <p className="text-red-500 text-[0.65rem] font-black text-center uppercase tracking-widest bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl">{error}</p>}
                            <button onClick={parseFile} disabled={!file} className="w-full py-5 bg-primary-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary-500/30 active:scale-95 transition-all disabled:opacity-50">Analyze Data Lattice</button>
                        </>
                    )}

                    {status === 'preview' && (
                        <>
                            <div className="overflow-x-auto rounded-[2rem] border dark:border-gray-700 max-h-64 shadow-inner">
                                <table className="w-full text-[0.6rem] text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 font-black uppercase tracking-widest text-gray-500 shadow-sm">
                                        <tr>{parsedData && Object.keys(parsedData[0]).map(h => <th key={h} className="p-4">{h}</th>)}</tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-800">
                                        {parsedData && parsedData.slice(0, 5).map((row, i) => (
                                            <tr key={i} className="text-gray-600 dark:text-gray-300 font-bold">
                                                {Object.values(row).map((v, j) => <td key={j} className="p-4">{String(v)}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStatus('idle')} className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-500 font-black uppercase text-xs tracking-widest rounded-2xl">Wipe Buffer</button>
                                <button onClick={handleImport} className="flex-[2] py-5 bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl active:scale-95 transition-all">Sync {parsedData?.length} Expert Nodes</button>
                            </div>
                        </>
                    )}

                    {status === 'importing' && (
                        <div className="text-center py-20">
                            <Loader2 className="w-20 h-20 text-indigo-500 animate-spin mx-auto mb-8" />
                            <p className="font-black uppercase tracking-[0.6em] text-gray-400 text-xs animate-pulse">Initializing Data Stream Injection...</p>
                        </div>
                    )}

                    {status === 'complete' && (
                        <div className="text-center">
                            <CheckCircle className="w-24 h-24 text-accent-500 mx-auto mb-8 shadow-[0_0_40px_rgba(6,182,212,0.2)] rounded-full p-4" />
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Registry Updated</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-12 font-bold uppercase tracking-widest">
                                Valid Nodes Injected: <span className="text-accent-500">{importResult?.importedCount || 0}</span>
                            </p>
                            <button onClick={onImportSuccess} className="w-full py-5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black uppercase text-xs tracking-[0.4em] rounded-2xl shadow-2xl active:scale-95 transition-all">Return to Hub</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyImportModal;