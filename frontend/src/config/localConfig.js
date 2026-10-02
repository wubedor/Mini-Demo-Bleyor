// Local network configuration for secure mobile app access

export const LOCAL_CONFIG = {
  // Your local network IP
  localIP: '10.250.118.252',
  port: '3000',
  
  // Full URLs
  localURL: 'http://10.250.118.252:3000',
  webURL: 'http://fir-1e69a.web.app',
  
  // Determine if running on local network
  isLocalNetwork: () => {
    return window.location.hostname === '10.250.118.252' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },
  
  // Get current base URL
  getBaseURL: () => {
    if (window.location.hostname === '10.250.118.252') {
      return 'http://10.250.118.252:3000';
    } else if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    } else {
      return 'http://samb-laundry.web.app';
    }
  },
  
  // Firebase domains for authentication
  getFirebaseDomains: () => [
    '10.250.118.252:3000',
    'http://10.250.118.252:3000',
    'localhost:3000',
    '127.0.0.1:3000',
    'samb-laundry.web.app',
    'http://samb-laundry.web.app',
    'https://samb-laundry.web.app'
  ],
  
  // Security settings
  security: {
    allowLocalOnly: true,
    requireSameNetwork: true,
    fallbackToWebApp: true,
    
    // Check if device is on same network
    isSameNetwork: () => {
      // This is a basic check - in production, you'd want more sophisticated network detection
      const currentHost = window.location.hostname;
      return currentHost === '10.250.118.252' || 
             currentHost === 'localhost' || 
             currentHost === '127.0.0.1';
    }
  }
};

export default LOCAL_CONFIG;
