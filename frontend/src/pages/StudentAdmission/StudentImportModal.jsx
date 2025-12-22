import React, { useState, useCallback } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CSV_HEADERS = ['firstName', 'lastName', 'email', 'phone', 'dob', 'gender', 'address', 'stream', 'currentSemester'];

const StudentImportModal = ({ onClose, onImportSuccess }) => {
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
            const headers = lines[0].split(',').map(h => h.trim());

            // Validate headers
            const requiredHeaders = ['firstName', 'lastName', 'email'];
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
            const invalidRow = data.find(row => !row.firstName || !row.lastName || !row.email);
            if (invalidRow) {
                setError('Some rows are missing required data (firstName, lastName, email). Please check your file.');
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
            const result = await api('/api/students/import', {
                method: 'POST',
                body: JSON.stringify({ students: parsedData }),
            });
            setImportResult(result);
            setStatus('complete');
        } catch (err) {
            setError(err.message || 'An unknown error occurred during import.');
            setStatus('preview'); // Go back to preview on error
        }
    };

    const renderContent = () => {
        switch (status) {
            case 'importing':
                return (
                    <div className="text-center py-16">
                        <Loader2 className="h-12 w-12 mx-auto text-primary-500 animate-spin" />
                        <p className="mt-4 font-semibold">Importing students...</p>
                        <p className="text-sm text-gray-500">Please wait, this may take a moment.</p>
                    </div>
                );

            case 'complete':
                return (
                    <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                        <h3 className="mt-4 text-xl font-bold">Import Complete</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">
                            Successfully imported <strong>{importResult.importedCount}</strong> students.
                        </p>
                        {importResult.failedCount > 0 && (
                             <div className="mt-4 text-left bg-red-50 dark:bg-red-900/30 p-4 rounded-lg max-h-48 overflow-y-auto">
                                <p className="font-semibold text-red-700 dark:text-red-300">
                                    <AlertTriangle className="inline-block mr-2 h-5 w-5" />
                                    <strong>{importResult.failedCount}</strong> records failed to import:
                                </p>
                                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400 mt-2">
                                    {importResult.errors.map((err, i) => (
                                        <li key={i}>{err.student.email}: {err.reason}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button onClick={onImportSuccess} className="mt-6 w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                           Close
                        </button>
                    </div>
                );

            case 'preview':
                return (
                    <>
                        <h3 className="font-semibold mb-2">Data Preview</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Showing first 5 rows from your file. Please verify the data is correct before importing.</p>
                        <div className="overflow-x-auto border dark:border-gray-600 rounded-lg max-h-60">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                                    <tr>
                                        {Object.keys(parsedData[0]).map(h => <th key={h} className="p-2 font-semibold">{h}</th>)}
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
                         <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-4">
                            <button onClick={() => { setStatus('idle'); setParsedData(null); setFile(null); }} className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm">
                                Back
                            </button>
                            <button onClick={handleImport} className="py-2 px-6 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                                Confirm & Import {parsedData.length} Students
                            </button>
                        </div>
                    </>
                );

            default: // idle
                return (
                    <>
                         <div className="bg-primary-50 dark:bg-primary-900/30 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
                            <h4 className="font-semibold text-primary-800 dark:text-primary-200">CSV Format Instructions</h4>
                            <p className="text-xs text-primary-700 dark:text-primary-300 mt-2">
                                Your CSV file must contain at least the following headers: <strong>firstName, lastName, email</strong>.
                            </p>
                            <p className="text-xs text-primary-700 dark:text-primary-300 mt-2">
                                Optional headers are: <strong>phone, dob, gender, address, stream, currentSemester</strong>.
                            </p>
                             <p className="text-xs text-primary-700 dark:text-primary-300 mt-2">
                                The `dob` column should be in `YYYY-MM-DD` format. The `stream` must match an existing stream name exactly. Do not include commas within any field.
                            </p>
                        </div>
                        <div className="mt-6">
                            <label htmlFor="csv-upload" className="block text-sm font-medium mb-2">Upload CSV File</label>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="csv-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {file ? (
                                            <>
                                                <FileText className="w-8 h-8 mb-3 text-green-500" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">{file.name}</span></p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">CSV files only</p>
                                            </>
                                        )}
                                    </div>
                                    <input id="csv-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                        <div className="mt-6 pt-4 border-t dark:border-gray-700 flex justify-end gap-4">
                            <button onClick={onClose} className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md text-sm">Cancel</button>
                            <button onClick={parseCSV} disabled={!file} className="py-2 px-6 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 disabled:bg-gray-400">
                                Upload & Preview
                            </button>
                        </div>
                    </>
                );
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
                 <div className="flex justify-between items-center mb-4 border-b dark:border-gray-700 pb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                        Bulk Import Students
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={24} />
                    </button>
                </div>
                <div className="overflow-y-auto pr-2">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default StudentImportModal;