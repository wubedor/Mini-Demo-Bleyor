// Mobile App State Manager
// Prevents continuous reloading and manages mobile app state

class MobileAppState {
  constructor() {
    this.isInitialized = false;
    this.state = {
      hasSeenSplash: false,
      hasSeenQR: false,
      lastSyncTime: null,
      connectionDebounce: null,
      reloadDebounce: null
    };
  }

  // Initialize mobile app state
  init() {
    if (this.isInitialized) return;
    
    console.log('📱 Initializing Mobile App State Manager');
    
    // Load saved state
    this.loadState();
    
    // Set up connection monitoring with debouncing
    this.setupConnectionMonitoring();
    
    // Set up reload prevention
    this.setupReloadPrevention();
    
    this.isInitialized = true;
  }

  // Load state from sessionStorage
  loadState() {
    try {
      const savedState = sessionStorage.getItem('samb-mobile-state');
      if (savedState) {
        this.state = { ...this.state, ...JSON.parse(savedState) };
      }
    } catch (error) {
      console.error('Failed to load mobile state:', error);
    }
  }

  // Save state to sessionStorage
  saveState() {
    try {
      sessionStorage.setItem('samb-mobile-state', JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save mobile state:', error);
    }
  }

  // Setup connection monitoring with debouncing
  setupConnectionMonitoring() {
    const handleConnectionChange = () => {
      if (this.state.connectionDebounce) {
        clearTimeout(this.state.connectionDebounce);
      }
      
      this.state.connectionDebounce = setTimeout(() => {
        const isOnline = navigator.onLine;
        console.log(`📱 Connection status: ${isOnline ? 'Online' : 'Offline'}`);
        
        // Trigger sync only when coming online and enough time has passed
        if (isOnline && (!this.state.lastSyncTime || Date.now() - this.state.lastSyncTime > 30000)) {
          this.triggerSync();
        }
        
        this.saveState();
      }, 500);
    };

    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);
  }

  // Setup reload prevention
  setupReloadPrevention() {
    // Prevent excessive reloads
    let reloadCount = 0;
    const originalReload = window.location.reload;
    
    window.location.reload = (...args) => {
      reloadCount++;
      console.log(`🔄 Reload attempt ${reloadCount}`);
      
      if (reloadCount > 5) {
        console.warn('⚠️ Too many reloads detected, preventing further reloads');
        return;
      }
      
      // Debounce reloads
      if (this.state.reloadDebounce) {
        clearTimeout(this.state.reloadDebounce);
      }
      
      this.state.reloadDebounce = setTimeout(() => {
        originalReload.apply(window, args);
      }, 1000);
    };
  }

  // Trigger sync with throttling
  triggerSync() {
    if (!this.state.lastSyncTime || Date.now() - this.state.lastSyncTime > 30000) {
      console.log('🔄 Triggering sync');
      this.state.lastSyncTime = Date.now();
      this.saveState();
      
      // Emit custom sync event
      window.dispatchEvent(new CustomEvent('mobileSync', {
        detail: { timestamp: this.state.lastSyncTime }
      }));
    }
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Reset state
  resetState() {
    this.state = {
      hasSeenSplash: false,
      hasSeenQR: false,
      lastSyncTime: null,
      connectionDebounce: null,
      reloadDebounce: null
    };
    this.saveState();
  }
}

export default new MobileAppState();
