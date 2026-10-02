import React from 'react';
import './SimpleStartupQR.css';

const SimpleStartupQR = () => {
  return (
    <div className="simple-startup-qr">
      <h2 className="qr-title">Scan to Get Started</h2>
      <div className="qr-placeholder">
        <div className="qr-code">
          <div className="qr-pattern">
            <div className="qr-square"></div>
            <div className="qr-square"></div>
            <div className="qr-square"></div>
            <div className="qr-square"></div>
          </div>
        </div>
        <p className="qr-description">
          Scan this QR code with your mobile device to download our app or visit our mobile site
        </p>
      </div>
    </div>
  );
};

export default SimpleStartupQR;
