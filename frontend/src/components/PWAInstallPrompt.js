import React, { useState, useEffect } from 'react';
import './PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = window.navigator.standalone === true;
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome);
    };

    // Check if iOS device
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
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

    checkInstalled();
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to not show again for a while
    try {
      localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
  };

  // Don't show if already installed or dismissed recently
  useEffect(() => {
    let dismissedTime = null;
    try {
      dismissedTime = localStorage.getItem('pwa-install-dismissed');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
    
    if (dismissedTime) {
      const timeDiff = Date.now() - parseInt(dismissedTime);
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      if (timeDiff < oneWeek) {
        setShowInstallPrompt(false);
      }
    }
  }, [showInstallPrompt]);

  if (isInstalled || !showInstallPrompt) return null;

  // iOS doesn't support beforeinstallprompt, show manual instructions
  if (isIOS) {
    return (
      <div className="pwa-install-prompt ios">
        <div className="pwa-install-content">
          <div className="pwa-install-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              <path d="M12 22V12"/>
              <path d="M8 12h8"/>
            </svg>
          </div>
          <div className="pwa-install-text">
            <h3>Install SAMB Laundry App</h3>
            <p>Install our app on your iOS device for quick access!</p>
            <div className="ios-instructions">
              <p><strong>To install:</strong></p>
              <ol>
                <li>Tap Share button <span className="share-icon">⚡</span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install app</li>
              </ol>
            </div>
          </div>
          <button className="pwa-install-dismiss" onClick={handleDismiss}>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
            <path d="M12 22V12"/>
            <path d="M8 12h8"/>
          </svg>
        </div>
        <div className="pwa-install-text">
          <h3>Install SAMB Laundry App</h3>
          <p>Get quick access to our laundry services! Install our app for a faster experience.</p>
        </div>
        <div className="pwa-install-actions">
          <button className="pwa-install-button" onClick={handleInstallClick}>
            Install App
          </button>
          <button className="pwa-install-dismiss" onClick={handleDismiss}>
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
