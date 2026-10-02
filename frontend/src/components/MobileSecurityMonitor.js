import React, { useEffect } from 'react';
import mobileAppSecurity from '../utils/mobileAppSecurity';

// Mobile App Security Component
// Provides production-ready security for SAMB's Laundry mobile app

export default function MobileSecurityMonitor() {
  const [securityStatus, setSecurityStatus] = React.useState(null);

  useEffect(() => {
    // Initialize mobile app security
    mobileAppSecurity.init();
    
    // Get security status
    const status = mobileAppSecurity.getSecurityStatus();
    setSecurityStatus(status);
    
    // Set up periodic security checks
    const securityInterval = setInterval(() => {
      const currentStatus = mobileAppSecurity.getSecurityStatus();
      setSecurityStatus(currentStatus);
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(securityInterval);
    };
  }, []);

  const handleClearSecurityData = () => {
    mobileAppSecurity.clearSecurityData();
    setSecurityStatus(mobileAppSecurity.getSecurityStatus());
  };

  const getSecurityLevelColor = (level) => {
    switch (level) {
      case 'production': return '#00ff88';
      case 'development': return '#ffc107';
      default: return '#ff4444';
    }
  };

  return (
    <div className="mobile-security-monitor" style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.9)',
      border: '1px solid #333',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '12px',
      zIndex: '9999',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      display: 'none' // Hide the entire component
    }}>
    </div>
  );
}
