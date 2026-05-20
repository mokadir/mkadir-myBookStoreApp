import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Message from '../common/Message';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const { register, isAuthenticated, error, setError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/');
    } catch {
      // Error is handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>Create Account</h2>
          <p className="auth-subtitle">Join BookStore today</p>

          {(error || localError) && (
            <Message variant="error" onClose={() => { setError(''); setLocalError(''); }}>
              {localError || error}
            </Message>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name"><FaUser /> Full Name</label>
              <input
                type="text" id="name" name="name"
                value={formData.name} onChange={handleChange}
                placeholder="Enter your full name" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email"><FaEnvelope /> Email</label>
              <input
                type="email" id="email" name="email"
                value={formData.email} onChange={handleChange}
                placeholder="Enter your email" required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password"><FaLock /> Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="At least 6 characters" required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword"><FaLock /> Confirm Password</label>
              <input
                type="password" id="confirmPassword" name="confirmPassword"
                value={formData.confirmPassword} onChange={handleChange}
                placeholder="Confirm your password" required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;