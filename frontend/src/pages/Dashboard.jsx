import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
    Users, Activity, FileDown, ArrowRight, Sparkles, 
    CheckCircle, TrendingUp, ShieldCheck, Clock, 
    ClipboardList, Wallet, UserPlus, Zap, BarChart3,
    ArrowUpRight, Globe, Fingerprint
} from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

const StatCard = ({ title, value, icon, badge, trendColor, delay }) => (
    <div 
        className="bg-white dark:bg-gray-800 p-8 rounded-[3rem] shadow-xl border border-white dark:border-gray-700/50 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden animate-fade-in-up"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity ${trendColor}`}></div>
        <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
                <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-2">{title}</p>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
            </div>
            <div className={`p-4 rounded-[1.5rem] bg-gray-50 dark:bg-gray-900/50 text-primary-600 shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {icon}
            </div>
        </div>
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-[0.2em] ${trendColor} bg-opacity-10 border border-current/20 shadow-sm`}>
            <TrendingUp size={10} className="mr-2" /> {badge}
        </div>
    </div>
);

const ShortcutBtn = ({ to, label, icon: Icon, color }) => (
    <Link to={to} className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group">
        <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
            <Icon size={20} />
        </div>
        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 text-center leading-tight">{label}</span>
    </Link>
);

export default function Dashboard() {
  const { user, api } = useAuth();
  const [data, setData] = useState(null);
  const [charts, setCharts] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [stats, chartData] = await Promise.all([
                api('/api/dashboard/stats'),
                api('/api/dashboard/charts')
            ]);
            setData(stats);
            setCharts(chartData);
        } catch (err) { console.error(err); }
    };
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [api]);

  return (
    <div className="animate-fade-in space-y-12 pb-24 max-w-[1600px] mx-auto px-4 sm:px-0">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
            <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/10 rounded-full border border-primary-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-ping"></div>
                    <span className="text-[0.5rem] font-black uppercase tracking-[0.3em] text-primary-600">Secure Protocol Active</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                    Overview <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>Matrix</span>
                </h1>
                <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex flex-wrap items-center gap-4">
                    Identity: <span className="text-primary-600 font-black">{user?.name.toUpperCase()}</span> 
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span> 
                    {formatDate(currentTime)} <span className="w-1 h-1 rounded-full bg-gray-300"></span> {currentTime.toLocaleTimeString()}
                </p>
            </div>
            <button className="flex items-center px-8 py-4 bg-accent-500 text-white rounded-[1.5rem] font-black uppercase text-[0.65rem] tracking-[0.3em] hover:bg-accent-600 transition shadow-xl shadow-accent-500/25 active:scale-95 group">
                <FileDown size={18} className="mr-3 group-hover:translate-y-1 transition-transform" /> Export Analytics
            </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatCard title="Active Nodes" value={data?.stats?.students || '0'} icon={<Users size={28} />} badge="+287 this week" trendColor="text-primary-600 bg-primary-500" delay={100} />
            <StatCard title="Expert Faculty" value={data?.stats?.faculty || '0'} icon={<Fingerprint size={28} />} badge="Nodes: Healthy" trendColor="text-secondary-500 bg-secondary-500" delay={200} />
            <StatCard title="Infra Status" value="Online" icon={<Activity size={28} />} badge="69 active user sessions" trendColor="text-accent-500 bg-accent-500" delay={300} />
            <StatCard title="Bulletins" value={data?.stats?.notices || '0'} icon={<ClipboardList size={28} />} badge="Registry: Updated" trendColor="text-yellow-500 bg-yellow-500" delay={400} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-10 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[120px] -mr-32 -mt-32"></div>
                <div className="flex items-center justify-between mb-12 relative z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter flex items-center gap-4">
                            <BarChart3 className="text-primary-500" size={24} /> Protocol Pulse
                        </h2>
                        <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.4em] mt-2">Live Institutional Performance Grid</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
                
                <div className="h-[350px] relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={charts?.attendanceTrend || []}>
                            <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                            <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', background: 'rgba(0,0,0,0.85)', color: '#fff', fontWeight: '900', padding: '15px' }} />
                            <Area type="monotone" dataKey="rate" stroke="#4f46e5" strokeWidth={5} fillOpacity={1} fill="url(#colorRate)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-10 rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 group">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bulletins</h2>
                    <Link to="/app/notice-board" className="p-3 bg-gray-50 dark:bg-gray-900 rounded-2xl text-primary-500 hover:scale-110 hover:bg-primary-500 hover:text-white transition-all shadow-sm"><ArrowUpRight size={20}/></Link>
                </div>
                <div className="space-y-6">
                    {data?.notices?.length > 0 ? data.notices.map((notice, i) => (
                        <div key={i} className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-[2.5rem] border border-transparent hover:border-primary-500/20 transition-all hover:translate-x-1 group/item">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-[0.5rem] font-black text-primary-500 uppercase tracking-widest px-2 py-0.5 bg-primary-500/10 rounded-md">{notice.category}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <p className="text-[0.55rem] text-gray-400 font-bold uppercase">{formatDate(notice.createdAt)}</p>
                            </div>
                            <h4 className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tight group-hover/item:text-primary-600 transition-colors">{notice.title}</h4>
                        </div>
                    )) : (
                        <div className="text-center py-16 opacity-30">
                            <Globe size={48} className="mx-auto mb-4" />
                            <p className="font-black uppercase tracking-widest text-[0.6rem]">Registry Silent</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-primary-950 p-12 rounded-[5rem] shadow-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-primary-600/10 to-transparent"></div>
            <div className="flex flex-col xl:flex-row items-center justify-between gap-12 relative z-10">
                <div className="text-center xl:text-left space-y-4">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center justify-center xl:justify-start gap-5">
                        <Zap className="text-yellow-400 animate-pulse" size={32} /> Rapid Control Hub
                    </h2>
                    <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.5em]">Initialize System Protocols Instantly</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full xl:w-auto">
                    <ShortcutBtn to="/app/student-admission" label="New Registry" icon={UserPlus} color="bg-primary-600" />
                    <ShortcutBtn to="/app/fees" label="Financial Ledger" icon={Wallet} color="bg-secondary-500" />
                    <ShortcutBtn to="/app/notice-board" label="Broadcast Node" icon={ClipboardList} color="bg-accent-500" />
                    <ShortcutBtn to="/app/attendance" label="Registry Scan" icon={CheckCircle} color="bg-yellow-500" />
                </div>
            </div>
        </div>

        <footer className="text-center pt-24 border-t border-gray-100 dark:border-gray-900 opacity-20">
            <p className="text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[1em]">© AIET INSTITUTIONAL GRID • CORE HUB</p>
        </footer>
    </div>
  );
}