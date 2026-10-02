import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import './DeliveryStatus.css';

const DeliveryStatus = ({ bookingId, userRole = 'customer' }) => {
  const [status, setStatus] = useState('pending');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if Firebase is available
  if (!db) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <p>Delivery tracking unavailable - Firebase not configured</p>
      </div>
    );
  }

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#ffc107', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: '#17a2b8', icon: '✅' },
    { value: 'processing', label: 'Processing', color: '#007bff', icon: '🔄' },
    { value: 'ready', label: 'Ready for Pickup/Delivery', color: '#28a745', icon: '🎯' },
    { value: 'in_transit', label: 'In Transit', color: '#fd7e14', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: '#28a745', icon: '✅' },
    { value: 'cancelled', label: 'Cancelled', color: '#dc3545', icon: '❌' }
  ];

  // Listen for real-time updates
  useEffect(() => {
    if (!bookingId) return;

    const bookingRef = doc(db, 'bookings', bookingId);
    const unsubscribe = onSnapshot(bookingRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setStatus(data.status || 'pending');
        setEstimatedTime(data.estimatedTime || '');
        setNotes(data.notes || '');
        setStatusHistory(data.statusHistory || []);
      }
    });

    return unsubscribe;
  }, [bookingId]);

  // Update status (admin only)
  const updateStatus = async (newStatus) => {
    if (!bookingId || userRole !== 'admin') return;
    
    setLoading(true);
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      const newHistoryEntry = {
        status: newStatus,
        timestamp: serverTimestamp(),
        notes: notes || `Status updated to ${newStatus}`
      };

      await updateDoc(bookingRef, {
        status: newStatus,
        estimatedTime,
        notes,
        statusHistory: [...statusHistory, newHistoryEntry],
        updatedAt: serverTimestamp()
      });

      setNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusInfo = statusOptions.find(s => s.value === status) || statusOptions[0];

  return (
    <div className="delivery-status">
      <div className="status-header">
        <h3>Delivery Status</h3>
        <div className="current-status" style={{ backgroundColor: currentStatusInfo.color }}>
          <span className="status-icon">{currentStatusInfo.icon}</span>
          <span className="status-text">{currentStatusInfo.label}</span>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="status-timeline">
        <h4>Status Timeline</h4>
        <div className="timeline">
          {statusHistory.length === 0 ? (
            <p className="no-history">No status updates yet</p>
          ) : (
            statusHistory.map((entry, index) => {
              const entryStatusInfo = statusOptions.find(s => s.value === entry.status) || statusOptions[0];
              return (
                <div key={index} className="timeline-item">
                  <div className="timeline-marker" style={{ backgroundColor: entryStatusInfo.color }}>
                    <span>{entryStatusInfo.icon}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-status">{entryStatusInfo.label}</div>
                    <div className="timeline-notes">{entry.notes}</div>
                    <div className="timeline-time">
                      {entry.timestamp?.toDate ? 
                        entry.timestamp.toDate().toLocaleString() : 
                        'Loading...'
                      }
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Estimated Delivery Time */}
      {estimatedTime && (
        <div className="estimated-time">
          <h4>Estimated {status === 'delivered' ? 'Delivery' : 'Ready'} Time</h4>
          <p>{estimatedTime}</p>
        </div>
      )}

      {/* Admin Controls */}
      {userRole === 'admin' && (
        <div className="admin-controls">
          <h4>Update Status</h4>
          <div className="status-buttons">
            {statusOptions.map(option => (
              <button
                key={option.value}
                className={`status-button ${status === option.value ? 'active' : ''}`}
                style={{ 
                  backgroundColor: status === option.value ? option.color : '#f8f9fa',
                  borderColor: option.color
                }}
                onClick={() => updateStatus(option.value)}
                disabled={loading}
              >
                <span>{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="status-form">
            <div className="form-group">
              <label>Estimated Time:</label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g., 2:00 PM, Tomorrow, 3-5 business days"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label>Notes:</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this status update..."
                className="form-control"
                rows="3"
              />
            </div>
            <button
              className="update-btn"
              onClick={() => updateStatus(status)}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Notes'}
            </button>
          </div>
        </div>
      )}

      {/* Customer View */}
      {userRole === 'customer' && notes && (
        <div className="customer-notes">
          <h4>Latest Update</h4>
          <p>{notes}</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryStatus;
