import React from 'react';
import { useMobile } from '../hooks/useMobile';
import './UniversalMobileLayout.css';

export default function UniversalMobileLayout({ children }) {
  const mobileInfo = useMobile();

  // Dynamic classes based on device
  const getDeviceClass = () => {
    const { deviceType, screenWidth, screenHeight } = mobileInfo;
    
    if (deviceType === 'ios') {
      if (screenWidth <= 375) return 'ios-small'; // iPhone SE
      if (screenWidth <= 428) return 'ios-medium'; // iPhone 12/13/14
      return 'ios-large'; // iPhone Pro Max
    }
    
    if (deviceType === 'android') {
      if (screenWidth <= 411) return 'android-small'; // Android compact
      if (screenWidth <= 480) return 'android-medium'; // Android regular
      return 'android-large'; // Android large/tablet
    }
    
    if (screenWidth <= 375) return 'device-small';
    if (screenWidth <= 428) return 'device-medium';
    if (screenWidth <= 480) return 'device-large';
    return 'device-xlarge';
  };

  const getOrientationClass = () => {
    return mobileInfo.orientation === 'landscape' ? 'landscape' : 'portrait';
  };

  const deviceClasses = [
    'universal-mobile-layout',
    getDeviceClass(),
    getOrientationClass(),
    mobileInfo.deviceType,
    mobileInfo.isStandalone ? 'standalone' : 'browser'
  ].filter(Boolean).join(' ');

  return (
    <div className={deviceClasses}>
      {/* Device-specific meta adjustments */}
      {mobileInfo.isMobile && (
        <style>{`
          /* iOS Safari specific fixes */
          ${mobileInfo.deviceType === 'ios' ? `
            .form-input { font-size: 16px !important; }
            .mobile-footer { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
          ` : ''}
          
          /* Android specific fixes */
          ${mobileInfo.deviceType === 'android' ? `
            .btn { outline: none; }
            .btn:focus { outline: 2px solid #2563eb; outline-offset: 2px; }
          ` : ''}
          
          /* Small screen adjustments */
          ${mobileInfo.screenWidth <= 375 ? `
            .service-card { margin: 8px !important; padding: 12px !important; }
            .btn { padding: 12px 16px !important; font-size: 14px !important; }
            .nav-btn { min-width: 50px !important; padding: 6px 4px !important; }
          ` : ''}
          
          /* Medium screen adjustments */
          ${mobileInfo.screenWidth > 375 && mobileInfo.screenWidth <= 428 ? `
            .service-card { margin: 12px !important; padding: 16px !important; }
            .btn { padding: 14px 20px !important; font-size: 15px !important; }
            .nav-btn { min-width: 60px !important; padding: 8px 8px !important; }
          ` : ''}
          
          /* Large screen adjustments */
          ${mobileInfo.screenWidth > 428 ? `
            .service-card { margin: 16px !important; padding: 20px !important; }
            .btn { padding: 16px 24px !important; font-size: 16px !important; }
            .nav-btn { min-width: 70px !important; padding: 10px 12px !important; }
          ` : ''}
          
          /* Landscape adjustments */
          ${mobileInfo.orientation === 'landscape' ? `
            .mobile-footer { height: 50px !important; }
            .location-map-container { max-height: 300px !important; }
            .nav-icon { font-size: 14px !important; }
            .nav-label { font-size: 8px !important; }
          ` : ''}
        `}</style>
      )}

      {/* Main content wrapper */}
      <main className="universal-content">
        {children}
      </main>

      {/* Device-specific mobile navigation */}
      {mobileInfo.isMobile && mobileInfo.screenWidth <= 768 && (
        <nav className="universal-mobile-nav">
          <button className="nav-item active" data-page="home">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Home</span>
          </button>
          <button className="nav-item" data-page="services">
            <span className="nav-icon">🧺</span>
            <span className="nav-label">Services</span>
          </button>
          <button className="nav-item" data-page="bookings">
            <span className="nav-icon">📅</span>
            <span className="nav-label">Bookings</span>
          </button>
          <button className="nav-item" data-page="profile">
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profile</span>
          </button>
        </nav>
      )}

      {/* Development info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="device-debug" style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '10px',
          zIndex: 9999,
          display: 'none' // Hidden by default
        }}>
          {mobileInfo.deviceType} | {mobileInfo.screenWidth}x{mobileInfo.screenHeight} | {mobileInfo.orientation}
        </div>
      )}
    </div>
  );
}
