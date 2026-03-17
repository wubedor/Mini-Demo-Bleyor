import React from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import './OfflineIndicator.css';

export default function OfflineIndicator() {
  const { isOnline, showOfflineMessage, setShowOfflineMessage } = useOfflineStatus();

  if (!showOfflineMessage) return null;

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-content">
        <span className="offline-icon">
          {isOnline ? '🟢' : '🔴'}
        </span>
        <span className="offline-text">
          {isOnline ? 'Back online' : 'You are offline. Some features may be limited.'}
        </span>
        <button 
          className="offline-close"
          onClick={() => setShowOfflineMessage(false)}
        >
          ×
        </button>
      </div>
    </div>
  );
}
