import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, UserPlus, Users, BookOpen, CalendarCheck, Percent,
  ClipboardList, Library, LogOut, Sparkles, MessageSquare, Briefcase, 
  CalendarDays, ShieldCheck, Database, ScrollText, Bus, Building, 
  Utensils, BarChart, HardDrive, Wallet
} from 'lucide-react';

const NavSection = ({ title, children }) => (
  <div className="mb-6">
    <p className="px-4 mb-3 text-[0.6rem] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] leading-none">
      {title}
    </p>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const NavItem = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      className={`flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-500 group ${
        isActive
          ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 shadow-sm border border-primary-100/50 dark:border-primary-500/20'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600'
      }`}
    >
      <span className={`${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}`}>
        {item.icon}
      </span>
      <span className="ml-3 tracking-tight font-black uppercase text-[0.68rem]">{item.name}</span>
      {isActive && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-600 shadow-[0_0_10px_rgba(124,58,237,0.8)] animate-pulse"></div>
      )}
    </NavLink>
  );
};

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  
  const adminLinks = [
    { section: 'Registry Control', items: [
        { icon: <Database size={18} />, name: 'User Approvals', path: '/app/user-approval' },
        { icon: <MessageSquare size={18} />, name: 'Admission Inquiries', path: '/app/admission-requests' },
        { icon: <UserPlus size={18} />, name: 'Student Records', path: '/app/student-admission' },
        { icon: <Users size={18} />, name: 'Faculty Node', path: '/app/faculty' },
    ]},
    { section: 'Academic Management', items: [
        { icon: <HardDrive size={18} />, name: 'Question Bank', path: '/app/question-bank' },
        { icon: <BookOpen size={18} />, name: 'Curriculum Plan', path: '/app/streams' },
        { icon: <Percent size={18} />, name: 'Examinations', path: '/app/marksheet' },
        { icon: <CalendarCheck size={18} />, name: 'Attendance Hub', path: '/app/attendance' },
        { icon: <CalendarDays size={18} />, name: 'Timetables', path: '/app/timetable' },
    ]},
    { section: 'Infrastructure', items: [
        { icon: <Wallet size={18} />, name: 'Fees Management', path: '/app/fees' },
        { icon: <Building size={18} />, name: 'Hostel System', path: '/app/hostel' },
        { icon: <Bus size={18} />, name: 'Transport Fleet', path: '/app/transport' },
        { icon: <Library size={18} />, name: 'Central Library', path: '/app/library' },
        { icon: <Utensils size={18} />, name: 'Smart Canteen', path: '/app/canteen' },
    ]},
    { section: 'Engagement & Ops', items: [
        { icon: <ClipboardList size={18} />, name: 'Notice Board', path: '/app/notice-board' },
        { icon: <CalendarDays size={18} />, name: 'Event Calendar', path: '/app/calendar' },
        { icon: <Briefcase size={18} />, name: 'Placement Hub', path: '/app/placements' },
        { icon: <BarChart size={18} />, name: 'System Reports', path: '/app/reports' },
    ]}
  ];

  const teacherLinks = [
    { section: 'Core Functions', items: [
        { icon: <HardDrive size={18} />, name: 'Question Bank', path: '/app/question-bank' },
        { icon: <Users size={18} />, name: 'Student Registry', path: '/app/student-admission' },
        { icon: <Percent size={18} />, name: 'Marks Entry', path: '/app/marksheet' },
        { icon: <CalendarCheck size={18} />, name: 'Mark Attendance', path: '/app/attendance' },
    ]},
    { section: 'Academic Tools', items: [
        { icon: <CalendarDays size={18} />, name: 'My Timetable', path: '/app/timetable' },
        { icon: <ScrollText size={18} />, name: 'Leave Portal', path: '/app/leave' },
        { icon: <ClipboardList size={18} />, name: 'Broadcast Notice', path: '/app/notice-board' },
    ]}
  ];

  const studentLinks = [
    { section: 'Academic Hub', items: [
        { icon: <LayoutDashboard size={18} />, name: 'My Progress', path: '/app/my-profile' },
        { icon: <HardDrive size={18} />, name: 'Papers Hub', path: '/app/question-bank' },
        { icon: <CalendarDays size={18} />, name: 'Daily Timetable', path: '/app/timetable' },
        { icon: <Percent size={18} />, name: 'Results Hub', path: '/app/marksheet' },
    ]},
    { section: 'Digital Campus', items: [
        { icon: <Sparkles size={18} />, name: 'Career Hub', path: '/app/career-hub' },
        { icon: <Utensils size={18} />, name: 'Smart Canteen', path: '/app/canteen' },
        { icon: <Library size={18} />, name: 'Digital Library', path: '/app/library' },
        { icon: <ClipboardList size={18} />, name: 'Bulletin Board', path: '/app/notice-board' },
    ]}
  ];

  let sidebarData = user?.role === 'Admin' ? adminLinks : user?.role === 'Teacher' ? teacherLinks : studentLinks;
  const dashboardPath = user?.role === 'Admin' ? '/app/dashboard' : user?.role === 'Teacher' ? '/app/teacher-dashboard' : '/app/student-dashboard';

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 print:hidden ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-900 transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-500 ease-in-out print:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full px-6 py-8">
            <div className="flex items-center justify-center mb-10 group cursor-pointer">
                <img src="/logo.png" alt="AIET" className="h-12 w-auto group-hover:scale-105 transition-transform duration-500" />
            </div>
            
            <NavSection title="Dashboards">
              <NavLink
                to={dashboardPath}
                className={({ isActive }) => `flex items-center px-4 py-4 text-[0.75rem] font-black uppercase tracking-widest rounded-2xl transition-all ${
                  isActive ? 'bg-primary-600 text-white shadow-2xl shadow-primary-500/40 translate-x-1' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900'
                }`}
              >
                <LayoutDashboard size={20} className="mr-3" />
                Main Dashboard
              </NavLink>
            </NavSection>

            <div className="flex-grow overflow-y-auto scrollbar-hide pr-1">
              {sidebarData.map((section, idx) => (
                <NavSection key={idx} title={section.section}>
                  {section.items.map((item, itemIdx) => <NavItem key={itemIdx} item={item} />)}
                </NavSection>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
               <button onClick={logout} className='flex w-full items-center px-4 py-3.5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors group'>
                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="ml-3">Exit System</span>
              </button>
            </div>
        </div>
      </div>
    </>
  );
}