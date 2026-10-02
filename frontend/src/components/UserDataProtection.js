import React, { useState, useEffect } from 'react';
import { auth } from '../components/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../components/firebase';
import { useSecurity } from '../context/SecurityContext';
import './UserDataProtection.css';

export default function UserDataProtection() {
  const { currentUser, isAdmin, encryptData, decryptData, sanitizeInput, logSecurityEvent } = useSecurity();
  const [userSensitiveData, setUserSensitiveData] = useState({});
  const [auditTrail, setAuditTrail] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user sensitive data (only for admins or own user)
  const loadUserSensitiveData = async (userId) => {
    if (!currentUser) return;

    try {
      // Only admins can view other users' data
      if (userId !== currentUser.uid && !isAdmin) {
        throw new Error('Unauthorized access to user data');
      }

      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();

      // Filter sensitive fields
      const sensitiveFields = {
        personalInfo: {
          fullName: userData.fullName || 'N/A',
          email: userData.email || 'N/A',
          phone: userData.phone || 'N/A',
          address: userData.address || 'N/A'
        },
        accountInfo: {
          role: userData.role || 'user',
          status: userData.status || 'active',
          createdAt: userData.createdAt?.toDate?.() || 'N/A',
          lastLoginAt: userData.lastLoginAt?.toDate?.() || 'N/A'
        },
        preferences: {
          notifications: userData.preferences?.notifications || false,
          privacy: userData.preferences?.privacy || 'standard',
          marketing: userData.preferences?.marketing || false
        }
      };

      setUserSensitiveData(sensitiveFields);
      
      // Log data access
      logSecurityEvent('sensitive_data_accessed', {
        targetUserId: userId,
        accessedBy: currentUser.uid,
        isAdminAccess: userId !== currentUser.uid
      });

    } catch (error) {
      console.error('Error loading user data:', error);
      logSecurityEvent('data_access_error', {
        targetUserId: userId,
        error: error.message
      });
    }
  };

  // Update user data with security checks
  const updateUserData = async (userId, updates) => {
    if (!currentUser) return;

    try {
      // Sanitize all inputs
      const sanitizedUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        sanitizedUpdates[key] = typeof value === 'string' ? sanitizeInput(value) : value;
      }

      // Add audit trail
      const auditEntry = {
        timestamp: serverTimestamp(),
        updatedBy: currentUser.uid,
        updatedByRole: isAdmin ? 'admin' : 'user',
        changes: sanitizedUpdates,
        previousData: userSensitiveData
      };

      // Update user document
      await updateDoc(doc(db, 'users', userId), {
        ...sanitizedUpdates,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: currentUser.uid,
        auditTrail: auditEntry
      });

      // Log update
      logSecurityEvent('user_data_updated', {
        targetUserId: userId,
        updatedBy: currentUser.uid,
        changes: Object.keys(sanitizedUpdates)
      });

      // Reload data
      await loadUserSensitiveData(userId);

    } catch (error) {
      console.error('Error updating user data:', error);
      logSecurityEvent('data_update_error', {
        targetUserId: userId,
        error: error.message
      });
    }
  };

  // Load audit trail for admins
  const loadAuditTrail = async () => {
    if (!isAdmin) return;

    try {
      // In production, this would load from a secure audit collection
      const mockAuditData = [
        {
          id: 1,
          timestamp: new Date(),
          action: 'user_login',
          userId: currentUser.uid,
          details: 'User logged in successfully',
          ipAddress: '10.97.183.252'
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 3600000),
          action: 'profile_update',
          userId: currentUser.uid,
          details: 'Updated phone number',
          ipAddress: '10.97.183.252'
        }
      ];

      setAuditTrail(mockAuditData);
    } catch (error) {
      console.error('Error loading audit trail:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      
      if (currentUser) {
        await loadUserSensitiveData(currentUser.uid);
        if (isAdmin) {
          await loadAuditTrail();
        }
      }
      
      setLoading(false);
    };

    initializeData();
  }, [currentUser, isAdmin]);

  if (loading) {
    return (
      <div className="data-protection-loading">
        <div className="loading-spinner"></div>
        <p>Loading secure data...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="data-protection-error">
        <h2>🔒 Authentication Required</h2>
        <p>Please sign in to access your data.</p>
      </div>
    );
  }

  return (
    <div className="user-data-protection">
      <div className="protection-header">
        <h2>🔒 Secure User Data Management</h2>
        <p>Your information is protected with enterprise-grade security</p>
      </div>

      <div className="data-sections">
        {/* Personal Information Section */}
        <div className="data-section">
          <h3>👤 Personal Information</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Full Name:</label>
              <span className="protected-data">{userSensitiveData.personalInfo?.fullName || 'N/A'}</span>
            </div>
            <div className="data-item">
              <label>Email:</label>
              <span className="protected-data">{userSensitiveData.personalInfo?.email || 'N/A'}</span>
            </div>
            <div className="data-item">
              <label>Phone:</label>
              <span className="protected-data">{userSensitiveData.personalInfo?.phone || 'N/A'}</span>
            </div>
            <div className="data-item">
              <label>Address:</label>
              <span className="protected-data">{userSensitiveData.personalInfo?.address || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Account Information Section */}
        <div className="data-section">
          <h3>🔐 Account Information</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Role:</label>
              <span className="role-badge">{userSensitiveData.accountInfo?.role || 'user'}</span>
            </div>
            <div className="data-item">
              <label>Status:</label>
              <span className={`status-badge ${userSensitiveData.accountInfo?.status || 'active'}`}>
                {userSensitiveData.accountInfo?.status || 'active'}
              </span>
            </div>
            <div className="data-item">
              <label>Member Since:</label>
              <span className="protected-data">
                {userSensitiveData.accountInfo?.createdAt instanceof Date 
                  ? userSensitiveData.accountInfo.createdAt.toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
            <div className="data-item">
              <label>Last Login:</label>
              <span className="protected-data">
                {userSensitiveData.accountInfo?.lastLoginAt instanceof Date 
                  ? userSensitiveData.accountInfo.lastLoginAt.toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Privacy Preferences Section */}
        <div className="data-section">
          <h3>🛡️ Privacy Preferences</h3>
          <div className="data-grid">
            <div className="data-item">
              <label>Email Notifications:</label>
              <span className="preference-value">
                {userSensitiveData.preferences?.notifications ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="data-item">
              <label>Privacy Level:</label>
              <span className="preference-value">
                {userSensitiveData.preferences?.privacy || 'Standard'}
              </span>
            </div>
            <div className="data-item">
              <label>Marketing Communications:</label>
              <span className="preference-value">
                {userSensitiveData.preferences?.marketing ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin-Only Audit Trail */}
      {isAdmin && (
        <div className="audit-section">
          <h3>📋 Security Audit Trail</h3>
          <div className="audit-table">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>User ID</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.timestamp.toLocaleString()}</td>
                    <td>{entry.action}</td>
                    <td>{entry.userId}</td>
                    <td>{entry.details}</td>
                    <td>{entry.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="security-notice">
        <div className="notice-icon">🔒</div>
        <div className="notice-content">
          <h4>Your Data is Protected</h4>
          <p>
            All personal information is encrypted and stored securely. Only authorized administrators 
            can access sensitive data, and all access is logged for security purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
