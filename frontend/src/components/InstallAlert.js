import React, { useState, useEffect } from 'react';
import { safeLocalStorage } from '../utils/mobileSafeStorage';
import './InstallAlert.css';

export default function InstallAlert() {
  const [showAlert, setShowAlert] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    isIOS: false,
    isAndroid: false,
    isMobile: false
  });

  useEffect(() => {
    // Detect device
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    
    setDeviceInfo({ isIOS, isAndroid, isMobile });

    // Check if user has dismissed the alert
    const hasDismissed = safeLocalStorage.getItem('install-alert-dismissed');
    setDismissed(hasDismissed === 'true');

    // Show alert after 5 seconds if not dismissed and on mobile
    if (!hasDismissed && isMobile) {
      const timer = setTimeout(() => {
        setShowAlert(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleInstallAlert = () => {
    let message = '';
    
    if (deviceInfo.isIOS) {
      message = '📱 Install SAMB\'s Laundry App!\n\n' +
               'To install:\n' +
               '1. Tap the Share button ⤴️ below\n' +
               '2. Scroll down and tap "Add to Home Screen"\n' +
               '3. Tap "Add" to confirm\n' +
               '4. The app will appear on your home screen!\n\n' +
               'Get instant access to laundry services!';
    } else if (deviceInfo.isAndroid) {
      message = '📱 Install SAMB\'s Laundry App!\n\n' +
               'To install:\n' +
               '1. Tap the menu button ⋮ above\n' +
               '2. Tap "Add to Home screen" or "Install app"\n' +
               '3. Tap "Install" to confirm\n' +
               '4. The app will be installed on your device!\n\n' +
               'Get instant access to laundry services!';
    }

    alert(message);
    setShowAlert(false);
  };

  const handleDismiss = () => {
    setShowAlert(false);
    safeLocalStorage.setItem('install-alert-dismissed', 'true');
    setDismissed(true);
  };

  // Don't show if dismissed or not mobile
  if (dismissed || !deviceInfo.isMobile || !showAlert) {
    return null;
  }

  return (
    <div className="install-alert-overlay">
      <div className="install-alert">
        <div className="alert-content">
          <div className="alert-icon">📱</div>
          <h3>Install SAMB's Laundry App!</h3>
          <p>Get instant access to booking, tracking, and exclusive offers!</p>
        </div>
        <div className="alert-actions">
          <button onClick={handleInstallAlert} className="alert-button primary">
            Install Now
          </button>
          <button onClick={handleDismiss} className="alert-button secondary">
            Maybe Later
          </button>
        </div>
        <button onClick={handleDismiss} className="alert-close">×</button>
      </div>
    </div>
  );
}
