import React, { useState, useEffect, useCallback } from 'react';
import qrcode from 'qrcode';
import './AppInstallQR.css';

export default function AppInstallQR() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [appUrl, setAppUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});

  // Detect device information
  const detectDevice = useCallback(() => {
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
  }, []);

  // Get current app URL
  const getAppURL = useCallback(() => {
    // Use the current origin (works for both local and deployed)
    return window.location.origin;
  }, []);

  // Generate QR code for app installation
  const generateQRCode = useCallback(async (url) => {
    try {
      setLoading(true);
      setError('');
      
      // Generate QR code using qrcode library
      const qrDataUrl = await qrcode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1a1a1a',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodeUrl(qrDataUrl);
      setLoading(false);
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Failed to generate QR code. Please try again.');
      setLoading(false);
    }
  }, []);

  // Initialize component
  useEffect(() => {
    const init = async () => {
      try {
        const device = detectDevice();
        setDeviceInfo(device);
        
        const url = getAppURL();
        setAppUrl(url);
        
        // Generate QR code for the app URL
        await generateQRCode(url);
      } catch (err) {
        console.error('Error initializing QR code:', err);
        setError('Failed to initialize QR code generator.');
        setLoading(false);
      }
    };

    init();
  }, [detectDevice, getAppURL, generateQRCode]);

  // Copy URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Download QR code as image
  const downloadQRCode = async () => {
    try {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = 'samb-laundry-app-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download QR code:', err);
    }
  };

  // Get install instructions based on device
  const getInstallInstructions = () => {
    if (deviceInfo.isIOS) {
      return [
        '1. Scan the QR code with your iPhone/iPad camera',
        '2. Tap the notification that appears',
        '3. Tap the Share button (square with arrow)',
        '4. Scroll down and tap "Add to Home Screen"',
        '5. Tap "Add" to confirm installation',
        '6. The app will appear on your home screen'
      ];
    } else if (deviceInfo.isAndroid) {
      return [
        '1. Scan the QR code with your Android camera',
        '2. Tap the notification that appears',
        '3. Tap the menu button (three dots)',
        '4. Tap "Add to Home screen" or "Install app"',
        '5. Tap "Install" to confirm',
        '6. The app will be installed on your device'
      ];
    } else {
      return [
        '1. Scan the QR code with your phone camera',
        '2. Tap the notification that appears',
        '3. Follow the on-screen instructions',
        '4. The app will be installed on your device'
      ];
    }
  };

  // Get device-specific installation tips
  const getDeviceTips = () => {
    if (deviceInfo.isIOS) {
      return {
        title: 'iOS Installation Tips',
        tips: [
          'Make sure you\'re using Safari browser',
          'The Share button is at the bottom of the screen',
          'Look for "Add to Home Screen" in the share menu',
          'The app will work offline once installed'
        ]
      };
    } else if (deviceInfo.isAndroid) {
      return {
        title: 'Android Installation Tips',
        tips: [
          'Use Chrome or Samsung Internet browser',
          'Look for the install icon in the address bar',
          'The app will be added to your app drawer',
          'You can create a home screen shortcut'
        ]
      };
    } else {
      return {
        title: 'General Installation Tips',
        tips: [
          'Any modern smartphone camera can scan QR codes',
          'The app works on both iOS and Android devices',
          'Installation takes less than 30 seconds',
          'The app will work offline after installation'
        ]
      };
    }
  };

  const instructions = getInstallInstructions();
  const deviceTips = getDeviceTips();

  return (
    <div className="app-install-qr">
      <div className="qr-header">
        <h1>Install SAMB's Laundry App</h1>
        <p>Scan the QR code to install our app on your device</p>
      </div>

      <div className="qr-content">
        <div className="qr-section">
          <div className="qr-code-container">
            {loading ? (
              <div className="qr-loading">
                <div className="spinner"></div>
                <p>Generating QR code...</p>
              </div>
            ) : error ? (
              <div className="qr-error">
                <p>{error}</p>
                <button onClick={() => generateQRCode(appUrl)} className="retry-button">
                  Retry
                </button>
              </div>
            ) : (
              <div className="qr-code-wrapper">
                <img src={qrCodeUrl} alt="Install App QR Code" className="qr-code-image" />
                <div className="qr-overlay">
                  <div className="app-icon">SAMB's</div>
                  <div className="app-name">Laundry App</div>
                </div>
                <button onClick={downloadQRCode} className="download-qr-button">
                  Download QR Code
                </button>
              </div>
            )}
          </div>

          <div className="qr-info">
            <div className="app-url-section">
              <h3>App URL:</h3>
              <div className="url-container">
                <input 
                  type="text" 
                  value={appUrl} 
                  readOnly 
                  className="url-input"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`copy-button ${copied ? 'copied' : ''}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="device-info">
              <h3>Your Device:</h3>
              <div className="device-details">
                <span className="device-type">
                  {deviceInfo.isIOS ? 'iOS Device' : deviceInfo.isAndroid ? 'Android Device' : 'Desktop'}
                </span>
                <span className="platform-info">
                  {deviceInfo.platform || 'Unknown Platform'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="instructions-section">
          <div className="install-instructions">
            <h3>How to Install:</h3>
            <ol className="steps-list">
              {instructions.map((instruction, index) => (
                <li key={index} className="step-item">
                  {instruction}
                </li>
              ))}
            </ol>
          </div>

          <div className="device-tips">
            <h3>{deviceTips.title}:</h3>
            <ul className="tips-list">
              {deviceTips.tips.map((tip, index) => (
                <li key={index} className="tip-item">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="features-section">
          <h3>App Features:</h3>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon"> bookings</div>
              <div className="feature-text">Easy Booking</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"> tracking</div>
              <div className="feature-text">Order Tracking</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"> payments</div>
              <div className="feature-text">Secure Payments</div>
            </div>
            <div className="feature-item">
              <div className="feature-icon"> support</div>
              <div className="feature-text">24/7 Support</div>
            </div>
          </div>
        </div>

        <div className="troubleshooting-section">
          <h3>Troubleshooting:</h3>
          <div className="troubleshooting-grid">
            <div className="trouble-item">
              <h4>QR Code Not Working?</h4>
              <p>Make sure your camera is focused and the QR code is well-lit. Try moving closer or further away.</p>
            </div>
            <div className="trouble-item">
              <h4>Can't Install?</h4>
              <p>Ensure you're using a supported browser (Safari for iOS, Chrome for Android). Try the manual URL.</p>
            </div>
            <div className="trouble-item">
              <h4>App Not Working?</h4>
              <p>Check your internet connection and try refreshing the app. Contact support if issues persist.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
