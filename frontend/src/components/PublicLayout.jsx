import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Sun, Moon, LogIn, MapPin, Phone, Mail, ArrowUp, ChevronRight,
  Menu, X, FileText, Users, Search, GraduationCap, Building, 
  Briefcase, ShieldCheck, Award, Microscope, Flag, LayoutGrid, History, ChevronDown
} from 'lucide-react';

// --- Data based on ARYAN Website structure ---
const topLinks = [
  { name: 'IMS Login', path: '/login', icon: <LogIn /> },
  { name: 'Alumni', path: '#', icon: <Users /> },
  { name: 'Admission Inquiry', path: '/admission-inquiry', icon: <FileText />, highlight: true },
  { name: 'Aryan Brochure', path: '#', icon: <FileText /> },
];

const mainNavLinks = [
  { name: 'Institute', path: '/institute/history', icon: <History /> },
  { 
    name: 'Academic', 
    path: '#', 
    icon: <GraduationCap />,
    children: [
        { 
            name: 'Courses', 
            path: '#',
            children: [
                { name: 'Diploma', path: '#' },
                { name: 'B.Tech', path: '#' },
                { name: 'M.Tech', path: '#' },
                { name: 'MBA', path: '#' },
                { name: 'MCA', path: '#' }
            ]
        },
        { 
            name: 'Department', 
            path: '#',
            children: [
                { name: 'CSE', path: '#' },
                { name: 'Mech', path: '#' },
                { name: 'Civil', path: '#' },
                { name: 'EE/EEE', path: '#' },
                { name: 'ECE', path: '#' },
                { name: 'BSH', path: '#' },
                { name: 'Mining', path: '#' }
            ]
        },
        { name: 'Committee', path: '#' },
        { name: 'MOOCS Courses', path: '#' },
        { name: 'Library', path: '/app/library' },
        { name: 'Academic Calender', path: '/app/calendar' },
        { name: 'Syllabus', path: '#' },
        { name: 'Capacity Building Policy', path: '#' },
        { name: 'Staff handbook', path: '#' },
        { name: 'Student handbook', path: '#' },
        { name: 'Feedback', path: '#' },
        { name: 'Lecture Note', path: '#' },
        { name: 'Previous Year Question & Answer', path: '#' },
        { name: 'Mandatory Disclosure', path: '#' }
    ]
  },
  { name: 'Admission', path: '/admission-inquiry', icon: <FileText /> },
  { name: 'Training & Placement', path: '/app/placements', icon: <Briefcase /> },
  { name: 'Facilities', path: '#', icon: <LayoutGrid /> },
  { name: 'Cell', path: '#', icon: <ShieldCheck /> },
  { name: 'NAAC', path: '#', icon: <Award /> },
  { name: 'NCC', path: '#', icon: <Flag /> },
  { name: 'Research & Publication', path: '#', icon: <Microscope /> }
];

