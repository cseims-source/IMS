import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, BookOpen, Briefcase, Calendar, Bus, PieChart, BarChart3, TrendingUp, TrendingDown, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Bar, Pie, Cell, Legend } from 'recharts';


const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="block">
        <div className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border-l-4 ${color}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                </div>
                <div className="text-white p-3 rounded-full bg-primary-500">
                    {icon}
                </div>
            </div>
        </div>
    </Link>
);

const ChartCard = ({ title, icon, children }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h2>
        <div className="h-64">
            {children}
        </div>
    </div>
);

const StudentListModal = ({ isOpen, onClose, streamName, students, isLoading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Students in {streamName}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
                </div>
                <div className="overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center py-8">Loading students...</p>
                    ) : students.length > 0 ? (
                        <ul className="space-y-2">
                            {students.map(student => (
                                <li key={student._id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                    {student.firstName} {student.lastName}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center py-8">No students found in this stream.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0, routes: 0 });
  const [chartData, setChartData] = useState({ studentsPerCourse: [], feeStatus: [] });
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const { api } = useAuth();

  // State for the student list modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [streamStudents, setStreamStudents] = useState([]);
  const [isStudentListLoading, setIsStudentListLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const data = await api('/api/dashboard/stats');
            setStats(data);
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    };
     const fetchChartData = async () => {
        try {
            const data = await api('/api/dashboard/charts');
            setChartData(data);
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        } finally {
            setChartLoading(false);
        }
    };
    fetchStats();
    fetchChartData();
  }, [api]);

  const handleBarClick = async (data) => {
      if (!data || !data.activePayload || !data.activePayload[0]) return;
      const streamName = data.activePayload[0].payload.name;
      
      setSelectedStream(streamName);
      setIsStudentModalOpen(true);
      setIsStudentListLoading(true);

      try {
          const studentsData = await api(`/api/students/stream/${encodeURIComponent(streamName)}`);
          setStreamStudents(studentsData);
      } catch (error) {
          console.error(`Failed to fetch students for stream ${streamName}`, error);
          setStreamStudents([]);
      } finally {
          setIsStudentListLoading(false);
      }
  };

  const PIE_COLORS = { 'Paid': '#10b981', 'Pending': '#f59e0b' };

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Admin Dashboard</h1>
        {loading ? <div className="text-center p-4">Loading stats...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.students} icon={<Users size={24} />} color="border-primary-500" link="/app/student-admission" />
                <StatCard title="Total Faculty" value={stats.faculty} icon={<Users size={24} />} color="border-primary-500" link="/app/faculty" />
                <StatCard title="Streams Offered" value={stats.courses} icon={<BookOpen size={24} />} color="border-primary-500" link="/app/streams" />
                <StatCard title="Active Routes" value={stats.routes} icon={<Bus size={24} />} color="border-primary-500" link="/app/transport" />
            </div>
        )}
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {chartLoading ? <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div> : (
                <ChartCard title="Students per Stream" icon={<BarChart3 className="text-primary-500" />}>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData.studentsPerCourse} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} onClick={handleBarClick}>
                             <CartesianGrid strokeDasharray="3 3" />
                             <XAxis dataKey="name" fontSize={12} />
                             <YAxis />
                             <Tooltip cursor={{ fill: 'rgba(100,100,100,0.1)' }} />
                             <Bar dataKey="students" fill="#16a34a" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            )}
             {chartLoading ? <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div> : (
                <ChartCard title="Fee Status Overview" icon={<PieChart className="text-primary-500" />}>
                    <ResponsiveContainer width="100%" height="100%">
                        <Pie
                            data={chartData.feeStatus}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                            {chartData.feeStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name] || '#8884d8'} />
                            ))}
                        </Pie>
                         <Legend />
                         <Tooltip />
                    </ResponsiveContainer>
                </ChartCard>
            )}
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <QuickLink to="/app/student-admission?action=new" text="New Admission" />
                <QuickLink to="/app/faculty" text="Add Faculty" />
                <QuickLink to="/app/notice-board" text="Post Notice" />
                <QuickLink to="/app/reports" text="Generate Report" />
                <QuickLink to="/app/calendar" text="Add Event" />
            </div>
        </div>

        <StudentListModal 
            isOpen={isStudentModalOpen}
            onClose={() => setIsStudentModalOpen(false)}
            streamName={selectedStream}
            students={streamStudents}
            isLoading={isStudentListLoading}
        />
    </div>
  );
}

const QuickLink = ({ to, text }) => (
    <Link to={to} className="block text-center p-4 bg-gray-50 hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200">
        <p className="font-semibold text-primary-600 dark:text-primary-400">{text}</p>
    </Link>
)