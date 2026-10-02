import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';
import { socketHelper } from '../utils/socketHelper';

const BackendAuthContext = createContext();

export const useBackendAuth = () => {
  const context = useContext(BackendAuthContext);
  if (!context) {
    throw new Error('useBackendAuth must be used within BackendAuthProvider');
  }
  return context;
};

export const BackendAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing tokens on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Verify token and get user data
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.data.user);
      // Connect Socket.IO with valid token
      socketHelper.connect(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${BACKEND_CONFIG.apiURL}/auth/login`, {
        email,
        password
      });

      const { user: userData, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set user state
      setUser(userData);
      
      // Connect Socket.IO
      socketHelper.disconnect();
      socketHelper.connect(tokens.accessToken);
      
      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(`${BACKEND_CONFIG.apiURL}/auth/register`, userData);
      
      const { user: newUser, tokens } = response.data.data;
      
      // Store tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      // Set user state
      setUser(newUser);
      
      // Connect Socket.IO
      socketHelper.disconnect();
      socketHelper.connect(tokens.accessToken);
      
      return { success: true, user: newUser };
    } catch (error) {
      const errorMessage = error.response?.data?.error?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('refreshToken');
      if (token) {
        await axios.post(`${BACKEND_CONFIG.apiURL}/auth/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setError(null);
      
      // Disconnect Socket.IO
      socketHelper.disconnect();
    }
  };

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${BACKEND_CONFIG.apiURL}/auth/refresh-token`, {
        refreshToken
      });

      const { tokens } = response.data.data;
      
      // Update stored tokens
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      
      return tokens.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens and logout
      logout();
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshToken,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isCustomer: user?.role === 'customer',
    isDriver: user?.role === 'driver'
  };

  return (
    <BackendAuthContext.Provider value={value}>
      {children}
    </BackendAuthContext.Provider>
  );
};

export default BackendAuthContext;
