import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendAuth } from '../context/BackendAuthContext';
import './LoginModal.css';

export default function LoginModal({ visible, onClose, onSuccess, prefillService }) {
  const navigate = useNavigate();
  const { login } = useBackendAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!visible) return null;

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password);
      if (!result.success) throw new Error(result.error || 'Login failed');

      setLoading(false);
      onSuccess && onSuccess(result.user);

      // If a service was preselected, go to booking page
      if (prefillService) {
        navigate('/book', { state: { selectedService: prefillService } });
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Login to continue</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {error && <div className="error">{error}</div>}
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn primary" onClick={handleLogin} disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <button className="btn" onClick={() => navigate('/register')}>Register</button>
          </div>
        </div>
      </div>
    </div>
  );
}
