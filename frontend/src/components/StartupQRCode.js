import React, { useState, useEffect } from 'react';
import './StartupQRCode.css';

export default function StartupQRCode({ onClose }) {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    // Get the current app URL
    const currentUrl = window.location.origin;
    setAppUrl(currentUrl);
    
    // Generate QR code URL
    const generateQRCode = () => {
      const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
      const size = 300; // Larger for better scanning
      const format = 'png';
      const ecc = 'H'; // High error correction
      const margin = 2;
      
      const qrUrl = `${baseUrl}?size=${size}x${size}&format=${format}&ecc=${ecc}&margin=${margin}&data=${encodeURIComponent(currentUrl)}`;
      setQrCodeUrl(qrUrl);
    };

    generateQRCode();

    // Show QR code after a short delay for dramatic effect
    const timer = setTimeout(() => {
      setShowQR(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'samb-laundry-mobile-app.png';
    link.click();
  };

  const handleCopyURL = () => {
    navigator.clipboard.writeText(appUrl);
    alert('App URL copied to clipboard!');
  };

  const handleHideQR = () => {
    setShowQR(false);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="startup-qr-overlay">
      <div className="startup-qr-modal">
        <div className="qr-header">
          <h2>📱 SAMB's Laundry Mobile App</h2>
          <p>Scan this QR code with your phone to get the mobile app!</p>
        </div>

        <div className={`qr-code-container ${showQR ? 'show' : 'loading'}`}>
          {qrCodeUrl && showQR ? (
            <div className="qr-code-wrapper">
              <img 
                src={qrCodeUrl} 
                alt="SAMB's Laundry Mobile App QR Code"
                className="qr-code-image"
              />
              <div className="qr-glow"></div>
            </div>
          ) : (
            <div className="qr-loading">
              <div className="loading-spinner"></div>
              <p>Generating QR Code...</p>
            </div>
          )}
        </div>

        <div className="qr-instructions">
          <h4>🎯 How to Scan:</h4>
          <div className="steps">
            <div className="step">
              <span className="step-number">1</span>
              <span className="step-text">Open phone camera or QR scanner app</span>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <span className="step-text">Point camera at QR code</span>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <span className="step-text">Tap the link that appears</span>
            </div>
            <div className="step">
              <span className="step-number">4</span>
              <span className="step-text">Install and enjoy the app!</span>
            </div>
          </div>
        </div>

        <div className="qr-actions">
          <button onClick={handleDownloadQR} className="qr-btn primary">
            📥 Download QR Code
          </button>
          <button onClick={handleCopyURL} className="qr-btn secondary">
            📋 Copy URL
          </button>
          <button onClick={handleHideQR} className="qr-btn close">
            ✖️ Close
          </button>
        </div>

        <div className="app-info">
          <div className="app-details">
            <div className="app-icon">🧺</div>
            <div className="app-text">
              <h4>SAMB's Laundry</h4>
              <p>Professional laundry services at your fingertips</p>
              <small>{appUrl}</small>
            </div>
          </div>
        </div>

        <div className="qr-footer">
          <p>
            <strong>💡 Pro Tip:</strong> Add this page to your home screen for quick access to the QR code!
          </p>
        </div>
      </div>
    </div>
  );
}
