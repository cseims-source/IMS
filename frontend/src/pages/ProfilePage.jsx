
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

    return <div>You do not have access to this page.</div>;
}
