import React, { useState, useEffect } from 'react';
import './QRCodeScanner.css';

export default function QRCodeScanner() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const appInfo = {
    name: "SAMB's Laundry",
    description: 'Professional laundry and cleaning services',
    url: window.location.origin,
    icon: '🧺'
  };

  useEffect(() => {
    // Generate QR code URL using a free QR code API
    const generateQRCode = () => {
      const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
      const appUrl = window.location.origin; // Your app's URL
      const size = 200;
      const format = 'png';
      
      // QR code with app URL
      const qrUrl = `${baseUrl}?size=${size}x${size}&format=${format}&data=${encodeURIComponent(appUrl)}`;
      setQrCodeUrl(qrUrl);
    };

    generateQRCode();
  }, []);

  const handleDownloadQR = () => {
    // Create a download link for the QR code
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'samb-laundry-qr-code.png';
    link.click();
  };

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: appInfo.name,
          text: appInfo.description,
          url: appInfo.url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(appInfo.url);
      alert('App link copied to clipboard!');
    }
  };

  return (
    <div className="qr-code-scanner">
      <div className="qr-container">
        <div className="qr-header">
          <h3>📱 Get Our Mobile App</h3>
          <p>Scan the QR code to download SAMB's Laundry app</p>
        </div>

        <div className="qr-code-wrapper">
          <div className="qr-code">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="SAMB's Laundry App QR Code"
                className="qr-image"
              />
            ) : (
              <div className="qr-loading">
                <div className="spinner"></div>
                <p>Generating QR Code...</p>
              </div>
            )}
          </div>
          
          <div className="qr-instructions">
            <h4>How to Scan:</h4>
            <ol>
              <li>Open your phone's camera app</li>
              <li>Point it at the QR code</li>
              <li>Tap the link that appears</li>
              <li>Install or open the app</li>
            </ol>
          </div>
        </div>

        <div className="qr-actions">
          <button onClick={handleDownloadQR} className="qr-btn download-btn">
            📥 Download QR Code
          </button>
          <button onClick={handleShareApp} className="qr-btn share-btn">
            📤 Share App
          </button>
        </div>

        <div className="app-info">
          <div className="app-details">
            <div className="app-icon">{appInfo.icon}</div>
            <div className="app-text">
              <h4>{appInfo.name}</h4>
              <p>{appInfo.description}</p>
              <small>{appInfo.url}</small>
            </div>
          </div>
        </div>

        <div className="qr-features">
          <h5>🚀 App Features:</h5>
          <div className="features-grid">
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <span className="feature-text">Mobile-optimized design</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🧺</span>
              <span className="feature-text">Easy booking system</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">👤</span>
              <span className="feature-text">Account management</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span className="feature-text">Booking tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <span className="feature-text">Notifications</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💳</span>
              <span className="feature-text">Secure payments</span>
            </div>
          </div>
        </div>

        <div className="qr-footer">
          <div className="compatibility">
            <h6>📲 Compatible with:</h6>
            <div className="platform-icons">
              <span className="platform">iOS</span>
              <span className="platform">Android</span>
              <span className="platform">Web</span>
            </div>
          </div>
          
          <div className="help-text">
            <p>
              <strong>Need help?</strong> Contact us at{' '}
              <a href="mailto:sambsKlinin@gmail.com">sambsKlinin@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
