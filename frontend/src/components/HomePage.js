import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import Services from './Services';
import GlobalCampus from './GlobalCampus';
import LocationMap from './LocationMap';
import QRCodeScanner from './QRCodeScanner';
import StartupQRCode from './StartupQRCode';

export default function HomePage() {
  const navigate = useNavigate();
  const [showStartupQR, setShowStartupQR] = useState(true);

  useEffect(() => {
    // Check if user has seen the QR code before
    let hasSeenQR = null;
    try {
      hasSeenQR = localStorage.getItem('hasSeenStartupQR');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
    
    if (hasSeenQR) {
      setShowStartupQR(false);
    }
  }, []);

  const handleHeroButtonClick = () => {
    navigate('/login');
  };

  const handleCloseQR = () => {
    setShowStartupQR(false);
    try {
      localStorage.setItem('hasSeenStartupQR', 'true');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
  };

  return (
    <>
      {showStartupQR && <StartupQRCode onClose={handleCloseQR} />}
      <HeroSection onButtonClick={handleHeroButtonClick} buttonText="Login to Book" />
      {/* The Services component now handles navigation to booking page */}
      <Services />
      <QRCodeScanner />
      <GlobalCampus />
      <LocationMap />
    </>
  );
}