import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon, ShieldCheck, HelpCircle, Code2, Globe, Heart } from 'lucide-react';
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
          : 'bg-white dark:bg-gray-950 py-2 border-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between">
          
          {/* Institution Branding - Balanced Logo Only */}
          <Link to="/" className="group relative z-50">
            <div className="flex-shrink-0 transition-transform duration-700 group-hover:scale-105">
                <img 
                    src="/logo.png" 
                    alt="AIET Logo" 
                    className="h-10 md:h-12 lg:h-14 w-auto object-contain" 
                />
            </div>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Main Website Link Button */}
            <a 
                href="https://www.aryan.ac.in/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hidden md:flex items-center gap-2 px-4 py-2 text-gray-500 dark:text-gray-400 text-[0.6rem] font-black uppercase tracking-[0.2em] rounded-xl hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-500 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-primary-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <Globe size={18} className="relative z-10 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110" />
                <span className="relative z-10">Main Site</span>
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 hover:rotate-12"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link to="/login" className="hidden sm:flex items-center gap-2 px-5 py-2 bg-[#166534] hover:bg-[#114f29] text-white text-[0.65rem] font-black uppercase tracking-widest rounded-lg transition-all shadow-md active:scale-95 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <ShieldCheck size={16} className="relative z-10" /> 
                <span className="relative z-10">Portal Login</span>
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
                {/* Main Footer Content */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-16">
                    {/* Brand Section */}
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            <img src="/logo.png" alt="Logo" className="h-14 md:h-16 lg:h-18 opacity-100 transition-all cursor-pointer hover:scale-105 duration-500" />
                        </div>
                        <div className="h-12 w-[1px] bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
                        <div className="flex flex-col text-center md:text-left">
                            <p className="text-[0.65rem] font-black text-gray-400 uppercase tracking-[0.4em] leading-tight">
                                Digital Infrastructure <br/>
                                <span className="text-[#166534] dark:text-primary-400 font-black">Institutional Gateway</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Navigation - Horizontal Layout */}
                    <div className="flex items-center gap-12">
                        <a href="https://www.aryan.ac.in/" target="_blank" rel="noreferrer" className="group flex flex-col items-center gap-2">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-full group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors border border-transparent group-hover:border-primary-100 dark:group-hover:border-primary-800">
                                <Globe size={18} className="text-gray-400 group-hover:text-[#166534] transition-colors" />
                            </div>
                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-gray-500 group-hover:text-[#166534] transition-colors">Main Site</span>
                        </a>
                    </div>
                </div>

                {/* Bottom Credits Bar */}
                <div className="pt-10 border-t border-gray-50 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <p className="text-[0.6rem] font-black text-gray-400 uppercase tracking-[0.2em]">
                            © {new Date().getFullYear()} AIET Digital Infrastructure
                        </p>
                        <p className="text-[0.5rem] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mt-1">
                            Authorized Access Only • Secure Internal Management
                        </p>
                    </div>

                    <div className="flex items-center gap-3 px-5 py-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-2xl border border-gray-100 dark:border-gray-800 group hover:border-primary-500/30 transition-all duration-500">
                        <Code2 size={14} className="text-[#166534] animate-pulse" />
                        <span className="text-[0.55rem] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
                            Developed with <Heart size={10} className="inline text-red-500 mx-1 fill-red-500 animate-bounce" /> by 
                            <span className="text-[#166534] dark:text-primary-400 ml-1 font-black">Silan Software pvt. ltd.</span>
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 selection:bg-green-600 selection:text-white font-sans">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}