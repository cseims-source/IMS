import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { BarChart3, Calendar, Activity, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';
import Spinner from '../../components/Spinner';

const StatCard = ({ title, value, icon: Icon, tone = 'text-primary-600' }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-900 ${tone}`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[0.6rem] font-black uppercase tracking-widest text-gray-400">{title}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

export default function StudentAttendanceAnalytics() {
    const { api, user } = useAuth();
    const { addToast } = useNotification();
    const [summary, setSummary] = useState([]);
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [summaryData, recordsData] = await Promise.all([
                    api(`/api/attendance/summary/${user.profileId}`),
                    api('/api/attendance/my-records')
                ]);
                setSummary(summaryData || []);
                setRecords(recordsData || []);
            } catch (error) {
                addToast('Failed to load attendance analytics.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [api, user.profileId, addToast]);

    const overall = useMemo(() => {
        if (!records.length) return { percentage: 0, total: 0, present: 0 };
        const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
        const total = records.length;
        const percentage = Math.round((present / total) * 100);
        return { percentage, total, present };
    }, [records]);

    const monthly = useMemo(() => {
        const bucket = new Map();
        records.forEach(r => {
            const month = r.date?.slice(0, 7);
            if (!month) return;
            const current = bucket.get(month) || { month, total: 0, present: 0 };
            current.total += 1;
            if (r.status === 'present' || r.status === 'late') current.present += 1;
            bucket.set(month, current);
        });
        return Array.from(bucket.values())
            .map(m => ({
                ...m,
                percentage: m.total ? Math.round((m.present / m.total) * 100) : 0
            }))
            .sort((a, b) => (a.month > b.month ? 1 : -1));
    }, [records]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
                <Spinner size="lg" />
                <p className="text-[0.65rem] font-black uppercase tracking-[0.4em] text-gray-400">Loading analytics</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-16 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Attendance Analytics</h1>
                    <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.4em]">Subject & Monthly Insights</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Overall %" value={`${overall.percentage}%`} icon={Activity} tone={overall.percentage >= 75 ? 'text-cyan-600' : 'text-red-500'} />
                <StatCard title="Total Records" value={overall.total} icon={BarChart3} />
                <StatCard title="Present + Late" value={overall.present} icon={TrendingUp} tone="text-accent-600" />
                <StatCard title="Months Tracked" value={monthly.length} icon={Calendar} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-6">Subject-wise %</h2>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={summary}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="subject" tickLine={false} axisLine={false} fontSize={10} interval={0} />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip cursor={{ fill: 'rgba(99,102,241,0.08)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '12px', fontWeight: '900' }} />
                                <Bar dataKey="percentage" radius={[10, 10, 0, 0]} barSize={36} fill="#6366f1" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-[3rem] p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-black uppercase tracking-tight mb-6">Monthly Trend</h2>
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly}>
                                <defs>
                                    <linearGradient id="monthlyFill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={10} />
                                <YAxis domain={[0, 100]} hide />
                                <Tooltip cursor={{ fill: 'rgba(6,182,212,0.08)' }} contentStyle={{ borderRadius: '1rem', border: 'none', background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: '12px', fontWeight: '900' }} />
                                <Area type="monotone" dataKey="percentage" stroke="#06b6d4" strokeWidth={3} fill="url(#monthlyFill)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
