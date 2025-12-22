import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, UserCircle, Sun, Moon } from 'lucide-react';

export default function Header({ setSidebarOpen, sidebarOpen }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const profileLink = user?.role === 'Student' ? "/app/my-profile" : "/app/profile";

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-md">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-500 focus:outline-none lg:hidden mr-4"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        
        {/* Updated Branding Section to match Landing Page style */}
        <div className="flex flex-col">
            <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-primary-700 dark:text-primary-400 leading-none font-serif">
                ARYAN
            </h1>
            <p className="text-[0.45rem] lg:text-[0.55rem] font-extrabold tracking-[0.15em] text-primary-700 dark:text-primary-400 uppercase mt-1 leading-none">
                Institute of Engineering & Technology
            </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <Link to={profileLink} className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <UserCircle className="h-8 w-8 text-gray-600 dark:text-gray-300" />
          <div className="ml-3 text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'Role'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
