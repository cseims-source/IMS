import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, UserPlus, Users, BookOpen, CalendarCheck, Percent,
  Calendar, Building, Utensils, ClipboardList, Library, GraduationCap,
  Briefcase, BarChart, X, UserCircle, LogOut, Bus, CalendarDays, UserCheck, DollarSign, Sparkles, MessageSquare
} from 'lucide-react';

const adminNav = [
  { icon: <UserCheck size={20} />, name: 'User Approvals', path: '/app/user-approval' },
  { icon: <MessageSquare size={20} />, name: 'Admission Requests', path: '/app/admission-requests' },
  { icon: <UserPlus size={20} />, name: 'Student Admission', path: '/app/student-admission' },
  { icon: <Users size={20} />, name: 'Faculty', path: '/app/faculty' },
  { icon: <BookOpen size={20} />, name: 'Streams & Curriculum', path: '/app/streams' },
  { icon: <DollarSign size={20} />, name: 'Fees Management', path: '/app/fees' },
  { icon: <CalendarCheck size={20} />, name: 'Attendance', path: '/app/attendance' },
  { icon: <Percent size={20} />, name: 'Marksheets', path: '/app/marksheet' },
  { icon: <CalendarDays size={20} />, name: 'Timetable', path: '/app/timetable' },
  { icon: <Building size={20} />, name: 'Hostel', path: '/app/hostel' },
  { icon: <Bus size={20} />, name: 'Transport', path: '/app/transport' },
  { icon: <ClipboardList size={20} />, name: 'Notice Board', path: '/app/notice-board' },
  { icon: <Library size={20} />, name: 'Library', path: '/app/library' },
  { icon: <Utensils size={20} />, name: 'Canteen', path: '/app/canteen' },
  { icon: <BarChart size={20} />, name: 'Reports', path: '/app/reports' },
  { icon: <Calendar size={20} />, name: 'Event Calendar', path: '/app/calendar' },
  { icon: <Briefcase size={20} />, name: 'Placements', path: '/app/placements' },
];

const teacherNav = [
  { icon: <Users size={20} />, name: 'Faculty', path: '/app/faculty' },
  { icon: <CalendarCheck size={20} />, name: 'Attendance', path: '/app/attendance' },
  { icon: <Percent size={20} />, name: 'Marksheets', path: '/app/marksheet' },
  { icon: <CalendarDays size={20} />, name: 'Timetable', path: '/app/timetable' },
  { icon: <ClipboardList size={20} />, name: 'Notice Board', path: '/app/notice-board' },
];

const studentNav = [
  { icon: <Sparkles size={20} />, name: 'Career Hub', path: '/app/career-hub' },
  { icon: <CalendarDays size={20} />, name: 'Timetable', path: '/app/timetable' },
  { icon: <ClipboardList size={20} />, name: 'Notice Board', path: '/app/notice-board' },
  { icon: <Utensils size={20} />, name: 'Canteen', path: '/app/canteen' },
  { icon: <Calendar size={20} />, name: 'Event Calendar', path: '/app/calendar' },
  { icon: <Briefcase size={20} />, name: 'Placements', path: '/app/placements' },
];

const NavItem = ({ item }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-primary-600 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-white'
      }`}
    >
      {item.icon}
      <span className="ml-3">{item.name}</span>
    </NavLink>
  );
};

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const { user, logout } = useAuth();
  
  let navLinks = [];
  if (user?.role === 'Admin') navLinks = adminNav;
  else if (user?.role === 'Teacher') navLinks = teacherNav;
  else if (user?.role === 'Student') navLinks = studentNav;
  
  const primaryLink = {
      path: '/app',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />
  };

  if (user?.role === 'Admin') {
    primaryLink.path = '/app/dashboard';
  } else if (user?.role === 'Teacher') {
    primaryLink.path = '/app/teacher-dashboard';
  } else if (user?.role === 'Student') {
    primaryLink.path = '/app/student-dashboard';
  }

  return (
    <>
      <div className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      <div id="sidebar" className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <div className="flex items-center">
            <img src="/logo.png" alt="Aryan Institute Logo" className="h-10" />
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <nav className="p-4 flex flex-col h-[calc(100vh-65px)]">
          <div className="flex-grow space-y-2 overflow-y-auto">
            <NavLink
              to={primaryLink.path}
              end
              className={({ isActive }) => `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-white'
              }`}
            >
              {primaryLink.icon}
              <span className="ml-3">{primaryLink.label}</span>
            </NavLink>
            {navLinks.map((item) => <NavItem key={item.name} item={item} />)}
          </div>
          <div className="mt-auto pt-2">
             <button
              onClick={logout}
              className='flex w-full items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400'
            >
              <LogOut size={20} />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}