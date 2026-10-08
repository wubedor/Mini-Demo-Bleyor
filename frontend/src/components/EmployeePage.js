import React, { useState } from 'react';
import axios from 'axios';
import './EmployeePage.css';

export default function EmployeePage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    region: '',
    position: '',
    experience: '',
    education: '',
    skills: '',
    availability: '',
    expectedSalary: '',
    startDate: '',
    coverLetter: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      const applicationData = {
        ...formData,
        applicantId: userData._id || userData.email,
        applicantName: `${formData.firstName} ${formData.lastName}`,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:5000/api/job-applications', applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSuccess('Application submitted successfully! We will review your application and contact you soon.');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          region: '',
          position: '',
          experience: '',
          education: '',
          skills: '',
          availability: '',
          expectedSalary: '',
          startDate: '',
          coverLetter: ''
        });
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employee-page">
      <div className="employee-container">
        <div className="page-header">
          <h1>Join Our Team</h1>
          <p className="page-subtitle">Apply for employment at SAMB's Laundry</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            {success}
            <p className="view-applications-link">
              <a href="/my-applications">View your applications</a>
            </p>
          </div>
        )}

        <div className="application-form">
          <h2>Employment Application</h2>
          <form onSubmit={handleSubmit}>
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="John"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="+233 20 123 4567"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  placeholder="123 Main Street"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    placeholder="Accra"
                  />
                </div>
                <div className="form-group">
                  <label>Region *</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    placeholder="Greater Accra"
                  />
                </div>
              </div>
            </div>

            {/* Position Information */}
            <div className="form-section">
              <h3>Position Information</h3>
              <div className="form-group">
                <label>Position Applying For *</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a position</option>
                  <option value="Laundry Worker">Laundry Worker</option>
                  <option value="Delivery Driver">Delivery Driver</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Years of Experience *</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2 years"
                />
              </div>

              <div className="form-group">
                <label>Highest Education *</label>
                <select
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select education level</option>
                  <option value="High School">High School</option>
                  <option value="Diploma">Diploma</option>
                  <option value="Bachelor's Degree">Bachelor's Degree</option>
                  <option value="Master's Degree">Master's Degree</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Skills *</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  placeholder="List your relevant skills (e.g., laundry operations, customer service, driving, etc.)"
                  rows={3}
                />
              </div>
            </div>

            {/* Availability & Expectations */}
            <div className="form-section">
              <h3>Availability & Expectations</h3>
              <div className="form-group">
                <label>Availability *</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends">Weekends only</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <div className="form-group">
                <label>Expected Salary (GHS/month) *</label>
                <input
                  type="text"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 2000"
                />
              </div>

              <div className="form-group">
                <label>Earliest Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Cover Letter */}
            <div className="form-section">
              <h3>Cover Letter</h3>
              <div className="form-group">
                <label>Tell us about yourself *</label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleChange}
                  required
                  placeholder="Why do you want to work with us? What makes you a good fit for this position?"
                  rows={5}
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <div className="info-section">
          <h3>Why Work With Us?</h3>
          <ul>
            <li>✅ Competitive salary and benefits</li>
            <li>✅ Flexible working hours</li>
            <li>✅ Career growth opportunities</li>
            <li>✅ Friendly and supportive team</li>
            <li>✅ Training and development programs</li>
            <li>✅ Safe and clean work environment</li>
          </ul>

          <h3>Requirements</h3>
          <ul>
            <li>Must be at least 18 years old</li>
            <li>Valid ID required</li>
            <li>Good communication skills</li>
            <li>Reliable and punctual</li>
            <li>Ability to work in a team</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
