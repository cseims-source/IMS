import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
    Search, Filter, Calendar, Clock, ArrowRight, ShieldCheck, 
    Database, Zap, ChevronDown, CheckCircle, Users, BarChart3, 
    XCircle, Save, AlertTriangle, Sparkles
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Spinner from '../../components/Spinner';

export default function AttendanceTracker() {
  const { api } = useAuth();
  const { addToast } = useNotification();
  
  const [activeMode, setActiveMode] = useState('LOG');
  const [streams, setStreams] = useState([]);
  const [streamSubjects, setStreamSubjects] = useState([]);
  const [students, setStudents] = useState([]);
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
    fetchDailySchedule();
  }, [api]);

  // 2. Dynamic Subject Loading
  useEffect(() => {
      const fetchSubjects = async () => {
          if (!formData.branch || !formData.semester) return;
          try {
              const data = await api(`/api/streams/${encodeURIComponent(formData.branch)}/${formData.semester}/subjects`);
              setStreamSubjects(data || []);
              if (data?.length > 0 && !formData.subject) {
                  setFormData(prev => ({ ...prev, subject: data[0].name }));
              }
          } catch (err) {
              console.error("Subject fetch failed", err);
              setStreamSubjects([]);
          }
      };
      fetchSubjects();
  }, [formData.branch, formData.semester, api]);

  // 3. Analytics Data Loading
  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
        const query = `stream=${encodeURIComponent(formData.branch || 'all')}&semester=${formData.semester || 'all'}&subject=${encodeURIComponent(formData.subject || 'all')}`;
        const data = await api(`/api/attendance/analytics?${query}`);
        setAnalytics(data);
    } catch (err) {
        console.error("Analytics fetch failed", err);
    } finally {
        setAnalyticsLoading(false);
    }
  }, [api, formData.branch, formData.semester, formData.subject]);

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
        return addToast('Select Stream and Learning Module first.', 'info');
    }
    setLoading(true);
    try {
        const data = await api(`/api/students/stream/${encodeURIComponent(formData.branch)}?semester=${formData.semester}`);
        setStudents(data);
        const initial = {};
        data.forEach(s => initial[s._id] = null);
        setAttendanceData(initial);
        addToast(`Registry synced: ${data.length} student nodes identified.`, 'success');
    } catch (err) {
        addToast('Registry sync failed.', 'error');
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
        addToast('Registry Sequence successfully committed to node.', 'success');
    } catch (err) {
        addToast(err.message || 'Sequence transmission failed.', 'error');
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

  return (
    <div className="animate-fade-in space-y-6 pb-12 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b dark:border-gray-800 pb-6">
            <div className="flex items-center gap-8">
                <div className="space-y-1.5">
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none flex items-center gap-3">
                        <Users className="text-primary-600 animate-float" size={32} /> 
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-indigo-500 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>Attendance Hub</span>
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
                        <Zap size={14} className={activeMode === 'LOG' ? 'animate-pulse' : ''} /> Logger
                    </button>
                    <button 
                        onClick={() => setActiveMode('ANALYTICS')}
                        className={`px-5 py-2.5 rounded-xl text-[0.6rem] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 ${activeMode === 'ANALYTICS' ? 'bg-white dark:bg-gray-800 shadow-xl text-primary-600 ring-1 ring-primary-500/20' : 'text-gray-500 hover:text-primary-400'}`}
                    >
                        <BarChart3 size={14} className={activeMode === 'ANALYTICS' ? 'animate-bounce' : ''} /> Matrix
                    </button>
                </nav>
            </div>
            <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-primary-500/5 border border-primary-500/20 rounded-2xl shadow-sm transition-all hover:bg-primary-500/10">
                <ShieldCheck className="text-primary-500 animate-pulse" size={20} />
                <span className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-primary-700 dark:text-primary-400">Registry Secure</span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden transform transition-all duration-500 hover:shadow-primary-500/5">
            <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-6 px-10 flex items-center justify-between gap-6 relative overflow-hidden text-white animate-fade-in">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-20 -mt-20 animate-hero-glow"></div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="p-3.5 bg-white/20 rounded-2xl backdrop-blur-xl border border-white/30 shadow-lg transform hover:rotate-6 transition-transform">
                        <Filter size={22} className="text-cyan-50" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-cyan-50">Filter Node</h2>
                        <p className="text-primary-100 text-[0.6rem] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                            <Database size={12} className="text-cyan-300" /> Active Registry Query
                        </p>
                    </div>
                </div>
                <div className="text-[0.6rem] font-black uppercase tracking-[0.5em] text-cyan-100/60 flex items-center gap-3 relative z-10">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div> Live Link Active
                </div>
            </div>
            
            <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
                    {[
                        { label: 'Stream Node', name: 'branch', options: streams.map(s => s.name) },
                        { label: 'Academic Sem', name: 'semester', options: [1,2,3,4,5,6,7,8] },
                        { label: 'Section Node', name: 'section', options: ['A', 'B', 'C'] },
                        { label: 'Core Module', name: 'subject', options: streamSubjects.map(s => s.name) },
                        { label: 'Time Slot', name: 'period', options: ['Period 1', 'Period 2', 'Period 3', 'Period 4'] }
                    ].map(field => (
                        <div key={field.label} className="space-y-2">
                            <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 ml-1 flex items-center gap-2">
                                {field.label}
                            </label>
                            <div className="relative group">
                                <select 
                                    name={field.name}
                                    value={formData[field.name]}
                                    onChange={(e) => setFormData(p => ({...p, [e.target.name]: e.target.value}))}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl text-[0.7rem] font-black uppercase tracking-tight focus:ring-4 focus:ring-primary-500/10 appearance-none cursor-pointer pr-10 transition-all"
                                >
                                    <option value="" className="text-gray-400">Select</option>
                                    {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-primary-500 transition-colors" size={14} />
                            </div>
                        </div>
                    ))}
                    <div className="space-y-2">
                        <label className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-gray-400 ml-1">Registry Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500" size={16} />
                            <input 
                                type="date" 
                                name="date"
                                value={formData.date} 
                                onChange={(e) => setFormData(p => ({...p, date: e.target.value}))}
                                className="w-full p-2.5 pl-10 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 rounded-xl text-[0.7rem] font-black focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer" 
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center border-t dark:border-gray-700 pt-6 gap-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-[0.6rem] font-black uppercase tracking-[0.4em] text-indigo-500 flex items-center gap-2">
                            <Clock size={12} className="animate-spin-slow" /> Timetable Sync:
                        </span>
                        {dailyClasses.length > 0 ? dailyClasses.slice(0, 2).map((c, i) => (
                            <button 
                                key={i} 
                                onClick={() => setFormData(p => ({...p, branch: c.stream, subject: c.subject, semester: c.semester.toString()}))}
                                className="px-4 py-1.5 bg-primary-600/10 text-primary-700 dark:text-primary-300 text-[0.6rem] font-black rounded-xl border border-primary-500/30 hover:bg-primary-700 hover:text-white hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all duration-300 uppercase tracking-widest active:scale-95"
                            >
                                {c.time}: {c.subject}
                            </button>
                        )) : <span className="text-[0.55rem] font-black text-gray-300 uppercase tracking-[0.5em] italic">Scheduler Scanning...</span>}
                    </div>
                    <button 
                        onClick={handleFetchStudents} 
                        disabled={loading} 
                        className="group flex items-center px-8 py-3 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-[0.3em] hover:bg-primary-700 hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] transition shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 relative overflow-hidden"
                    >
                        {loading ? <Spinner size="sm" className="mr-3"/> : <Zap size={16} className="mr-3 group-hover:scale-125 transition-transform" />} 
                        <span className="relative z-10">Start Log Sequence</span>
                    </button>
                </div>
            </div>
        </div>

        {activeMode === 'LOG' ? (
            students.length > 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 p-10 animate-scale-in">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4 border-l-4 border-cyan-500 pl-6">
                        <div className="space-y-1.5">
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                                Roster <span className="text-primary-600">Active</span>
                            </h3>
                            <p className="text-[0.7rem] font-black text-gray-500 uppercase tracking-[0.4em]">
                                Commit protocol for <span className="text-primary-600 font-black">{formData.subject}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        {students.map((student) => (
                            <div key={student._id} className={`p-6 rounded-[2rem] border transition-all duration-500 relative group overflow-hidden ${attendanceData[student._id] ? 'bg-white dark:bg-gray-800 border-primary-500/40 shadow-2xl' : 'bg-gray-50/50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'}`}>
                                <div className={`absolute top-0 left-0 w-2 h-full transition-all duration-500 ${attendanceData[student._id] === 'present' ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : attendanceData[student._id] === 'absent' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-transparent'}`}></div>
                                
                                <div className="flex items-center gap-5 mb-6 text-gray-900 dark:text-white">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-500 ${attendanceData[student._id] === 'present' ? 'bg-cyan-100 text-cyan-700 shadow-inner' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                                        {student.firstName[0]}{student.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tight leading-none mb-1">{student.firstName} {student.lastName}</h4>
                                        <p className="text-[0.6rem] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                                            <Database size={10} className="text-primary-400" /> ID-{student._id.slice(-6).toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleStatusChange(student._id, 'present')} 
                                        className={`flex-1 py-2.5 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'present' ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-transparent shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-105 rotate-1 animate-scale-in' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-cyan-400 hover:text-cyan-500'}`}
                                    >
                                        P
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(student._id, 'absent')} 
                                        className={`flex-1 py-2.5 rounded-xl text-[0.7rem] font-black uppercase transition-all duration-500 border ${attendanceData[student._id] === 'absent' ? 'bg-gradient-to-br from-red-500 to-red-600 text-white border-transparent shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105 -rotate-1 animate-scale-in' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-red-400 hover:text-red-500'}`}
                                    >
                                        A
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-10">
                        <div className="flex items-center gap-12">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                <span className="text-[0.7rem] font-black text-gray-900 dark:text-gray-200 uppercase tracking-[0.2em]">{stats.present} Present</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                <span className="text-[0.7rem] font-black text-gray-900 dark:text-gray-200 uppercase tracking-[0.2em]">{stats.absent} Absent</span>
                            </div>
                            <div className="text-[0.7rem] font-black text-primary-600 uppercase tracking-[0.4em] animate-pulse">
                                {stats.unmarked} Node Commits Remaining
                            </div>
                        </div>
                        <button 
                            onClick={handleSaveAttendance} 
                            disabled={saving || stats.unmarked > 0} 
                            className="group flex items-center px-10 py-3.5 bg-primary-600 text-white rounded-[1.5rem] font-black uppercase text-[0.7rem] tracking-[0.3em] hover:bg-primary-700 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] transition shadow-2xl shadow-primary-500/30 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-800"
                        >
                            {saving ? <Spinner size="sm" className="mr-3"/> : <Save size={18} className="mr-3 group-hover:rotate-12 transition-transform" />} 
                            <span className="relative z-10">Commit Records</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-24 bg-white dark:bg-gray-800 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-800/50 shadow-inner group">
                    <div className="p-10 bg-primary-50 dark:bg-primary-900/20 inline-block rounded-[3rem] mb-8 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 shadow-sm">
                        <AlertTriangle className="text-primary-300 dark:text-primary-700" size={64} />
                    </div>
                    <p className="text-[0.8rem] font-black uppercase tracking-[0.5em] text-gray-400 dark:text-gray-600">Initialize sequence parameters to view roster</p>
                </div>
            )
        ) : (
            <div className="space-y-8 animate-fade-in-up">
                {analyticsLoading ? (
                    <div className="text-center py-24 flex flex-col items-center gap-6 bg-white dark:bg-gray-800 rounded-[3rem] shadow-xl">
                        <Spinner size="lg" />
                        <p className="font-black uppercase text-[0.8rem] tracking-[0.5em] text-gray-400 animate-pulse">Aggregating Matrix Nodes...</p>
                    </div>
                ) : analytics ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700/50">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-10">Subject Participation Matrix</h3>
                                <div className="h-[320px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.subjectStats}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" className="dark:stroke-gray-700" />
                                            <XAxis dataKey="subject" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis domain={[0, 100]} fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                cursor={{fill: 'rgba(79, 70, 229, 0.05)'}} 
                                                contentStyle={{ borderRadius: '1.5rem', border: 'none', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', fontSize: '11px', fontWeight: '900' }} 
                                            />
                                            <Bar dataKey="percentage" radius={[12, 12, 0, 0]} barSize={40}>
                                                {analytics.subjectStats.map((e, i) => <Cell key={i} fill={i % 2 === 0 ? '#4f46e5' : '#06b6d4'} className="transition-all hover:opacity-80" />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { label: 'Total Enrolled Nodes', value: analytics.summary.totalEnrolled, color: 'text-primary-600', icon: <Users />, bg: 'bg-primary-50/50' },
                                    { label: 'Node Participation', value: analytics.summary.avgAttendance + '%', color: 'text-cyan-600', icon: <BarChart3 />, bg: 'bg-cyan-50/50' },
                                    { label: 'Defaulter Nodes', value: analytics.summary.defaulters, color: 'text-red-500', icon: <XCircle />, bg: 'bg-red-50/50' }
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700/50 flex items-center justify-between group hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
                                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                        <div className="relative z-10">
                                            <p className="text-[0.65rem] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                                            <p className={`text-4xl font-black ${stat.color} tracking-tighter`}>{stat.value}</p>
                                        </div>
                                        <div className={`p-4 ${stat.bg} dark:bg-gray-900 rounded-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 relative z-10 shadow-sm`}>
                                            {React.cloneElement(stat.icon, { size: 28, className: stat.color })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-slide-up">
                            <div className="p-8 border-b dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/50 dark:bg-gray-900/20">
                                <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Performance Registry Matrix</h3>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                                    <input type="text" placeholder="Identity lookup..." className="pl-12 pr-6 py-3 bg-white dark:bg-gray-900 border-0 rounded-2xl text-[0.7rem] font-black uppercase w-64 shadow-xl focus:ring-4 focus:ring-primary-500/10" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                                        <tr className="text-[0.7rem] font-black uppercase tracking-[0.3em] text-gray-600 dark:text-gray-400">
                                            <th className="p-6 pl-10">Student Node Identity</th>
                                            <th className="p-6 text-gray-700 dark:text-gray-300">Logged Sessions</th>
                                            <th className="p-6 text-gray-700 dark:text-gray-300">Participation Score</th>
                                            <th className="p-6 pr-10 text-gray-700 dark:text-gray-300">Logic Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-[0.75rem]">
                                        {analytics.studentStats.map(row => (
                                            <tr key={row.roll} className="border-b dark:border-gray-700/50 hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-all group">
                                                <td className="p-6 pl-10">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center font-black text-primary-600 uppercase text-xs shadow-inner">
                                                            {row.name.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-1">{row.name}</p>
                                                            <p className="text-[0.6rem] text-gray-500 font-black uppercase tracking-widest flex items-center gap-2">
                                                                <Database size={10} className="text-primary-300" /> UID-{row.roll.slice(-4).toUpperCase()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-6 font-black text-gray-800 dark:text-gray-200 text-base">{row.present} <span className="text-gray-400 font-medium">/ {row.total}</span></td>
                                                <td className="p-6">
                                                    <div className="flex items-center gap-5">
                                                        <div className="flex-grow w-32 h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner p-0.5">
                                                            <div className={`h-full rounded-full transition-all duration-1000 ${row.percentage >= 75 ? 'bg-gradient-to-r from-cyan-500 to-primary-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'bg-red-500'}`} style={{ width: `${row.percentage}%` }}></div>
                                                        </div>
                                                        <span className={`font-black text-sm w-12 text-right ${row.percentage >= 75 ? 'text-primary-600' : 'text-red-500'}`}>{row.percentage.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-6 pr-10">
                                                    <span className={`px-4 py-1.5 rounded-xl text-[0.65rem] font-black uppercase tracking-[0.2em] shadow-sm ${row.percentage >= 75 ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20' : 'bg-red-500/10 text-red-600 border border-red-500/20'}`}>
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
                    <div className="text-center py-32 bg-white dark:bg-gray-800 rounded-[4rem] border-2 border-dashed border-gray-100 dark:border-gray-800/50 shadow-inner">
                        <div className="mb-8 p-10 bg-primary-50 dark:bg-primary-900/20 inline-block rounded-full">
                            <BarChart3 className="text-primary-200 dark:text-primary-800" size={80} />
                        </div>
                        <p className="text-[0.9rem] font-black uppercase tracking-[0.6em] text-gray-500 dark:text-gray-400">Initialize sequence parameters to generate matrix</p>
                    </div>
                )}
            </div>
        )}
    </div>
  );
}
