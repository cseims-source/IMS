import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, Calculator, Trophy, Award, Search, BookOpen, Upload, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

const getGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
};

export default function MarksheetEntry() {
  const { user, api } = useAuth();
  const { addToast } = useNotification();
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
    const [customExamName, setCustomExamName] = useState('');
    const [selectedExamId, setSelectedExamId] = useState('');
    const [examList, setExamList] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [examDate, setExamDate] = useState('');
    const [status, setStatus] = useState('published');
    const [remarks, setRemarks] = useState('');
  const [marks, setMarks] = useState({});
  const [total, setTotal] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [myMarksheets, setMyMarksheets] = useState([]);
  const [loadingMyMarks, setLoadingMyMarks] = useState(false);
    const [studentFilters, setStudentFilters] = useState({ exam: 'all', semester: 'all', academicYear: 'all' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStream, setFilterStream] = useState('all');
    const [filterSemester, setFilterSemester] = useState('all');
    const [filterSection, setFilterSection] = useState('all');
    const [filterAcademicYear, setFilterAcademicYear] = useState('all');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadFormat, setDownloadFormat] = useState('csv');
    const [analytics, setAnalytics] = useState({ gradeDistribution: [], subjectAverages: [], toppers: [] });
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const isAdminOrTeacher = user?.role === 'Admin' || user?.role === 'Teacher';
  const selectedStudent = students.find(s => s._id === selectedStudentId);
  const isAdmin = user?.role === 'Admin';

  const filteredStudents = useMemo(() => {
      return students.filter(s => {
          const matchesSearch = `${s.firstName} ${s.lastName} ${s.registrationNumber || ''}`
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          const matchesStream = filterStream === 'all' || s.stream === filterStream;
          const matchesSemester = filterSemester === 'all' || String(s.currentSemester) === String(filterSemester);
          const matchesSection = filterSection === 'all' || s.section === filterSection;
          return matchesSearch && matchesStream && matchesSemester && matchesSection;
      });
  }, [students, searchTerm, filterStream, filterSemester, filterSection]);

  const streamOptions = useMemo(() => [...new Set(students.map(s => s.stream).filter(Boolean))], [students]);
  const sectionOptions = useMemo(() => [...new Set(students.map(s => s.section).filter(Boolean))], [students]);
    const academicYearOptions = useMemo(() => [...new Set(students.map(s => s.academicYear).filter(Boolean))], [students]);
    const examOptions = useMemo(() => ['mid-term', 'final', 'unit-test-1', 'unit-test-2', 'practical', 'surprise-test'], []);

  useEffect(() => {
    if (isAdminOrTeacher) {
        const fetchStudents = async () => {
            try {
                const data = await api('/api/students');
                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            }
        };
        fetchStudents();
    } else {
        // Handle Student view
        fetchMyResults();
    }
  }, [api, isAdminOrTeacher]);

  const fetchMyResults = async () => {
      setLoadingMyMarks(true);
      try {
          const params = new URLSearchParams({
              exam: studentFilters.exam,
              semester: studentFilters.semester,
              academicYear: studentFilters.academicYear
          });
          const data = await api(`/api/marksheet/my-marksheets?${params.toString()}`);
          setMyMarksheets(data);
      } catch (err) {
          addToast('Failed to fetch results.', 'error');
      } finally {
          setLoadingMyMarks(false);
      }
  };

  useEffect(() => {
    if (!isAdminOrTeacher) return;

    const fetchSubjectsForStudent = async () => {
        if (!selectedStudent || !selectedStudent.stream || !selectedStudent.currentSemester) {
            setSubjects([]);
            return;
        }
        setLoadingSubjects(true);
        try {
            const subjectsData = await api(`/api/streams/${encodeURIComponent(selectedStudent.stream)}/${selectedStudent.currentSemester}/subjects`);
            setSubjects(subjectsData.map(s => ({ ...s, maxMarks: 100 })));
        } catch (error) {
            console.error("Failed to fetch subjects for stream/semester", error);
            setSubjects([]);
        } finally {
            setLoadingSubjects(false);
        }
    };

    fetchSubjectsForStudent();
    setMarks({});
  }, [selectedStudent, api, isAdminOrTeacher]);

    useEffect(() => {
        if (!isAdminOrTeacher || !selectedStudent?.stream || !selectedStudent?.currentSemester) return;
        const fetchExams = async () => {
                setLoadingExams(true);
                try {
                        const params = new URLSearchParams({
                                stream: selectedStudent.stream,
                                semester: selectedStudent.currentSemester,
                                section: selectedStudent.section || 'A',
                                academicYear: selectedStudent.academicYear || 'all'
                        });
                        const data = await api(`/api/exams?${params.toString()}`);
                        setExamList(data || []);
                } catch (error) {
                        setExamList([]);
                } finally {
                        setLoadingExams(false);
                }
        };
        fetchExams();
    }, [api, isAdminOrTeacher, selectedStudent]);

  const fetchMarksheet = useCallback(async () => {
      if (isAdminOrTeacher && selectedStudentId && selectedExam && selectedStudent?.currentSemester) {
          try {
              const academicYear = selectedStudent?.academicYear ? `?academicYear=${encodeURIComponent(selectedStudent.academicYear)}` : '';
              const data = await api(`/api/marksheet/${selectedStudentId}/${selectedExam}/${selectedStudent.currentSemester}${academicYear}`);
              if (data) {
                  const newMarks = {};
                  data.marks.forEach(m => {
                      newMarks[m.subjectName] = m.marksObtained;
                  });
                  setMarks(newMarks);
                  setExamDate(data.examDate || '');
                  setStatus(data.status || 'published');
                  setRemarks(data.remarks || '');
                  setSelectedExamId(data.examId || '');
              } else {
                  setMarks({});
                  setExamDate('');
                  setStatus('published');
                  setRemarks('');
                  setSelectedExamId('');
              }
          } catch (error) {
              console.error("Failed to fetch marksheet", error);
              setMarks({});
          }
      }
  }, [selectedStudentId, selectedExam, selectedStudent, api, isAdminOrTeacher]);
  
    useEffect(() => {
        fetchMarksheet();
    }, [fetchMarksheet]);


  useEffect(() => {
    if (subjects.length > 0) {
      const currentTotal = subjects.reduce((acc, subject) => acc + (Number(marks[subject.name]) || 0), 0);
      const maxTotal = subjects.reduce((acc, subject) => acc + subject.maxMarks, 0);
      setTotal(currentTotal);
      setPercentage(maxTotal > 0 ? ((currentTotal / maxTotal) * 100).toFixed(2) : 0);
    } else {
        setTotal(0);
        setPercentage(0);
    }
  }, [marks, subjects]);

  const handleMarkChange = (subjectName, value, maxMarks) => {
    const numericValue = Math.max(0, Math.min(maxMarks, Number(value)));
    setMarks(prev => ({ ...prev, [subjectName]: numericValue }));
  };
  
    const handleSubmit = async (e) => {
    e.preventDefault();
        const resolvedExam = selectedExam === 'custom' ? customExamName.trim() : selectedExam;
        if(!selectedStudentId || !resolvedExam || !selectedStudent?.currentSemester) {
        addToast("Please select a student and an exam.", "error");
        return;
    }

    const marksheetData = {
        student: selectedStudentId,
        exam: resolvedExam,
        examId: selectedExamId || undefined,
        academicYear: selectedStudent?.academicYear,
        section: selectedStudent?.section,
        semester: selectedStudent.currentSemester,
        examDate,
        status,
        remarks,
        marks: subjects.map(s => ({
            subjectName: s.name,
            subjectId: s._id,
            marksObtained: marks[s.name] || 0,
            maxMarks: s.maxMarks
        })),
        total,
        percentage,
        grade: getGrade(percentage)
    };

    try {
        await api('/api/marksheet', {
            method: 'POST',
            body: JSON.stringify(marksheetData)
        });
        addToast("Marksheet saved successfully!", "success");
    } catch(err) {
        addToast("Error saving marksheet.", "error");
    }
  };

  useEffect(() => {
      if (!isAdminOrTeacher) return;
      const fetchAnalytics = async () => {
          setAnalyticsLoading(true);
          try {
              const params = new URLSearchParams({
                  stream: filterStream,
                  semester: filterSemester,
                  section: filterSection,
                  exam: selectedExam || 'all',
                  academicYear: filterAcademicYear
              });
              const data = await api(`/api/marksheet/analytics?${params.toString()}`);
              setAnalytics(data || { gradeDistribution: [], subjectAverages: [], toppers: [] });
          } catch (error) {
              addToast('Failed to load analytics.', 'error');
          } finally {
              setAnalyticsLoading(false);
          }
      };
      fetchAnalytics();
  }, [api, addToast, isAdminOrTeacher, filterStream, filterSemester, filterSection, filterAcademicYear, selectedExam]);

  const handleUploadMarksheets = async () => {
      if (!uploadFile) return addToast('Select a CSV/XLSX file.', 'info');
      setUploading(true);
      try {
          const formData = new FormData();
          formData.append('file', uploadFile);
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/marksheet/upload`, {
              method: 'POST',
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: formData
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Upload failed');
          }
          addToast('Marksheet upload completed.', 'success');
          setUploadFile(null);
      } catch (error) {
          addToast(error.message || 'Upload failed.', 'error');
      } finally {
          setUploading(false);
      }
  };

  const handleDownloadMarksheets = async () => {
      setDownloading(true);
      try {
          const params = new URLSearchParams({
              stream: filterStream,
              semester: filterSemester,
              section: filterSection,
              exam: selectedExam || 'all',
              academicYear: filterAcademicYear,
              format: downloadFormat
          });
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_BASE_URL}/api/marksheet/download?${params.toString()}`, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Download failed');
          }
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `marksheets.${downloadFormat}`;
          a.click();
          window.URL.revokeObjectURL(url);
      } catch (error) {
          addToast(error.message || 'Download failed.', 'error');
      } finally {
          setDownloading(false);
      }
  };

  if (!isAdminOrTeacher) {
      return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl animate-fade-in">
             <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-2xl text-primary-600"><Award size={32} /></div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Academic <span className="text-primary-600">Performance</span></h1>
                    <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mt-1">Registry Results Node • Private Session</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div>
                    <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Exam Filter</label>
                    <select value={studentFilters.exam} onChange={(e) => setStudentFilters(p => ({ ...p, exam: e.target.value }))} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                        <option value="all">All Exams</option>
                        {examOptions.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Semester Filter</label>
                    <select value={studentFilters.semester} onChange={(e) => setStudentFilters(p => ({ ...p, semester: e.target.value }))} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                        <option value="all">All Semesters</option>
                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Academic Year</label>
                    <select value={studentFilters.academicYear} onChange={(e) => setStudentFilters(p => ({ ...p, academicYear: e.target.value }))} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                        <option value="all">All Years</option>
                        {academicYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            <button onClick={fetchMyResults} className="mb-8 px-6 py-2 bg-primary-600 text-white rounded-xl font-black uppercase text-[0.65rem] tracking-widest">Apply Filters</button>

            {loadingMyMarks ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Spinner size="lg" />
                    <p className="text-xs font-black uppercase tracking-widest text-gray-400 animate-pulse">Syncing logic grids...</p>
                </div>
            ) : myMarksheets.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {myMarksheets.map((m, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-gray-800 dark:text-gray-100">{m.exam} Exam</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Semester {m.semester} Logic Stream</p>
                                    {m.examDate && (
                                        <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mt-2">Exam Date: {m.examDate}</p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-black text-primary-600 tracking-tighter">{m.percentage}%</p>
                                    <span className="px-3 py-1 bg-primary-600 text-white rounded-lg text-xs font-black uppercase">Grade: {m.grade}</span>
                                    {m.status && (
                                        <div className="mt-2 text-[0.6rem] font-black uppercase tracking-widest text-gray-400">Status: {m.status}</div>
                                    )}
                                </div>
                             </div>
                             <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[0.6rem] font-black uppercase text-gray-400 border-b dark:border-gray-800"><th className="pb-3">Module</th><th className="pb-3 text-center">Logic Pulse</th><th className="pb-3 text-right">Capacity</th></tr>
                                    </thead>
                                    <tbody className="text-sm font-bold">
                                        {m.marks.map((s, i) => (
                                            <tr key={i} className="border-b last:border-0 dark:border-gray-800"><td className="py-3 text-gray-600 dark:text-gray-300">{s.subjectName}</td><td className="py-3 text-center">{s.marksObtained}</td><td className="py-3 text-right text-gray-400">{s.maxMarks}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-[3rem] border-gray-100 dark:border-gray-800">
                    <Trophy size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-sm font-black uppercase tracking-[0.3em] text-gray-400">Registry records for this node are empty.</p>
                </div>
            )}
        </div>
      )
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl animate-fade-in">
      <h1 className="text-3xl font-black text-gray-800 dark:text-white uppercase tracking-tighter mb-8">Registry Hub: <span className="text-primary-600">Marksheet Entry</span></h1>
      <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 mb-10 p-8 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Search Student</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Name / Reg No" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Stream Filter</label>
                            <select value={filterStream} onChange={(e) => setFilterStream(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                                <option value="all">All Streams</option>
                                {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Semester Filter</label>
                            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                                <option value="all">All Semesters</option>
                                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Section Filter</label>
                            <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                                <option value="all">All Sections</option>
                                {sectionOptions.map(s => <option key={s} value={s}>Section {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Academic Year</label>
                            <select value={filterAcademicYear} onChange={(e) => setFilterAcademicYear(e.target.value)} className="w-full p-3 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                                <option value="all">All Years</option>
                                {academicYearOptions.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label htmlFor="student-select" className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Select Student Node</label>
            <select id="student-select" value={selectedStudentId} onChange={e => { setSelectedStudentId(e.target.value); }} className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-500/10 font-bold text-sm">
              <option value="">-- Identity Search --</option>
                            {filteredStudents.map(s => <option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.stream})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="exam-select" className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Logic Cycle (Exam)</label>
                        <select id="exam-select" value={selectedExam} onChange={e => {
                                const value = e.target.value;
                                setSelectedExam(value);
                                if (value !== 'custom') {
                                        const selected = examList.find(ex => ex.name === value);
                                        setSelectedExamId(selected?._id || '');
                                        setExamDate(selected?.startDate || '');
                                } else {
                                        setSelectedExamId('');
                                }
                        }} className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner focus:ring-4 focus:ring-primary-500/10 font-bold text-sm">
              <option value="">-- Cycle Selection --</option>
                            {examList.map(ex => <option key={ex._id} value={ex.name}>{ex.name}</option>)}
                            {examOptions.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                            <option value="custom">Custom Exam</option>
            </select>
          </div>
                    {selectedExam === 'custom' && (
                        <div>
                            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Custom Exam Name</label>
                            <input value={customExamName} onChange={(e) => setCustomExamName(e.target.value)} placeholder="Surprise Test - Unit 3" className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm" />
                        </div>
                    )}
                    <div>
                        <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Exam Date</label>
                        <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm" />
                    </div>
                    <div>
                        <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm">
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>
                    </div>

                    {isAdmin && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Upload Marksheet (CSV/XLSX)</label>
                                <input type="file" accept=".csv,.xlsx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-[0.65rem] font-bold" />
                            </div>
                            <div className="flex items-center gap-3">
                                <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)} className="p-3 bg-white dark:bg-gray-900 border-0 rounded-xl text-[0.7rem] font-black uppercase shadow-inner">
                                    <option value="csv">CSV</option>
                                    <option value="xlsx">XLSX</option>
                                </select>
                                <button type="button" onClick={handleUploadMarksheets} disabled={uploading} className="flex items-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-gray-800 disabled:opacity-50">
                                    <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                                <button type="button" onClick={handleDownloadMarksheets} disabled={downloading} className="flex items-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-primary-700 disabled:opacity-50">
                                    <Download size={14} /> {downloading ? 'Downloading...' : 'Download'}
                                </button>
                            </div>
                        </div>
                    )}
        </div>

                {isAdminOrTeacher && (
                    <div className="mb-12">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600"><BookOpen size={18} /></div>
                            <h2 className="text-lg font-black uppercase tracking-tight">Analytics Snapshot</h2>
                        </div>
                        {analyticsLoading ? (
                            <div className="text-center py-10"><Spinner /></div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-4">Grade Distribution</p>
                                    <div className="space-y-2">
                                        {analytics.gradeDistribution.length === 0 ? (
                                            <p className="text-xs text-gray-400">No data.</p>
                                        ) : analytics.gradeDistribution.map((g, idx) => (
                                            <div key={idx} className="flex justify-between text-xs font-bold">
                                                <span>Grade {g.grade}</span>
                                                <span>{g.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-4">Subject Averages</p>
                                    <div className="space-y-2 max-h-48 overflow-auto pr-2">
                                        {analytics.subjectAverages.length === 0 ? (
                                            <p className="text-xs text-gray-400">No data.</p>
                                        ) : analytics.subjectAverages.map((s, idx) => (
                                            <div key={idx} className="flex justify-between text-xs font-bold">
                                                <span>{s.subject}</span>
                                                <span>{s.avgMarks}/{s.maxMarks}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800">
                                    <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 mb-4">Top Performers</p>
                                    <div className="space-y-2">
                                        {analytics.toppers.length === 0 ? (
                                            <p className="text-xs text-gray-400">No data.</p>
                                        ) : analytics.toppers.map((t, idx) => (
                                            <div key={idx} className="flex justify-between text-xs font-bold">
                                                <span>{t.student?.firstName} {t.student?.lastName}</span>
                                                <span>{t.percentage}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
        
        {selectedStudent && selectedExam && (
            <div className="animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600"><BookOpen size={20} /></div>
                    <h2 className="text-xl font-black uppercase tracking-tight">Active Node: {selectedStudent.firstName} (Sem {selectedStudent.currentSemester})</h2>
                </div>
                {loadingSubjects ? <div className="text-center py-10"><Spinner /></div> : subjects.length > 0 ? (
                <div className="space-y-4 max-w-2xl">
                    {subjects.map(subject => (
                        <div key={subject._id} className="grid grid-cols-3 items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <label className="font-bold text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300">{subject.name}</label>
                            <input 
                                type="number"
                                value={marks[subject.name] || ''}
                                onChange={(e) => handleMarkChange(subject.name, e.target.value, subject.maxMarks)}
                                placeholder="00"
                                className="p-3 bg-white dark:bg-gray-900 border-0 rounded-xl font-mono font-black text-center shadow-inner focus:ring-4 focus:ring-primary-500/10"
                                max={subject.maxMarks}
                                min="0"
                            />
                            <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">/ {subject.maxMarks} Max</span>
                        </div>
                    ))}
                </div>
                ) : <p className="text-gray-500 italic p-10 bg-gray-50 dark:bg-gray-900 rounded-3xl text-center">No modules identified for this semester cycle.</p>}

                <div className="mt-8">
                    <label className="block text-[0.65rem] font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Remarks</label>
                    <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} className="w-full p-4 bg-white dark:bg-gray-900 border-0 rounded-2xl shadow-inner font-bold text-sm" placeholder="Optional notes" />
                </div>
                
                {subjects.length > 0 && (
                <>
                    <div className="mt-12 p-8 bg-gradient-to-br from-gray-900 to-primary-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[80px] -mr-32 -mt-32"></div>
                        <h3 className="text-lg font-black uppercase tracking-tighter flex items-center mb-8 relative z-10"><Calculator size={20} className="mr-3 text-primary-400"/> Calculated Matrix</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center relative z-10">
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60 mb-2">Total Score</p>
                                <p className="text-3xl font-black tracking-tighter">{total} <span className="text-sm opacity-40">/ {subjects.reduce((a, b) => a + b.maxMarks, 0)}</span></p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60 mb-2">Efficiency</p>
                                <p className="text-3xl font-black tracking-tighter">{percentage}%</p>
                            </div>
                            <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                                <p className="text-[0.6rem] font-black uppercase tracking-widest opacity-60 mb-2">Registry Grade</p>
                                <p className="text-3xl font-black tracking-tighter text-primary-400">{getGrade(percentage)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-10">
                        <button type="submit" className="flex items-center px-12 py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary-500/30 hover:bg-primary-700 transition active:scale-95 group">
                            <Save size={18} className="mr-3 group-hover:scale-110 transition-transform" /> Commit Registry Update
                        </button>
                    </div>
                </>
                )}
            </div>
        )}
      </form>
    </div>
  );
}