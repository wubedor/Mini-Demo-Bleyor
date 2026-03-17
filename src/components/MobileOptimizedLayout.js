import React from 'react';
import { useMobile } from '../hooks/useMobile';
import './MobileOptimizedLayout.css';

export default function MobileOptimizedLayout({ children }) {
  const mobileInfo = useMobile();

  return (
    <div className={`app-wrapper ${mobileInfo.isMobile ? 'mobile' : mobileInfo.isTablet ? 'tablet' : 'desktop'}`}>
      {/* Mobile-specific optimizations */}
      {mobileInfo.isMobile && (
        <>
          {/* Add mobile-specific meta tags */}
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
          
          {/* Mobile status bar color */}
          <meta name="theme-color" content="#2563eb" />
          
          {/* Apple touch icon */}
          <link rel="apple-touch-icon" href="/SAMBS.png" />
          
          {/* Prevent zoom on input focus (iOS) */}
          <style>{`
            @media screen and (-webkit-min-device-pixel-ratio:0) {
              select, textarea, input[type="text"], input[type="password"], 
              input[type="datetime"], input[type="datetime-local"], 
              input[type="date"], input[type="month"], input[type="time"], 
              input[type="week"], input[type="number"], input[type="email"], 
              input[type="url"], input[type="search"], input[type="tel"], 
              input[type="color"] {
                font-size: 16px !important;
              }
            }
          `}</style>
        </>
      )}
      
      {/* Main content with mobile optimizations */}
      <main className={`main-content ${mobileInfo.orientation}`}>
        {children}
      </main>
      
      {/* Mobile-specific footer */}
      {mobileInfo.isMobile && (
        <div className="mobile-footer">
          <div className="mobile-nav">
            <button className="nav-btn active">
              <span className="nav-icon">🏠</span>
              <span className="nav-label">Home</span>
            </button>
            <button className="nav-btn">
              <span className="nav-icon">🧺</span>
              <span className="nav-label">Services</span>
            </button>
            <button className="nav-btn">
              <span className="nav-icon">📅</span>
              <span className="nav-label">Bookings</span>
            </button>
            <button className="nav-btn">
              <span className="nav-icon">👤</span>
              <span className="nav-label">Profile</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Device info for debugging (remove in production) */}
      {false && process.env.NODE_ENV === 'development' && (
        <div className="device-info">
          <small>
            {mobileInfo.deviceType} | {mobileInfo.screenWidth}x{mobileInfo.screenHeight} | 
            {mobileInfo.orientation} | {mobileInfo.isOnline ? 'Online' : 'Offline'} |
            {mobileInfo.isStandalone ? 'Standalone' : 'Browser'}
          </small>
        </div>
      )}
    </div>
  );
}
