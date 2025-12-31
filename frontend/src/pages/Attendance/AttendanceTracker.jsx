import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    Search, Filter, Calendar, Clock, ArrowRight, ShieldCheck, 
    Database, Zap, ChevronDown, CheckCircle, Users, BarChart3, 
    XCircle, Save, AlertTriangle, Sparkles, RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Spinner from '../../components/Spinner';

export default function AttendanceTracker() {
  const { api, user } = useAuth();
  const { addToast } = useNotification();
  
  const [activeMode, setActiveMode] = useState('LOG');
  const [streams, setStreams] = useState([]);
  const [streamSubjects, setStreamSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [hasSynced, setHasSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dailyClasses, setDailyClasses] = useState([]);

  // Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const [formData, setFormData] = useState({
      branch: '', 
      semester: '1', 
      section: 'A', 
      subject: '',
      date: new Date().toISOString().split('T')[0], 
      period: 'Period 1'
  });

  const [attendanceData, setAttendanceData] = useState({});

  // 1. Initial Load: Streams & Schedule
  useEffect(() => {
    api('/api/streams').then(setStreams).catch(console.error);
    if (user?.role === 'Teacher') {
        fetchDailySchedule();
    }
  }, [api, user]);

  // 2. Dynamic Subject Loading (Curriculum Hub Sync)
  useEffect(() => {
      const fetchSubjects = async () => {
          if (!formData.branch || !formData.semester) return;
          try {
              const data = await api(`/api/streams/${encodeURIComponent(formData.branch)}/${formData.semester}/subjects`);
              setStreamSubjects(data || []);
              if (data?.length > 0) {
                  setFormData(prev => ({ ...prev, subject: data[0].name }));
              } else {
                  setFormData(prev => ({ ...prev, subject: '' }));
              }
          } catch (err) {
              setStreamSubjects([]);
          }
      };
      fetchSubjects();
  }, [formData.branch, formData.semester, api]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
        const query = `stream=${encodeURIComponent(formData.branch || 'all')}&semester=${formData.semester || 'all'}&subject=${encodeURIComponent(formData.subject || 'all')}`;
        const data = await api(`/api/attendance/analytics?${query}`);
        setAnalytics(data);
    } catch (err) {
        addToast('Analytics fetch failed.', 'error');
    } finally {
        setAnalyticsLoading(false);
    }
  }, [api, formData.branch, formData.semester, formData.subject, addToast]);

  useEffect(() => {
    if (activeMode === 'ANALYTICS') fetchAnalytics();
  }, [activeMode, fetchAnalytics]);

  const fetchDailySchedule = async () => {
      try {
          const schedule = await api(`/api/timetable/teacher/daily-schedule?date=${formData.date}`);
          setDailyClasses(schedule);
      } catch (err) { console.error(err); }
  };

  const handleFetchStudents = async () => {
    if (!formData.branch || !formData.subject) {
        return addToast('Select Stream and Subject node first.', 'info');
    }

    setLoading(true);
    setHasSynced(false);
    try {
        // Fetch students who are currently in the selected stream and semester
        const data = await api(`/api/students/stream/${encodeURIComponent(formData.branch)}?semester=${formData.semester}`);
        
        setStudents(data);
        setHasSynced(true);

        if (data.length === 0) {
            addToast('No student nodes identified for this logic cluster.', 'info');
        } else {
            const initial = {};
            data.forEach(s => initial[s._id] = null);
            setAttendanceData(initial);
            addToast(`Registry synced: ${data.length} student nodes identified.`, 'success');
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
                subject: formData.subject,
                attendanceData
            })
        });
        addToast('Registry sequence committed successfully.', 'success');
        if (activeMode === 'ANALYTICS') fetchAnalytics();
    } catch (err) {
        addToast('Sequence transmission failure.', 'error');
    } finally {
        setSaving(false);
    }
  };

  const stats = useMemo(() => {
      const vals = Object.values(attendanceData);
      return {
          present: vals.filter(v => v === 'present').length,
          absent: vals.filter(v => v === 'absent').length,
          unmarked: vals.filter(v => v === null).length
      };
  }, [attendanceData]);

  const selectedStreamData = streams.find(s => s.name === formData.branch);

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b dark:border-gray-800 pb-6 px-2">
            <div className="flex items-center gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-3">
                        <Users className="text-primary-600 animate-float" size={32} /> Attendance Hub
                    </h1>
                    <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Sparkles size={12} className="text-cyan-400" /> AIET Registry Gateway
                    </p>
                </div>
                <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                <nav className="flex gap-2 bg-gray-100 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-inner">
                    <button 
                        onClick={() => setActiveMode('LOG')}
                        className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 ${activeMode === 'LOG' ? 'bg-white dark:bg-gray-800 shadow-xl text-primary-600 ring-1 ring-primary-500/20' : 'text-gray-500 hover:text-primary-400'}`}
                    >
                        <Zap size={14} /> Logger
                    </button>
                    <button 
                        onClick={() => setActiveMode('ANALYTICS')}
                        className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 ${activeMode === 'ANALYTICS' ? 'bg-white dark:bg-gray-800 shadow-xl text-primary-600 ring-1 ring-primary-500/20' : 'text-gray-500 hover:text-primary-400'}`}
                    >
                        <BarChart3 size={14} /> Matrix
                    </button>
                </nav>
            </div>
            <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-primary-500/5 border border-primary-500/20 rounded-2xl shadow-sm">
                <ShieldCheck className="text-primary-500 animate-pulse" size={20} />
                <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary-700">Registry Secure</span>
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
                        <p className="text-[0.6rem] font-black uppercase tracking-[0.4em] opacity-70">Define Node Parameters</p>
                    </div>
                 </div>
                 <div className="text-right relative z-10 hidden sm:block">
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.5em] opacity-50 mb-1">Authenticated Node</p>
                    <p className="font-black text-sm uppercase">{user.name}</p>
                 </div>
            </div>
            
            <div className="p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Stream Cluster</label>
                        <select 
                            value={formData.branch}
                            onChange={(e) => setFormData(p => ({...p, branch: e.target.value}))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner focus:ring-4 focus:ring-primary-500/10 transition-all"
                        >
                            <option value="">Select Stream Node</option>
                            {streams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Academic Sem</label>
                        <select 
                            value={formData.semester}
                            onChange={(e) => setFormData(p => ({...p, semester: e.target.value}))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            {selectedStreamData ? (
                                selectedStreamData.semesters.map(sem => (
                                    <option key={sem._id} value={sem.semesterNumber}>Sem {sem.semesterNumber}</option>
                                ))
                            ) : (
                                [1,2,3,4,5,6,7,8].map(sem => <option key={sem} value={sem}>{sem}</option>)
                            )}
                        </select>
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 ml-1">Learning Module (Subject)</label>
                        <select 
                            value={formData.subject}
                            onChange={(e) => setFormData(p => ({...p, subject: e.target.value}))}
                            className="w-full p-4 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase shadow-inner"
                        >
                            <option value="">Select Subject</option>
                            {streamSubjects.map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)}
                            {streamSubjects.length === 0 && <option disabled>Initialize Stream First</option>}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button 
                            onClick={activeMode === 'LOG' ? handleFetchStudents : fetchAnalytics} 
                            disabled={loading || analyticsLoading} 
                            className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.3em] hover:bg-primary-700 transition shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading || analyticsLoading ? <RefreshCw className="animate-spin mx-auto" /> : 'Run Sync'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center border-t dark:border-gray-700 pt-8 gap-6">
                    <div className="flex items-center gap-6">
                         <div className="space-y-1">
                            <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 block ml-1">Registry Date</label>
                            <input 
                                type="date" 
                                value={formData.date} 
                                onChange={(e) => setFormData(p => ({...p, date: e.target.value}))}
                                className="p-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-xl font-black text-[0.7rem] shadow-inner focus:ring-2 focus:ring-primary-500/20" 
                            />
                        </div>
                        <div className="h-10 w-[1px] bg-gray-200 dark:bg-gray-800"></div>
                        <div className="space-y-1">
                            <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400 block ml-1">Active Scheduler</label>
                            <div className="flex gap-2">
                                {dailyClasses.slice(0, 2).map((c, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-accent-500/10 text-accent-600 text-[0.6rem] font-black rounded-lg border border-accent-500/20">
                                        {c.time}: {c.subject}
                                    </span>
                                ))}
                                {dailyClasses.length === 0 && <span className="text-[0.6rem] font-bold text-gray-400 italic">No scheduled nodes found.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {activeMode === 'LOG' && (
            <div className="animate-fade-in-up">
                {loading ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl">
                        <Spinner size="lg" />
                        <p className="mt-4 font-black uppercase text-xs tracking-widest text-gray-400">Communicating with Registry Cloud...</p>
                    </div>
                ) : hasSynced && students.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-xl">
                         <Users size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                         <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Student Nodes Identified</h3>
                         <p className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2 max-w-md mx-auto">The Registry found no student entities assigned to <span className="text-primary-500">{formData.branch}</span> in Semester <span className="text-primary-500">{formData.semester}</span>.</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 p-12 animate-scale-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                            {students.map((student) => (
                                <div key={student._id} className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden group ${attendanceData[student._id] ? 'bg-white dark:bg-gray-900 border-primary-500/40 shadow-2xl scale-[1.02]' : 'bg-gray-50/50 dark:bg-gray-900/20 border-transparent hover:border-gray-200'}`}>
                                    <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-1000 ${attendanceData[student._id] === 'present' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : attendanceData[student._id] === 'absent' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-transparent'}`}></div>
                                    <div className="flex items-center gap-5 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-black text-primary-600 shadow-inner">
                                            {student.firstName[0]}{student.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase text-gray-900 dark:text-white leading-tight mb-1">{student.firstName} {student.lastName}</h4>
                                            <p className="text-[0.6rem] text-gray-400 font-bold uppercase tracking-widest">ID-{student._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={() => handleStatusChange(student._id, 'present')} 
                                            className={`flex-1 py-3 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'present' ? 'bg-cyan-500 text-white border-transparent shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-cyan-400'}`}
                                        >
                                            Present
                                        </button>
                                        <button 
                                            onClick={() => handleStatusChange(student._id, 'absent')} 
                                            className={`flex-1 py-3 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'absent' ? 'bg-red-500 text-white border-transparent shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-red-400'}`}
                                        >
                                            Absent
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-900 text-white p-10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 shadow-3xl">
                            <div className="flex items-center gap-16">
                                <div className="text-center">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Verified Nodes</p>
                                    <p className="text-4xl font-black text-cyan-400 tracking-tighter">{stats.present}</p>
                                </div>
                                <div className="text-center border-l border-white/10 pl-16">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Unaccounted Nodes</p>
                                    <p className="text-4xl font-black text-red-500 tracking-tighter">{stats.absent}</p>
                                </div>
                                <div className="text-center border-l border-white/10 pl-16">
                                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Pending Logic</p>
                                    <p className="text-4xl font-black text-yellow-500 tracking-tighter">{stats.unmarked}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleSaveAttendance} 
                                disabled={saving || stats.unmarked > 0} 
                                className="group flex items-center px-16 py-5 bg-white text-gray-900 rounded-[2rem] font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:bg-gray-600 disabled:text-gray-400"
                            >
                                {saving ? <Spinner size="sm" className="mr-3"/> : <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform" />} Commit Records
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-700 shadow-inner">
                        <p className="text-[0.8rem] font-black uppercase tracking-[0.4em] text-gray-400">Initialize sequence parameters and run sync to pull roster.</p>
                    </div>
                )}
            </div>
        )}

        {activeMode === 'ANALYTICS' && (
            <div className="space-y-8 animate-fade-in-up">
                {analyticsLoading ? (
                    <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[4rem] shadow-xl">
                        <Spinner size="lg" />
                        <p className="font-black uppercase text-[0.8rem] tracking-[0.5em] text-gray-400 animate-pulse mt-8">Analyzing Institutional Matrix...</p>
                    </div>
                ) : analytics ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-700/50">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-10">Subject Participation Matrix</h3>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.subjectStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                            <XAxis dataKey="subject" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} hide />
                                            <Tooltip cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} contentStyle={{ borderRadius: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: '900' }} />
                                            <Bar dataKey="percentage" radius={[12, 12, 0, 0]} barSize={40}>
                                                {analytics.subjectStats.map((e, i) => <Cell key={i} fill={i % 2 === 0 ? '#4f46e5' : '#06b6d4'} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: 'Total Cluster Nodes', value: analytics.summary.totalEnrolled, color: 'text-primary-600', bg: 'bg-primary-50' },
                                    { label: 'Participation Nodes', value: analytics.summary.avgAttendance + '%', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                                    { label: 'Flagged (At-Risk)', value: analytics.summary.defaulters, color: 'text-red-600', bg: 'bg-red-50' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-xl border border-gray-100 dark:border-gray-700/50 group hover:-translate-y-2 transition-all">
                                        <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
                                        <h4 className={`text-5xl font-black ${stat.color} tracking-tighter`}>{stat.value}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-3xl border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                            <div className="p-10 border-b dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row justify-between items-center gap-8">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Registry Participation Registry</h3>
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input type="text" placeholder="Identity lookup..." className="w-full pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border-0 rounded-2xl text-xs font-bold shadow-inner" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-900/80">
                                        <tr className="text-[0.65rem] font-black uppercase tracking-[0.2em] text-gray-500 border-b dark:border-gray-800">
                                            <th className="p-8 pl-12">Entity Identity</th>
                                            <th className="p-8 text-center">Score Matrix</th>
                                            <th className="p-8 text-right pr-12">Logic Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-800">
                                        {analytics.studentStats.map(row => (
                                            <tr key={row.roll} className="hover:bg-primary-50/20 transition-all">
                                                <td className="p-8 pl-12">
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white uppercase text-sm mb-1">{row.name}</p>
                                                        <p className="text-[0.6rem] text-gray-400 font-bold uppercase tracking-widest">ID-{row.roll.slice(-6).toUpperCase()}</p>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex-grow h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner p-0.5">
                                                            <div className={`h-full rounded-full transition-all duration-1000 ${row.percentage >= 75 ? 'bg-gradient-to-r from-cyan-500 to-primary-600 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-red-500'}`} style={{ width: `${row.percentage}%` }}></div>
                                                        </div>
                                                        <span className={`font-black text-base w-14 text-right tracking-tighter ${row.percentage >= 75 ? 'text-cyan-600' : 'text-red-500'}`}>{row.percentage.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right pr-12">
                                                    <span className={`px-5 py-1.5 rounded-xl text-[0.6rem] font-black uppercase tracking-widest shadow-sm ${row.percentage >= 75 ? 'bg-primary-600 text-white' : 'bg-red-500 text-white'}`}>
                                                        {row.percentage >= 75 ? 'Optimal' : 'Flagged'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-40 bg-white dark:bg-gray-800 rounded-[5rem] border-4 border-dashed border-gray-100 dark:border-gray-700/50 shadow-inner group">
                        <div className="p-12 bg-gray-50 dark:bg-gray-900/50 inline-block rounded-full mb-8 group-hover:scale-110 transition-transform">
                            <BarChart3 className="text-gray-200 dark:text-gray-800" size={80} />
                        </div>
                        <p className="text-xl font-black uppercase tracking-[0.5em] text-gray-400">Initialize filters to generate matrix</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}