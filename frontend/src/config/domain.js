// Universal Domain Configuration for SAMB's Laundry Mobile App
export const DOMAIN_CONFIG = {
  // Universal domain that works everywhere
  universal: 'https://samb-laundry.app',
  
  // Development domain (localhost)
  development: 'http://localhost:3000',
  
  // Network accessible domain
  network: 'http://localhost:3000',
  
  // Current active domain based on environment
  current: process.env.NODE_ENV === 'production' 
    ? 'https://samb-laundry.app' 
    : 'http://localhost:3000',
  
  // API endpoints
  api: process.env.NODE_ENV === 'production'
    ? 'https://samb-laundry.app/api'
    : 'http://localhost:5000/api',
  
  // Firebase configuration
  firebase: {
    authDomain: process.env.NODE_ENV === 'production' 
      ? 'samb-laundry.app' 
      : 'localhost',
    projectId: 'samb-laundry-app',
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  },
  
  // PWA configuration
  pwa: {
    scope: process.env.NODE_ENV === 'production'
      ? 'https://samb-laundry.app/'
      : 'http://localhost:3000/',
    start_url: process.env.NODE_ENV === 'production'
      ? 'https://samb-laundry.app'
      : 'http://localhost:3000',
  }
};

// Helper function to get current domain
export const getCurrentDomain = () => {
  return DOMAIN_CONFIG.current;
};

// Helper function to check if app is in production
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

// Helper function to get Firebase config
export const getFirebaseConfig = () => {
  return DOMAIN_CONFIG.firebase;
};

// Helper function to enforce HTTPS in production
export const enforceHTTPS = () => {
  if (window.location.protocol !== 'https:' && 
      window.location.hostname !== 'localhost' &&
      isProduction()) {
    window.location.replace(`https://${window.location.hostname}${window.location.pathname}`);
  }
};

// Helper function to track domain usage
export const trackDomainUsage = () => {
  const domain = window.location.origin;
  const device = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';
  
  console.log('🌐 Domain Access:', { 
    domain, 
    device, 
    timestamp: new Date().toISOString(),
    isProduction: isProduction()
  });
  
  // Send to analytics if available
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'domain_access', {
      domain: domain,
      device: device,
      is_production: isProduction()
    });
  }
};

export default DOMAIN_CONFIG;
