import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, UserCog, User, Shield, ArrowLeft } from 'lucide-react';

const RoleCard = ({ role, icon, color, path }) => (
    <Link to={path} className={`block p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${color}`}>
        <div className="flex flex-col items-center text-white">
            {icon}
            <h3 className="mt-4 text-2xl font-bold">{role}</h3>
            <p className="mt-1 text-sm opacity-90">Login as {role}</p>
        </div>
    </Link>
);

export default function LoginSelection() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4 relative">
       {/* Back Button */}
       <Link to="/" className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">
            <ArrowLeft size={20} className="mr-2" />
            Back to Home
       </Link>

       <div className="max-w-4xl w-full mx-auto">
        <div className="text-center mb-10">
            <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-600 rounded-full mb-4">
                <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">Welcome Back!</h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Please select your role to proceed.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <RoleCard role="Admin" icon={<Shield size={48}/>} color="bg-primary-600 hover:bg-primary-700" path="/login/admin" />
           <RoleCard role="Teacher" icon={<UserCog size={48}/>} color="bg-primary-600 hover:bg-primary-700" path="/login/teacher" />
           <RoleCard role="Student" icon={<User size={48}/>} color="bg-primary-600 hover:bg-primary-700" path="/login/student" />
        </div>
       </div>
    </div>
  );
}