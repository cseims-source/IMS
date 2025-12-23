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
          className="text-gray-500 focus:outline-none lg:hidden mr-6"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
        
        {/* Synchronized Internal Branding - Logo Only */}
        <Link to="/app" className="flex items-center group">
            <div className="flex-shrink-0 transition-transform group-hover:rotate-3 duration-500">
                <img 
                    src="/logo.png" 
                    alt="AIET Logo" 
                    className="h-12 md:h-16 w-auto object-contain" 
                />
            </div>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label={theme === 'dark' ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
        <Link to={profileLink} className="flex items-center p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-600">
          <UserCircle className="h-9 w-9 text-gray-600 dark:text-gray-300" />
          <div className="ml-3 text-right hidden sm:block">
            <p className="text-sm font-black text-gray-800 dark:text-gray-100 leading-none">{user?.name || 'User'}</p>
            <p className="text-[0.65rem] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1.5">{user?.role || 'Role'}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}