import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SplashScreen.css';
import { splashScreenUtils } from '../utils/splashScreen';

export default function SplashScreenFixed() {
  const [fadeOut, setFadeOut] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Splash Screen Fixed: Component mounted');
    console.log('Mobile app detected:', splashScreenUtils.isMobileApp());
    
    // Get timing info from utility
    const timing = splashScreenUtils.getTimingInfo();
    console.log('Splash timing:', timing);
    
    // Progress animation using utility timing
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + timing.progressIncrement;
        const rounded = Math.round(newProgress * 10) / 10;
        console.log(`Progress: ${rounded}%`);
        return newProgress > 100 ? 100 : rounded;
      });
    }, 1000);

    // Start fade out using utility timing
    const fadeTimer = setTimeout(() => {
      console.log('Splash Screen Fixed: Starting fade out');
      setFadeOut(true);
    }, timing.fadeOutStart);

    // Navigate to home using utility timing
    const navigateTimer = setTimeout(() => {
      console.log('Splash Screen Fixed: Navigating to home');
      clearInterval(progressInterval);
      navigate('/');
    }, timing.duration);

    // Cleanup function
    return () => {
      console.log('Splash Screen Fixed: Cleaning up timers');
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        {/* Logo Container */}
        <div className="logo-container">
          <div className="logo-wrapper">
            <div className="logo-circle">
              <div className="logo-icon">
                <img 
                  src="/SAMBS.png" 
                  alt="SAMB's Laundry Logo" 
                  className="company-logo-image"
                  onError={(e) => {
                    console.error('Logo image failed to load:', e);
                    e.target.style.display = 'none';
                    // Show fallback text if image fails
                    const fallbackText = document.createElement('div');
                    fallbackText.textContent = 'SAMB\'s';
                    fallbackText.style.cssText = 'font-size: 24px; font-weight: bold; color: white;';
                    e.target.parentNode.appendChild(fallbackText);
                  }}
                  onLoad={() => {
                    console.log('Logo image loaded successfully');
                  }}
                />
              </div>
            </div>
            <div className="logo-glow"></div>
          </div>
        </div>

        {/* Company Name */}
        <div className="company-info">
          <h1 className="company-name">
            <span className="company-main">SAMB's</span>
            <span className="company-divider">|</span>
            <span className="company-sub">Laundry & Klinin Services</span>
          </h1>
          <p className="company-tagline">Professional Care for Your Clothes</p>
        </div>

        {/* Enhanced Loading Progress */}
        <div className="loading-container">
          <div className="loading-header">
            <h3 className="loading-title">Preparing Your Experience</h3>
            <p className="loading-subtitle">Optimizing SAMB's Laundry Services for you...</p>
          </div>
          
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loadingProgress}%` }}
              ></div>
              <div className="progress-glow" style={{ width: `${loadingProgress}%` }}></div>
            </div>
            <div className="progress-info">
              <span className="progress-percentage">{Math.round(loadingProgress)}%</span>
              <span className="progress-status">
                {loadingProgress < 20 && "Initializing..."}
                {loadingProgress >= 20 && loadingProgress < 40 && "Loading Services..."}
                {loadingProgress >= 40 && loadingProgress < 60 && "Configuring..."}
                {loadingProgress >= 60 && loadingProgress < 80 && "Optimizing..."}
                {loadingProgress >= 80 && loadingProgress < 100 && "Almost Ready..."}
                {loadingProgress >= 100 && "Complete!"}
              </span>
            </div>
          </div>
          
          <div className="loading-tips">
            {loadingProgress < 10 && "?? Starting SAMB's Laundry..."}
            {loadingProgress >= 10 && loadingProgress < 20 && "?? Preparing premium laundry services..."}
            {loadingProgress >= 20 && loadingProgress < 30 && "?? Optimizing fabric care algorithms..."}
            {loadingProgress >= 30 && loadingProgress < 40 && "?? Setting up your personalized experience..."}
            {loadingProgress >= 40 && loadingProgress < 50 && "?? Initializing service management..."}
            {loadingProgress >= 50 && loadingProgress < 60 && "?? Configuring quality assurance systems..."}
            {loadingProgress >= 60 && loadingProgress < 70 && "?? Connecting to our network..."}
            {loadingProgress >= 70 && loadingProgress < 80 && "?? Preparing your booking dashboard..."}
            {loadingProgress >= 80 && loadingProgress < 90 && "?? Finalizing your experience..."}
            {loadingProgress >= 90 && loadingProgress < 100 && "?? Almost there..."}
            {loadingProgress >= 100 && "?? Welcome to SAMB's Laundry!"}
          </div>
          
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
        </div>

        {/* Background Elements */}
        <div className="background-elements">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
          <div className="bubble bubble-4"></div>
          <div className="bubble bubble-5"></div>
          <div className="bubble bubble-6"></div>
          <div className="bubble bubble-7"></div>
        </div>

        {/* Bottom Info */}
        <div className="bottom-info">
          <p className="version-info">Version 1.0.0</p>
          <p className="copyright">© 2024 SAMB's Laundry & Klinin Services</p>
        </div>
      </div>
    </div>
  );
}
