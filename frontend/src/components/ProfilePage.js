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
    return <div className="profile-container"><LoadingSpinner /></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>Your Profile</h2>
        {error && <div className="profile-error">{error}</div>}
        {success && <div className="profile-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          
          <label htmlFor="address">Address</label>
          <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} required />
          
          <label htmlFor="city">City</label>
          <input id="city" type="text" name="city" value={formData.city} onChange={handleChange} />
          
          <label htmlFor="region">Region</label>
          <input id="region" type="text" name="region" value={formData.region} onChange={handleChange} />
          
          <button type="submit" className="profile-button" disabled={loading}>
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        <button onClick={handleDeleteAccount} className="profile-delete-button" disabled={loading}>
          Delete Account
        </button>
      </div>
    </div>
  );
}