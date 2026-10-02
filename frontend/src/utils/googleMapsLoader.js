// Centralized Google Maps Loader with async loading
class GoogleMapsLoader {
  constructor() {
    this.loading = false;
    this.loaded = false;
    this.loadPromise = null;
    this.callbacks = [];
  }

  // Load Google Maps API with async loading for best performance
  load(apiKey, libraries = ['places']) {
    // Return existing promise if already loading
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Return resolved promise if already loaded
    if (this.loaded && window.google && window.google.maps) {
      return Promise.resolve(window.google.maps);
    }

    // Create new loading promise
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if API key is available
      if (!apiKey) {
        reject(new Error('Google Maps API key not configured'));
        return;
      }

      // Set loading state
      this.loading = true;

      // Create script element
      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      
      // Use loading=async for best performance as recommended by Google
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(',')}&loading=async`;

      // Success callback
      script.onload = () => {
        console.log('Google Maps loaded successfully with async loading');
        this.loading = false;
        this.loaded = true;
        
        // For async loading, we need to wait for the libraries to be available
        // The callback will be executed when the maps are actually ready
        const checkMapsReady = () => {
          if (window.google && window.google.maps && window.google.maps.Map) {
            // Execute all pending callbacks
            this.callbacks.forEach(callback => callback());
            this.callbacks = [];
            resolve(window.google.maps);
          } else {
            // Check again in a moment
            setTimeout(checkMapsReady, 100);
          }
        };
        
        // Start checking if maps are ready
        checkMapsReady();
      };

      // Error callback
      script.onerror = (error) => {
        console.error('Failed to load Google Maps script:', error);
        this.loading = false;
        this.loadPromise = null;
        
        reject(new Error('Failed to load Google Maps. Please check your internet connection and API key configuration.'));
      };

      // Add script to document
      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  // Add callback to be executed when Google Maps loads
  onLoad(callback) {
    if (this.loaded && window.google && window.google.maps) {
      callback();
    } else {
      this.callbacks.push(callback);
    }
  }

  // Check if Google Maps is loaded
  isLoaded() {
    return this.loaded && window.google && window.google.maps;
  }

  // Check if Google Maps is loading
  isLoading() {
    return this.loading;
  }

  // Reset loader (useful for testing)
  reset() {
    this.loading = false;
    this.loaded = false;
    this.loadPromise = null;
    this.callbacks = [];
  }
}

// Create singleton instance
const googleMapsLoader = new GoogleMapsLoader();

export default googleMapsLoader;

// Export utility functions
export const loadGoogleMaps = (apiKey, libraries) => {
  return googleMapsLoader.load(apiKey, libraries);
};

export const isGoogleMapsLoaded = () => {
  return googleMapsLoader.isLoaded();
};

export const onGoogleMapsLoad = (callback) => {
  return googleMapsLoader.onLoad(callback);
};
