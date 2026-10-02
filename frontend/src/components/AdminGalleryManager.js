import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import Gallery from './Gallery';
import './AdminGalleryManager.css';

export default function AdminGalleryManager() {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    categories: 0
  });

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      setLoading(true);
      const mediaCollection = collection(db, 'serviceGallery');
      const q = query(mediaCollection, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMediaItems(items);
      calculateStats(items);
    } catch (error) {
      console.error('Error fetching media items:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (items) => {
    const stats = {
      total: items.length,
      images: items.filter(item => item.mediaType === 'image').length,
      videos: items.filter(item => item.mediaType === 'video').length,
      categories: new Set(items.map(item => item.category)).size
    };
    setStats(stats);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleUpdateItem = async (updatedData) => {
    try {
      const itemRef = doc(db, 'serviceGallery', selectedItem.id);
      await updateDoc(itemRef, updatedData);
      
      await fetchMediaItems();
      setShowEditModal(false);
      setSelectedItem(null);
      
      alert('Media item updated successfully!');
    } catch (error) {
      console.error('Error updating media item:', error);
      alert('Failed to update media item. Please try again.');
    }
  };

  const handleToggleActive = async (itemId, currentStatus) => {
    try {
      const itemRef = doc(db, 'serviceGallery', itemId);
      await updateDoc(itemRef, { isActive: !currentStatus });
      
      await fetchMediaItems();
    } catch (error) {
      console.error('Error toggling media status:', error);
      alert('Failed to update media status. Please try again.');
    }
  };

  const handleBulkDelete = async (itemIds) => {
    if (!window.confirm(`Are you sure you want to delete ${itemIds.length} media items?`)) {
      return;
    }

    try {
      for (const itemId of itemIds) {
        await deleteDoc(doc(db, 'serviceGallery', itemId));
      }
      
      await fetchMediaItems();
      alert(`${itemIds.length} media items deleted successfully!`);
    } catch (error) {
      console.error('Error bulk deleting media items:', error);
      alert('Failed to delete some media items. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-gallery-loading">
        <div className="spinner"></div>
        <p>Loading admin gallery...</p>
      </div>
    );
  }

  return (
    <div className="admin-gallery-manager">
      <div className="admin-header">
        <h1>Gallery Management</h1>
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total Items</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.images}</span>
            <span className="stat-label">Images</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.videos}</span>
            <span className="stat-label">Videos</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.categories}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <button className="action-btn primary">
                📤 Upload New Media
              </button>
              <button className="action-btn secondary">
                📊 View Analytics
              </button>
              <button className="action-btn secondary">
                📥 Export Gallery
              </button>
              <button className="action-btn danger">
                🗑️ Bulk Delete
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Gallery Settings</h3>
            <div className="settings-list">
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Show inactive items</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Auto-approve uploads</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" />
                <span>Enable comments</span>
              </label>
              <label className="setting-item">
                <input type="checkbox" defaultChecked />
                <span>Show upload dates</span>
              </label>
            </div>
          </div>
        </div>

        <div className="admin-main">
          <Gallery isAdmin={true} />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <div className="modal-header">
              <h3>Edit Media Item</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            
            <EditMediaForm 
              item={selectedItem}
              onUpdate={handleUpdateItem}
              onCancel={() => setShowEditModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Media Form Component
function EditMediaForm({ item, onUpdate, onCancel }) {
  const [formData, setFormData] = useState({
    title: item.title || '',
    description: item.description || '',
    category: item.category || 'general',
    isActive: item.isActive !== false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>Category:</label>
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="general">General</option>
          <option value="cleaning">Cleaning Services</option>
          <option value="laundry">Laundry Services</option>
          <option value="before-after">Before & After</option>
          <option value="equipment">Equipment & Facilities</option>
          <option value="team">Our Team</option>
          <option value="events">Events & Special Projects</option>
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span>Active (visible in gallery)</span>
        </label>
      </div>

      <div className="form-actions">
        <button type="submit" className="save-btn">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
      </div>
    </form>
  );
}
