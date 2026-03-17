import React, { useState, useEffect } from 'react';
import { useMobile } from '../hooks/useMobile';
import './MobileFeatures.css';

export default function MobileFeatures() {
  const mobileInfo = useMobile();
  const [pushSubscription, setPushSubscription] = useState(null);
  const [cameraPermission, setCameraPermission] = useState('prompt');
  const [locationPermission, setLocationPermission] = useState('prompt');

  useEffect(() => {
    // Check permissions
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'camera' }).then(result => {
        setCameraPermission(result.state);
      });
      
      navigator.permissions.query({ name: 'geolocation' }).then(result => {
        setLocationPermission(result.state);
      });
    }
  }, []);

  const requestPushNotification = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
        });
        setPushSubscription(subscription);
        alert('Push notifications enabled!');
      } catch (error) {
        console.error('Push notification error:', error);
      }
    }
  };

  const shareContent = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SAMB\'s Laundry',
          text: 'Check out SAMB\'s Laundry - Professional laundry and dry cleaning services!',
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    }
  };

  const requestCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
      alert('Camera access granted!');
    } catch (error) {
      console.error('Camera access denied:', error);
      setCameraPermission('denied');
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          alert(`Location: ${position.coords.latitude}, ${position.coords.longitude}`);
          setLocationPermission('granted');
        },
        (error) => {
          console.error('Location error:', error);
          setLocationPermission('denied');
        }
      );
    }
  };

  const addToHomeScreen = () => {
    // This is handled by the InstallPrompt component
    alert('Use the install prompt or add to home screen from your browser menu');
  };

  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  };

  if (!mobileInfo.isMobile) {
    return null; // Only show on mobile devices
  }

  return (
    <div className="mobile-features">
      <h3>📱 Mobile Features</h3>
      
      <div className="feature-grid">
        {/* Push Notifications */}
        <div className="feature-card">
          <button 
            onClick={requestPushNotification}
            className="feature-btn"
            disabled={pushSubscription !== null}
          >
            🔔 {pushSubscription ? 'Notifications Enabled' : 'Enable Push Notifications'}
          </button>
        </div>

        {/* Share Feature */}
        <div className="feature-card">
          <button onClick={shareContent} className="feature-btn">
            📤 Share App
          </button>
        </div>

        {/* Camera Access */}
        <div className="feature-card">
          <button 
            onClick={requestCameraAccess}
            className="feature-btn"
            disabled={cameraPermission === 'granted'}
          >
            📷 {cameraPermission === 'granted' ? 'Camera Access Granted' : 'Enable Camera'}
          </button>
        </div>

        {/* Location Access */}
        <div className="feature-card">
          <button 
            onClick={getCurrentLocation}
            className="feature-btn"
            disabled={locationPermission === 'granted'}
          >
            📍 {locationPermission === 'granted' ? 'Location Set' : 'Get Location'}
          </button>
        </div>

        {/* Add to Home Screen */}
        <div className="feature-card">
          <button onClick={addToHomeScreen} className="feature-btn">
            📱 Add to Home Screen
          </button>
        </div>

        {/* Vibration Test */}
        <div className="feature-card">
          <button onClick={vibrateDevice} className="feature-btn">
            📳 Test Vibration
          </button>
        </div>
      </div>

      {/* Device Capabilities */}
      <div className="device-capabilities">
        <h4>Device Capabilities</h4>
        <div className="capability-list">
          <div className="capability">
            <span className="capability-name">Touch Support:</span>
            <span className="capability-value">{'ontouchstart' in window ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Service Worker:</span>
            <span className="capability-value">{'serviceWorker' in navigator ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Push API:</span>
            <span className="capability-value">{'PushManager' in window ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Share API:</span>
            <span className="capability-value">{navigator.share ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Vibration:</span>
            <span className="capability-value">{'vibrate' in navigator ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Camera:</span>
            <span className="capability-value">{'mediaDevices' in navigator ? '✅ Yes' : '❌ No'}</span>
          </div>
          <div className="capability">
            <span className="capability-name">Geolocation:</span>
            <span className="capability-value">{'geolocation' in navigator ? '✅ Yes' : '❌ No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
