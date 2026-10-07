import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function BackendAdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAdminAccess = () => {
      setLoading(true);
      setError('');

      try {
        // Check if user has authentication token
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Check user role from localStorage
        const userRole = localStorage.getItem('userRole');
        const userData = localStorage.getItem('userData');
        
        if (!userData) {
          setError('User data not found');
          setLoading(false);
          return;
        }

        const parsedUser = JSON.parse(userData);

        // Check if user has admin role
        if (userRole !== 'admin' && userRole !== 'super_admin') {
          setError('Admin access required');
          setLoading(false);
          return;
        }

        // Check if user account is active
        if (parsedUser.isActive === false) {
          setError('Account is not active');
          setLoading(false);
          return;
        }

        setIsAuthorized(true);
        setLoading(false);
      } catch (error) {
        console.error('Error checking admin access:', error);
        setError('Error verifying admin access');
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  if (loading) {
    return (
      <div className="admin-route-loading">
        <div className="loading-spinner"></div>
        <p>Verifying admin access...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-route-error">
        <div className="error-container">
          <h2>🔒 Access Denied</h2>
          <p>{error}</p>
          <div className="error-details">
            <h3>What happened?</h3>
            <p>You don't have permission to access this admin area.</p>
            
            <h3>What you can do:</h3>
            <ul>
              <li>Contact your system administrator</li>
              <li>Sign in with an admin account</li>
              <li>Request admin access if needed</li>
            </ul>
          </div>
          
          <div className="error-actions">
            <button 
              onClick={() => window.history.back()}
              className="back-button"
            >
              ← Go Back
            </button>
            <button 
              onClick={() => window.location.href = '/login'}
              className="login-button"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
