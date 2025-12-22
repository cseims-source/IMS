

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, BookOpen, GraduationCap, BarChart2, CheckCircle, Calendar, DollarSign, ClipboardList, Clock, ArrowRight } from 'lucide-react';
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

const LoadingWidget = ({ title, icon }) => (
    <Widget title={title} icon={icon}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
    </Widget>
);

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, api } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await api('/api/dashboard/student-summary');
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch dashboard summary", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [api]);
  
  const photoUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`;

  return (
    <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row items-center">
                <img src={photoUrl} alt="Student" className="w-24 h-24 rounded-full mr-0 sm:mr-6 mb-4 sm:mb-0 border-4 border-primary-200" />
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 text-center sm:text-left">Welcome, {user.name.split(' ')[0]}!</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-center sm:text-left">Here is your summary for today.</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Today's Timetable */}
            {loading ? <LoadingWidget title="Today's Schedule" icon={<Clock />} /> : (
                <Widget title="Today's Schedule" icon={<Clock />} linkTo="/app/timetable" linkText="View Full Timetable">
                    {summary?.scheduleToday?.length > 0 ? (
                        summary.scheduleToday.map((item, index) => (
                            <div key={index} className="flex items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <span className="font-semibold w-20">{item.time}</span>
                                <span className="text-gray-700 dark:text-gray-200">{item.subject}</span>
                            </div>
                        ))
                    ) : <p className="text-center text-gray-500 py-6">No classes scheduled for today!</p>}
                </Widget>
            )}

            {/* Pending Fees */}
            {loading ? <LoadingWidget title="Pending Fees" icon={<DollarSign />} /> : (
                <Widget title="Pending Fees" icon={<DollarSign />} linkTo="/app/my-profile" linkText="View Fee History">
                    {summary?.pendingFees?.length > 0 ? (
                         summary.pendingFees.map(fee => (
                             <div key={fee._id} className="flex justify-between items-center text-sm p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                                <div>
                                    <p className="font-medium">{fee.type}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Due: {formatDate(fee.dueDate)}</p>
                                </div>
                                <p className="font-semibold">₹{fee.amount.toLocaleString()}</p>
                            </div>
                         ))
                    ) : (
                        <div className="text-center py-6 text-green-600">
                             <CheckCircle className="mx-auto h-8 w-8" />
                             <p className="mt-2 font-semibold">All fees cleared!</p>
                        </div>
                    )}
                </Widget>
            )}
            
             {/* Latest Notices */}
            {loading ? <LoadingWidget title="Latest Notices" icon={<ClipboardList />} /> : (
                <Widget title="Latest Notices" icon={<ClipboardList />} linkTo="/app/notice-board" linkText="View All Notices">
                    {summary?.latestNotices?.length > 0 ? (
                        summary.latestNotices.map(notice => (
                            <div key={notice._id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <p className="font-semibold truncate">{notice.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{notice.category} - {formatDate(notice.date)}</p>
                            </div>
                        ))
                    ) : <p className="text-center text-gray-500 py-6">No recent notices.</p>}
                </Widget>
            )}

            <div className="md:col-span-2 lg:col-span-3">
                 {loading ? <LoadingWidget title="Recent Grades" icon={<BarChart2 />} /> : (
                    <Widget title="Academics & Deadlines" icon={<BarChart2 />} linkTo="/app/my-profile" linkText="View Full Academic Profile">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold mb-2">Recent Grades</h4>
                                {summary?.recentMarksheet ? (
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/30 rounded-md">
                                        <p className="capitalize font-semibold">{summary.recentMarksheet.exam.replace('-', ' ')} Exam</p>
                                        <p className="text-sm">Overall: {summary.recentMarksheet.percentage}% ({summary.recentMarksheet.grade})</p>
                                    </div>
                                ): <p className="text-sm text-gray-500">No recent grades posted.</p>}
                            </div>
                            <div>
                                <h4 className="font-semibold mb-2">Upcoming Deadlines</h4>
                                {summary?.upcomingEvents?.length > 0 ? (
                                    summary.upcomingEvents.map(event => (
                                         <div key={event._id} className="text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md mb-2">
                                            <p className="font-semibold">{event.title}</p>
                                            <p className="text-xs text-gray-500">{event.category} - {formatDate(event.date)}</p>
                                        </div>
                                    ))
                                ): <p className="text-sm text-gray-500">No upcoming deadlines.</p>}
                            </div>
                        </div>
                    </Widget>
                 )}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
                <AcademicAdvisor />
            </div>
        </div>
    </div>
  );
}