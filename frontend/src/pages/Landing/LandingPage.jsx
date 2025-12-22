import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BookOpen, Users, Trophy, Building2, 
  Bus, Monitor, GraduationCap, CheckCircle,
  Wifi, Sparkles, Camera, MapPin, Target, Zap, Clock
} from 'lucide-react';

const stats = [
  { label: 'Years of Excellence', value: '15+' },
  { label: 'Students Placed', value: '95%' },
  { label: 'Acres Green Campus', value: '25' },
  { label: 'Expert Faculty', value: '100+' },
];

const departments = [
  { name: 'Computer Science', code: 'CSE', desc: 'Cutting-edge labs & AI research centers.', icon: <Monitor /> },
  { name: 'Electrical Engineering', code: 'EE', desc: 'Advanced power systems & automation.', icon: <CheckCircle /> },
  { name: 'Civil Engineering', code: 'CE', desc: 'Sustainable infrastructure design.', icon: <Building2 /> },
  { name: 'Mechanical Eng.', code: 'ME', desc: 'Robotics & manufacturing excellence.', icon: <Trophy /> },
  { name: 'Electronics & Comm.', code: 'ECE', desc: 'IoT and embedded systems focus.', icon: <Wifi /> },
];

const facilities = [
  { title: 'Hostels', desc: 'Separate in-campus hostels for boys & girls with 24/7 security.', icon: <Building2 /> },
  { title: 'Transport', desc: 'Fleet of 20+ buses covering all major routes in Bhubaneswar & Cuttack.', icon: <Bus /> },
  { title: 'Central Library', desc: '20,000+ books, journals and digital resources.', icon: <BookOpen /> },
  { title: 'Wi-Fi Campus', desc: 'High-speed internet connectivity across the 25-acre campus.', icon: <Wifi /> },
];

// Local images from public folder
const campusImages = [
  '/campus1.jpg',
  '/campus2.jpg',
  '/campus3.jpg',
  '/campus4.jpg'
];

const CampusImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campusImages.length);
    }, 5000);

    const clockTimer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => {
      clearInterval(slideTimer);
      clearInterval(clockTimer);
    };
  }, []);

  // Map animations for different slides
  const animations = ['animate-kb-in', 'animate-kb-right', 'animate-kb-out', 'animate-kb-left'];

  return (
    <div className="relative h-[480px] w-full group perspective-1000">
      {/* Glow Backdrop */}
      <div className="absolute -inset-6 bg-primary-500/20 blur-3xl rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-1000 animate-pulse"></div>
      
      <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.4)] border-8 border-white/90 dark:border-gray-800/90 bg-gray-950 backdrop-blur-md">
        
        {/* All Images Pre-rendered for smooth cross-fade */}
        {campusImages.map((src, idx) => (
          <div 
            key={src}
            className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${currentIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <img
              src={src}
              alt={`Campus View ${idx + 1}`}
              className={`w-full h-full object-cover ${currentIndex === idx ? animations[idx % animations.length] : ''}`}
              onError={(e) => {
                // Remove broken image source to keep the UI clean
                e.target.style.display = 'none';
              }}
            />
          </div>
        ))}

        {/* HUD Overlay - Surveillance Aesthetic */}
        <div className="absolute inset-0 z-20 pointer-events-none border-[1px] border-white/5 m-4 rounded-3xl">
           {/* Corners */}
           <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary-500/40"></div>
           <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-500/40"></div>
           <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary-500/40"></div>
           <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary-500/40"></div>

           {/* Laser Scanning Bar */}
           <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_15px_#22c55e] animate-laser"></div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-8 left-8 z-30 flex flex-col gap-3 animate-float">
          <div className="flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 text-white shadow-2xl">
            <div className="relative h-2 w-2">
                <span className="absolute -inset-1 bg-green-500 rounded-full animate-ping opacity-75"></span>
                <div className="relative h-2 w-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
            </div>
            <span className="text-[0.6rem] font-black uppercase tracking-[0.2em]">REC_CAM_0{currentIndex + 1}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-600/20 backdrop-blur-md rounded-xl border border-primary-500/30 text-primary-400 text-[0.55rem] font-bold">
            <Clock size={10} /> {time}
          </div>
        </div>

        {/* Bottom Metadata HUD */}
        <div className="absolute bottom-0 left-0 w-full z-30 p-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-600 text-white text-[0.5rem] font-black uppercase rounded">HQ_LIVE</span>
                    <p className="text-white/60 text-[0.6rem] font-mono tracking-tighter flex items-center gap-2">
                        LAT: 20.2961° N | LONG: 85.8245° E
                    </p>
                </div>
                <h4 className="text-white font-black text-3xl tracking-tighter uppercase drop-shadow-2xl">
                    Aryan <span className="text-primary-500">Vihar</span>
                </h4>
            </div>
            
            {/* Minimalist Indicators */}
            <div className="flex gap-3 mb-2">
                {campusImages.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all duration-700 ${currentIndex === idx ? 'w-10 bg-primary-500 shadow-[0_0_20px_#22c55e]' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
          </div>
        </div>

        {/* Grid Overlay */}
        <div className="absolute inset-0 z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
      </div>
    </div>
  );
};

// Comprehensive list of companies from the user-provided image
const recruiters = [
  { name: "Wipro", domain: "wipro.com" },
  { name: "Dell", domain: "dell.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Varroc", domain: "varroc.com" },
  { name: "Unilever", domain: "unilever.com" },
  { name: "Reliance", domain: "ril.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "HCL Tech", domain: "hcltech.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "Concentrix", domain: "concentrix.com" },
  { name: "ICICI Bank", domain: "icicibank.com" },
  { name: "Bajaj Auto", domain: "bajajauto.com" },
  { name: "Genpact", domain: "genpact.com" },
  { name: "Tata Steel", domain: "tatasteel.com" },
  { name: "Mphasis", domain: "mphasis.com" },
  { name: "Royal Enfield", domain: "royalenfield.com" },
  { name: "Exide", domain: "exideindustries.com" },
  { name: "Axis Bank", domain: "axisbank.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "Tech Mahindra", domain: "techmahindra.com" },
  { name: "S&P Global", domain: "spglobal.com" },
  { name: "IDBI Bank", domain: "idbibank.in" },
  { name: "Honeywell", domain: "honeywell.com" },
  { name: "Cognizant", domain: "cognizant.com" }
];

const RecruiterLogo = ({ company }) => {
  const [error, setError] = React.useState(false);
  const logoUrl = `https://unavatar.io/${company.domain}?fallback=false`;
  const fallbackUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${company.name}&backgroundColor=15803d&fontFamily=serif&fontWeight=bold`;

  return (
    <div className="flex-shrink-0 px-6 py-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-[0_8px_30px_-15px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-15px_rgba(22,163,74,0.25)] hover:border-primary-200 dark:hover:border-primary-900 transition-all duration-500 transform hover:-translate-y-2 min-w-[200px] flex flex-col items-center justify-center gap-5 cursor-pointer group/card">
      <div className="h-14 w-28 flex items-center justify-center overflow-hidden">
        <img 
          key={error ? 'fallback' : 'main'}
          src={error ? fallbackUrl : logoUrl} 
          alt={`${company.name} logo`} 
          className="max-h-full max-w-full object-contain transition-all duration-500 scale-105 group-hover/card:scale-110"
          onError={() => setError(true)}
          loading="lazy"
        />
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[0.75rem] font-black text-gray-700 dark:text-gray-300 tracking-[0.1em] uppercase group-hover/card:text-primary-700 dark:group-hover/card:text-primary-400 transition-colors">
          {company.name}
        </span>
        <div className="w-8 h-1 bg-primary-100 dark:bg-primary-900/30 mt-2 rounded-full group-hover/card:w-16 group-hover/card:bg-primary-500 transition-all duration-500"></div>
      </div>
    </div>
  );
};

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-white dark:bg-gray-900 pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-100/50 via-transparent to-transparent dark:from-primary-900/20"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-primary-600 mr-2"></span>
              AICTE Approved & Affiliated to BPUT, Odisha
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
              Transforming Education, <br />
              <span className="text-primary-700">
                Empowering Future.
              </span>
            </h1>
            
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Welcome to <strong className="text-primary-700 dark:text-primary-400">Aryan Institute of Engineering & Technology (AIET)</strong>. 
              Experience world-class technical education in the temple city of Bhubaneswar. 
              Join us to innovate, create, and lead.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/admission-inquiry"
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-all transform hover:-translate-y-1 shadow-lg shadow-primary-500/30"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-primary-600 dark:bg-primary-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-primary-500/50">
            {stats.map((stat, index) => (
              <div key={index} className="p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-primary-100 text-sm md:text-base font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              {/* Dynamic Image Slider */}
              <CampusImageSlider />
            </div>
            
            <div>
              <h2 className="text-primary-600 dark:text-primary-400 font-black tracking-[0.2em] uppercase text-xs mb-3 flex items-center gap-2">
                <Target size={14} /> About Aryan Institute
              </h2>
              <h3 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-8 leading-[1.1]">
                Top Engineering College <br className="hidden md:block" /> in Odisha.
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                <strong className="text-primary-700 dark:text-primary-400">Aryan Institute of Engineering and Technology (AIET)</strong>, the top engineering college in Odisha and one of the best Btech college in Bhubaneswar. Established in 2009, AIET has made significant progress in imparting high-quality technical education and research excellence.
              </p>
              
              <div className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-xl p-6 rounded-2xl shadow-xl border-l-4 border-primary-500 mb-8 transform hover:scale-[1.02] transition-transform">
                  <p className="text-gray-800 dark:text-gray-200 font-bold italic text-lg leading-relaxed">
                      "<span className="text-primary-700 dark:text-primary-400">ARYAN</span> ranked 2nd among 'best Btech/engineering colleges in Odisha' in 2020."
                  </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {[
                    'AICTE & BPUT Approved',
                    'Top 2 Engineering College',
                    '100% Placement Support',
                    'Advanced R&D Focus'
                ].map((item, i) => (
                  <div key={i} className="flex items-center text-gray-700 dark:text-gray-200 font-bold text-sm bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Zap className="h-4 w-4 text-primary-600 mr-3" fill="currentColor" />
                    {item}
                  </div>
                ))}
              </div>
              <Link to="/admission-inquiry" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-black rounded-full hover:bg-primary-600 hover:text-white transition-all shadow-xl group">
                DISCOVER MORE <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform"/>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Placement Marquee */}
      <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-4 mb-16 text-center">
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter flex items-center justify-center gap-3">
               <Sparkles className="text-primary-600" size={32} />
               OUR TOP RECRUITERS
               <Sparkles className="text-primary-600" size={32} />
            </h2>
            <div className="w-24 h-1.5 bg-primary-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-500 dark:text-gray-400 font-medium uppercase tracking-[0.2em] text-sm">Join the league of global achievers</p>
        </div>
        
        <div className="relative flex overflow-x-hidden group pb-8">
          <div className="animate-marquee whitespace-nowrap flex space-x-10 items-center">
            {[...recruiters, ...recruiters].map((company, index) => (
              <RecruiterLogo key={index} company={company} />
            ))}
          </div>
        </div>

        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white dark:from-gray-900 to-transparent z-10 pointer-events-none"></div>
      </section>

      {/* Departments Grid */}
      <section className="py-24 bg-gray-50 dark:bg-gray-800/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Academic Departments</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our B.Tech programs are designed to meet the evolving demands of the global industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, idx) => (
              <div key={idx} className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300 hover:-translate-y-2">
                <div className="h-14 w-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl shadow-sm flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6 group-hover:scale-110 transition-transform">
                  {dept.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{dept.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{dept.desc}</p>
                <div className="flex items-center text-sm font-semibold text-primary-600 dark:text-primary-400">
                  <span>Explore {dept.code}</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
             <div className="group p-8 bg-gradient-to-br from-primary-600 to-purple-700 rounded-2xl shadow-xl flex flex-col justify-center items-center text-center text-white hover:-translate-y-2 transition-transform">
                <h3 className="text-2xl font-bold mb-2">Apply Now</h3>
                <p className="text-primary-100 text-sm mb-6">Admissions open for the {new Date().getFullYear()} academic session.</p>
                <Link to="/admission-inquiry" className="px-6 py-2 bg-white text-primary-700 font-bold rounded-full hover:bg-gray-100 transition-colors">
                  Get Started
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">World-Class Facilities</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {facilities.map((fac, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl shadow-sm border-b-4 border-primary-500 hover:shadow-lg transition-shadow">
                <div className="text-primary-500 mb-4">
                  {React.cloneElement(fac.icon, { size: 32 })}
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{fac.title}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{fac.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to shape your future?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join the community of innovators at <span className="text-primary-400 font-bold">Aryan Institute</span>. 
            Applications are now open for B.Tech and Diploma programs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
             <Link to="/admission-inquiry" className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-lg transition-colors">
               Online Admission
             </Link>
             <Link to="/login" className="px-8 py-3 bg-transparent border border-gray-600 hover:border-white text-white font-bold rounded-lg transition-colors">
               Contact Us
             </Link>
          </div>
        </div>
      </section>
    </div>
  );
}