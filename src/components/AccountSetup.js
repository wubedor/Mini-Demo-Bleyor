import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './AccountSetup.css';

export default function AccountSetup() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const [accountData, setAccountData] = useState({
    // Step 1: Basic Info
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    
    // Step 2: Contact Info
    phone: '',
    address: '',
    city: 'Accra',
    region: 'Greater Accra',
    
    // Step 3: Preferences
    preferredService: 'Regular Laundry',
    preferredTime: 'Morning',
    notifications: true,
    newsletter: false
  });

  const [passwordStrength, setPasswordStrength] = useState(0);

  const handleChange = (e) => {
    setAccountData({ ...accountData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'password') {
      let strength = 0;
      const password = e.target.value;
      if (password.length >= 6) strength++;
      if (password.length >= 10) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      setPasswordStrength(strength);
    }
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return { text: 'Weak', color: '#f44336' };
    if (passwordStrength <= 3) return { text: 'Medium', color: '#ff9800' };
    return { text: 'Strong', color: '#4caf50' };
  };

  const validateStep = () => {
    setError('');
    
    if (step === 1) {
      if (!accountData.email || !accountData.password || !accountData.name) {
        setError('Please fill in all required fields');
        return false;
      }
      if (accountData.password !== accountData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (passwordStrength < 2) {
        setError('Please use a stronger password');
        return false;
      }
    }
    
    if (step === 2) {
      if (!accountData.phone || !accountData.address) {
        setError('Please provide your contact information');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const createAccount = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        accountData.email, 
        accountData.password
      );
      
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: accountData.name
      });

      // Save comprehensive user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        // Basic Info
        name: accountData.name,
        email: accountData.email,
        
        // Contact Info
        phone: accountData.phone,
        address: accountData.address,
        city: accountData.city,
        region: accountData.region,
        
        // Preferences
        preferredService: accountData.preferredService,
        preferredTime: accountData.preferredTime,
        notifications: accountData.notifications,
        newsletter: accountData.newsletter,
        
        // Account Info
        isVerified: false,
        accountType: 'customer',
        memberSince: new Date(),
        lastLogin: new Date(),
        
        // Booking Stats
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        
        // Status
        isActive: true,
        isPremium: false
      });

      // Send verification email
      await sendEmailVerification(user);
      
      // Sign out and show success message
      await auth.signOut();
      
      setSuccess(`Account created successfully! 🎉\n\nVerification email sent to ${accountData.email}\n\nPlease check your email and verify your account, then login to start booking!`);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 5000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="setup-step">
            <h3>Step 1: Basic Information</h3>
            
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={accountData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={accountData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={accountData.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                required
              />
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getPasswordStrengthText().color
                    }}
                  />
                </div>
                <span style={{ color: getPasswordStrengthText().color }}>
                  {getPasswordStrengthText().text}
                </span>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={accountData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="setup-step">
            <h3>Step 2: Contact Information</h3>
            
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={accountData.phone}
                onChange={handleChange}
                placeholder="+233 XX XXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label>Address *</label>
              <input
                type="text"
                name="address"
                value={accountData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <select name="city" value={accountData.city} onChange={handleChange}>
                  <option value="Accra">Accra</option>
                  <option value="Kumasi">Kumasi</option>
                  <option value="Takoradi">Takoradi</option>
                  <option value="Tamale">Tamale</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Region</label>
                <select name="region" value={accountData.region} onChange={handleChange}>
                  <option value="Greater Accra">Greater Accra</option>
                  <option value="Ashanti">Ashanti</option>
                  <option value="Western">Western</option>
                  <option value="Northern">Northern</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="setup-step">
            <h3>Step 3: Service Preferences</h3>
            
            <div className="form-group">
              <label>Preferred Service</label>
              <select name="preferredService" value={accountData.preferredService} onChange={handleChange}>
                <option value="Regular Laundry">Regular Laundry</option>
                <option value="Dry Cleaning">Dry Cleaning</option>
                <option value="Express Service">Express Service</option>
                <option value="Premium Service">Premium Service</option>
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Time</label>
              <select name="preferredTime" value={accountData.preferredTime} onChange={handleChange}>
                <option value="Morning">Morning (8AM - 12PM)</option>
                <option value="Afternoon">Afternoon (12PM - 4PM)</option>
                <option value="Evening">Evening (4PM - 6PM)</option>
              </select>
            </div>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={accountData.notifications}
                  onChange={(e) => setAccountData({...accountData, notifications: e.target.checked})}
                />
                <span>Send booking notifications via email</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="newsletter"
                  checked={accountData.newsletter}
                  onChange={(e) => setAccountData({...accountData, newsletter: e.target.checked})}
                />
                <span>Send me updates and special offers</span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="account-setup">
      <div className="setup-container">
        <div className="setup-header">
          <h2>Create Your Account</h2>
          <p>Join SAMB's Laundry and manage your bookings easily</p>
          
          <div className="progress-bar">
            <div className="progress-steps">
              {[1, 2, 3].map((stepNumber) => (
                <div 
                  key={stepNumber}
                  className={`step ${step >= stepNumber ? 'active' : ''}`}
                >
                  {stepNumber}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form className="setup-form" onSubmit={(e) => e.preventDefault()}>
          {renderStep()}

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <div className="step-actions">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                Previous
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary" 
                onClick={createAccount}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            )}
          </div>
        </form>

        <div className="setup-footer">
          <p>Already have an account? <a href="/login">Sign In</a></p>
        </div>
      </div>
    </div>
  );
}
