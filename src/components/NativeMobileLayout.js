import React, { useEffect, useState } from 'react';
import { useMobile } from '../hooks/useMobile';
import './NativeMobileLayout.css';

export default function NativeMobileLayout({ children }) {
  const mobileInfo = useMobile();
  const [platformClass, setPlatformClass] = useState('');

  useEffect(() => {
    // Detect platform and apply appropriate classes
    const detectPlatform = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const { deviceType, screenWidth } = mobileInfo;
      
      let platform = '';
      let size = '';
      
      // Platform Detection
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        platform = 'ios';
      } else if (/Android/i.test(userAgent)) {
        platform = 'android';
      } else if (deviceType === 'ios') {
        platform = 'ios';
      } else if (deviceType === 'android') {
        platform = 'android';
      }
      
      // Size Detection
      if (platform === 'ios') {
        if (screenWidth <= 375) size = 'small';
        else if (screenWidth <= 414) size = 'medium';
        else size = 'large';
      } else if (platform === 'android') {
        if (screenWidth <= 360) size = 'small';
        else if (screenWidth <= 412) size = 'medium';
        else size = 'large';
      }
      
      return `${platform}-${size}`;
    };
    
    setPlatformClass(detectPlatform());
  }, [mobileInfo]);

  // Platform-specific content padding
  const getContentStyle = () => {
    const basePadding = mobileInfo.isMobile && mobileInfo.screenWidth <= 768 ? '60px' : '0';
    
    if (platformClass.includes('ios')) {
      return {
        paddingBottom: basePadding,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
      };
    } else if (platformClass.includes('android')) {
      return {
        paddingBottom: basePadding,
        fontFamily: 'Roboto, "Noto Sans", sans-serif'
      };
    }
    return { paddingBottom: basePadding };
  };

  const renderNavigation = () => {
    if (!mobileInfo.isMobile) return null;
    
    return (
      <nav className="native-mobile-nav">
        <div className="nav-content">
          <div className="nav-brand">
            <span className="brand-text">SAMB</span>
          </div>
          <div className="nav-items">
            <a href="/" className="nav-item">Home</a>
            <a href="/services" className="nav-item">Services</a>
            <a href="/contact" className="nav-item">Contact</a>
            {mobileInfo.user && (
              <a href="/my-bookings" className="nav-item">Bookings</a>
            )}
          </div>
        </div>
      </nav>
    );
  };

  return (
    <div className={`native-mobile-layout ${platformClass}`}>
      {/* Platform-specific meta adjustments */}
      <style>{`
        /* iOS Platform Styles */
        .ios {
          --primary-color: #007AFF;
          --secondary-color: #5856D6;
          --success-color: #34C759;
          --warning-color: #FF9500;
          --error-color: #FF3B30;
          --background-color: #F2F2F7;
          --surface-color: #FFFFFF;
          --text-primary: #000000;
          --text-secondary: #3C3C43;
          --text-tertiary: #8E8E93;
          --border-color: #C6C6C8;
          --shadow-color: rgba(0, 0, 0, 0.1);
          --nav-height: 65px;
          --card-radius: 16px;
          --button-radius: 12px;
          --transition: 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Android Platform Styles */
        .android {
          --primary-color: #1976D2;
          --secondary-color: #7B1FA2;
          --success-color: #388E3C;
          --warning-color: #F57C00;
          --error-color: #D32F2F;
          --background-color: #FAFAFA;
          --surface-color: #FFFFFF;
          --text-primary: #212121;
          --text-secondary: #757575;
          --text-tertiary: #BDBDBD;
          --border-color: #E0E0E0;
          --shadow-color: rgba(0, 0, 0, 0.12);
          --nav-height: 70px;
          --card-radius: 8px;
          --button-radius: 4px;
          --transition: 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }
        
        /* Size-specific adjustments */
        .ios-small { --nav-height: 60px; --card-padding: 12px; --font-scale: 0.9; }
        .ios-medium { --nav-height: 65px; --card-padding: 16px; --font-scale: 1; }
        .ios-large { --nav-height: 70px; --card-padding: 20px; --font-scale: 1.1; }
        
        .android-small { --nav-height: 65px; --card-padding: 16px; --font-scale: 0.95; }
        .android-medium { --nav-height: 70px; --card-padding: 16px; --font-scale: 1; }
        .android-large { --nav-height: 75px; --card-padding: 20px; --font-scale: 1.05; }
        
        /* Platform-specific button styles */
        .ios .btn {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif;
          font-weight: 600;
          letter-spacing: -0.4px;
          border-radius: var(--button-radius);
          border: none;
          background: var(--primary-color);
          color: white;
          transition: all var(--transition);
          box-shadow: 0 2px 8px var(--shadow-color);
        }
        
        .android .btn {
          font-family: 'Roboto', "Noto Sans", sans-serif;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.25px;
          border-radius: var(--button-radius);
          border: none;
          background: var(--primary-color);
          color: white;
          transition: all var(--transition);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        /* Platform-specific card styles */
        .ios .service-card,
        .ios .booking-card {
          background: var(--surface-color);
          border-radius: var(--card-radius);
          box-shadow: 0 2px 10px var(--shadow-color);
          border: none;
          padding: var(--card-padding);
          transition: all var(--transition);
        }
        
        .android .service-card,
        .android .booking-card {
          background: var(--surface-color);
          border-radius: var(--card-radius);
          box-shadow: 0 2px 4px var(--shadow-color);
          border: 1px solid var(--border-color);
          padding: var(--card-padding);
          transition: all var(--transition);
        }
        
        /* Platform-specific navigation */
        .ios .native-mobile-nav {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 0.5px solid var(--border-color);
          height: var(--nav-height);
        }
        
        .android .native-mobile-nav {
          background: var(--surface-color);
          box-shadow: 0 -2px 8px var(--shadow-color);
          border-top: 1px solid var(--border-color);
          height: var(--nav-height);
        }
        
        .ios .nav-item {
          transition: all var(--transition);
          border-radius: 12px;
        }
        
        .android .nav-item {
          transition: all var(--transition);
          border-radius: 50%;
          margin: 0 8px;
        }
        
        /* Safe area insets for iOS */
        .ios .native-mobile-nav {
          padding-bottom: max(8px, env(safe-area-inset-bottom));
        }
        
        .ios.standalone {
          padding-top: env(safe-area-inset-top);
        }
      `}</style>

      {/* Main content with platform-specific styling */}
      <main className="native-content" style={getContentStyle()}>
        {children}
      </main>

      {/* Platform-specific navigation */}
      {renderNavigation()}

      {/* Platform-specific status bar handling */}
      {platformClass.includes('ios') && mobileInfo.isStandalone && (
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
      )}

      {/* Development info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="platform-debug" style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          {platformClass || 'Unknown'} | {mobileInfo.screenWidth}x{mobileInfo.screenHeight}
        </div>
      )}
    </div>
  );
}
