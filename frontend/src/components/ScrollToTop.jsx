
import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="group relative flex items-center justify-center w-14 h-14 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 border border-gray-100 dark:border-gray-800"
        aria-label="Scroll to top"
      >
        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>
        
        {/* Button Inner Content */}
        <div className="absolute inset-0.5 bg-white dark:bg-gray-900 rounded-[1.1rem] z-10 flex items-center justify-center overflow-hidden">
             {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <ArrowUp 
                className="text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-500 group-hover:-translate-y-1 animate-float" 
                size={24} 
            />
        </div>
        
        {/* Magnetic Ring Effect */}
        <div className="absolute -inset-1 rounded-[1.5rem] border-2 border-primary-500/0 group-hover:border-primary-500/20 scale-90 group-hover:scale-100 transition-all duration-500"></div>
      </button>
    </div>
  );
}