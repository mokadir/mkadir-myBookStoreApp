import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Message from '../common/Message';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaUser, FaEnvelope, FaPhone, FaSave } from 'react-icons/fa';

const Profile = () => {
  const { user, isAuthenticated, updateProfile, loading: authLoading, error, setError } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
    }
  }, [user]);

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (authLoading) return <LoadingSpinner />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <h1>My Profile</h1>
          <span className="profile-role">{user?.role}</span>
        </div>

        {error && <Message variant="error" onClose={() => setError('')}>{error}</Message>}
        {success && <Message variant="success" onClose={() => setSuccess('')}>{success}</Message>}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label><FaUser /> Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label><FaEnvelope /> Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label><FaPhone /> Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1-555-0000" />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;