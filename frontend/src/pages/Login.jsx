import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = (role) => {
    if (login(role)) {
      if (role === 'Teacher') {
        navigate('/app/teacher-dashboard');
      } else if (role === 'Student') {
        navigate('/app/profile');
      } else {
        navigate('/app');
      }
    } else {
      alert('Login failed!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
       <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
            <div className="flex justify-center items-center mx-auto w-20 h-20 bg-blue-600 rounded-full">
                <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900 dark:text-white">Institute Management System</h1>
            <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Select a role to login and explore the system</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100">Login As</h2>
            <button
                onClick={() => handleLogin('Admin')}
                className="w-full flex items-center justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
                <LogIn className="mr-2" size={20} />
                Admin
            </button>
            <button
                onClick={() => handleLogin('Teacher')}
                className="w-full flex items-center justify-center py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
                <LogIn className="mr-2" size={20} />
                Teacher
            </button>
            <button
                onClick={() => handleLogin('Student')}
                className="w-full flex items-center justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
                <LogIn className="mr-2" size={20} />
                Student
            </button>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
            This is a demo application. No username/password required.
        </p>
       </div>
    </div>
  );
}