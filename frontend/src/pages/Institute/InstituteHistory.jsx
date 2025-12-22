import React from 'react';
import { Target, Lightbulb, History, CheckCircle } from 'lucide-react';

const InstituteHistory = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-700 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600 rounded-full blur-3xl opacity-40"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            About <span className="text-primary-300 font-bold">Aryan Institute</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-3xl mx-auto leading-relaxed">
            A legacy of excellence in engineering education since 2009.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-16 relative z-20">
        
        {/* History Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center mb-6">
                <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-xl mr-4 text-primary-600 dark:text-primary-400">
                    <History size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Brief History</h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed space-y-4">
                <p>
                    Founded in 2009, <strong className="text-primary-700 dark:text-primary-400">Aryan Institute of Engineering and Technology (AIET)</strong> stands as a prominent institution among self-financing engineering colleges in eastern India. Located in the temple city of Bhubaneswar, Odisha, AIET is an integral part of the Aryan Educational Trust. Accredited with an "A" Grade by NAAC and affiliated with BPUT, Odisha, the college is dedicated to cultivating disciplined and skilled young engineers for comprehensive national progress.
                </p>
                <p>
                    AIET's commitment extends beyond education, aiming to secure employment opportunities for students upon completion of their four-year engineering degree. The NAAC accreditation in 2023 underscores the institution's unwavering commitment to providing a sustainable learning environment.
                </p>
                <p>
                    The faculty at AIET comprises individuals with a unique blend of industry and academic experience, ensuring the delivery of quality education in technical fields. With an affordable fee structure and a convenient location in the smart city of Bhubaneswar, AIET emerges as a preferred destination for both aspiring students and parents alike.
                </p>
            </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-lg p-8 border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mr-4 text-blue-600 dark:text-blue-400">
                        <Target size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Mission</h2>
                </div>
                <ul className="space-y-4">
                    {[
                        "To impart contemporary technical education and skills to students of different socio-economic background.",
                        "To equip students with analytical learning and real life problem solving.",
                        "To make learning a continuous endeavour compatible with market needs.",
                        "To promote the spirit of leadership, entrepreneurship, innovation and ethics."
                    ].map((item, index) => (
                        <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                            <CheckCircle className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Vision */}
            <div className="bg-gradient-to-br from-white to-purple-50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl shadow-lg p-8 border-t-4 border-purple-500 hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mr-4 text-purple-600 dark:text-purple-400">
                        <Lightbulb size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Our Vision</h2>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed italic">
                    "To become a leading engineering institution of the state by impacting quality technical education at affordable costs to create skilled and motivated engineers to serve the technological requirements of society in different ways."
                </p>
                <div className="mt-8 flex justify-end">
                    <div className="h-2 w-24 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"></div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default InstituteHistory;