import React, { useState } from 'react';
import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import './ContactPage.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sanitizeInput = (input) => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-+()]+$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    // Client-side validation
    if (!formData.name.trim()) {
      setStatus('Please enter your name');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(formData.email)) {
      setStatus('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setStatus('Please enter a valid phone number');
      setIsSubmitting(false);
      return;
    }

    if (!formData.message.trim() || formData.message.length < 10) {
      setStatus('Message must be at least 10 characters long');
      setIsSubmitting(false);
      return;
    }

    // Rate limiting check (prevent spam)
    let lastSubmission = null;
    try {
      lastSubmission = localStorage.getItem('lastContactSubmission');
    } catch (error) {
      console.warn('Unable to access localStorage:', error);
    }
    
    if (lastSubmission) {
      const timeDiff = Date.now() - parseInt(lastSubmission);
      const minTimeBetweenSubmissions = 60000; // 1 minute
      
      if (timeDiff < minTimeBetweenSubmissions) {
        setStatus('Please wait before sending another message');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // Sanitize data before sending to database
      const sanitizedData = {
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        subject: sanitizeInput(formData.subject),
        message: sanitizeInput(formData.message),
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent.substring(0, 200), // Limit user agent length
        ipAddress: null // We'll let Firebase handle this securely
      };

      // Add to Firestore with security rules
      await addDoc(collection(db, 'contactMessages'), sanitizedData);
      
      // Update rate limiting
      try {
        localStorage.setItem('lastContactSubmission', Date.now().toString());
      } catch (error) {
        console.warn('Unable to access localStorage:', error);
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      setStatus('Message sent successfully! We will get back to you soon.');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus('');
      }, 5000);
      
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <h1>Contact Us</h1>
        <p className="contact-description">
          Have questions or feedback? We would love to hear from you! Fill out the form below and we will get back to you as soon as possible.
        </p>

        <form onSubmit={handleSubmit} className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              maxLength={100}
              placeholder="John Doe"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              maxLength={254}
              placeholder="john.doe@example.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              maxLength={20}
              placeholder="+1 (555) 123-4567"
              autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="General Inquiry"
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              maxLength={1000}
              placeholder="Tell us how we can help you..."
              rows={5}
            />
            <small className="char-count">
              {formData.message.length}/1000 characters
            </small>
          </div>

          {status && (
            <div className={`status-message ${status.includes('sent successfully') ? 'success' : 'error'}`}>
              {status}
            </div>
          )}

          <button 
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <div className="contact-info">
          <h2>Other Ways to Reach Us</h2>
          <div className="contact-methods">
            <div className="contact-method">
              <h3>Email</h3>
              <p>sambsKlinin@gmail.com</p>
            </div>
            <div className="contact-method">
              <h3>Phone</h3>
              <p>Available during business hours</p>
            </div>
            <div className="contact-method">
              <h3>Location</h3>
              <p>Visit our laundry service center</p>
            </div>
          </div>
        </div>

        <div className="security-notice">
          <h3>Your Privacy & Security</h3>
          <p>
            We take your privacy seriously. Your information is encrypted during transmission and stored securely. 
            We never share your data with third parties without your consent.
          </p>
          <ul>
            <li>All data is encrypted in transit</li>
            <li>Messages are stored securely</li>
            <li>We implement rate limiting to prevent spam</li>
            <li>Your information is never sold to third parties</li>
            <li>You can request data deletion at any time</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
