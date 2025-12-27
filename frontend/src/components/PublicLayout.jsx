import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, Globe, Heart, Fingerprint } from 'lucide-react';
import ScrollToTop from './ScrollToTop';

function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 border-b ${
        isScrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-2xl border-gray-200 dark:border-gray-800 py-1'
          : 'bg-white dark:bg-gray-950 py-3 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          
          <Link to="/" className="group relative z-50">
            <div className="flex-shrink-0 transition-transform duration-700 group-hover:scale-105">
                <img 
                    src="/logo.png" 
                    alt="AIET Logo" 
                    className="h-10 md:h-12 lg:h-14 w-auto object-contain" 
                />
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-6">
            <a 
                href="https://www.aryan.ac.in/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 text-[0.65rem] font-black uppercase tracking-[0.2em] rounded-xl hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-500 group"
            >
                <Globe size={18} className="transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                <span>Institute Website</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:rotate-12"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <Link to="/login" className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-[0.7rem] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <Fingerprint size={16} className="relative z-10" /> 
                <span className="relative z-10">Gateway Login</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 pt-16 pb-12">
            <div className="container mx-auto px-8 md:px-16 lg:px-24">
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            <img src="/logo.png" alt="Logo" className="h-12 md:h-16 w-auto object-contain transition-all cursor-pointer hover:scale-105 duration-500" />
                        </div>
                        <div className="h-12 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                        <div className="flex flex-col text-center md:text-left">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.4em] leading-tight">
                                Digital Node <br/>
                                <span className="text-primary-600 dark:text-primary-400 font-black">Lavender Infrastructure</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <a href="https://www.aryan.ac.in/" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2">
                            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-all border border-transparent group-hover:border-primary-100 dark:group-hover:border-primary-800">
                                <Globe size={22} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                            </div>
                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 group-hover:text-primary-600 transition-colors">Main Site</span>
                        </a>
                    </div>
                </div>

                <div className="pt-10 border-t border-gray-50 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} AIET Digital Infrastructure
                        </p>
                        <p className="text-[0.55rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-1">
                            Secure Access Protocol • Private Institutional Cloud
                        </p>
                    </div>

                    <div className="flex items-center gap-4 px-6 py-3 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-primary-500/30 transition-all duration-500">
                        <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Developed with <Heart size={12} className="inline text-red-500 mx-1 fill-red-500 animate-bounce" /> by 
                            <span className="text-heritage-600 dark:text-primary-400 ml-1 font-black">Silan Software pvt. ltd.</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary-600 selection:text-white font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}