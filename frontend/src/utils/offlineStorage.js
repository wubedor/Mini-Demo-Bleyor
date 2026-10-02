// Offline Storage Utility for SAMB's Laundry App
import { safeLocalStorage, safeSessionStorage } from './mobileSafeStorage';

const OFFLINE_STORAGE_KEYS = {
  USER_PROFILE: 'samb_user_profile',
  USER_BOOKINGS: 'samb_user_bookings',
  SERVICES: 'samb_services',
  PENDING_BOOKINGS: 'samb_pending_bookings',
  OFFLINE_QUEUE: 'samb_offline_queue',
  APP_STATE: 'samb_app_state',
  CACHED_DATA: 'samb_cached_data',
  LAST_SYNC: 'samb_last_sync'
};

class OfflineStorage {
  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineData();
      this.notifyOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyOnlineStatus(false);
    });
  }

  notifyOnlineStatus(isOnline) {
    const event = new CustomEvent('connectionChange', { detail: { isOnline } });
    window.dispatchEvent(event);
  }

  // User Profile Management
  saveUserProfile(profile) {
    try {
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Failed to save user profile:', error);
      return false;
    }
  }

  getUserProfile() {
    try {
      const profile = safeLocalStorage.getItem(OFFLINE_STORAGE_KEYS.USER_PROFILE);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  // Bookings Management
  saveBookings(bookings) {
    try {
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.USER_BOOKINGS, JSON.stringify(bookings));
      this.updateLastSync('bookings');
      return true;
    } catch (error) {
      console.error('Failed to save bookings:', error);
      return false;
    }
  }

  getBookings() {
    try {
      const bookings = safeLocalStorage.getItem(OFFLINE_STORAGE_KEYS.USER_BOOKINGS);
      return bookings ? JSON.parse(bookings) : [];
    } catch (error) {
      console.error('Failed to get bookings:', error);
      return [];
    }
  }

  addBooking(booking) {
    const bookings = this.getBookings();
    bookings.push({
      ...booking,
      id: booking.id || Date.now().toString(),
      createdAt: new Date().toISOString(),
      offline: !this.isOnline,
      synced: this.isOnline
    });
    
    if (!this.isOnline) {
      this.queueForSync('booking', booking);
    }
    
    return this.saveBookings(bookings);
  }

  // Services Management
  saveServices(services) {
    try {
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.SERVICES, JSON.stringify(services));
      this.updateLastSync('services');
      return true;
    } catch (error) {
      console.error('Failed to save services:', error);
      return false;
    }
  }

  getServices() {
    try {
      const services = safeLocalStorage.getItem(OFFLINE_STORAGE_KEYS.SERVICES);
      return services ? JSON.parse(services) : [];
    } catch (error) {
      console.error('Failed to get services:', error);
      return [];
    }
  }

  // Offline Queue Management
  queueForSync(type, data) {
    try {
      const queue = this.getOfflineQueue();
      queue.push({
        id: Date.now().toString(),
        type,
        data,
        timestamp: new Date().toISOString(),
        retries: 0
      });
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      return true;
    } catch (error) {
      console.error('Failed to queue for sync:', error);
      return false;
    }
  }

  getOfflineQueue() {
    try {
      const queue = safeLocalStorage.getItem(OFFLINE_STORAGE_KEYS.OFFLINE_QUEUE);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get offline queue:', error);
      return [];
    }
  }

  removeQueueItem(itemId) {
    try {
      const queue = this.getOfflineQueue();
      const updatedQueue = queue.filter(item => item.id !== itemId);
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));
      return true;
    } catch (error) {
      console.error('Failed to remove queue item:', error);
      return false;
    }
  }

  // Sync Management
  async syncOfflineData() {
    if (!this.isOnline) return false;

    const queue = this.getOfflineQueue();
    if (queue.length === 0) return true;

    console.log(`🔄 Syncing ${queue.length} offline items...`);
    let syncedCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      try {
        const success = await this.syncItem(item);
        if (success) {
          this.removeQueueItem(item.id);
          syncedCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error('Failed to sync item:', error);
        failedCount++;
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} synced, ${failedCount} failed`);
    return failedCount === 0;
  }

  async syncItem(item) {
    try {
      switch (item.type) {
        case 'booking':
          return await this.syncBooking(item.data);
        case 'profile_update':
          return await this.syncProfileUpdate(item.data);
        case 'rating':
          return await this.syncRating(item.data);
        default:
          console.warn('Unknown sync item type:', item.type);
          return false;
      }
    } catch (error) {
      console.error('Failed to sync item:', error);
      return false;
    }
  }

  async syncBooking(bookingData) {
    try {
      // This would integrate with your Firebase/Backend API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const result = await response.json();
        // Update local booking with server ID
        this.updateLocalBooking(bookingData.id, result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to sync booking:', error);
      return false;
    }
  }

  updateLocalBooking(localId, serverData) {
    const bookings = this.getBookings();
    const bookingIndex = bookings.findIndex(b => b.id === localId);
    if (bookingIndex !== -1) {
      bookings[bookingIndex] = {
        ...bookings[bookingIndex],
        ...serverData,
        synced: true,
        offline: false
      };
      this.saveBookings(bookings);
    }
  }

  getAuthToken() {
    try {
      return safeLocalStorage.getItem('authToken') || safeSessionStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  // Cache Management
  updateLastSync(type) {
    try {
      const lastSync = this.getLastSync();
      lastSync[type] = new Date().toISOString();
      safeLocalStorage.setItem(OFFLINE_STORAGE_KEYS.LAST_SYNC, JSON.stringify(lastSync));
    } catch (error) {
      console.error('Failed to update last sync:', error);
    }
  }

  getLastSync() {
    try {
      const lastSync = safeLocalStorage.getItem(OFFLINE_STORAGE_KEYS.LAST_SYNC);
      return lastSync ? JSON.parse(lastSync) : {};
    } catch (error) {
      console.error('Failed to get last sync:', error);
      return {};
    }
  }

  // Storage Management
  getStorageUsage() {
    try {
      let totalSize = 0;
      const keys = Object.values(OFFLINE_STORAGE_KEYS);
      
      for (const key of keys) {
        const value = safeLocalStorage.getItem(key);
        if (value) {
          totalSize += new Blob([value]).size;
        }
      }
      
      return {
        used: totalSize,
        available: 5 * 1024 * 1024 - totalSize, // 5MB estimated limit
        percentage: (totalSize / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  clearCache() {
    try {
      const keys = Object.values(OFFLINE_STORAGE_KEYS);
      keys.forEach(key => safeLocalStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear cache:', error);
      return false;
    }
  }

  // App State Management
  saveAppState(state) {
    try {
      safeSessionStorage.setItem(OFFLINE_STORAGE_KEYS.APP_STATE, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error('Failed to save app state:', error);
      return false;
    }
  }

  getAppState() {
    try {
      const state = safeSessionStorage.getItem(OFFLINE_STORAGE_KEYS.APP_STATE);
      return state ? JSON.parse(state) : {};
    } catch (error) {
      console.error('Failed to get app state:', error);
      return {};
    }
  }

  // Utility Methods
  isDataStale(type, maxAgeMinutes = 30) {
    const lastSync = this.getLastSync();
    const lastSyncTime = lastSync[type];
    
    if (!lastSyncTime) return true;
    
    const syncAge = Date.now() - new Date(lastSyncTime).getTime();
    const maxAge = maxAgeMinutes * 60 * 1000;
    
    return syncAge > maxAge;
  }

  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: navigator.connection?.effectiveType || 'unknown',
      downlink: navigator.connection?.downlink || 0,
      rtt: navigator.connection?.rtt || 0
    };
  }
}

// Create singleton instance
const offlineStorage = new OfflineStorage();

export default offlineStorage;
export { OFFLINE_STORAGE_KEYS };
