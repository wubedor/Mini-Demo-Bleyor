import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_CONFIG } from '../../config/backendConfig';
import './UserManagement.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        filter: filter
      };

      const response = await axios.get(`${BACKEND_CONFIG.apiURL}/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BACKEND_CONFIG.apiURL}/admin/users/${userId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BACKEND_CONFIG.apiURL}/admin/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user => {
    const searchMatch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const filterMatch = filter === 'all' || 
                      (filter === 'active' && user.isActive) ||
                      (filter === 'inactive' && !user.isActive) ||
                      (filter === 'admin' && user.role === 'admin');
    return searchMatch && filterMatch;
  });

  const renderUserModal = () => {
    if (!showModal || !selectedUser) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>User Details</h2>
            <button className="close-btn" onClick={() => setShowModal(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="modal-body">
            <div className="user-details">
              <div className="detail-item">
                <label>Name:</label>
                <span>{selectedUser.fullName}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{selectedUser.phone}</span>
              </div>
              <div className="detail-item">
                <label>Role:</label>
                <span className={`role-badge ${selectedUser.role}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className={`status-badge ${selectedUser.isActive ? 'active' : 'inactive'}`}>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-item">
                <label>Member Since:</label>
                <span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="detail-item">
                <label>Last Login:</label>
                <span>{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="detail-item">
                <label>Total Bookings:</label>
                <span>{selectedUser.totalBookings || 0}</span>
              </div>
              <div className="detail-item">
                <label>Loyalty Points:</label>
                <span>{selectedUser.loyaltyPoints || 0}</span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>
              Close
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowModal(false);
                navigate(`/admin/users/${selectedUser._id}/edit`);
              }}
            >
              Edit User
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="user-management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-management">
        <div className="error-message">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={fetchUsers} className="retry-btn">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <h1>User Management</h1>
        <button 
          onClick={() => navigate('/admin/dashboard')}
          className="btn btn-outline"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      <div className="controls-section">
        <div className="search-filter">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Add User
          </button>
          <button className="btn btn-secondary">
            <i className="fas fa-download"></i>
            Export
          </button>
        </div>
      </div>

      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <i className="fas fa-users"></i>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Status</th>
                <th>Bookings</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.profileImage ? (
                          <img src={user.profileImage} alt={user.fullName} />
                        ) : (
                          <div className="avatar-placeholder">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="user-details">
                        <h4>{user.fullName}</h4>
                        <p>ID: {user._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <span>{user.email}</span>
                      </div>
                      <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <span>{user.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="booking-stats">
                      <span className="booking-count">{user.totalBookings || 0}</span>
                      <small>bookings</small>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                      <small>{new Date(user.createdAt).toLocaleTimeString()}</small>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleViewUser(user)}
                        className="btn btn-sm btn-outline"
                        title="View Details"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/users/${user._id}/edit`)}
                        className="btn btn-sm btn-outline"
                        title="Edit User"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                        className={`btn btn-sm ${user.isActive ? 'btn-warning' : 'btn-success'}`}
                        title={user.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <i className={`fas ${user.isActive ? 'fa-ban' : 'fa-check'}`}></i>
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn btn-sm btn-danger"
                        title="Delete User"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="btn btn-outline"
          >
            <i className="fas fa-chevron-left"></i>
            Previous
          </button>
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-outline"
          >
            Next
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {renderUserModal()}
    </div>
  );
}
