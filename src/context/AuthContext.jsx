// AuthContext.jsx
// Handles User Authentication and Session state using React Context API only

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  // Check existing token on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = getAuthToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiRequest('/auth/me');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
          setTokenState(null);
        }
      } catch (err) {
        console.warn('Session expired, logging out:', err.message);
        setAuthToken(null);
        setTokenState(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await apiRequest('/auth/login', 'POST', { email, password });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  // Register handler
  const register = async (userData) => {
    const res = await apiRequest('/auth/register', 'POST', userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  // Logout handler
  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  // Demo Role Quick Switcher for College Internal Marks Evaluation
  // Instantly logs in as predefined project personas
  const quickSwitchRole = async (targetRole) => {
    setLoading(true);
    try {
      let email = 'customer@salon.edu';
      if (targetRole === 'Admin') email = 'admin@salon.edu';
      else if (targetRole === 'Receptionist') email = 'reception@salon.edu';
      else if (targetRole === 'Service Provider') email = 'aarav@salon.edu';
      else if (targetRole === 'Customer') email = 'customer@salon.edu';

      const res = await apiRequest('/auth/login', 'POST', {
        email,
        password: 'college123'
      });

      if (res.success) {
        setAuthToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
      }
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        quickSwitchRole,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
