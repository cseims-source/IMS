
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Menu, Sun, Moon, Search, ChevronDown, LogOut, User, MapPin, Sparkles, Fingerprint, Loader2, Globe } from 'lucide-react';

export default function Header({ setSidebarOpen }) {
  const { user, logout, api } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AD';
  const profilePath = user?.role === 'Student' ? '/app/my-profile' : '/app/profile';

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setIsSearching(true);
        try {
          const data = await api(`/api/dashboard/global-search?q=${searchTerm}`);
          setSearchResults(data);
        } catch (err) {
          console.error(err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, api]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchResults(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (path) => {
    setSearchTerm('');
    setSearchResults(null);
    navigate(path);
  }

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl border-b border-gray-100 dark:border-gray-900 transition-all duration-500">
      <div className="flex items-center flex-1 relative" ref={searchRef}>
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 focus:outline-none lg:hidden mr-6 p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <Menu size={24} />
        </button>
        
        <div className="relative w-full max-w-md hidden md:block group">
            <Search className={`absolute left-5 top-1/2 -translate-y-1/2 ${searchTerm ? 'text-primary-600' : 'text-primary-400'} group-focus-within:text-primary-600 transition-colors`} size={18} />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Find students, faculty, or system modules..." 
                className="w-full bg-gray-100 dark:bg-gray-900 border-0 rounded-2xl pl-14 pr-12 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary-200 transition-all shadow-inner"
            />
            {isSearching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-400 animate-spin" size={16} />}
        </div>

        {/* Search Results Dropdown */}
        {searchResults && (
            <div className="absolute top-full mt-4 w-full max-w-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-scale-in">
                <div className="p-6 space-y-6">
                    {Object.entries(searchResults).map(([key, items]) => items.length > 0 && (
                        <div key={key}>
                            <h4 className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.3em] mb-3 ml-2">{key}</h4>
                            <div className="space-y-1">
                                {items.map((item, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => handleResultClick(item.path)}
                                        className="w-full text-left flex items-center gap-4 p-3 rounded-2xl hover:bg-primary-50 dark:hover:bg-primary-900/20 group transition-all"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                            {item.type === 'Student' ? <User size={18}/> : item.type === 'Faculty' ? <Fingerprint size={18}/> : <Globe size={18}/>}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{item.title}</p>
                                            <p className="text-[0.65rem] text-gray-400 font-bold">{item.sub}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {!Object.values(searchResults).some(arr => arr.length > 0) && (
                        <div className="text-center py-6">
                            <p className="text-sm text-gray-400 font-bold">No nodes found for "{searchTerm}"</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button onClick={toggleTheme} className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90 hover:rotate-12">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-4 group p-1.5 pr-5 rounded-2xl transition-all border border-transparent hover:border-primary-100 dark:hover:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-primary-500/30 group-hover:scale-105 transition-transform">
                    {userInitials}
                </div>
                <div className="text-left hidden sm:block">
                    <p className="text-[0.65rem] font-black text-primary-500 uppercase tracking-widest leading-none mb-1.5">{user?.role === 'Teacher' ? 'Faculty Member' : user?.role}</p>
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-tighter">{user?.name}</span>
                        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-500 ${dropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-[0_30px_80px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-gray-800 py-6 animate-scale-in overflow-hidden z-50">
                    <div className="px-8 pb-6 border-b border-gray-50 dark:border-gray-800 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-xl shadow-inner border border-primary-100">
                            {userInitials}
                        </div>
                        <div>
                            <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight text-lg">{user?.name}</p>
                            <p className="text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: AIET-{user?.profileId?.toString().slice(-4).toUpperCase() || 'CORE'}</p>
                        </div>
                    </div>
                    <div className="p-3 space-y-1">
                        <Link 
                          to={profilePath} 
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl transition-all group"
                        >
                            <User size={18} className="text-gray-400 group-hover:text-primary-600" />
                            System Profile
                        </Link>
                        <div className="flex items-center gap-4 px-6 py-3.5 text-[0.65rem] font-mono text-gray-400 select-all cursor-help hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-colors">
                             <MapPin size={18} />
                             IP Trace Locked
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50 dark:border-gray-800 mt-2">
                            <span className="text-[0.65rem] font-black uppercase tracking-widest text-gray-500">Night Protocol</span>
                            <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-all relative ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg transition-all ${theme === 'dark' ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <button onClick={logout} className="flex items-center gap-4 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full rounded-2xl transition-all mt-2 group">
                            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                            Sign out of system
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}