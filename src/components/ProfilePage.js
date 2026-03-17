import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setFormData({
            name: userData.name || '',
            phone: userData.phonenumber || '',
            address: userData.address || ''
          });
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    };

    fetchUserData();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        name: formData.name,
        phonenumber: formData.phone,
        address: formData.address
      });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Delete user data from Firestore
        await deleteDoc(doc(db, 'users', user.uid));
        // Delete user from Authentication
        await user.delete();
        navigate('/');
      } catch (err) {
        setError('Failed to delete account. You may need to re-login recently to perform this action.');
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
          <label htmlFor="name">Full Name</label>
          <input id="name" type="text" name="name" value={formData.name} onChange={handleChange} required />
          <label htmlFor="phone">Phone Number</label>
          <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          <label htmlFor="address">Address</label>
          <input id="address" type="text" name="address" value={formData.address} onChange={handleChange} required />
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