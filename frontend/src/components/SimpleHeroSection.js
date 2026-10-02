import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SimpleHeroSection.css';

const SimpleHeroSection = ({ onButtonClick, buttonText = "Login to Book" }) => {
  const navigate = useNavigate();
  
  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="simple-hero-section">
      <div className="hero-background">
        <img src="/IMG-20260216-WA0000.jpg" alt="SAMB's Laundry Background" className="hero-bg-image" />
        <div className="hero-overlay"></div>
      </div>
      <div className="hero-content">
        <h1 className="hero-title">Welcome To SAMB's LAUNDRY AND KLININ SERVICES</h1>
        <p className="hero-subtitle">The Experts in Cleaning and Laundry Services for your Homes, Offices and Sites.</p>
        <div className="hero-buttons">
          <button className="hero-button primary" onClick={onButtonClick}>{buttonText}</button>
          <button className="hero-button secondary" onClick={handleLearnMore}>Learn More</button>
        </div>
      </div>
    </div>
  );
};

export default SimpleHeroSection;
