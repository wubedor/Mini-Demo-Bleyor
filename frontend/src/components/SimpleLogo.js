import React from 'react';
import './SimpleLogo.css';

const SimpleLogo = ({ size = 'medium' }) => {
  return (
    <div className={`simple-logo ${size}`}>
      <div className="logo-image">
        <img src="/SAMBs.png" alt="SAMB's Laundry Logo" className="logo-img" />
      </div>
      <div className="logo-text">
        <span className="logo-samb">SAMB's</span>
        <span className="logo-laundry">Laundry &<br />Klinin Services</span>
      </div>
    </div>
  );
};

export default SimpleLogo;
