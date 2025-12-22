import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CSV_HEADERS = ['name', 'email', 'subject', 'phone', 'qualification'];

const FacultyImportModal = ({ onClose, onImportSuccess }) => {
    const { api } = useAuth();
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [status, setStatus] = useState('idle'); // idle -> preview -> importing -> complete
    const [importResult, setImportResult] = useState(null);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setError('');
        } else {
            setError('Please select a valid .csv file.');
            setFile(null);
        }
    };
    
    const parseCSV = useCallback(() => {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                setError('CSV file must contain headers and at least one row of data.');
                return;
            }
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Validate headers
            const requiredHeaders = ['name', 'email', 'subject'];
            const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
            if (missingHeaders.length > 0) {
                 setError(`Invalid CSV headers. Missing required headers: ${missingHeaders.join(', ')}.`);
                 return;
            }

            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj, header, index) => {
                    if (CSV_HEADERS.includes(header)) {
                        obj[header] = values[index]?.trim() || '';
                    }
                    return obj;
                }, {});
            });

            // Basic validation for required fields in data
            const invalidRow = data.find(row => !row.name || !row.email || !row.subject);
            if (invalidRow) {
                setError('Some rows are missing required data (name, email, subject). Please check your file.');
                return;
            }

            setParsedData(data);
            setStatus('preview');
        };
        reader.readAsText(file);
    }, [file]);

    const handleImport = async () => {
        if (!parsedData) return;

        setStatus('importing');
        try {
            const result = await api('/api/faculty/import', {
                method: 'POST',
                body: JSON.stringify({ facultyMembers: parsedData }),
            });
            setImportResult(result);
            setStatus('complete');
        } catch (err) {
            setError(err.message || 'An unknown error occurred during import.');
            setStatus('preview');
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'importing':
                return (
                    <div className="text-center py-16">
                        <Loader2 className="h-12 w-12 mx-auto text-primary-500 animate-spin" />
                        <p className="mt-4 font-semibold">Importing faculty...</p>
                        <p className="text-sm text-gray-500">Please wait, processing records.</p>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                        <h3 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">Import Complete</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Successfully imported <strong>{importResult.importedCount}</strong> faculty members.
                        </p>
                        {importResult.failedCount > 0 && (
                             <div className="mt-4 text-left bg-red-50 dark:bg-red-900/30 p-4 rounded-lg max-h-48 overflow-y-auto">
                                <p className="font-semibold text-red-700 dark:text-red-300">
                                    <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                                    <strong>{importResult.failedCount}</strong> records failed:
                                </p>
                                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2">
                                    {importResult.errors.map((err, i) => (
                                        <li key={i}>{err.member.email}: {err.reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button onClick={onImportSuccess} className="mt-6 w-full py-3 px-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition shadow-lg">
                           Done
                        </button>
                    </div>
                );

            case 'preview':
                return (
                    <>
                        <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Data Preview</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Showing first 5 rows. Verify headers and content match.</p>
                        <div className="overflow-x-auto border dark:border-gray-600 rounded-lg max-h-60 mb-6">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        {Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 font-semibold uppercase">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.slice(0, 5).map((row, i) => (
                                        <tr key={i} className="border-b dark:border-gray-600 last:border-0">
                                            {Object.keys(row).map(h => <td key={h} className="p-2 truncate">{row[h]}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                         <div className="flex justify-end gap-4">
                            <button onClick={() => { setStatus('idle'); setParsedData(null); setFile(null); }} className="py-2.5 px-5 border border-gray-300 dark:border-gray-600 rounded-xl text-sm font-bold">
                                Back
                            </button>
                            <button onClick={handleImport} className="py-2.5 px-8 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition shadow-lg">
                                Import {parsedData.length} Faculty
                            </button>
                        </div>
                    </>
                );

            default: // idle
                return (
                    <>
                         <div className="bg-primary-50 dark:bg-primary-900/20 p-5 rounded-2xl border border-primary-100 dark:border-primary-800/50 mb-6">
                            <h4 className="font-bold text-primary-800 dark:text-primary-200 mb-2">CSV Requirements</h4>
                            <ul className="text-xs text-primary-700 dark:text-primary-300 space-y-1 list-disc list-inside">
                                <li>Mandatory headers: <strong>name, email, subject</strong></li>
                                <li>Optional headers: <strong>phone, qualification</strong></li>
                                <li>Duplicates by email will be skipped automatically.</li>
                            </ul>
                        </div>
                        <div className="mb-6">
                            <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-44 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-2xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {file ? (
                                        <>
                                            <FileText className="w-12 h-12 mb-3 text-green-500 animate-bounce" />
                                            <p className="text-sm font-bold text-gray-700 dark:text-gray-200">{file.name}</p>
                                        </>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-12 h-12 mb-3 text-gray-400 group-hover:text-primary-500 transition-colors" />
                                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-bold">Select CSV File</span></p>
                                            <p className="text-xs text-gray-400">Drag and drop or click</p>
                                        </>
                                    )}
                                </div>
                                <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                            </label>
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4 text-center font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
                        <div className="flex justify-end gap-4">
                            <button onClick={onClose} className="py-2.5 px-5 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-700 transition">Cancel</button>
                            <button onClick={parseCSV} disabled={!file} className="py-2.5 px-8 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                Preview Data
                            </button>
                        </div>
                    </>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-white/10">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                        Bulk Import Faculty
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2 scrollbar-hide">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default FacultyImportModal;