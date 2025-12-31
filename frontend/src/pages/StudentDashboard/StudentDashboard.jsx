import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, BookOpen, GraduationCap, BarChart2, CheckCircle, Calendar, DollarSign, ClipboardList, Clock, ArrowRight, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/dateFormatter';
import AcademicAdvisor from './AcademicAdvisor.jsx';

const Widget = ({ title, icon, children, linkTo, linkText }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg h-full flex flex-col">
        <div className="flex items-center justify-between text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
            <div className="flex items-center">
                {React.cloneElement(icon, { className: "mr-3 text-primary-500"})}
                {title}
            </div>
        </div>
        <div className="flex-grow space-y-3">{children}</div>
        {linkTo && (
            <div className="mt-4 border-t dark:border-gray-700 pt-3">
                <Link to={linkTo} className="flex items-center justify-end text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                    {linkText} <ArrowRight size={16} className="ml-1" />
                </Link>
            </div>
        )}
    </div>
);

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, api } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const [sumData, attData] = await Promise.all([
            api('/api/dashboard/student-summary'),
            api('/api/attendance/my-records')
        ]);
        setSummary(sumData);
        setAttendance(attData);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [api]);
  
  const attStats = useMemo(() => {
    if (!attendance.length) return { perc: 0, status: 'Registry Silence' };
    const present = attendance.filter(a => a.status === 'present').length;
    const perc = ((present / attendance.length) * 100).toFixed(0);
    return { perc, status: perc >= 75 ? 'Optimal' : 'Flagged' };
  }, [attendance]);

  const photoUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-xl border border-white/20 dark:border-gray-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] -mr-32 -mt-32" />
            <div className="flex flex-col sm:flex-row items-center relative z-10">
                <img src={photoUrl} alt="Student" className="w-24 h-24 rounded-[2rem] mr-0 sm:mr-8 mb-4 sm:mb-0 border-4 border-white dark:border-gray-800 shadow-2xl group-hover:scale-105 transition-transform duration-700" />
                <div className="text-center sm:text-left">
                    <p className="text-[0.65rem] font-black text-primary-500 uppercase tracking-widest mb-1.5">Authenticated Academic Node</p>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Welcome back, {user.name.split(' ')[0]}</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.4em] mt-3 text-[0.65rem]">Node Cycle: 2025-26 // Infrastructure: Online</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Participation Pulse Widget */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                 <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 ${attStats.perc >= 75 ? 'bg-cyan-500' : 'bg-red-500'}`}></div>
                 <div className="flex justify-between items-start mb-6">
                     <div>
                        <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest mb-1">Participation Pulse</p>
                        <h3 className={`text-4xl font-black tracking-tighter ${attStats.perc >= 75 ? 'text-cyan-600' : 'text-red-500'}`}>{attStats.perc}%</h3>
                     </div>
                     <div className="p-3.5 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner group-hover:rotate-12 transition-transform">
                        <Activity size={22} className="text-primary-500" />
                     </div>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest shadow-sm ${attStats.perc >= 75 ? 'bg-cyan-50 text-cyan-600 border border-cyan-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    Logic: {attStats.status}
                 </span>
            </div>

            {/* Today's Timetable Snippet */}
            <div className="lg:col-span-1">
                {loading ? <div className="h-40 bg-white dark:bg-gray-800 rounded-[2.5rem] animate-pulse"></div> : (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 h-full">
                         <div className="flex items-center justify-between mb-6">
                            <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">Active Sequence</p>
                            <Clock size={16} className="text-primary-400" />
                         </div>
                         {summary?.scheduleToday?.length > 0 ? (
                            <div className="space-y-4">
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase leading-none">{summary.scheduleToday[0].subject}</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></div>
                                    <span className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">Starts at {summary.scheduleToday[0].time}</span>
                                </div>
                            </div>
                         ) : <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-[0.3em] italic">No active sequences today</p>}
                         <Link to="/app/timetable" className="mt-8 block text-[0.6rem] font-black text-primary-600 uppercase tracking-widest hover:translate-x-1 transition-transform">Full Scheduler <ArrowRight size={12} className="inline ml-1"/></Link>
                    </div>
                )}
            </div>

            {/* Pending Fees Shortcode */}
            <div className="bg-gradient-to-br from-gray-900 to-primary-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
                 <p className="text-[0.6rem] font-black uppercase tracking-widest text-primary-400 mb-2">Registry Ledger</p>
                 <h4 className="text-3xl font-black tracking-tighter mb-4">₹{summary?.pendingFees?.reduce((acc, f) => acc + f.amount, 0).toLocaleString() || '0'}</h4>
                 <p className="text-[0.55rem] font-bold uppercase tracking-widest text-primary-200 opacity-60">Pending Logic Verification</p>
                 <Link to="/app/my-profile" className="absolute bottom-8 right-8 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all"><Zap size={18} /></Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-widest">Registry Notices</p>
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                    {summary?.latestNotices?.slice(0, 1).map(n => (
                        <div key={n._id}>
                             <p className="text-xs font-black text-gray-900 dark:text-white uppercase truncate tracking-tight">{n.title}</p>
                             <p className="text-[0.55rem] font-bold text-gray-400 uppercase mt-2">{formatDate(n.date)}</p>
                        </div>
                    ))}
                    <Link to="/app/notice-board" className="mt-4 block text-[0.6rem] font-black text-primary-600 uppercase tracking-widest">View bulletin <ArrowRight size={12} className="inline ml-1"/></Link>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                 <AcademicAdvisor />
            </div>
            <div className="space-y-8">
                <Widget title="Events Hub" icon={<Calendar />} linkTo="/app/calendar" linkText="Full Timeline">
                    <div className="space-y-4">
                        {summary?.upcomingEvents?.map(event => (
                             <div key={event._id} className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 group hover:border-primary-200 transition-colors">
                                <p className="text-[0.6rem] font-black text-primary-500 uppercase mb-1 tracking-widest">{formatDate(event.date)}</p>
                                <h5 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{event.title}</h5>
                            </div>
                        ))}
                    </div>
                </Widget>
            </div>
        </div>
    </div>
  );
}