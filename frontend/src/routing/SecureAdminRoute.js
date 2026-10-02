import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../components/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../components/firebase';
import { useSecurity } from '../context/SecurityContext';
import '../styles/SecureAdminRoute.css';

export default function AdminRoute({ children }) {
  const { logSecurityEvent, isAuthenticated } = useSecurity();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAdminAccess = async () => {
      setLoading(true);
      setError('');

      try {
        // Check if user is authenticated
        if (!auth.currentUser) {
          logSecurityEvent('unauthorized_access_attempt', {
            path: window.location.pathname,
            reason: 'not_authenticated'
          });
          setError('Authentication required');
          setLoading(false);
          return;
        }

        // Check if user is admin
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const userData = userDoc.data();
        
        if (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin')) {
          logSecurityEvent('unauthorized_access_attempt', {
            path: window.location.pathname,
            userId: auth.currentUser.uid,
            reason: 'insufficient_role',
            userRole: userData?.role || 'none'
          });
          setError('Admin access required');
          setLoading(false);
          return;
        }

        // Check if admin account is active
        if (userData.status !== 'active') {
          logSecurityEvent('blocked_access_attempt', {
            path: window.location.pathname,
            userId: auth.currentUser.uid,
            reason: 'account_inactive',
            accountStatus: userData.status
          });
          setError('Account is not active');
          setLoading(false);
          return;
        }

        // Log successful admin access
        logSecurityEvent('admin_access_granted', {
          path: window.location.pathname,
          userId: auth.currentUser.uid,
          role: userData.role
        });

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

  return children;
}
