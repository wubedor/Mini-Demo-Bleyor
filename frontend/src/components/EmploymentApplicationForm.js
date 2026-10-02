import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_CONFIG } from '../config/backendConfig';

const EmploymentApplicationForm = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: 'prefer_not_to_say',
    
    // Address
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nigeria'
    },
    
    // Position
    positionApplied: '',
    positionOther: '',
    expectedSalary: '',
    availableStartDate: '',
    
    // Education
    education: [{
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false
    }],
    
    // Work Experience
    workExperience: [{
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      isCurrentlyWorking: false,
      responsibilities: ''
    }],
    
    // Skills
    skills: [''],
    
    // References
    references: [{
      name: '',
      position: '',
      company: '',
      phone: '',
      email: '',
      relationship: ''
    }],
    
    // Additional Info
    coverLetter: '',
    whyJoinUs: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('[')) {
      // Handle array fields
      const [arrayName, index, field] = name.match(/(\w+)\[(\d+)\]\.(\w+)/).slice(1);
      setFormData(prev => ({
        ...prev,
        [arrayName]: prev[arrayName].map((item, i) => 
          i === parseInt(index) ? { ...item, [field]: type === 'checkbox' ? checked : value } : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultItem]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post(
        `${BACKEND_CONFIG.apiURL}/employment/apply`,
        formData
      );

      setSubmitStatus({
        type: 'success',
        message: 'Application submitted successfully! We will contact you soon.'
      });
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: 'prefer_not_to_say',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'Nigeria'
        },
        positionApplied: '',
        positionOther: '',
        expectedSalary: '',
        availableStartDate: '',
        education: [{
          institution: '',
          degree: '',
          fieldOfStudy: '',
          startDate: '',
          endDate: '',
          isCurrentlyStudying: false
        }],
        workExperience: [{
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          isCurrentlyWorking: false,
          responsibilities: ''
        }],
        skills: [''],
        references: [{
          name: '',
          position: '',
          company: '',
          phone: '',
          email: '',
          relationship: ''
        }],
        coverLetter: '',
        whyJoinUs: ''
      });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Error submitting application. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="employment-application-form">
      <div className="container">
        <div className="form-header">
          <h1>Join Our Team</h1>
          <p>Fill out the form below to apply for a position at SAMB Laundry</p>
        </div>

        {submitStatus && (
          <div className={`alert alert-${submitStatus.type}`}>
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <section className="form-section">
            <h2>Personal Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
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
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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
                />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="prefer_not_to_say">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Address Information */}
          <section className="form-section">
            <h2>Address Information</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Zip Code *</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Position Information */}
          <section className="form-section">
            <h2>Position Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Position Applied For *</label>
                <select
                  name="positionApplied"
                  value={formData.positionApplied}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a position</option>
                  <option value="driver">Driver</option>
                  <option value="laundry_staff">Laundry Staff</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="manager">Manager</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.positionApplied === 'other' && (
                <div className="form-group">
                  <label>Specify Position *</label>
                  <input
                    type="text"
                    name="positionOther"
                    value={formData.positionOther}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              <div className="form-group">
                <label>Expected Salary (₦) *</label>
                <input
                  type="number"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Available Start Date *</label>
                <input
                  type="date"
                  name="availableStartDate"
                  value={formData.availableStartDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </section>

          {/* Education */}
          <section className="form-section">
            <h2>Education</h2>
            {formData.education.map((edu, index) => (
              <div key={index} className="education-item">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Institution *</label>
                    <input
                      type="text"
                      name={`education[${index}].institution`}
                      value={edu.institution}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Degree *</label>
                    <input
                      type="text"
                      name={`education[${index}].degree`}
                      value={edu.degree}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Field of Study *</label>
                    <input
                      type="text"
                      name={`education[${index}].fieldOfStudy`}
                      value={edu.fieldOfStudy}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name={`education[${index}].startDate`}
                      value={edu.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name={`education[${index}].endDate`}
                      value={edu.endDate}
                      onChange={handleChange}
                      disabled={edu.isCurrentlyStudying}
                      required={!edu.isCurrentlyStudying}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name={`education[${index}].isCurrentlyStudying`}
                        checked={edu.isCurrentlyStudying}
                        onChange={handleChange}
                      />
                      Currently Studying
                    </label>
                  </div>
                </div>
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeArrayItem('education', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addArrayItem('education', {
                institution: '',
                degree: '',
                fieldOfStudy: '',
                startDate: '',
                endDate: '',
                isCurrentlyStudying: false
              })}
            >
              + Add Education
            </button>
          </section>

          {/* Work Experience */}
          <section className="form-section">
            <h2>Work Experience</h2>
            {formData.workExperience.map((work, index) => (
              <div key={index} className="work-experience-item">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      name={`workExperience[${index}].company`}
                      value={work.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      name={`workExperience[${index}].position`}
                      value={work.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name={`workExperience[${index}].startDate`}
                      value={work.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name={`workExperience[${index}].endDate`}
                      value={work.endDate}
                      onChange={handleChange}
                      disabled={work.isCurrentlyWorking}
                    />
                  </div>
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name={`workExperience[${index}].isCurrentlyWorking`}
                        checked={work.isCurrentlyWorking}
                        onChange={handleChange}
                      />
                      Currently Working Here
                    </label>
                  </div>
                  <div className="form-group full-width">
                    <label>Responsibilities *</label>
                    <textarea
                      name={`workExperience[${index}].responsibilities`}
                      value={work.responsibilities}
                      onChange={handleChange}
                      required
                      rows="3"
                    />
                  </div>
                </div>
                {formData.workExperience.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeArrayItem('workExperience', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addArrayItem('workExperience', {
                company: '',
                position: '',
                startDate: '',
                endDate: '',
                isCurrentlyWorking: false,
                responsibilities: ''
              })}
            >
              + Add Work Experience
            </button>
          </section>

          {/* Skills */}
          <section className="form-section">
            <h2>Skills</h2>
            {formData.skills.map((skill, index) => (
              <div key={index} className="skill-item">
                <input
                  type="text"
                  name={`skills[${index}]`}
                  value={skill}
                  onChange={handleChange}
                  placeholder="Enter a skill"
                  required
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeArrayItem('skills', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addArrayItem('skills', '')}
            >
              + Add Skill
            </button>
          </section>

          {/* References */}
          <section className="form-section">
            <h2>References</h2>
            {formData.references.map((ref, index) => (
              <div key={index} className="reference-item">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name={`references[${index}].name`}
                      value={ref.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      name={`references[${index}].position`}
                      value={ref.position}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      name={`references[${index}].company`}
                      value={ref.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input
                      type="tel"
                      name={`references[${index}].phone`}
                      value={ref.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name={`references[${index}].email`}
                      value={ref.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship *</label>
                    <input
                      type="text"
                      name={`references[${index}].relationship`}
                      value={ref.relationship}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                {formData.references.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeArrayItem('references', index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add"
              onClick={() => addArrayItem('references', {
                name: '',
                position: '',
                company: '',
                phone: '',
                email: '',
                relationship: ''
              })}
            >
              + Add Reference
            </button>
          </section>

          {/* Additional Information */}
          <section className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group full-width">
              <label>Cover Letter *</label>
              <textarea
                name="coverLetter"
                value={formData.coverLetter}
                onChange={handleChange}
                required
                rows="8"
                placeholder="Tell us about yourself and why you're interested in this position..."
              />
            </div>
            <div className="form-group full-width">
              <label>Why do you want to join SAMB Laundry? *</label>
              <textarea
                name="whyJoinUs"
                value={formData.whyJoinUs}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Share your motivation for joining our team..."
              />
            </div>
          </section>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .employment-application-form {
          padding: 2rem 0;
          background: #f5f5f5;
          min-height: 100vh;
        }

        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .form-header h1 {
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #666;
        }

        .alert {
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }

        .alert-success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .alert-error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .form-section {
          background: white;
          padding: 2rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .form-section h2 {
          color: #333;
          margin-bottom: 1.5rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #007bff;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
        }

        .checkbox-group label {
          margin-bottom: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-group input[type="checkbox"] {
          width: auto;
        }

        .education-item,
        .work-experience-item,
        .reference-item,
        .skill-item {
          padding: 1.5rem;
          background: #f9f9f9;
          border-radius: 4px;
          margin-bottom: 1rem;
          position: relative;
        }

        .btn-remove {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-add {
          background: #28a745;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
        }

        .skill-item {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .skill-item input {
          flex: 1;
        }

        .form-actions {
          text-align: center;
          margin-top: 2rem;
        }

        .btn-submit {
          background: #007bff;
          color: white;
          border: none;
          padding: 1rem 3rem;
          border-radius: 4px;
          font-size: 1.1rem;
          cursor: pointer;
          font-weight: 600;
        }

        .btn-submit:hover {
          background: #0056b3;
        }

        .btn-submit:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default EmploymentApplicationForm;
