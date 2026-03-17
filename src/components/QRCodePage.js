import React from 'react';
import QRCodeScanner from './QRCodeScanner';
import './QRCodePage.css';

export default function QRCodePage() {
  return (
    <div className="qr-code-page">
      <div className="page-header">
        <h1>📱 Get SAMB's Laundry Mobile App</h1>
        <p>Scan the QR code to download our app and book services on the go!</p>
      </div>
      
      <QRCodeScanner />
      
      <div className="additional-info">
        <div className="info-section">
          <h2>🚀 Why Download Our App?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">⚡</div>
              <div className="benefit-content">
                <h3>Fast Booking</h3>
                <p>Book laundry services in seconds with our streamlined mobile interface</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">📱</div>
              <div className="benefit-content">
                <h3>Native Experience</h3>
                <p>Enjoy a mobile-optimized app designed specifically for your device</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🔔</div>
              <div className="benefit-content">
                <h3>Real-time Updates</h3>
                <p>Get instant notifications about your booking status and updates</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">💾</div>
              <div className="benefit-content">
                <h3>Offline Access</h3>
                <p>Access your booking information even without internet connection</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">👤</div>
              <div className="benefit-content">
                <h3>Account Management</h3>
                <p>Manage your profile, preferences, and booking history easily</p>
              </div>
            </div>
            <div className="benefit-item">
              <div className="benefit-icon">🎯</div>
              <div className="benefit-content">
                <h3>Exclusive Offers</h3>
                <p>Get special discounts and promotions available only to app users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>📲 How to Install</h2>
          <div className="install-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Scan QR Code</h3>
                <p>Use your phone's camera to scan the QR code above</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Open Link</h3>
                <p>Tap the link that appears after scanning</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Install App</h3>
                <p>Follow the installation instructions for your device</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Start Booking</h3>
                <p>Create an account and book your first laundry service!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>🔧 Technical Requirements</h2>
          <div className="requirements">
            <div className="requirement-item">
              <h4>iOS Devices</h4>
              <ul>
                <li>iOS 12.0 or later</li>
                <li>iPhone 5s or newer</li>
                <li>iPad Air or newer</li>
                <li>iPad mini 2 or newer</li>
              </ul>
            </div>
            <div className="requirement-item">
              <h4>Android Devices</h4>
              <ul>
                <li>Android 6.0 (Marshmallow) or later</li>
                <li>RAM: 2GB or more recommended</li>
                <li>Storage: 50MB free space</li>
                <li>ARM processor</li>
              </ul>
            </div>
            <div className="requirement-item">
              <h4>Web Access</h4>
              <ul>
                <li>Modern web browser (Chrome, Safari, Firefox)</li>
                <li>JavaScript enabled</li>
                <li>Internet connection</li>
                <li>Responsive design works on all devices</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>💬 Need Help?</h2>
          <div className="support-info">
            <div className="support-item">
              <h4>📧 Email Support</h4>
              <p>Contact us at: <a href="mailto:sambsKlinin@gmail.com">sambsKlinin@gmail.com</a></p>
            </div>
            <div className="support-item">
              <h4>📞 Phone Support</h4>
              <p>Call us: <a href="tel:0540240754">0540240754</a> or <a href="tel:0207760173">0207760173</a></p>
            </div>
            <div className="support-item">
              <h4>💬 WhatsApp</h4>
              <p>Message us on WhatsApp for quick assistance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
