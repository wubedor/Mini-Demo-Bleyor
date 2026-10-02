import React, { useState, useEffect } from 'react';
import firebaseStatusChecker from '../utils/firebaseStatusChecker';
import './FirebaseStatus.css';

export default function FirebaseStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkFirebaseStatus = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await firebaseStatusChecker.runFullCheck();
        setStatus(result);
        
        console.log('🔥 Firebase Status Check Complete:', result);
      } catch (err) {
        console.error('❌ Firebase Status Check Failed:', err);
        setError(err.message || 'Failed to check Firebase status');
      } finally {
        setLoading(false);
      }
    };

    checkFirebaseStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkFirebaseStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#00ff88';
      case 'warning': return '#ffc107';
      case 'error': return '#ff4444';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getHealthStatus = () => {
    if (!status) return 'checking';
    if (status.overall) return 'healthy';
    if (status.status && Object.values(status.status).some(s => s)) return 'warning';
    return 'error';
  };

  const healthStatus = getHealthStatus();

  if (loading) {
    return (
      <div className="firebase-status-container">
        <div className="firebase-status-header">
          <h3>🔥 Firebase Status</h3>
        </div>
        <div className="firebase-status-loading">
          <div className="loading-spinner"></div>
          <p>Checking Firebase status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="firebase-status-container">
        <div className="firebase-status-header">
          <h3>🔥 Firebase Status</h3>
        </div>
        <div className="firebase-status-error">
          <div className="error-icon">❌</div>
          <div className="error-details">
            <h4>Status Check Failed</h4>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-button"
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="firebase-status-container">
      <div className="firebase-status-header">
        <h3>🔥 Firebase Status</h3>
        <div className={`status-indicator ${healthStatus}`}>
          {getStatusIcon(healthStatus)}
          <span>{healthStatus.toUpperCase()}</span>
        </div>
      </div>

      <div className="firebase-status-content">
        {/* Overall Status */}
        <div className="status-section">
          <h4>Overall Status</h4>
          <div className={`status-item ${healthStatus}`}>
            <span className="status-icon">{getStatusIcon(healthStatus)}</span>
            <span className="status-text">
              {healthStatus === 'healthy' ? 'All Systems Operational' : 
               healthStatus === 'warning' ? 'Some Issues Detected' : 'Critical Issues'}
            </span>
          </div>
        </div>

        {/* Individual Component Status */}
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Configuration</span>
            <span className={`status-value ${status.status.config ? 'success' : 'error'}`}>
              {status.status.config ? '✅ Configured' : '❌ Missing'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Authentication</span>
            <span className={`status-value ${status.status.auth ? 'success' : 'error'}`}>
              {status.status.auth ? '✅ Ready' : '❌ Issues'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Firestore</span>
            <span className={`status-value ${status.status.firestore ? 'success' : 'error'}`}>
              {status.status.firestore ? '✅ Connected' : '❌ Failed'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Storage</span>
            <span className={`status-value ${status.status.storage ? 'success' : 'error'}`}>
              {status.status.storage ? '✅ Available' : '❌ Issues'}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label">Security Rules</span>
            <span className={`status-value ${status.status.rules ? 'success' : 'error'}`}>
              {status.status.rules ? '✅ Working' : '❌ Blocking'}
            </span>
          </div>
        </div>

        {/* Sign-in/Sign-up Readiness */}
        <div className="readiness-section">
          <h4>Sign-In & Sign-Up Readiness</h4>
          <div className={`readiness-status ${healthStatus}`}>
            <span className="readiness-icon">
              {healthStatus === 'healthy' ? '🚀' : 
               healthStatus === 'warning' ? '⚠️' : '🚫'}
            </span>
            <span className="readiness-text">
              {healthStatus === 'healthy' ? 'Ready for Sign-In & Sign-Up' : 
               healthStatus === 'warning' ? 'Limited Functionality' : 'Not Ready'}
            </span>
          </div>
        </div>

        {/* Issues and Recommendations */}
        {healthStatus !== 'healthy' && (
          <div className="issues-section">
            <h4>Issues & Recommendations</h4>
            <div className="issues-list">
              {status.details && status.details.config && status.details.config.missing && (
                <div className="issue-item">
                  <span className="issue-type">Configuration:</span>
                  <span className="issue-description">
                    Missing: {status.details.config.missing.join(', ')}
                  </span>
                </div>
              )}
              
              {status.details && status.details.firestore && status.details.firestore.error && (
                <div className="issue-item">
                  <span className="issue-type">Firestore:</span>
                  <span className="issue-description">
                    {status.details.firestore.error}
                    {status.details.firestore.code === 'permission-denied' && 
                      ' - Firestore rules need to be deployed'}
                  </span>
                </div>
              )}

              <div className="recommendations">
                <h5>🔧 Recommended Actions:</h5>
                <ul>
                  <li>Deploy updated Firestore rules to fix permission issues</li>
                  <li>Verify Firebase configuration in .env file</li>
                  <li>Check Firebase project settings</li>
                  <li>Ensure all API keys are valid</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Last Updated */}
        <div className="status-footer">
          <small>
            Last checked: {status ? new Date(status.timestamp).toLocaleString() : 'Never'}
          </small>
          <button 
            onClick={() => {
              setLoading(true);
              firebaseStatusChecker.runFullCheck().then(result => {
                setStatus(result);
                setLoading(false);
              });
            }}
            className="refresh-button"
          >
            🔄 Refresh Status
          </button>
        </div>
      </div>
    </div>
  );
}
