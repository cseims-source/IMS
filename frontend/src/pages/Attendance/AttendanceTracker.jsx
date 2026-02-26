import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    Filter, ShieldCheck, 
    Zap, Users, BarChart3, 
    Save, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import Spinner from '../../components/Spinner';

export default function AttendanceTracker() {
  const { api, user } = useAuth();
  const { addToast } = useNotification();
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

  
  const [activeMode, setActiveMode] = useState('LOG');
  const [streams, setStreams] = useState([]);
  const [streamSubjects, setStreamSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [hasSynced, setHasSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [teacherWorkload, setTeacherWorkload] = useState([]);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [downloadFormat, setDownloadFormat] = useState('csv');

  const [formData, setFormData] = useState({
      branch: '', 
      semester: '1', 
      section: 'A', 
      subject: '',
      subjectId: '',
      date: new Date().toISOString().split('T')[0],
      academicYear: ''
  });

  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    const initRegistry = async () => {
        try {
            const streamsData = await api('/api/streams');
            setStreams(streamsData);
            if (user?.role === 'Teacher') {
                const facultyList = await api('/api/faculty');
                const myProfile = facultyList.find(f => f.email === user.email);
                if (myProfile) setTeacherWorkload(myProfile.workload || []);
            }
        } catch (err) { console.error(err); }
    };
    initRegistry();
  }, [api, user]);

  useEffect(() => {
      const fetchSubjects = async () => {
          if (!formData.branch || !formData.semester) return;
          try {
              const data = await api(`/api/streams/${encodeURIComponent(formData.branch)}/${formData.semester}/subjects`);
              setStreamSubjects(data || []);
          } catch (err) {
              setStreamSubjects([]);
          }
      };
      fetchSubjects();
  }, [formData.branch, formData.semester, api]);

  // Enforcement: Filter options based on teacher workload
  const availableStreams = useMemo(() => {
      if (user?.role !== 'Teacher') return streams;
      const assignedNames = [...new Set(teacherWorkload.map(w => w.stream))];
      return streams.filter(s => assignedNames.includes(s.name));
  }, [streams, teacherWorkload, user]);

  const availableSemesters = useMemo(() => {
      if (user?.role !== 'Teacher' || !formData.branch) {
          const stream = streams.find(s => s.name === formData.branch);
          return stream ? stream.semesters.map(s => s.semesterNumber) : [1,2,3,4,5,6,7,8];
      }
      return [...new Set(teacherWorkload.filter(w => w.stream === formData.branch).map(w => w.semester))];
  }, [streams, teacherWorkload, user, formData.branch]);

  const availableSections = useMemo(() => {
      if (user?.role !== 'Teacher' || !formData.branch) return ['A', 'B', 'C', 'D', 'E'];
      return [...new Set(teacherWorkload.filter(w => 
          w.stream === formData.branch && 
          w.semester === parseInt(formData.semester)
      ).map(w => w.section))];
  }, [teacherWorkload, user, formData.branch, formData.semester]);

  const availableSubjects = useMemo(() => {
      if (user?.role !== 'Teacher' || !formData.branch) return streamSubjects;
      const assignedSubjects = teacherWorkload.filter(w => 
          w.stream === formData.branch && 
          w.semester === parseInt(formData.semester) && 
          w.section === formData.section
      ).map(w => w.subject);
      return streamSubjects.filter(s => assignedSubjects.includes(s.name));
  }, [streamSubjects, teacherWorkload, user, formData.branch, formData.semester, formData.section]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
        const query = `stream=${encodeURIComponent(formData.branch || 'all')}&semester=${formData.semester || 'all'}&section=${formData.section}&subject=${encodeURIComponent(formData.subject || 'all')}&academicYear=${encodeURIComponent(formData.academicYear || 'all')}`;
        const data = await api(`/api/attendance/analytics?${query}`);
        setAnalytics(data);
    } catch (err) {
        addToast('Analytics fetch failed.', 'error');
    } finally {
        setAnalyticsLoading(false);
    }
  }, [api, formData.branch, formData.semester, formData.section, formData.subject, addToast]);

  useEffect(() => {
    if (activeMode === 'ANALYTICS') {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  const handleFetchStudents = async () => {
    if (!formData.branch || !formData.subject || !formData.section) {
        return addToast('Select Stream, Subject, and Section nodes.', 'info');
    }

    setLoading(true);
    setHasSynced(false);
    try {
        const data = await api(`/api/students/stream/${encodeURIComponent(formData.branch)}?semester=${formData.semester}&section=${formData.section}`);
        
        setStudents(data);
        setHasSynced(true);

        if (!formData.academicYear && data.length > 0 && data[0].academicYear) {
            setFormData(p => ({ ...p, academicYear: data[0].academicYear }));
        }

        if (data.length === 0) {
            addToast(`No students found in Section ${formData.section}.`, 'info');
        } else {
            const initial = {};
            data.forEach(s => initial[s._id] = null);
            setAttendanceData(initial);
            addToast(`Registry synced: ${data.length} students found.`, 'success');
        }
    } catch (err) {
        addToast(err.message || 'Registry sync failed.', 'error');
    } finally {
        setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
      setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    const unmarked = Object.values(attendanceData).filter(v => v === null).length;
    if (unmarked > 0) return addToast(`${unmarked} nodes remain unmarked in sequence.`, 'error');

    setSaving(true);
    try {
        await api('/api/attendance', {
            method: 'POST',
            body: JSON.stringify({
                date: formData.date,
                streamName: formData.branch,
                semester: formData.semester,
                section: formData.section,
                subject: formData.subject,
                subjectId: formData.subjectId,
                academicYear: formData.academicYear,
                attendanceData
            })
        });
        addToast('Registry sequence committed successfully.', 'success');
        if (activeMode === 'ANALYTICS') fetchAnalytics();
    } catch (err) {
        addToast(err.message || 'Sequence transmission failure.', 'error');
    } finally {
        setSaving(false);
    }
  };

  const handleUploadAttendance = async () => {
    if (!uploadFile) return addToast('Select a CSV or XLSX file to upload.', 'info');
    setUploading(true);
    try {
        const form = new FormData();
        form.append('file', uploadFile);

        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/attendance/upload`, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Upload failed');
        addToast(`Uploaded: ${data.insertedCount}, Duplicates: ${data.skippedDuplicates}, Errors: ${data.errorCount}`, 'success');
    } catch (err) {
        addToast(err.message || 'Upload failed.', 'error');
    } finally {
        setUploading(false);
    }
  };

  const handleDownloadAttendance = async () => {
    setDownloading(true);
    try {
        const params = new URLSearchParams({
            stream: formData.branch || 'all',
            academicYear: formData.academicYear || 'all',
            semester: formData.semester || 'all',
            section: formData.section || 'all',
            subject: formData.subject || 'all',
            format: downloadFormat
        });
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/attendance/download?${params.toString()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Download failed');
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `attendance.${downloadFormat === 'xlsx' ? 'xlsx' : 'csv'}`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        addToast(err.message || 'Download failed.', 'error');
    } finally {
        setDownloading(false);
    }
  };

  const stats = useMemo(() => {
      const vals = Object.values(attendanceData);
      return {
          present: vals.filter(v => v === 'present').length,
          late: vals.filter(v => v === 'late').length,
          absent: vals.filter(v => v === 'absent').length,
          unmarked: vals.filter(v => v === null).length
      };
  }, [attendanceData]);

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b dark:border-gray-800 pb-6 px-2">
            <div className="flex items-center gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-3">
                        <Users className="text-primary-600 animate-float" size={32} /> Attendance Hub
                    </h1>
                    <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Sparkles size={12} className="text-cyan-400" /> Sectional Log Gateway
                    </p>
                </div>
                <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                <nav className="flex gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                    <button onClick={() => setActiveMode('LOG')} className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 ${activeMode === 'LOG' ? 'bg-white dark:bg-gray-800 shadow-xl text-primary-600 ring-1 ring-primary-500/20' : 'text-gray-500 hover:text-primary-400'}`}>
                        <Zap size={14} /> Logger
                    </button>
                    <button onClick={() => setActiveMode('ANALYTICS')} className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 ${activeMode === 'ANALYTICS' ? 'bg-white dark:bg-gray-800 shadow-xl text-primary-600 ring-1 ring-primary-500/20' : 'text-gray-500 hover:text-primary-400'}`}>
                        <BarChart3 size={14} /> Matrix
                    </button>
                </nav>
            </div>
            <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-primary-500/5 border border-primary-500/20 rounded-2xl shadow-sm">
                <ShieldCheck className="text-primary-500 animate-pulse" size={20} />
                <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary-700">Assignments Verified</span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-8 flex items-center justify-between text-white relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32"></div>
                 <div className="relative z-10 flex items-center gap-6">
                    <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-xl border border-white/30">
                        <Filter className="text-white" size={24} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Initialize Sequence</h2>
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] opacity-70">Stream &gt; Sem &gt; Section &gt; Subject</p>
                    </div>
                 </div>
            </div>
            
            <div className="p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Stream Cluster</label>
                        <select 
                            value={formData.branch}
                            onChange={(e) => setFormData(p => ({...p, branch: e.target.value}))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            <option value="">Select Stream</option>
                            {availableStreams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Academic Sem</label>
                        <select 
                            value={formData.semester}
                            onChange={(e) => setFormData(p => ({
                                ...p,
                                semester: e.target.value
                            }))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            {availableSemesters.map(sem => (
                                <option key={sem} value={sem}>Sem {sem}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Section Node</label>
                        <select 
                            value={formData.section}
                            onChange={(e) => setFormData(p => ({...p, section: e.target.value}))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            {availableSections.map(sec => <option key={sec} value={sec}>Section {sec}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2 xl:col-span-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Learning Module</label>
                        <select 
                            value={formData.subject}
                            onChange={(e) => {
                                const selected = streamSubjects.find(s => s.name === e.target.value);
                                setFormData(p => ({...p, subject: e.target.value, subjectId: selected?._id || ''}));
                            }}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            <option value="">Select Subject</option>
                            {availableSubjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button onClick={activeMode === 'LOG' ? handleFetchStudents : fetchAnalytics} disabled={loading || analyticsLoading} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.3em] hover:bg-primary-700 transition shadow-xl active:scale-95 disabled:opacity-50">
                            {loading || analyticsLoading ? <RefreshCw className="animate-spin mx-auto" /> : 'Sync Node'}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                     <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 block ml-1">Registry Date</label>
                        <input type="date" value={formData.date} onChange={(e) => setFormData(p => ({
                            ...p,
                            date: e.target.value
                        }))} className="p-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl font-black text-[0.7rem] shadow-inner" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 block ml-1">Batch Start Year</label>
                        <input type="text" value={formData.academicYear} onChange={(e) => setFormData(p => ({...p, academicYear: e.target.value}))} className="p-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl font-black text-[0.7rem] shadow-inner" placeholder="2024-25" />
                    </div>
                </div>

                {user?.role === 'Admin' && (
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Upload Attendance</label>
                            <input type="file" accept=".csv,.xlsx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full text-[0.65rem] font-bold" />
                        </div>
                        <div className="flex items-center gap-3">
                            <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)} className="p-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl text-[0.7rem] font-black uppercase shadow-inner">
                                <option value="csv">CSV</option>
                                <option value="xlsx">XLSX</option>
                            </select>
                            <button onClick={handleUploadAttendance} disabled={uploading} className="px-6 py-3 bg-gray-900 text-white rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-gray-800 disabled:opacity-50">
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                            <button onClick={handleDownloadAttendance} disabled={downloading} className="px-6 py-3 bg-primary-600 text-white rounded-xl font-black uppercase text-[0.65rem] tracking-widest hover:bg-primary-700 disabled:opacity-50">
                                {downloading ? 'Downloading...' : 'Download'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {activeMode === 'LOG' && (
            <div className="animate-fade-in-up">
                {loading ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl">
                        <Spinner size="lg" />
                        <p className="mt-4 font-black uppercase text-xs tracking-widest text-gray-400">Pulling sectional logic...</p>
                    </div>
                ) : hasSynced && students.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                         <Layers size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                         <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Nodes in Section {formData.section}</h3>
                         <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-2">Adjust your sectional parameters above.</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl p-12 animate-scale-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {students.map((student) => (
                                <div key={student._id} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group ${attendanceData[student._id] ? 'bg-white dark:bg-gray-900 border-primary-500/40 shadow-2xl scale-[1.02]' : 'bg-gray-50/50 dark:bg-gray-900/20 border-transparent hover:border-gray-200'}`}>
                                    <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-1000 ${attendanceData[student._id] === 'present' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : attendanceData[student._id] === 'late' ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : attendanceData[student._id] === 'absent' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-transparent'}`}></div>
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-primary-600">
                                            {student.firstName[0]}{student.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase text-gray-900 dark:text-white leading-tight mb-1">{student.firstName} {student.lastName}</h4>
                                            <p className="text-[0.6rem] font-mono text-gray-400 font-bold">REG: {student.registrationNumber || '---'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={() => handleStatusChange(student._id, 'present')} className={`flex-1 py-3 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'present' ? 'bg-cyan-500 text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}>Present</button>
                                        <button onClick={() => handleStatusChange(student._id, 'late')} className={`flex-1 py-3 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'late' ? 'bg-amber-500 text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}>Late</button>
                                        <button onClick={() => handleStatusChange(student._id, 'absent')} className={`flex-1 py-3 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'absent' ? 'bg-red-500 text-white border-transparent' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}>Absent</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-900 text-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="flex items-center gap-16">
                                <div className="text-center">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Verified Nodes</p>
                                    <p className="text-4xl font-black text-cyan-400 tracking-tighter">{stats.present}</p>
                                </div>
                                <div className="text-center border-l border-white/10 pl-16">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Late Entries</p>
                                    <p className="text-4xl font-black text-amber-400 tracking-tighter">{stats.late}</p>
                                </div>
                                <div className="text-center border-l border-white/10 pl-16">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Absences</p>
                                    <p className="text-4xl font-black text-red-500 tracking-tighter">{stats.absent}</p>
                                </div>
                                <div className="text-center border-l border-white/10 pl-16">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Section {formData.section} Total</p>
                                    <p className="text-4xl font-black text-primary-400 tracking-tighter">{students.length}</p>
                                </div>
                            </div>
                            <button onClick={handleSaveAttendance} disabled={saving || stats.unmarked > 0} className="group flex items-center px-16 py-5 bg-white text-gray-900 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl disabled:bg-gray-600">
                                {saving ? <Spinner size="sm" className="mr-3"/> : <Save size={18} className="mr-3" />} Commit Section Logs
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                        <p className="text-[0.8rem] font-black uppercase tracking-[0.4em] text-gray-400">Initialize Section Logic and Run Sync to Pull roster.</p>
                    </div>
                )}
            </div>
        )}

        {activeMode === 'ANALYTICS' && (
            <div className="space-y-8 animate-fade-in-up">
                {analyticsLoading ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl">
                        <Spinner size="lg" />
                        <p className="mt-4 font-black uppercase text-xs tracking-widest text-gray-400">Loading analytics data...</p>
                    </div>
                ) : !analytics || !analytics.studentStats || analytics.studentStats.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed dark:border-gray-700">
                        <Layers size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Analytics Data Available</h3>
                        <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest mt-2">Select filters and sync to view analytics.</p>
                    </div>
                ) : (
                <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-3xl overflow-hidden">
                    <div className="p-10 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-8">
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Participation Registry (Section {formData.section})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/80">
                                <tr className="text-[0.65rem] font-black uppercase tracking-[0.25em] text-gray-500 border-b dark:border-gray-800">
                                    <th className="p-8 pl-12">Entity Identity</th>
                                    <th className="p-8">Registration No</th>
                                    <th className="p-8 text-center">Efficiency Matrix</th>
                                    <th className="p-8 text-right pr-12">Registry Node</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-800">
                                {analytics.studentStats.map(row => (
                                    <tr key={row.roll} className="hover:bg-primary-50/20 transition-all group">
                                        <td className="p-8 pl-12 font-black text-sm uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-primary-600">{row.name}</td>
                                        <td className="p-8 font-mono text-[0.65rem] text-gray-400">{row.registrationNumber || '---'}</td>
                                        <td className="p-8">
                                            <div className="flex items-center gap-6">
                                                <div className="flex-grow h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${row.percentage >= 75 ? 'bg-cyan-500' : 'bg-red-500'}`} style={{ width: `${row.percentage}%` }}></div>
                                                </div>
                                                <span className={`font-black text-sm w-12 text-right ${row.percentage >= 75 ? 'text-cyan-600' : 'text-red-500'}`}>{row.percentage.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="p-8 text-right pr-12">
                                            <span className={`px-4 py-1.5 rounded-xl text-[0.55rem] font-black uppercase tracking-widest ${row.percentage >= 75 ? 'bg-cyan-50 text-cyan-600' : 'bg-red-50 text-red-600'}`}>
                                                {row.percentage >= 75 ? 'Optimal' : 'Flagged'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                )}
            </div>
        )}
    </div>
  );
}