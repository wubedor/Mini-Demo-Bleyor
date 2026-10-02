// Backend API configuration for SAMB Laundry App
// This connects to the Node.js backend running on port 5000

export const BACKEND_CONFIG = {
  // Backend server configuration
  backendURL: 'http://localhost:5000',
  apiURL: 'http://localhost:5000/api',
  
  // Socket.IO WebSocket configuration
  socketURL: 'http://localhost:5000',
  
  // Determine if running on local network
  isLocalNetwork: () => {
    return window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  },
  
  // Get current backend base URL
  getBackendURL: () => {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      // For production, update with your backend URL
      return 'https://your-production-backend.com';
    }
  },
  
  // Get Socket.IO URL
  getSocketURL: () => {
    if (window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    } else {
      return 'https://your-production-backend.com';
    }
  },
  
  // API endpoints
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    services: '/api/services',
    bookings: '/api/bookings',
    payments: '/api/payments',
    notifications: '/api/notifications',
    upload: '/api/upload',
    locations: '/api/locations'
  },
  
  // WebSocket configuration for Socket.IO
  socket: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
    maxReconnectionAttempts: 5
  }
};

export default BACKEND_CONFIG;
