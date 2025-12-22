import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileDown, Sliders, Loader2, Sparkles } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

const reportTypes = [
  { id: 'attendance', name: 'Attendance Defaulters (<75%)' },
  { id: 'fees', name: 'Fees Pending' },
  { id: 'academic', name: 'Academic Performance' },
];

const reportHeaders = {
    attendance: ['Student Name', 'Stream', 'Attendance %'],
    fees: ['Student Name', 'Stream', 'Fee Type', 'Pending Amount', 'Due Date'],
    academic: ['Student Name', 'Stream', 'Overall Grade', 'Exams Taken'],
};

const reportKeys = {
    attendance: ['studentName', 'stream', 'attendancePercentage'],
    fees: ['studentName', 'stream', 'feeType', 'amount', 'dueDate'],
    academic: ['studentName', 'stream', 'averageGrade', 'examCount'],
};

export default function ReportGenerator() {
  const [reportType, setReportType] = useState('attendance');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [filters, setFilters] = useState({ stream: 'all', dateRange: 'all' });
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { api } = useAuth();
  const tableRef = useRef(null);
  
  // New state for AI Insights
  const [aiQuery, setAiQuery] = useState('');
  const [aiInsight, setAiInsight] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

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

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedReport(null);
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const data = await api(`/api/reports/${reportType}?${queryParams}`);
        setGeneratedReport(data);
    } catch (err) {
        setError(err.message || 'Failed to generate report.');
    } finally {
        setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    if (!aiQuery.trim()) {
        setAiError('Please enter a question to get insights.');
        return;
    }
    setIsAiLoading(true);
    setAiError('');
    setAiInsight('');
    try {
        const response = await api('/api/reports/ai-insights', {
            method: 'POST',
            body: JSON.stringify({ query: aiQuery }),
        });
        setAiInsight(response.insight);
    } catch (err) {
        setAiError(err.message || 'Failed to get insights from the AI. Please check if the API key is configured on the backend.');
    } finally {
        setIsAiLoading(false);
    }
  };

  const exportToCsv = () => {
    if (!generatedReport || generatedReport.length === 0) return;
    
    const headers = reportHeaders[reportType];
    const keys = reportKeys[reportType];
    
    const csvContent = [
        headers.join(','),
        ...generatedReport.map(row => 
            keys.map(key => {
                let value = key.split('.').reduce((o, i) => o ? o[i] : '', row);
                if (key === 'dueDate' && value) value = formatDate(value);
                if (key === 'amount' && value) value = `₹${value}`;
                if (key === 'attendancePercentage' && value) value = `${value}%`;
                if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
                return value;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) URL.revokeObjectURL(link.href);
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentHeaders = reportHeaders[reportType] || [];
  const currentKeys = reportKeys[reportType] || [];

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Standard Report Generator</h1>
        
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600 flex flex-wrap items-end gap-4 mb-8">
          <div className="flex-grow">
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Type</label>
            <select id="report-type" name="reportType" value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-500 rounded-md">
              {reportTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>
          <div className="flex-grow">
            <label htmlFor="stream-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Stream</label>
            <select id="stream-filter" name="stream" value={filters.stream} onChange={handleFilterChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-500 rounded-md">
              <option value="all">All Streams</option>
              {streams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex-grow">
            <label htmlFor="date-range-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Date Range</label>
            <select id="date-range-filter" name="dateRange" value={filters.dateRange} onChange={handleFilterChange} className="mt-1 block w-full p-2 border-gray-300 dark:border-gray-500 rounded-md">
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
            </select>
          </div>
          <button onClick={handleGenerate} disabled={loading} className="px-5 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 flex items-center disabled:bg-primary-400">
              {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {generatedReport ? (
          <div>
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Report Results ({generatedReport.length} records)</h2>
                  <button onClick={exportToCsv} className="flex items-center text-sm px-3 py-1.5 border rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"><FileDown size={16} className="mr-2"/>Export as CSV</button>
              </div>
               <div ref={tableRef} className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                  <table className="w-full text-left">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>{currentHeaders.map(h => <th key={h} className="p-3 font-semibold">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                          {generatedReport.map((row, index) => (
                              <tr key={index} className="border-b dark:border-gray-600 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                  {currentKeys.map(key => {
                                      let value = key.split('.').reduce((o, i) => o ? o[i] : '', row);
                                      if (key === 'dueDate' && value) value = formatDate(value);
                                      if (key === 'amount' && value) value = `₹${value}`;
                                      if (key === 'attendancePercentage' && value) value = `${value}%`;
                                      return <td key={key} className="p-3">{value}</td>
                                  })}
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
        ) : (
          !loading && <div className="text-center py-12 border-2 border-dashed dark:border-gray-600 rounded-lg">
              <Sliders size={48} className="mx-auto text-gray-400"/>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Select your report criteria and click "Generate Report" to see the data.</p>
          </div>
        )}
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
              <Sparkles className="mr-3 text-primary-500" /> AI-Powered Insights
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Ask questions in natural language to get AI-driven analysis of your institute's data. 
              For example: "Which stream has the most students?" or "What is the overall fee payment status?"
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
              <textarea
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask a question about the institute's data..."
                  className="w-full p-3 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 h-24 sm:h-auto"
                  rows="2"
              />
              <button
                  onClick={handleGetInsights}
                  disabled={isAiLoading}
                  className="px-5 py-2 bg-primary-600 text-white rounded-md font-semibold hover:bg-primary-700 flex items-center justify-center disabled:bg-primary-400 shrink-0"
              >
                  {isAiLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                  {isAiLoading ? 'Analyzing...' : 'Get Insights'}
              </button>
          </div>

          <div className="mt-6">
              {isAiLoading && (
                  <div className="text-center p-8 border-2 border-dashed dark:border-gray-600 rounded-lg">
                      <Loader2 className="h-8 w-8 mx-auto text-primary-500 animate-spin" />
                      <p className="mt-4 font-semibold">Generating analysis...</p>
                  </div>
              )}
              {aiError && (
                   <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                      <strong>Error:</strong> {aiError}
                   </div>
              )}
              {aiInsight && (
                  <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg border dark:border-gray-600">
                      <h3 className="font-semibold text-lg mb-2">Analysis:</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                          {aiInsight}
                      </div>
                  </div>
              )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
              Note: AI insights are based on a summarized snapshot of the data and may be experimental.
          </p>
      </div>
    </div>
  );
}