// Utility functions for splash screen management

export const splashScreenUtils = {
  // Check if splash screen should show
  shouldShowSplash() {
    // Handle Node.js environment for testing
    if (typeof localStorage === 'undefined') {
      return false;
    }
    
    // Always show splash screen for now to test if component works
    console.log('Splash screen check: Always showing for testing');
    return true;
  },

  // Check if running in mobile app
  isMobileApp() {
    // Handle Node.js environment for testing
    if (typeof window === 'undefined') {
      return false;
    }
    
    const userAgentCheck = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const standaloneCheck = window.matchMedia('(display-mode: standalone)').matches;
    const webAppCheck = window.navigator.standalone === true;
    
    return userAgentCheck || standaloneCheck || webAppCheck;
  },

  // Mark splash screen as shown
  markSplashShown() {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('samb-splash-shown', 'true');
      console.log('Splash screen marked as shown');
    }
  },

  // Reset splash screen (for testing)
  resetSplash() {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('samb-last-launch-time');
      console.log('Splash screen reset - will show on next fresh launch');
    }
  },

  // Get splash screen duration
  getDuration() {
    return 20000; // 20 seconds
  },

  // Get splash screen timing info
  getTimingInfo() {
    const duration = this.getDuration();
    return {
      duration,
      fadeOutStart: duration - 500, // 19.5 seconds
      progressIncrement: 5, // 5% per second
      backupTimer: duration + 1000 // 21 seconds
    };
  }
};
