
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './UserProfile/UserProfile.jsx';

export default function ProfilePage() {
    const { user } = useAuth();

    if (!user) {
        return null; // or a loading indicator
    }

    // This page is now only for Admin and Teacher roles
    if (user.role === 'Admin' || user.role === 'Teacher') {
        return <UserProfile />;
    }

    return (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Access Restricted</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">This profile view is available only to Admin and Teacher roles.</p>
        </div>
    );
}
