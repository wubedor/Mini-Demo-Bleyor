import React, { useState, useEffect } from 'react';
import offlineStorage from '../utils/offlineStorage';
import './OfflineStatus.css';

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState(offlineStorage.getConnectionStatus());
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, count: 0 });
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    // Debounce connection changes to prevent rapid reloads
    let connectionTimeout = null;
    
    const handleConnectionChange = (event) => {
      const { isOnline: online } = event.detail;
      
      // Clear existing timeout
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      
      // Debounce connection status changes
      connectionTimeout = setTimeout(() => {
        setIsOnline(online);
        setConnectionStatus(offlineStorage.getConnectionStatus());
        
        if (online) {
          setShowOfflineBanner(false);
          // Only sync if it's been more than 30 seconds since last sync
          if (!lastSyncTime || Date.now() - lastSyncTime > 30000) {
            syncOfflineData();
          }
        } else {
          setShowOfflineBanner(true);
        }
      }, 500); // 500ms debounce
    };

    window.addEventListener('connectionChange', handleConnectionChange);
    
    // Also listen to native online/offline events with debouncing
    const handleOnline = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      
      connectionTimeout = setTimeout(() => {
        setIsOnline(true);
        setConnectionStatus(offlineStorage.getConnectionStatus());
        setShowOfflineBanner(false);
        
        if (!lastSyncTime || Date.now() - lastSyncTime > 30000) {
          syncOfflineData();
        }
      }, 500);
    };
    
    const handleOffline = () => {
      if (connectionTimeout) clearTimeout(connectionTimeout);
      
      connectionTimeout = setTimeout(() => {
        setIsOnline(false);
        setConnectionStatus(offlineStorage.getConnectionStatus());
        setShowOfflineBanner(true);
      }, 500);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('connectionChange', handleConnectionChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncOfflineData = async () => {
    // Prevent excessive sync calls (minimum 30 seconds between syncs)
    const now = Date.now();
    if (lastSyncTime && now - lastSyncTime < 30000) {
      console.log('🔄 Sync throttled - too soon since last sync');
      return;
    }
    
    setSyncStatus({ syncing: true, count: 0 });
    setLastSyncTime(now);
    
    try {
      const queue = offlineStorage.getOfflineQueue();
      setSyncStatus({ syncing: true, count: queue.length });
      
      const success = await offlineStorage.syncOfflineData();
      
      if (success) {
        setSyncStatus({ syncing: false, count: 0 });
        // Show success notification
        showNotification('All data synced successfully!', 'success');
      } else {
        const remainingQueue = offlineStorage.getOfflineQueue();
        setSyncStatus({ syncing: false, count: remainingQueue.length });
        showNotification('Some data failed to sync', 'warning');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus({ syncing: false, count: 0 });
      showNotification('Sync failed. Please try again.', 'error');
    }
  };

  const showNotification = (message, type) => {
    // This would integrate with your notification system
    console.log(`[${type}] ${message}`);
  };

  const getConnectionIcon = () => {
    if (!isOnline) return '📵';
    
    switch (connectionStatus.connectionType) {
      case 'slow-2g': return '🐌';
      case '2g': return '📶';
      case '3g': return '📡';
      case '4g': return '🚀';
      default: return '🌐';
    }
  };

  const getConnectionColor = () => {
    if (!isOnline) return '#ff4444';
    
    switch (connectionStatus.connectionType) {
      case 'slow-2g': return '#ff8800';
      case '2g': return '#ffaa00';
      case '3g': return '#44aa44';
      case '4g': return '#00aa44';
      default: return '#666666';
    }
  };

  const getStorageUsage = () => {
    const usage = offlineStorage.getStorageUsage();
    return `${(usage.used / 1024 / 1024).toFixed(1)}MB`;
  };

  if (!showOfflineBanner && isOnline && syncStatus.count === 0) {
    return null;
  }

  return (
    <div className={`offline-status ${!isOnline ? 'offline' : 'online'} ${showOfflineBanner ? 'banner' : 'indicator'}`}>
      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="offline-banner">
          <div className="offline-content">
            <div className="offline-icon">📵</div>
            <div className="offline-message">
              <h4>You're offline</h4>
              <p>Some features may be limited. Your data will be synced when you're back online.</p>
            </div>
            <div className="offline-actions">
              <button 
                className="retry-button"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="status-indicator">
        <div className="connection-info">
          <span 
            className="connection-icon" 
            style={{ color: getConnectionColor() }}
          >
            {getConnectionIcon()}
          </span>
          <span className="connection-text">
            {!isOnline ? 'Offline' : connectionStatus.connectionType || 'Online'}
          </span>
        </div>

        {/* Sync Status */}
        {syncStatus.syncing && (
          <div className="sync-status">
            <div className="sync-spinner"></div>
            <span>Syncing {syncStatus.count} items...</span>
          </div>
        )}

        {/* Pending Items */}
        {!isOnline && syncStatus.count > 0 && (
          <div className="pending-items">
            <span>{syncStatus.count} items pending</span>
          </div>
        )}

        {/* Storage Usage */}
        <div className="storage-usage">
          <span>{getStorageUsage()} used</span>
        </div>
      </div>

      {/* Detailed Status Panel */}
      <div className="status-details">
        <div className="status-section">
          <h4>Connection Status</h4>
          <div className="status-item">
            <span>Status:</span>
            <span className={isOnline ? 'status-online' : 'status-offline'}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="status-item">
            <span>Type:</span>
            <span>{connectionStatus.connectionType || 'Unknown'}</span>
          </div>
          <div className="status-item">
            <span>Speed:</span>
            <span>{connectionStatus.downlink} Mbps</span>
          </div>
        </div>

        <div className="status-section">
          <h4>Offline Data</h4>
          <div className="status-item">
            <span>Pending:</span>
            <span>{syncStatus.count} items</span>
          </div>
          <div className="status-item">
            <span>Storage:</span>
            <span>{getStorageUsage()}</span>
          </div>
          <div className="status-item">
            <span>Last Sync:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="status-actions">
          {!isOnline && (
            <button 
              className="sync-button"
              onClick={syncOfflineData}
              disabled={syncStatus.syncing}
            >
              {syncStatus.syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          )}
          
          <button 
            className="clear-button"
            onClick={() => {
              if (window.confirm('Clear all offline data? This cannot be undone.')) {
                offlineStorage.clearCache();
                window.location.reload();
              }
            }}
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
