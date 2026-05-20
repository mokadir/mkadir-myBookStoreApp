import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

const AuthContext = createContext();

/**
 * AuthProvider - manages authentication state across the app
 * Stores user info in localStorage for persistence
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('userInfo');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('userInfo');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Register a new user
   */
  const register = useCallback(async (name, email, password) => {
    setError('');
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email, password) => {
    setError('');
    try {
      const { data } = await authApi.login({ email, password });
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('userInfo');
    setUser(null);
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (userData) => {
    try {
      const { data } = await authApi.updateProfile(userData);
      const updatedUser = { ...user, ...data };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Update failed';
      setError(message);
      throw new Error(message);
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    setError,
    register,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to access auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;