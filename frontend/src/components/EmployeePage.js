import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeePage.css';

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'employee',
    department: '',
    address: '',
    city: '',
    region: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/users?role=employee', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setEmployees(response.data.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('accessToken');
      
      if (editingEmployee) {
        // Update existing employee
        await axios.put(`http://localhost:5000/api/users/${editingEmployee._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Employee updated successfully!');
      } else {
        // Create new employee
        await axios.post('http://localhost:5000/api/users/register', {
          ...formData,
          password: 'TempPass123' // Default password, should be changed on first login
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Employee created successfully!');
      }

      setShowModal(false);
      setEditingEmployee(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'employee',
        department: '',
        address: '',
        city: '',
        region: '',
        isActive: true
      });
      fetchEmployees();
    } catch (err) {
      console.error('Error saving employee:', err);
      setError('Failed to save employee');
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      email: employee.email || '',
      phone: employee.phone || '',
      role: employee.role || 'employee',
      department: employee.department || '',
      address: employee.address || '',
      city: employee.city || '',
      region: employee.region || '',
      isActive: employee.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`http://localhost:5000/api/users/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Employee deleted successfully!');
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError('Failed to delete employee');
      }
    }
  };

  const toggleStatus = async (employee) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://localhost:5000/api/users/${employee._id}`, {
        isActive: !employee.isActive
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Employee status updated!');
      fetchEmployees();
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'employee',
      department: '',
      address: '',
      city: '',
      region: '',
      isActive: true
    });
  };

  if (loading) {
    return <div className="employee-page"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="employee-page">
      <div className="employee-container">
        <div className="page-header">
          <h1>Employee Management</h1>
          <button className="add-employee-btn" onClick={() => setShowModal(true)}>
            + Add Employee
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="employees-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="7">No employees found</td>
                </tr>
              ) : (
                employees.map((employee) => (
                  <tr key={employee._id}>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.phone || 'N/A'}</td>
                    <td>{employee.department || 'N/A'}</td>
                    <td>{employee.role}</td>
                    <td>
                      <span className={`status-badge ${employee.isActive ? 'active' : 'inactive'}`}>
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn edit" onClick={() => handleEdit(employee)}>
                        Edit
                      </button>
                      <button 
                        className="action-btn toggle" 
                        onClick={() => toggleStatus(employee)}
                      >
                        {employee.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="action-btn delete" onClick={() => handleDelete(employee._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingEmployee}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Region</label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    Active
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {editingEmployee ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
