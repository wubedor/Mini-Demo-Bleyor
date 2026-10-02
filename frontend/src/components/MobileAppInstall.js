import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeLocalStorage } from '../utils/mobileSafeStorage';
import './MobileAppInstall.css';

export default function MobileAppInstall() {
  const navigate = useNavigate();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    isChrome: false,
    isSafari: false
  });

  useEffect(() => {
    // Detect device and browser
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;
    const isChrome = /chrome/.test(userAgent) && /google inc/.test(navigator.vendor);
    const isSafari = /safari/.test(userAgent) && !isChrome;

    setDeviceInfo({
      isIOS,
      isAndroid,
      isDesktop,
      isChrome,
      isSafari
    });

    // Check if app is already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true;

    // Show install prompt for mobile users if not installed
    if (!isInstalled && (isIOS || isAndroid)) {
      const hasSeenPrompt = safeLocalStorage.getItem('mobile-install-seen');
      if (!hasSeenPrompt) {
        // Show browser alert first
        setTimeout(() => {
          // Browser alert for immediate attention
          if (deviceInfo.isIOS) {
            alert('📱 Install SAMB\'s Laundry App!\n\nTap the Share button ⤴️ below, then "Add to Home Screen" to install our app for easy access!');
          } else if (deviceInfo.isAndroid) {
            alert('📱 Install SAMB\'s Laundry App!\n\nTap the menu button ⋮ above, then "Add to Home screen" to install our app for easy access!');
          }
          
          // Then show the detailed modal
          setShowInstallPrompt(true);
        }, 2000); // Show after 2 seconds
      }
    }
  }, []);

  const handleInstallClick = () => {
    setShowInstallPrompt(false);
    safeLocalStorage.setItem('mobile-install-seen', 'true');
    
    // Navigate to mobile login after install prompt
    navigate('/mobile-login');
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    safeLocalStorage.setItem('mobile-install-seen', 'true');
  };

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="mobile-app-install">
      <div className="install-overlay" onClick={handleDismiss}>
        <div className="install-modal" onClick={(e) => e.stopPropagation()}>
          <div className="install-header">
            <div className="app-icon">
              <img src="/SAMBS.png" alt="SAMB's Laundry" />
            </div>
            <h3>Install SAMB's Laundry App</h3>
            <button onClick={handleDismiss} className="close-button">×</button>
          </div>
          
          <div className="install-content">
            <p>Get the best experience with our mobile app!</p>
            
            <div className="install-steps">
              {deviceInfo.isIOS ? (
                <div className="ios-steps">
                  <h4>iPhone/iPad Installation:</h4>
                  <ol>
                    <li>Tap the Share button <span className="share-icon">⤴</span></li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                    <li>The app will appear on your home screen</li>
                  </ol>
                </div>
              ) : (
                <div className="android-steps">
                  <h4>Android Installation:</h4>
                  <ol>
                    <li>Tap the menu button <span className="menu-icon">⋮</span></li>
                    <li>Tap "Add to Home screen" or "Install app"</li>
                    <li>Tap "Install" to confirm</li>
                    <li>The app will be installed on your device</li>
                  </ol>
                </div>
              )}
            </div>
            
            <div className="install-benefits">
              <h5>Why install the app?</h5>
              <div className="benefits-grid">
                <div className="benefit">
                  <span className="benefit-icon">📱</span>
                  <span>Home Screen Access</span>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">⚡</span>
                  <span>Faster Loading</span>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">🔔</span>
                  <span>Push Notifications</span>
                </div>
                <div className="benefit">
                  <span className="benefit-icon">📴</span>
                  <span>Offline Access</span>
                </div>
              </div>
            </div>
            
            <div className="install-actions">
              <button onClick={handleInstallClick} className="install-button primary">
                Got it! Take me to Login
              </button>
              <button onClick={handleDismiss} className="install-button secondary">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
