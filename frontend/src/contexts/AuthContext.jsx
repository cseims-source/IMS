import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

// In production (Vercel), this should be set to your Render backend URL (e.g., https://your-app.onrender.com)
// In development, it defaults to empty string so the Vite proxy handles it.
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const api = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    // Prepend the base URL for production readiness
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'An error occurred');
        error.status = response.status;
        throw error;
    }
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return null;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
        const data = await api('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Login failed:', error);
        return { success: false, message: error.message };
    }
  };

  const register = async (userData) => {
    try {
        await api('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return { success: true };
    } catch (error) {
        console.error('Registration failed:', error);
        return { success: false, message: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const forgotPassword = async (email) => {
    try {
        const data = await api('/api/auth/forgotpassword', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const resetPassword = async (password, resetToken) => {
    try {
        const data = await api(`/api/auth/resetpassword/${resetToken}`, {
            method: 'PUT',
            body: JSON.stringify({ password }),
        });
        return { success: true, message: data.message };
    } catch (error) {
        return { success: false, message: error.message };
    }
  };

  const value = { user, loading, login, register, logout, api, forgotPassword, resetPassword };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}