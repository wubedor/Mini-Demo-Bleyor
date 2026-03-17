import { useState, useEffect } from 'react';

export const useMobile = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    orientation: 'portrait',
    isOnline: navigator.onLine,
    isStandalone: false,
    deviceType: 'unknown'
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isMobile = width <= 768;
      const isTablet = width > 768 && width <= 1024;
      const isDesktop = width > 1024;
      const orientation = width > height ? 'landscape' : 'portrait';
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      // Detect device type
      let deviceType = 'unknown';
      if (/Android/i.test(navigator.userAgent)) {
        deviceType = 'android';
      } else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        deviceType = 'ios';
      } else if (/Windows Phone/i.test(navigator.userAgent)) {
        deviceType = 'windows-phone';
      } else if (isMobile) {
        deviceType = 'mobile';
      } else if (isTablet) {
        deviceType = 'tablet';
      } else if (isDesktop) {
        deviceType = 'desktop';
      }

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        screenWidth: width,
        screenHeight: height,
        orientation,
        isOnline: navigator.onLine,
        isStandalone,
        deviceType
      });
    };

    updateDeviceInfo();

    // Listen for resize events
    window.addEventListener('resize', updateDeviceInfo);
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', updateDeviceInfo);
    
    // Listen for online/offline events
    window.addEventListener('online', updateDeviceInfo);
    window.addEventListener('offline', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      window.removeEventListener('online', updateDeviceInfo);
      window.removeEventListener('offline', updateDeviceInfo);
    };
  }, []);

  return deviceInfo;
};
