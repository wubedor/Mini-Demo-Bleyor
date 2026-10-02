import { io } from 'socket.io-client';
import { BACKEND_CONFIG } from '../config/backendConfig';

class SocketHelper {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  // Initialize Socket.IO connection
  connect(token = null) {
    try {
      console.log('Connecting to Socket.IO server...');
      
      const socketOptions = {
        ...BACKEND_CONFIG.socket,
        auth: token ? { token } : undefined,
        extraHeaders: token ? { Authorization: `Bearer ${token}` } : undefined
      };

      this.socket = io(BACKEND_CONFIG.getSocketURL(), socketOptions);

      // Setup event listeners
      this.setupEventListeners();
      
      return this.socket;
    } catch (error) {
      console.error('Socket.IO connection error:', error);
      return null;
    }
  }

  // Setup Socket.IO event listeners
  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket.IO connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        this.reconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.isConnected = false;
      this.reconnect();
    });

    // Reconnection events
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket.IO reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket.IO reconnection attempt ${attemptNumber}`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
      this.isConnected = false;
    });

    // Custom application events
    this.socket.on('booking_update', (data) => {
      console.log('Booking update received:', data);
      this.handleBookingUpdate(data);
    });

    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.handleNotification(data);
    });

    this.socket.on('driver_location', (data) => {
      console.log('Driver location update:', data);
      this.handleDriverLocation(data);
    });
  }

  // Reconnection logic
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit event:', event);
    }
  }

  // Listen to events
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Remove event listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  isSocketConnected() {
    return this.isConnected;
  }

  // Event handlers
  handleBookingUpdate(data) {
    // Dispatch custom event or update state
    window.dispatchEvent(new CustomEvent('bookingUpdate', { detail: data }));
  }

  handleNotification(data) {
    // Dispatch custom event or update state
    window.dispatchEvent(new CustomEvent('notification', { detail: data }));
  }

  handleDriverLocation(data) {
    // Dispatch custom event or update state
    window.dispatchEvent(new CustomEvent('driverLocation', { detail: data }));
  }
}

// Create singleton instance
export const socketHelper = new SocketHelper();

export default socketHelper;
