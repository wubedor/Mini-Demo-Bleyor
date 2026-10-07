import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for stored user data from backend authentication
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Reset state
    setUser(null);
    setIsAdmin(false);
    
    // Reload page to ensure clean state
    window.location.reload();
  };

  const value = {
    user,
    loading,
    isAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <LoadingSpinner /> : children}
    </AuthContext.Provider>
  );
}
