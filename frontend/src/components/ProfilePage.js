import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    region: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const userData = localStorage.getItem('userData');
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          setFormData({
            firstName: parsedData.firstName || '',
            lastName: parsedData.lastName || '',
            phone: parsedData.phone || '',
            address: parsedData.address || '',
            city: parsedData.city || '',
            region: parsedData.region || ''
          });
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('userData');
      
      const response = await axios.put('http://localhost:5000/api/users/profile', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'x-user-data': userData || '{}'
        }
      });

      if (response.data.success) {
        // Update localStorage
        const parsedUserData = JSON.parse(userData || '{}');
        localStorage.setItem('userData', JSON.stringify({ ...parsedUserData, ...formData }));
        
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete('http://localhost:5000/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Clear localStorage
        localStorage.clear();
        navigate('/');
      } catch (err) {
        setError('Failed to delete account. Please try again.');
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="profile-page"><LoadingSpinner /></div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>My Profile</h1>
          <div className="action-buttons">
            <button 
              onClick={handleEditToggle} 
              className={isEditing ? 'cancel-btn' : 'edit-btn'}
            >
              {isEditing ? 'Cancel' : 'Update Profile'}
            </button>
            <button onClick={handleDeleteAccount} className="delete-btn">
              Delete Account
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isEditing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-section">
              <h2>Personal Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-view">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {formData.firstName ? formData.firstName.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>

            <div className="profile-info">
              <div className="info-section">
                <h2>Personal Information</h2>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Full Name</label>
                    <p>{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div className="info-item">
                    <label>Phone</label>
                    <p>{formData.phone || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <label>Address</label>
                    <p>{formData.address || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <label>City</label>
                    <p>{formData.city || 'Not provided'}</p>
                  </div>
                  <div className="info-item">
                    <label>Region</label>
                    <p>{formData.region || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="edit-hint">
                <p>💡 Click "Update Profile" to edit your information</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
