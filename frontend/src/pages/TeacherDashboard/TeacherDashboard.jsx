import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, CalendarCheck, Percent, Clock, Eye, Edit, Sparkles, Loader2, AlertTriangle, FileText, Copy, Check } from 'lucide-react';

const StatCard = ({ title, value, icon, color }) => (
    <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
            </div>
            <div className="text-gray-500">
                {icon}
            </div>
        </div>
    </div>
);

const QuickLink = ({ to, text, icon }) => (
    <Link to={to} className="flex items-center text-center p-4 bg-primary-50 hover:bg-primary-100 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200">
        <div className="text-primary-600 dark:text-primary-400 mr-3">{icon}</div>
        <p className="font-semibold text-primary-700 dark:text-primary-300">{text}</p>
    </Link>
);

const StudentList = ({ students, loading }) => {
    const [streamFilter, setStreamFilter] = useState('All');
    
    const streams = useMemo(() => 
        ['All', ...[...new Set(students.map(s => s.stream))].sort()],
        [students]
    );

    const filteredStudents = useMemo(() => 
        streamFilter === 'All' 
            ? students 
            : students.filter(s => s.stream === streamFilter),
        [students, streamFilter]
    );

    if (loading) {
        return <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg animate-pulse h-64"></div>;
    }

    return (
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
             <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">My Students</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter by stream:</span>
                    {streams.map(s => (
                        <button 
                            key={s}
                            onClick={() => setStreamFilter(s)}
                            className={`px-3 py-1 text-sm rounded-full ${streamFilter === s ? 'bg-primary-600 text-white font-semibold' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>
             
             {students.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No students are currently assigned to your streams.</p>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {filteredStudents.map(student => (
                        <Link key={student._id} to={`/app/student/${student._id}`} className="group block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-100">{student.firstName} {student.lastName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{student.stream}</p>
                                </div>
                                <Eye className="text-gray-400 group-hover:text-primary-500 transition-colors" size={18} />
                            </div>
                        </Link>
                    ))}
                </div>
             )}
        </div>
    );
};

const TeacherAIInsights = () => {
    const { api } = useAuth();
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await api('/api/dashboard/teacher-insights');
                setInsights(data);
            } catch (err) {
                setError(err.message || 'Failed to load AI insights.');
            } finally {
                setLoading(false);
            }
        };
        fetchInsights();
    }, [api]);
    
    return (
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                <Sparkles className="mr-2 text-primary-500"/> AI-Powered Insights
            </h2>
            {loading ? (
                <div className="text-center py-8"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary-500" /><p className="mt-2">Analyzing student data...</p></div>
            ) : error ? (
                <div className="text-center py-8 text-red-500"><AlertTriangle className="mx-auto h-8 w-8" /><p className="mt-2">{error}</p></div>
            ) : insights ? (
                <div>
                     <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">{insights.summary}</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                             <h3 className="font-semibold mb-2 text-red-600 dark:text-red-400">⚠️ At-Risk Students</h3>
                             {insights.atRiskStudents?.length > 0 ? (
                                 <ul className="space-y-3 text-sm">
                                     {insights.atRiskStudents.map(s => (
                                        <li key={s.name} className="p-3 bg-red-50 dark:bg-red-900/30 rounded-md border-l-2 border-red-300 dark:border-red-700">
                                            <p><strong>{s.name}</strong> ({s.stream})</p>
                                            <p className="text-red-700 dark:text-red-300 text-xs mt-1">Reason: {s.reason}</p>
                                            <p className="mt-2 pt-2 border-t dark:border-red-800/50 text-xs text-gray-600 dark:text-gray-300"><strong className="text-gray-700 dark:text-gray-200">Suggestion:</strong> {s.suggestedIntervention}</p>
                                        </li>
                                    ))}
                                 </ul>
                             ) : <p className="text-sm text-gray-500">No students flagged.</p>}
                        </div>
                         <div>
                             <h3 className="font-semibold mb-2 text-green-600 dark:text-green-400">✨ Top Improvers</h3>
                             {insights.topImprovers?.length > 0 ? (
                                 <ul className="space-y-2 text-sm">
                                     {insights.topImprovers.map(s => <li key={s.name} className="p-2 bg-green-50 dark:bg-green-900/30 rounded-md"><strong>{s.name}</strong> ({s.stream}) - <span className="text-green-600 font-semibold">+{s.change}</span></li>)}
                                 </ul>
                             ) : <p className="text-sm text-gray-500">No significant improvements noted.</p>}
                        </div>
                     </div>
                </div>
            ) : (
                 <div className="text-center py-8"><p>No insights available.</p></div>
            )}
        </div>
    );
};

const QuizGenerator = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const { api } = useAuth();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuiz(null);
        try {
            const data = await api('/api/dashboard/teacher-tools/generate-quiz', {
                method: 'POST',
                body: JSON.stringify({ topic, numQuestions }),
            });
            setQuiz(data.quiz);
        } catch (err) {
            setError(err.message || 'Failed to generate quiz.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = () => {
        if (!quiz) return;
        const quizText = quiz.map((q, i) => 
            `Q${i+1}: ${q.question}\n` +
            q.options.map((opt, j) => `  ${String.fromCharCode(97 + j)}) ${opt}`).join('\n') +
            `\nAnswer: ${q.answer}\n`
        ).join('\n');
        navigator.clipboard.writeText(quizText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const reset = () => {
        setIsModalOpen(false);
        setTopic('');
        setQuiz(null);
        setError('');
    };

    return (
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center"><FileText className="mr-2 text-primary-500" /> AI Quiz Generator</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Instantly create a short quiz on any topic for your students.</p>
            <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                <Sparkles size={18} className="mr-2" /> Create a Quiz
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Generate a New Quiz</h2>
                            <button onClick={reset} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">&times;</button>
                        </div>
                        
                        {!quiz && (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="topic" className="block text-sm font-medium">Topic</label>
                                    <input id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Photosynthesis" className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label htmlFor="numQuestions" className="block text-sm font-medium">Number of Questions</label>
                                    <input id="numQuestions" type="number" value={numQuestions} onChange={e => setNumQuestions(e.target.value)} min="1" max="10" className="mt-1 w-full p-2 border rounded-md" />
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-primary-600 text-white rounded-md flex items-center justify-center disabled:bg-primary-400">
                                    {isLoading ? <><Loader2 className="animate-spin mr-2"/> Generating...</> : 'Generate Quiz'}
                                </button>
                            </div>
                        )}

                        {quiz && (
                            <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                                {quiz.map((q, i) => (
                                    <div key={i} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <p className="font-semibold">Q{i+1}: {q.question}</p>
                                        <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                                            {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                                        </ul>
                                        <p className="text-sm mt-2 font-bold text-green-600">Answer: {q.answer}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        {quiz && (
                             <div className="mt-4 pt-4 border-t dark:border-gray-700 flex justify-end gap-2">
                                <button onClick={handleCopy} className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md text-sm">
                                    {copied ? <><Check size={16} className="mr-2"/> Copied!</> : <><Copy size={16} className="mr-2"/> Copy Quiz</>}
                                </button>
                                <button onClick={() => {setQuiz(null); setTopic('');}} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm">Create Another</button>
                             </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ students: 0, classesAssigned: 0, schedule: [] });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    const fetchDashboardData = async () => {
        try {
            const [statsData, studentsData] = await Promise.all([
                api('/api/dashboard/teacher-stats'),
                api('/api/students')
            ]);
            setStats(statsData);
            setStudents(studentsData);
        } catch (error) {
            console.error("Failed to fetch teacher dashboard data", error);
        } finally {
            setLoading(false);
            setStudentsLoading(false);
        }
    };
    fetchDashboardData();
  }, [api]);

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Teacher's Dashboard</h1>
        
        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={stats.students} icon={<Users size={28} />} color="border-primary-500" />
                <StatCard title="Streams Assigned" value={stats.classesAssigned} icon={<BookOpen size={28} />} color="border-primary-500" />
                <StatCard title="Today's Classes" value={stats.schedule.length} icon={<Clock size={28} />} color="border-primary-500" />
            </div>
        )}
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Today's Schedule</h2>
                {loading ? <div className="h-48 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg"></div> : (
                    <div className="space-y-4">
                        {stats.schedule && stats.schedule.length > 0 ? stats.schedule.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center mb-3 sm:mb-0">
                                    <div className="w-24 text-sm font-semibold text-primary-600 dark:text-primary-400">{item.time}</div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-100">{item.class}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Link to={`/app/attendance?stream=${encodeURIComponent(item.class)}&date=${todayDate}`} className="flex items-center px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-900/80 transition-colors">
                                        <CalendarCheck size={14} className="mr-1.5"/> Attendance
                                    </Link>
                                    <Link to="/app/marksheet" className="flex items-center px-3 py-1.5 text-xs font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-900/80 transition-colors">
                                        <Edit size={14} className="mr-1.5"/> Enter Marks
                                    </Link>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No classes scheduled for today.</p>
                        )}
                    </div>
                )}
            </div>
            
            <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 gap-4">
                    <QuickLink to="/app/attendance" text="Mark Attendance" icon={<CalendarCheck size={20}/>} />
                    <QuickLink to="/app/marksheet" text="Update Marks" icon={<Percent size={20}/>} />
                    <QuickLink to="/app/notice-board" text="Post Notice" icon={<FileText size={20}/>} />
                </div>
            </div>
        </div>

        <div className="mt-8">
            <StudentList students={students} loading={studentsLoading} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <TeacherAIInsights />
            <QuizGenerator />
        </div>
    </div>
  );
}