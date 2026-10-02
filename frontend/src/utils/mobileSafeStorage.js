// Mobile-safe storage utilities
// Handles sessionStorage/localStorage fallbacks for mobile browsers and WebView apps

class MobileSafeStorage {
  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
    this.memoryStorage = {};
    this.storageType = this.isStorageAvailable ? 'localStorage' : 'memory';
  }

  checkStorageAvailability() {
    try {
      const testKey = '__storage_test__';
      const testValue = 'test';
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('localStorage not available, using memory storage:', e.message);
      return false;
    }
  }

  setItem(key, value) {
    try {
      if (this.isStorageAvailable) {
        localStorage.setItem(key, value);
      } else {
        this.memoryStorage[key] = value;
      }
      return true;
    } catch (error) {
      console.warn('Failed to save to storage, using memory fallback:', error.message);
      this.memoryStorage[key] = value;
      return true;
    }
  }

  getItem(key) {
    try {
      if (this.isStorageAvailable) {
        return localStorage.getItem(key);
      } else {
        return this.memoryStorage[key] || null;
      }
    } catch (error) {
      console.warn('Failed to read from storage, using memory fallback:', error.message);
      return this.memoryStorage[key] || null;
    }
  }

  removeItem(key) {
    try {
      if (this.isStorageAvailable) {
        localStorage.removeItem(key);
      } else {
        delete this.memoryStorage[key];
      }
      return true;
    } catch (error) {
      console.warn('Failed to remove from storage, using memory fallback:', error.message);
      delete this.memoryStorage[key];
      return true;
    }
  }

  clear() {
    try {
      if (this.isStorageAvailable) {
        localStorage.clear();
      } else {
        this.memoryStorage = {};
      }
      return true;
    } catch (error) {
      console.warn('Failed to clear storage, using memory fallback:', error.message);
      this.memoryStorage = {};
      return true;
    }
  }

  getStorageType() {
    return this.storageType;
  }
}

// SessionStorage equivalent
class MobileSafeSessionStorage {
  constructor() {
    this.isStorageAvailable = this.checkStorageAvailability();
    this.memoryStorage = {};
    this.storageType = this.isStorageAvailable ? 'sessionStorage' : 'memory';
  }

  checkStorageAvailability() {
    try {
      const testKey = '__session_test__';
      const testValue = 'test';
      sessionStorage.setItem(testKey, testValue);
      sessionStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn('sessionStorage not available, using memory storage:', e.message);
      return false;
    }
  }

  setItem(key, value) {
    try {
      if (this.isStorageAvailable) {
        sessionStorage.setItem(key, value);
      } else {
        this.memoryStorage[key] = value;
      }
      return true;
    } catch (error) {
      console.warn('Failed to save to sessionStorage, using memory fallback:', error.message);
      this.memoryStorage[key] = value;
      return true;
    }
  }

  getItem(key) {
    try {
      if (this.isStorageAvailable) {
        return sessionStorage.getItem(key);
      } else {
        return this.memoryStorage[key] || null;
      }
    } catch (error) {
      console.warn('Failed to read from sessionStorage, using memory fallback:', error.message);
      return this.memoryStorage[key] || null;
    }
  }

  removeItem(key) {
    try {
      if (this.isStorageAvailable) {
        sessionStorage.removeItem(key);
      } else {
        delete this.memoryStorage[key];
      }
      return true;
    } catch (error) {
      console.warn('Failed to remove from sessionStorage, using memory fallback:', error.message);
      delete this.memoryStorage[key];
      return true;
    }
  }

  clear() {
    try {
      if (this.isStorageAvailable) {
        sessionStorage.clear();
      } else {
        this.memoryStorage = {};
      }
      return true;
    } catch (error) {
      console.warn('Failed to clear sessionStorage, using memory fallback:', error.message);
      this.memoryStorage = {};
      return true;
    }
  }

  getStorageType() {
    return this.storageType;
  }
}

// Create global instances
const mobileSafeLocalStorage = new MobileSafeStorage();
const mobileSafeSessionStorage = new MobileSafeSessionStorage();

// Export safe storage functions that work like native storage APIs
export const safeLocalStorage = {
  setItem: (key, value) => mobileSafeLocalStorage.setItem(key, value),
  getItem: (key) => mobileSafeLocalStorage.getItem(key),
  removeItem: (key) => mobileSafeLocalStorage.removeItem(key),
  clear: () => mobileSafeLocalStorage.clear(),
  getStorageType: () => mobileSafeLocalStorage.getStorageType()
};

export const safeSessionStorage = {
  setItem: (key, value) => mobileSafeSessionStorage.setItem(key, value),
  getItem: (key) => mobileSafeSessionStorage.getItem(key),
  removeItem: (key) => mobileSafeSessionStorage.removeItem(key),
  clear: () => mobileSafeSessionStorage.clear(),
  getStorageType: () => mobileSafeSessionStorage.getStorageType()
};

// Auto-detect and log storage type
console.log('📱 Mobile Storage Status:');
console.log(`📦 localStorage: ${mobileSafeLocalStorage.getStorageType()}`);
console.log(`🔄 sessionStorage: ${mobileSafeSessionStorage.getStorageType()}`);

const safeStorageUtils = { safeLocalStorage, safeSessionStorage };

export default safeStorageUtils;
