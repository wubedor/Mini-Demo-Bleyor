import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { safeLocalStorage } from '../utils/mobileSafeStorage';
import './UniversalPWAInstall.css';

export default function UniversalPWAInstall() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showMobileLogin, setShowMobileLogin] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installInstructions, setInstallInstructions] = useState([]);

  // Device detection function
  const detectDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window['standalone'] === true);
    const isInWebAppChrome = (window.matchMedia('(display-mode: standalone)').matches);
    
    return {
      isIOS,
      isAndroid,
      isMobile,
      isStandalone,
      isInWebAppiOS,
      isInWebAppChrome,
      isDesktop: !isMobile,
      userAgent: navigator.userAgent,
      platform: navigator.platform || 'unknown'
    };
  };

  const checkInstalled = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           window.navigator.standalone === true ||
           document.referrer.includes('android-app://');
  };

  const getInstallInstructions = (device) => {
    if (device.isIOS) {
      return [
        'Tap the Share button ⤴️ at the bottom of your screen',
        'Scroll down and tap "Add to Home Screen"',
        'Tap "Add" to confirm',
        'The app will appear on your home screen'
      ];
    } else if (device.isAndroid) {
      return [
        'Tap the menu button ⋮ in the top-right corner',
        'Tap "Add to Home screen" or "Install app"',
        'Tap "Install" to confirm',
        'The app will be installed on your device'
      ];
    } else {
      return [
        'Look for the install icon in your browser address bar',
        'Click the install button',
        'Click "Install" to confirm',
        'The app will be available in your applications'
      ];
    }
  };

  useEffect(() => {
    // Initialize
    const device = detectDevice();
    setIsInstalled(checkInstalled());
    setInstallInstructions(getInstallInstructions(device));

    // Listen for beforeinstallprompt event (Chrome/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show browser alert for immediate attention
      const device = detectDevice();
      setTimeout(() => {
        if (device.isAndroid) {
          alert('📱 Install SAMB\'s Laundry App!\n\nTap the install button that appeared in your browser to add our app to your home screen!');
        } else if (device.isIOS) {
          alert('📱 Install SAMB\'s Laundry App!\n\nTap the Share button ⤴️ below, then "Add to Home Screen" to install our app!');
        } else {
          alert('📱 Install SAMB\'s Laundry App!\n\nClick the install icon in your browser address bar to add our app!');
        }
      }, 1000);
      
      setShowInstallPrompt(true);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
        // Show mobile login option after install
        setShowMobileLogin(true);
      }
    } else {
      // Manual install instructions
      setShowMobileLogin(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setShowMobileLogin(false);
    // Remember user choice
    safeLocalStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleManualInstall = () => {
    // Show browser alert with instructions
    const device = detectDevice();
    let instructions = '';
    
    if (device.isIOS) {
      instructions = '📱 How to install SAMB\'s Laundry App on iPhone/iPad:\n\n' +
                   '1. Tap the Share button ⤴️ at the bottom of your screen\n' +
                   '2. Scroll down and tap "Add to Home Screen"\n' +
                   '3. Tap "Add" to confirm\n' +
                   '4. The app will appear on your home screen!';
    } else if (device.isAndroid) {
      instructions = '📱 How to install SAMB\'s Laundry App on Android:\n\n' +
                   '1. Tap the menu button ⋮ in the top-right corner\n' +
                   '2. Tap "Add to Home screen" or "Install app"\n' +
                   '3. Tap "Install" to confirm\n' +
                   '4. The app will be installed on your device!';
    } else {
      instructions = '📱 How to install SAMB\'s Laundry App:\n\n' +
                   '1. Look for the install icon in your browser address bar\n' +
                   '2. Click the install button\n' +
                   '3. Click "Install" to confirm\n' +
                   '4. The app will be available in your applications!';
    }
    
    alert(instructions);
    
    // Show manual installation instructions
    setShowInstallPrompt(true);
  };

  const handleClosePrompt = () => {
    setShowInstallPrompt(false);
    // Remember user dismissed the prompt
    safeLocalStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if already installed or dismissed
  const isDismissed = safeLocalStorage.getItem('pwa-install-dismissed') === 'true';
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <div className="universal-pwa-install">
      {showInstallPrompt && (
        <div className="install-overlay">
          <div className="install-modal">
            <div className="install-header">
              <h2>📱 Install SAMB's Laundry App</h2>
              <button onClick={handleClosePrompt} className="close-button">×</button>
            </div>
            
            <div className="install-content">
              <div className="app-info">
                <div className="app-icon">🧺</div>
                <h3>SAMB's Laundry Services</h3>
                <p>Professional laundry and cleaning services at your fingertips</p>
              </div>
              
              <div className="install-benefits">
                <h4>Why install?</h4>
                <ul>
                  <li>🚀 Fast loading and offline access</li>
                  <li>📱 Native app experience</li>
                  <li>🔔 Push notifications (coming soon)</li>
                  <li>💾 Save data and storage</li>
                </ul>
              </div>
              
              <div className="install-steps">
                <h4>How to install:</h4>
                <ol>
                  {installInstructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
            
            <div className="install-actions">
              {deferredPrompt ? (
                <button onClick={handleInstallClick} className="install-button primary">
                  Install App
                </button>
              ) : (
                <button onClick={handleManualInstall} className="install-button primary">
                  Show Instructions
                </button>
              )}
              <button onClick={handleDismiss} className="install-button secondary">
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showMobileLogin && (
        <div className="mobile-login-prompt">
          <div className="login-modal">
            <h3>🎉 App Installed Successfully!</h3>
            <p>Ready to book your laundry services?</p>
            <div className="login-actions">
              <button onClick={() => navigate('/mobile-login')} className="login-button primary">
                Login / Sign Up
              </button>
              <button onClick={() => navigate('/')} className="login-button secondary">
                Browse Services
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
