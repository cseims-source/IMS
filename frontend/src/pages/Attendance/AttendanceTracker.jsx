import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, XCircle, User, BarChart2, List, Filter, 
  Download, Calendar, Clock, Sparkles, Loader2, 
  CalendarCheck, ArrowRight 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/dateFormatter';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const today = new Date().toISOString().split('T')[0];

const TabButton = ({ active, onClick, children, icon }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 transform active:scale-95 ${
            active 
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' 
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-transparent'
        }`}
    >
        {icon && <span className="mr-2">{icon}</span>}
        {children}
    </button>
);

export default function AttendanceTracker() {
  const [activeTab, setActiveTab] = useState('mark'); // 'mark' or 'analytics'
  const [searchParams, setSearchParams] = useSearchParams();
  const [streams, setStreams] = useState([]);
  
  // Selection States
  const [selectedStream, setSelectedStream] = useState(searchParams.get('stream') || '');
  const [selectedSemester, setSelectedSemester] = useState(searchParams.get('semester') || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || today);
  
  // Data States
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Analytics States
  const [dateRange, setDateRange] = useState({ start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], end: today });
  const [analyticsData, setAnalyticsData] = useState({ studentStats: [], subjectStats: [] });
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Teacher Specific States
  const [teacherSchedule, setTeacherSchedule] = useState([]);
  const [teacherProfile, setTeacherProfile] = useState(null);

  const { api, user } = useAuth();
  const { addToast } = useNotification();
  const isTeacher = user?.role === 'Teacher';

  // 0. Fetch Teacher Profile (for assigned subjects restriction)
  useEffect(() => {
      if (isTeacher) {
          const fetchProfile = async () => {
              try {
                  const allFaculty = await api('/api/faculty');
                  const me = allFaculty.find(f => f._id === user.profileId);
                  setTeacherProfile(me);
              } catch (err) {
                  console.error("Failed to fetch teacher profile details", err);
              }
          };
          fetchProfile();
      }
  }, [isTeacher, api, user]);

  // 1. Initial Load: Get Streams
  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const data = await api('/api/streams');
        setStreams(data);
        if (data.length > 0 && !selectedStream) {
          setSelectedStream(data[0].name);
        }
      } catch (error) {
        console.error("Failed to fetch streams", error);
      }
    };
    fetchStreams();
  }, [api, selectedStream]);
  
  const selectedStreamData = useMemo(() => streams.find(s => s.name === selectedStream), [streams, selectedStream]);

  // 1.5 Fetch Teacher's Schedule for the selected date
  useEffect(() => {
      if (isTeacher && selectedDate && activeTab === 'mark') {
          const fetchSchedule = async () => {
              try {
                  const data = await api(`/api/timetable/teacher/daily-schedule?date=${selectedDate}`);
                  setTeacherSchedule(data);
              } catch (error) {
                  console.error("Failed to fetch teacher schedule", error);
              }
          };
          fetchSchedule();
      }
  }, [isTeacher, selectedDate, activeTab, api]);

  // 2. Stream Change: Reset/Set Semester
  useEffect(() => {
    if (selectedStreamData && !selectedStreamData.semesters.some(s => s.semesterNumber.toString() === selectedSemester)) {
        if(selectedStreamData.semesters.length > 0) {
            setSelectedSemester(selectedStreamData.semesters[0].semesterNumber.toString());
        } else {
            setSelectedSemester('');
        }
    }
  }, [selectedStreamData, selectedSemester]);

  // 3. Fetch Subjects based on Stream & Semester
  useEffect(() => {
      if (selectedStream && selectedSemester) {
          const fetchSubjects = async () => {
              try {
                  const data = await api(`/api/streams/${encodeURIComponent(selectedStream)}/${selectedSemester}/subjects`);
                  setAvailableSubjects(data);
                  if (data.length > 0) {
                      if (isTeacher && teacherProfile?.assignedSubjects?.length > 0) {
                          const validSubject = data.find(s => teacherProfile.assignedSubjects.includes(s.name));
                          setSelectedSubject(validSubject ? validSubject.name : data[0].name);
                      } else {
                          setSelectedSubject(data[0].name);
                      }
                  } else {
                      setSelectedSubject('');
                  }
              } catch (error) {
                  console.error("Failed to fetch subjects", error);
              }
          };
          fetchSubjects();
      }
  }, [selectedStream, selectedSemester, api, isTeacher, teacherProfile]);

  // 4. Update URL params
  useEffect(() => {
    const params = {};
    if (selectedStream) params.stream = selectedStream;
    if (selectedSemester) params.semester = selectedSemester;
    if (selectedDate) params.date = selectedDate;
    setSearchParams(params, { replace: true });
  }, [selectedStream, selectedSemester, selectedDate, setSearchParams]);

  // 5. MARK TAB: Fetch Students & Existing Attendance
  useEffect(() => {
    if (activeTab !== 'mark' || !selectedStream || !selectedSemester || !selectedDate || !selectedSubject) return;
    
    const fetchStudentsAndAttendance = async () => {
      setLoading(true);
      try {
        // Updated to include semester filter in student fetch
        const studentData = await api(`/api/students/stream/${encodeURIComponent(selectedStream)}?semester=${selectedSemester}`);
        setStudents(studentData);

        const attendanceData = await api(`/api/attendance/${encodeURIComponent(selectedStream)}/${selectedDate}?subject=${encodeURIComponent(selectedSubject)}&semester=${selectedSemester}`);
        
        const newAttendance = {};
        if (attendanceData) {
            attendanceData.forEach(record => {
                if (record.student && record.student._id) {
                    newAttendance[record.student._id] = record.status;
                }
            });
        }
        setAttendance(newAttendance);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setStudents([]);
        setAttendance({});
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsAndAttendance();
  }, [selectedStream, selectedSemester, selectedDate, selectedSubject, activeTab, api]);

  // 6. ANALYTICS TAB: Fetch Reports
  useEffect(() => {
      if (activeTab !== 'analytics' || !selectedStream || !selectedSemester) return;

      const fetchAnalytics = async () => {
          setAnalyticsLoading(true);
          try {
              const query = new URLSearchParams({
                  stream: selectedStream,
                  semester: selectedSemester,
                  subject: selectedSubject || 'All',
                  startDate: dateRange.start,
                  endDate: dateRange.end
              }).toString();

              const data = await api(`/api/attendance/analytics?${query}`);
              setAnalyticsData(data);
          } catch (error) {
              console.error("Failed to fetch analytics", error);
          } finally {
              setAnalyticsLoading(false);
          }
      };
      fetchAnalytics();
  }, [activeTab, selectedStream, selectedSemester, selectedSubject, dateRange, api]);


  // Handlers
  const handleAttendanceChange = (studentId, status) => {
    setAttendance(prev => ({
        ...prev,
        [studentId]: prev[studentId] === status ? null : status,
    }));
  };

  const markAll = (status) => {
    const newAttendance = {};
    students.forEach(student => {
        newAttendance[student._id] = status;
    });
    setAttendance(newAttendance);
  }

  const handleSave = async () => {
    if (!selectedSubject) {
        addToast("Please select a subject first.", "error");
        return;
    }
    try {
        await api('/api/attendance', {
            method: 'POST',
            body: JSON.stringify({
                date: selectedDate,
                streamName: selectedStream,
                semester: selectedSemester,
                subject: selectedSubject,
                attendanceData: attendance
            })
        });
        addToast("Attendance saved successfully!", "success");
    } catch (error) {
        console.error("Save error:", error);
        addToast("Failed to save attendance.", "error");
    }
  }

  const handleScheduleClick = (cls) => {
      setSelectedStream(cls.stream);
      setSelectedSemester(cls.semester.toString());
      setSelectedSubject(cls.subject);
  };

  const attendanceSummary = useMemo(() => {
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const unmarked = students.length - present - absent;
    const leaves = Object.values(attendance).filter(s => s === 'leave').length;
    return { present, absent, unmarked, leaves };
  }, [attendance, students]);

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap justify-between items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/30 gap-4">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <CalendarCheck className="text-primary-600" /> Attendance <span className="text-primary-600">Hub</span>
            </h1>
            <div className="flex gap-2">
                <TabButton active={activeTab === 'mark'} onClick={() => setActiveTab('mark')} icon={<CheckCircle size={18}/>}>Take Attendance</TabButton>
                <TabButton active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<BarChart2 size={18}/>}>View Analytics</TabButton>
            </div>
        </div>

        {/* --- COMMON FILTERS --- */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50">
            <div className="flex flex-wrap items-end gap-6">
                {activeTab === 'mark' ? (
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={14}/> Target Date</label>
                        <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold" />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">From</label>
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold" />
                        </div>
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">To</label>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold" />
                        </div>
                    </>
                )}

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Academic Stream</label>
                    <select value={selectedStream} onChange={e => setSelectedStream(e.target.value)} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold">
                        {streams.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Semester</label>
                    <select value={selectedSemester} onChange={e => setSelectedSemester(e.target.value)} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold" disabled={!selectedStreamData}>
                        {selectedStreamData?.semesters.map(s => <option key={s._id} value={s.semesterNumber}>{s.semesterNumber}</option>)}
                    </select>
                </div>
                <div className="flex-[2] min-w-[250px]">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2"><List size={14}/> Subject Allocation</label>
                    <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-3 border-0 bg-gray-50 dark:bg-gray-900 rounded-2xl focus:ring-2 focus:ring-primary-500 font-bold">
                        {activeTab === 'analytics' && <option value="All">All Subjects (Aggregate)</option>}
                        {availableSubjects
                            .filter(s => {
                                if (activeTab === 'mark' && isTeacher && teacherProfile?.assignedSubjects?.length > 0) {
                                    return teacherProfile.assignedSubjects.includes(s.name);
                                }
                                return true;
                            })
                            .map(s => <option key={s._id} value={s.name}>{s.name} ({s.code})</option>)
                        }
                    </select>
                </div>
            </div>
            
            {/* TEACHER SCHEDULE SECTION */}
            {isTeacher && activeTab === 'mark' && (
                <div className="mt-8 pt-8 border-t dark:border-gray-700/50">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                        <Sparkles size={16} className="text-primary-500 animate-pulse"/> Suggested from your Daily Timetable
                    </h3>
                    {teacherSchedule.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                            {teacherSchedule.map((cls, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleScheduleClick(cls)}
                                    className={`flex items-center p-4 rounded-[1.5rem] border-2 transition-all duration-500 transform hover:-translate-y-1 ${
                                        selectedStream === cls.stream && selectedSemester === cls.semester.toString() && selectedSubject === cls.subject
                                        ? 'bg-primary-600 border-primary-500 text-white shadow-xl shadow-primary-500/20'
                                        : 'bg-white border-gray-100 hover:border-primary-300 dark:bg-gray-900 dark:border-gray-800'
                                    }`}
                                >
                                    <div className="text-left">
                                        <div className={`text-[0.6rem] font-black uppercase tracking-widest mb-1 ${selectedStream === cls.stream && selectedSemester === cls.semester.toString() && selectedSubject === cls.subject ? 'text-primary-100' : 'text-primary-600'}`}>{cls.time}</div>
                                        <div className="text-sm font-black">{cls.subject}</div>
                                        <div className={`text-[0.7rem] font-bold opacity-70`}>{cls.stream} • Sem {cls.semester}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed dark:border-gray-800 text-center">
                            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No classes synced for this date</p>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* --- MARK ATTENDANCE CONTENT --- */}
        {activeTab === 'mark' && (
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>

                <div className="flex flex-wrap justify-between items-center mb-8 gap-4 relative z-10">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                            Active Student Roster
                        </h2>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                            Filtering for {selectedStream} • Semester {selectedSemester}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => markAll('present')} className="px-5 py-2.5 bg-green-500/10 text-green-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300">Mark All Present</button>
                        <button onClick={() => markAll('absent')} className="px-5 py-2.5 bg-red-500/10 text-red-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:text-white transition-all duration-300">Mark All Absent</button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1,2,3,4,5,6,7,8].map(i => (
                            <div key={i} className="h-44 bg-gray-100 dark:bg-gray-900 rounded-3xl animate-pulse"></div>
                        ))}
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border-2 border-dashed dark:border-gray-800">
                        <div className="flex flex-col items-center gap-4">
                            <User size={48} className="text-gray-300" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest">No students found in {selectedStream} Sem {selectedSemester}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                        {students.map((student, idx) => {
                            const status = attendance[student._id];
                            let cardClass = 'bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800';
                            let glowClass = '';

                            if (status === 'present') {
                                cardClass = 'bg-green-50/50 border-green-500/50 dark:bg-green-950/20 dark:border-green-500/30';
                                glowClass = 'shadow-[0_0_20px_rgba(34,197,94,0.15)]';
                            }
                            if (status === 'absent') {
                                cardClass = 'bg-red-50/50 border-red-500/50 dark:bg-red-950/20 dark:border-red-500/30';
                                glowClass = 'shadow-[0_0_20px_rgba(239,68,68,0.15)]';
                            }
                            if (status === 'leave') {
                                cardClass = 'bg-yellow-50/50 border-yellow-500/50 dark:bg-yellow-950/20 dark:border-yellow-500/30';
                                glowClass = 'shadow-[0_0_20px_rgba(234,179,8,0.15)]';
                            }

                            return (
                                <div 
                                    key={student._id} 
                                    className={`p-6 border-2 rounded-[2rem] transition-all duration-500 animate-fade-in-up ${cardClass} ${glowClass}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-center mb-5">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-tr from-primary-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition duration-500"></div>
                                            <div className="relative h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-inner">
                                                <img src={student.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${student.firstName}`} alt={student.firstName} className="h-full w-full object-cover"/>
                                            </div>
                                        </div>
                                        <div className="ml-4 overflow-hidden">
                                            <p className="font-black text-gray-900 dark:text-white truncate text-base leading-tight">{student.firstName} {student.lastName}</p>
                                            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {student._id.slice(-6).toUpperCase()}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleAttendanceChange(student._id, 'present')} className={`flex items-center justify-center py-2 text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${status === 'present' ? 'bg-green-600 text-white shadow-lg shadow-green-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-green-50 dark:hover:bg-green-900/30'}`}>
                                            P
                                        </button>
                                        <button onClick={() => handleAttendanceChange(student._id, 'absent')} className={`flex items-center justify-center py-2 text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${status === 'absent' ? 'bg-red-600 text-white shadow-lg shadow-red-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                                            A
                                        </button>
                                        <button onClick={() => handleAttendanceChange(student._id, 'leave')} className={`flex items-center justify-center py-2 text-[0.65rem] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${status === 'leave' ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/40' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'}`}>
                                            L
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="mt-12 pt-8 border-t-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="flex flex-wrap gap-6 text-[0.7rem] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-green-600">{attendanceSummary.present} Present</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className="text-red-600">{attendanceSummary.absent} Absent</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span className="text-yellow-600">{attendanceSummary.leaves} Leave</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                             <span className="opacity-50">{attendanceSummary.unmarked} Unmarked</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave} 
                        disabled={students.length === 0}
                        className="w-full md:w-auto px-12 py-4 bg-primary-600 text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-primary-700 shadow-2xl shadow-primary-500/40 transition-all duration-300 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center gap-3"
                    >
                        Save Session Record <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform"/>
                    </button>
                </div>
            </div>
        )}

        {/* --- ANALYTICS TAB CONTENT --- */}
        {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700/50">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter">Subject Attendance Matrix</h3>
                        <div className="h-72">
                            {analyticsData.subjectStats.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsData.subjectStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="subject" fontSize={10} axisLine={false} tickLine={false} fontStyle="bold" />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} fontSize={10} />
                                        <Tooltip cursor={{ fill: 'rgba(34,197,94,0.05)' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                        <Bar dataKey="percentage" fill="#22c55e" name="Attendance %" radius={[10, 10, 0, 0]}>
                                            {analyticsData.subjectStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.percentage < 75 ? '#ef4444' : '#22c55e'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                                    <BarChart2 size={48} className="opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-xs">Awaiting data matrix...</p>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-primary-600 p-8 rounded-[2.5rem] shadow-xl text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32"></div>
                        <h3 className="text-lg font-black mb-8 uppercase tracking-tighter relative z-10 flex items-center gap-3">
                            <Sparkles size={20}/> Insights Overview
                        </h3>
                        <div className="grid grid-cols-2 gap-6 relative z-10">
                            <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20">
                                <p className="text-4xl font-black mb-1">{analyticsData.studentStats.length}</p>
                                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] opacity-70">Enrolled Minds</p>
                            </div>
                            <div className="p-6 bg-red-500/20 backdrop-blur-md rounded-3xl border border-red-400/30">
                                <p className="text-4xl font-black mb-1 text-red-200">
                                    {analyticsData.studentStats.filter(s => s.percentage < 75).length}
                                </p>
                                <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] opacity-70">Defaulter Alert</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Table */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700/50">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
                        <List size={20} className="text-primary-500" /> Detailed Performance Registry
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-gray-400 text-[0.65rem] font-black uppercase tracking-widest">
                                    <th className="px-6 py-4">Intellectual Profile</th>
                                    <th className="px-6 py-4 text-center">Sessions</th>
                                    <th className="px-6 py-4 text-center">Presence</th>
                                    <th className="px-6 py-4 text-center">Excused</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analyticsLoading ? (
                                    <tr><td colSpan="6" className="p-12 text-center">
                                        <Loader2 className="animate-spin h-10 w-10 mx-auto text-primary-500" />
                                    </td></tr>
                                ) : analyticsData.studentStats.length === 0 ? (
                                    <tr><td colSpan="6" className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest">No matching registry records</td></tr>
                                ) : (
                                    analyticsData.studentStats.map(stat => (
                                        <tr key={stat._id} className="bg-gray-50/50 dark:bg-gray-900/50 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-300 transform hover:scale-[1.01]">
                                            <td className="px-6 py-4 rounded-l-2xl">
                                                <div className="font-black text-gray-900 dark:text-white">{stat.name}</div>
                                                <div className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest">UID: {stat._id.slice(-6)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-600 dark:text-gray-400">{stat.totalClasses}</td>
                                            <td className="px-6 py-4 text-center font-bold text-green-600">{stat.presentClasses}</td>
                                            <td className="px-6 py-4 text-center font-bold text-yellow-600">{stat.leaveClasses || 0}</td>
                                            <td className="px-6 py-4 text-center">
                                                <div className={`text-lg font-black ${stat.percentage >= 75 ? 'text-primary-600' : 'text-red-600'}`}>
                                                    {stat.percentage.toFixed(1)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center rounded-r-2xl">
                                                <span className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-full ${stat.percentage >= 75 ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                    {stat.percentage >= 75 ? 'Exemplary' : 'Warning'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}