function TopBar() {
    return (
        <div className="bg-primary-950 text-gray-300 py-1 text-xs border-b border-gray-800 hidden lg:block transition-all duration-300 font-sans">
            <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
                <div className="flex items-center gap-6">
                    {/* Logo Image Only in TopBar to optimize space below */}
                    <Link to="/" className="flex items-center group mr-4">
                        <img src="/logo.png" alt="Aryan Logo" className="h-9 w-auto bg-white rounded p-0.5 transform group-hover:scale-110 transition-transform shadow-sm" />
                    </Link>

                    <div className="flex items-center gap-4">
                        {topLinks.map((link, idx) => (
                            <Link
                                key={idx}
                                to={link.path}
                                className={`flex items-center gap-2 transition-all duration-200 font-medium group ${
                                    link.highlight
                                        ? 'text-white hover:text-red-300'
                                        : 'hover:text-white'
                                }`}
                            >
                                {link.highlight && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>}
                                {React.cloneElement(link.icon, { size: 14, className: link.highlight ? 'text-red-400' : '' })}
                                <span className="group-hover:translate-x-0.5 transition-transform">{link.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <a href="tel:+919437481252" className="flex items-center gap-2 hover:text-white transition-colors group">
                        <Phone size={14} className="text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="tracking-wide">+91-9437481252</span>
                    </a>
                    <a href="mailto:admission@aryan.ac.in" className="flex items-center gap-2 hover:text-white transition-colors group">
                        <Mail size={14} className="text-primary-500 group-hover:scale-110 transition-transform" />
                        <span className="tracking-wide">admission@aryan.ac.in</span>
                    </a>
                </div>
            </div>
        </div>
    )
}

function NavItem({ link, isMobile, onClose }) {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = link.children && link.children.length > 0;
    const isActive = location.pathname === link.path;

    if (hasChildren) {
        if (isMobile) {
            return (
                <div className="flex flex-col">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`flex items-center justify-between px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors rounded-lg ${
                            isOpen ? 'text-white bg-primary-600 shadow-md' : 'text-gray-700 dark:text-gray-200'
                        }`}
                    >
                        <span className="flex items-center gap-3">
                            {link.icon && React.cloneElement(link.icon, { size: 18, className: isOpen ? "text-white" : "text-primary-500" })}
                            {link.name}
                        </span>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100 mb-2' : 'max-h-0 opacity-0'}`}>
                        <div className="ml-6 flex flex-col space-y-1 border-l-2 border-primary-200 dark:border-primary-900/50 pl-4 mt-2">
                            {link.children.map(child => (
                                <NavItem key={child.name} link={child} isMobile={true} onClose={onClose} />
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group/parent">
                <button
                    className={`flex items-center gap-1.5 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 group-hover/parent:bg-primary-600 group-hover/parent:text-white ${
                        isActive ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-800 dark:text-gray-100'
                    }`}
                >
                    {link.name}
                    <ChevronDown size={14} className="group-hover/parent:rotate-180 transition-transform duration-300" />
                </button>
                <div className="absolute left-0 mt-0 pt-0 w-72 opacity-0 invisible group-hover/parent:opacity-100 group-hover/parent:visible transition-all duration-200 z-[100] transform translate-y-1 group-hover/parent:translate-y-0">
                    <div className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 py-0 overflow-visible">
                        {link.children.map((child, idx) => {
                            const hasSubChildren = child.children && child.children.length > 0;
                            return (
                                <div key={child.name} className="relative group/sub">
                                    <Link
                                        to={child.path}
                                        className={`flex items-center justify-between px-5 py-3 text-[0.75rem] font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100 hover:bg-primary-600 hover:text-white border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0 transition-all duration-150`}
                                    >
                                        {child.name}
                                        {hasSubChildren && <ChevronDown size={14} className="text-gray-400 -rotate-90 group-hover/sub:text-white transition-transform group-hover/sub:translate-x-1" />}
                                    </Link>
                                    {hasSubChildren && (
                                        <div className="absolute left-full top-0 ml-[1px] w-64 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 transform translate-x-1 group-hover/sub:translate-x-0">
                                            <div className="bg-white dark:bg-gray-800 shadow-2xl border border-gray-100 dark:border-gray-700 py-0">
                                                {child.children.map((subChild, sIdx) => (
                                                    <Link
                                                        key={subChild.name}
                                                        to={subChild.path}
                                                        className={`block px-5 py-3 text-[0.75rem] font-bold uppercase tracking-wide text-gray-800 dark:text-gray-100 hover:bg-primary-600 hover:text-white border-b border-dashed border-gray-100 dark:border-gray-700 last:border-0 transition-colors`}
                                                    >
                                                        {subChild.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            to={link.path}
            onClick={onClose}
            className={isMobile 
                ? `px-4 py-3 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:bg-primary-600 hover:text-white rounded-lg flex justify-between items-center group transition-colors`
                : `flex items-center gap-1.5 px-3 py-2 text-[0.7rem] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 hover:bg-primary-600 hover:text-white ${
                    isActive 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-800 dark:text-gray-100'
                }`
            }
        >
            {isMobile ? (
                <>
                    <span className="flex items-center gap-3">
                        {link.icon && React.cloneElement(link.icon, { size: 18, className: "text-primary-500 group-hover:text-white" })}
                        {link.name}
                    </span>
                    <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                </>
            ) : link.name}
        </Link>
    );
}

function Header() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
    <TopBar />
    <div className="h-1 w-full bg-primary-700 hidden lg:block"></div>
    <header
      className={`sticky top-0 z-50 transition-all duration-500 border-b border-transparent ${
        isScrolled
          ? 'bg-white/98 dark:bg-gray-900/98 backdrop-blur-md shadow-2xl border-gray-200 dark:border-gray-800 py-1'
          : 'bg-white dark:bg-gray-900 py-2 lg:py-3 shadow-sm'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Branding Section (Restored to main Navbar with requested styles) */}
          <Link to="/" className="flex items-center gap-4 group relative z-50 flex-shrink-0">
            <div className="flex flex-col">
                <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-primary-700 dark:text-primary-400 leading-none font-serif transition-transform group-hover:scale-[1.02]">
                    ARYAN
                </h1>
                <p className="text-[0.65rem] lg:text-[0.72rem] font-extrabold tracking-[0.2em] text-primary-700 dark:text-primary-400 uppercase mt-2.5 leading-none">
                    Institute of Engineering & Technology
                </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-1 ml-4">
            <Link to="/" className="p-2.5 text-gray-800 dark:text-gray-100 hover:text-white hover:bg-primary-600 rounded-sm transition-all duration-300" aria-label="Home">
                <Building size={20} />
            </Link>
            {mainNavLinks.map((link) => (
                <NavItem key={link.name} link={link} isMobile={false} />
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 relative z-50">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-all duration-300 hover:rotate-180 hover:scale-110"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            
            <button
                className="xl:hidden p-2 text-gray-800 dark:text-gray-100 hover:text-primary-600 transition-transform active:scale-90"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
            >
                {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div 
        className={`xl:hidden absolute top-full left-0 w-full bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl border-b dark:border-gray-800 shadow-2xl transition-all duration-400 ease-in-out origin-top overflow-hidden z-40 ${
            mobileMenuOpen ? 'max-h-[90vh] opacity-100 translate-y-0' : 'max-h-0 opacity-0 -translate-y-4'
        }`}
      >
        <div className="container mx-auto px-4 py-6 flex flex-col space-y-1 overflow-y-auto max-h-[85vh]">
            {mainNavLinks.map((link) => (
                <NavItem key={link.name} link={link} isMobile={true} onClose={() => setMobileMenuOpen(false)} />
            ))}
            
            <div className="border-t border-gray-100 dark:border-gray-800 my-4 pt-4">
                 <p className="px-4 text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest mb-3">Quick Access</p>
                 <div className="grid grid-cols-1 gap-2">
                    {topLinks.map((link, idx) => (
                        <Link
                            key={idx}
                            to={link.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase rounded-lg transition-colors ${
                                link.highlight 
                                ? 'text-white bg-red-600 shadow-lg' 
                                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                        >
                            {React.cloneElement(link.icon, { size: 18 })}
                            {link.name}
                        </Link>
                    ))}
                 </div>
                 <div className="mt-6 px-4 space-y-4 border-t dark:border-gray-800 pt-6">
                    <a href="tel:+919437481252" className="flex items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full"><Phone size={18} className="text-primary-600" /></div>
                        +91-9437481252
                    </a>
                    <a href="mailto:admission@aryan.ac.in" className="flex items-center gap-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                        <div className="p-2 bg-primary-100 dark:bg-primary-900/50 rounded-full"><Mail size={18} className="text-primary-600" /></div>
                        admission@aryan.ac.in
                    </a>
                 </div>
            </div>
        </div>
      </div>
    </header>
    </>
  );
}

function Footer() {
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const LinkItem = ({ text, to = "#" }) => (
        <li>
            <Link to={to} className="flex items-center text-gray-400 hover:text-yellow-400 transition-all duration-300 group text-[0.8rem] font-medium py-1.5 border-b border-transparent hover:border-primary-900/30">
                <ChevronRight size={14} className="mr-1 text-primary-500 transform group-hover:translate-x-1 transition-transform" />
                <span className="group-hover:translate-x-0.5 transition-transform">{text}</span>
            </Link>
        </li>
    );

    return (
        <footer className="bg-gray-950 text-gray-300 border-t border-gray-900 relative overflow-hidden font-sans">
            {/* Top branding accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700"></div>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Column 1: Identity */}
                    <div className="space-y-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 group">
                                <img src="/logo.png" alt="Aryan Institute" className="h-16 w-auto bg-white rounded-xl p-1.5 shadow-2xl transition-transform group-hover:scale-105" />
                                <div className="flex flex-col">
                                    <h3 className="text-2xl font-black text-primary-500 leading-none tracking-tighter">ARYAN</h3>
                                    <p className="text-primary-400 text-[0.65rem] font-black tracking-widest uppercase mt-1.5 leading-tight opacity-80">
                                        INSTITUTE OF ENGINEERING & TECHNOLOGY
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-primary-900/30 transition-colors">
                                <h4 className="flex items-center font-bold text-white mb-3 uppercase text-xs tracking-[0.2em] text-primary-400">
                                    <MapPin size={16} className="text-primary-500 mr-2" /> City Office
                                </h4>
                                <p className="text-[0.85rem] leading-relaxed text-gray-400 pl-6">
                                    32, Forest Park, First Floor,<br/> Bhubaneswar-751009
                                </p>
                            </div>
                            <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800/50 hover:border-primary-900/30 transition-colors">
                                <h4 className="flex items-center font-bold text-white mb-3 uppercase text-xs tracking-[0.2em] text-primary-400">
                                    <MapPin size={16} className="text-primary-500 mr-2" /> Campus
                                </h4>
                                <p className="text-[0.85rem] leading-relaxed text-gray-400 pl-6">
                                    Aryan Institute of Engineering & Technology, Arya Vihar, Bhubaneswar-752050
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Contact */}
                    <div>
                        <h3 className="text-xl font-black text-white mb-8 relative inline-block">
                            Contact Info
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-primary-500 rounded-full"></span>
                        </h3>
                        <ul className="space-y-6">
                            <li className="flex items-start group p-3 hover:bg-gray-900/40 rounded-lg transition-colors">
                                <Phone size={20} className="text-primary-500 mr-4 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <div className="space-y-1">
                                    <span className="block text-[0.85rem] font-bold text-gray-200">+91-9437481251</span>
                                    <span className="block text-[0.85rem] font-bold text-gray-200">+91-9437481252</span>
                                </div>
                            </li>
                            <li className="flex items-start group p-3 hover:bg-gray-900/40 rounded-lg transition-colors">
                                <Mail size={20} className="text-primary-500 mr-4 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
                                <a href="mailto:admission@aryan.ac.in" className="text-[0.85rem] font-bold text-gray-200 hover:text-primary-400 transition-colors">admission@aryan.ac.in</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Links */}
                    <div>
                        <h3 className="text-xl font-black text-white mb-8 relative inline-block">
                            Resources
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-yellow-500 rounded-full"></span>
                        </h3>
                        <ul className="grid grid-cols-1 gap-1">
                            <LinkItem text="Notice Board" to="/app/notice-board" />
                            <LinkItem text="E-Magazine" />
                            <LinkItem text="Blogs & Articles" />
                            <LinkItem text="Grievance Redressal" />
                            <LinkItem text="Student Feedback" />
                            <LinkItem text="Parent Feedback" />
                            <LinkItem text="Faculty Appraisal" />
                        </ul>
                    </div>

                    {/* Column 4: Compliance */}
                    <div>
                        <h3 className="text-xl font-black text-white mb-8 relative inline-block">
                            Important
                            <span className="absolute -bottom-2 left-0 w-12 h-1 bg-yellow-500 rounded-full"></span>
                        </h3>
                        <ul className="grid grid-cols-1 gap-1">
                            <LinkItem text="Central Library" to="/app/library" />
                            <LinkItem text="Mandatory Disclosure" />
                            <LinkItem text="Aryan Brochure" />
                            <LinkItem text="Privacy Policy" />
                            <LinkItem text="Terms of Use" />
                            <LinkItem text="Anti-Ragging Cell" />
                            <LinkItem text="Internal Complaint" />
                        </ul>
                    </div>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center text-[0.75rem] font-bold tracking-wider text-gray-600">
                    <p className="mb-6 md:mb-0 uppercase">© {new Date().getFullYear()} <span className="text-primary-700">ARYAN</span> Institute of Engineering & Technology. All rights reserved.</p>
                    <div className="flex gap-8">
                        <Link to="#" className="hover:text-primary-500 transition-colors uppercase">Accreditation</Link>
                        <Link to="#" className="hover:text-primary-500 transition-colors uppercase">Ranking</Link>
                        <Link to="#" className="hover:text-primary-500 transition-colors uppercase">Affiliation</Link>
                    </div>
                </div>
            </div>

            {/* Premium Scroll to Top */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-10 right-10 bg-primary-600 hover:bg-primary-500 text-white p-4 rounded-full shadow-[0_0_25px_rgba(22,163,74,0.3)] transition-all duration-500 transform hover:scale-110 active:scale-95 z-50 ${showScrollTop ? 'translate-y-0 opacity-100 rotate-0' : 'translate-y-20 opacity-0 rotate-180 pointer-events-none'}`}
                aria-label="Scroll to top"
            >
                <ArrowUp size={24} strokeWidth={3} />
            </button>
        </footer>
    );
}

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}