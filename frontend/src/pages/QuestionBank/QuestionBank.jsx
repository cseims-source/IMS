import React, { useState, useEffect, useMemo } from 'react';
import { 
    FileText, BookOpen, Layers, Library, Search, Filter, 
    Plus, Sparkles, Trash2, Download, ChevronDown, 
    Database, Cpu, X, Loader2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Spinner from '../../components/Spinner';

const StatCard = ({ title, value, icon, color, delay }) => (
    <div 
        className={`bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-xl border border-white dark:border-gray-700/50 hover:shadow-2xl transition-all duration-700 group relative overflow-hidden animate-fade-in-up`}
        style={{ animationDelay: `${delay}ms` }}
    >
        <div className={`absolute top-0 right-0 w-32 h-32 blur-[70px] opacity-10 group-hover:opacity-30 transition-opacity ${color}`}></div>
        <div className="flex justify-between items-center relative z-10">
            <div>
                <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 text-gray-500 group-hover:text-primary-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                {React.cloneElement(icon, { size: 18 })}
            </div>
        </div>
    </div>
);

export default function QuestionBank() {
    const { api, user } = useAuth();
    const { addToast } = useNotification();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metadata, setMetadata] = useState(null);
    const [metaLoading, setMetaLoading] = useState(true);
    
    // AI Modal States
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [aiSubject, setAiSubject] = useState('');
    const [aiTopic, setAiTopic] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiQuestions, setAiQuestions] = useState(null);

    const [filters, setFilters] = useState({
        rows: '20',
        course: 'All Courses',
        branch: 'All Branches',
        academicYear: 'All Academic Years',
        search: ''
    });

    useEffect(() => {
        fetchMetadata();
    }, [api]);

    useEffect(() => {
        fetchPapers();
    }, [filters.course, filters.branch, filters.academicYear]);

    const fetchMetadata = async () => {
        setMetaLoading(true);
        try {
            const data = await api('/api/question-papers/metadata');
            setMetadata(data);
        } catch (err) {
            addToast('Metadata aggregation failed.', 'error');
        } finally {
            setMetaLoading(false);
        }
    };

    const fetchPapers = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                ...filters,
                search: filters.search
            }).toString();
            const data = await api(`/api/question-papers?${queryParams}`);
            setPapers(data);
        } catch (err) {
            addToast('Registry sync failed.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setFilters(f => ({ ...f, search: e.target.value }));
    };

    const handleGenerateAI = async () => {
        if (!aiSubject || !aiTopic) return addToast('Define subject & topic nodes.', 'info');
        setAiLoading(true);
        try {
            const data = await api('/api/question-papers/generate-ai', {
                method: 'POST',
                body: JSON.stringify({ subject: aiSubject, topic: aiTopic })
            });
            setAiQuestions(data.questions);
            addToast('AI Logic sequence completed.', 'success');
        } catch (err) {
            addToast('AI neural link broken.', 'error');
        } finally {
            setAiLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Wipe this record from node history?')) return;
        try {
            await api(`/api/question-papers/${id}`, { method: 'DELETE' });
            setPapers(prev => prev.filter(p => p._id !== id));
            addToast('Node purged.', 'success');
            fetchMetadata(); // Update stats
        } catch (err) {
            addToast('Deletion sequence failed.', 'error');
        }
    };

    const searchDebounce = useMemo(() => {
        let timer;
        return (val) => {
            clearTimeout(timer);
            timer = setTimeout(() => fetchPapers(), 500);
        };
    }, []);

    const stats = metadata?.stats || { totalPapers: 0, totalCourses: 0, totalBranches: 0, totalSubjects: 0 };
    const filterOptions = metadata?.filters || { courses: ['All Courses'], branches: ['All Branches'], academicYears: ['All Academic Years'] };

    return (
        <div className="animate-fade-in space-y-10 pb-20 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none">
                        Question <span className="text-primary-600 bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-text-shine" style={{ WebkitBackgroundClip: 'text' }}>Bank</span>
                    </h1>
                    <p className="text-[0.65rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] flex items-center gap-3">
                        <Database size={12} className="text-accent-500 animate-pulse" /> INSTITUTIONAL REGISTRY HUB // CLOUD-SYNC ENABLED
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <button 
                        onClick={() => setIsAIOpen(true)}
                        className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3.5 bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-600/20 rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95 group"
                    >
                        <Sparkles size={16} className="mr-2 group-hover:rotate-12 transition-transform" /> AI Synthesizer
                    </button>
                    <button className="flex-1 lg:flex-none flex items-center justify-center px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-black uppercase text-[0.65rem] tracking-[0.2em] hover:bg-primary-700 transition shadow-lg shadow-primary-500/30 active:scale-95 group">
                        <Plus size={16} className="mr-2 group-hover:rotate-90 transition-transform" /> Upload Paper
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {metaLoading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-[2rem] animate-pulse border dark:border-gray-700"></div>
                    ))
                ) : (
                    <>
                        <StatCard title="Papers Uploaded" value={stats.totalPapers} icon={<FileText />} color="bg-primary-500" delay={100} />
                        <StatCard title="Active Courses" value={stats.totalCourses} icon={<BookOpen />} color="bg-accent-500" delay={200} />
                        <StatCard title="Branch Nodes" value={stats.totalBranches} icon={<Layers />} color="bg-secondary-500" delay={300} />
                        <StatCard title="Curriculum Subjects" value={stats.totalSubjects} icon={<Library />} color="bg-primary-600" delay={400} />
                    </>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[0.75rem] font-black uppercase tracking-[0.3em] text-gray-400 flex items-center gap-3">
                        <Filter size={14} className="text-primary-500" /> Filter Data Clusters
                    </h2>
                    <button onClick={fetchMetadata} className="p-2 text-gray-400 hover:text-primary-500 transition-colors">
                        <RefreshCw size={12} className={metaLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
                    <div className="space-y-1.5">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 ml-1">Limit</label>
                        <select 
                            value={filters.rows}
                            onChange={(e) => setFilters(f => ({...f, rows: e.target.value}))}
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-[0.65rem] font-black uppercase focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            <option>20</option><option>50</option><option>100</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 ml-1">Stream Logic</label>
                        <select 
                            value={filters.course}
                            onChange={(e) => setFilters(f => ({...f, course: e.target.value}))}
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-[0.65rem] font-black uppercase focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            {filterOptions.courses.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 ml-1">Branch Hub</label>
                        <select 
                            value={filters.branch}
                            onChange={(e) => setFilters(f => ({...f, branch: e.target.value}))}
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-[0.65rem] font-black uppercase focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            {filterOptions.branches.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 ml-1">Year Cycle</label>
                        <select 
                            value={filters.academicYear}
                            onChange={(e) => setFilters(f => ({...f, academicYear: e.target.value}))}
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-[0.65rem] font-black uppercase focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none shadow-inner"
                        >
                            {filterOptions.academicYears.map(opt => <option key={opt}>{opt}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 ml-1">Identity Lookup</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                            <input 
                                type="text"
                                placeholder="Search title..."
                                value={filters.search}
                                onChange={(e) => { handleSearch(e); searchDebounce(e.target.value); }}
                                className="w-full p-3.5 pl-11 bg-gray-50 dark:bg-gray-950 border-0 rounded-xl text-[0.65rem] font-black uppercase focus:ring-4 focus:ring-primary-500/10 transition-all shadow-inner"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-700/50 overflow-hidden min-h-[400px] relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                        <Spinner size="lg" />
                        <p className="text-[0.7rem] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Syncing cluster nodes...</p>
                    </div>
                ) : papers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-scale-in">
                        <div className="w-32 h-32 rounded-full bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center text-gray-200 dark:text-gray-700 shadow-inner mb-8 group relative">
                             <div className="absolute inset-0 border-4 border-dashed border-gray-100 dark:border-gray-800 rounded-full animate-spin-slow"></div>
                            <Library size={60} className="group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-2">No Nodes Identified</h2>
                            <p className="text-gray-400 dark:text-gray-500 text-[0.65rem] font-black uppercase tracking-[0.3em]">The registry is empty for the current Neural Query</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-gray-400 border-b dark:border-gray-700">
                                    <th className="p-8 pl-12">Metadata Logic</th>
                                    <th className="p-8">Branch Protocol</th>
                                    <th className="p-8">Cycle Year</th>
                                    <th className="p-8">Matrix Score</th>
                                    <th className="p-8 text-right pr-12">Registry Ops</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {papers.map((paper, idx) => (
                                    <tr key={paper._id} className="hover:bg-primary-50/20 dark:hover:bg-primary-900/10 transition-all group animate-fade-in-up" style={{ animationDelay: `${idx * 40}ms` }}>
                                        <td className="p-6 pl-12">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
                                                    <FileText size={22} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm mb-1 group-hover:text-primary-600 transition-colors">{paper.title}</p>
                                                    <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.2em]">{paper.subject}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[0.7rem] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{paper.branch}</span>
                                                <span className="text-[0.55rem] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sem {paper.semester} Node</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-sm font-mono font-black text-gray-600 dark:text-gray-300">{paper.academicYear}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[0.55rem] font-black uppercase tracking-widest shadow-sm ${
                                                paper.difficulty === 'Easy' ? 'bg-accent-100 text-accent-700' : 
                                                paper.difficulty === 'Hard' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {paper.difficulty}
                                            </span>
                                        </td>
                                        <td className="p-6 text-right pr-12">
                                            <div className="flex justify-end gap-3">
                                                <button className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-primary-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Download size={18}/></button>
                                                {user?.role === 'Admin' && (
                                                    <button onClick={() => handleDelete(paper._id)} className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90"><Trash2 size={18}/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isAIOpen && (
                <div className="fixed inset-0 bg-gray-950/90 backdrop-blur-xl flex justify-center items-center z-[120] p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-[0_0_80px_rgba(79,70,229,0.2)] w-full max-w-2xl border border-white/10 animate-scale-in relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -mr-32 -mt-32"></div>
                        
                        <button onClick={() => setIsAIOpen(false)} className="absolute top-10 right-10 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-400 active:scale-75">
                            <X size={24} />
                        </button>
                        
                        <div className="flex items-center gap-6 mb-10 relative z-10">
                            <div className="p-4 bg-gradient-to-br from-indigo-600 to-primary-500 rounded-2xl text-white shadow-xl shadow-indigo-500/30 animate-pulse">
                                <Cpu size={32} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">Neural <span className="text-indigo-600">Synthesizer</span></h2>
                                <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-[0.5em] mt-2">Quantum Question Logic Engine</p>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Learning Module</label>
                                    <input 
                                        type="text" 
                                        value={aiSubject}
                                        onChange={(e) => setAiSubject(e.target.value)}
                                        placeholder="e.g. Distributed Systems"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold transition-all shadow-inner"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1">Topic Logic</label>
                                    <input 
                                        type="text" 
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g. Raft Consensus"
                                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-0 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 text-xs font-bold transition-all shadow-inner"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleGenerateAI}
                                disabled={aiLoading}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-primary-600 text-white font-black uppercase text-[0.65rem] tracking-[0.4em] rounded-[1.5rem] shadow-xl shadow-indigo-500/40 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group"
                            >
                                {aiLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />}
                                {aiLoading ? 'Synthesizing...' : 'Initialize Logic Pulse'}
                            </button>

                            {aiQuestions && (
                                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-indigo-500/20 max-h-[350px] overflow-y-auto scrollbar-hide space-y-4 animate-slide-up shadow-inner">
                                    <h4 className="text-[0.55rem] font-black uppercase tracking-[0.5em] text-indigo-500 flex items-center gap-3">
                                        <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping"></div> Logic Trace Output
                                    </h4>
                                    {aiQuestions.map((q, i) => (
                                        <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start gap-4 group/item hover:border-indigo-400 transition-all duration-500">
                                            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center font-black text-[0.7rem] shrink-0 shadow-sm">{i+1}</span>
                                            <div className="flex-grow">
                                                <p className="text-[0.75rem] font-black text-gray-800 dark:text-gray-100 leading-relaxed mb-3">{q.question}</p>
                                                <div className="flex gap-4">
                                                    <span className="text-[0.55rem] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <div className="w-0.5 h-0.5 rounded-full bg-gray-300"></div> Pts: {q.marks}
                                                    </span>
                                                    <span className="text-[0.55rem] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <div className="w-0.5 h-0.5 rounded-full bg-indigo-400"></div> {q.complexity}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
