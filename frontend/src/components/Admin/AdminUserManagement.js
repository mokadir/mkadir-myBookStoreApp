import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaUsers, FaTrash, FaCrown, FaUser } from 'react-icons/fa';

const AdminUserManagement = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await adminApi.getAllUsers();
        setUsers(data);
      } catch { setError('Failed to fetch users'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  // Auth check after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    try {
      await adminApi.updateUser(user._id, { role: newRole });
      setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
      setSuccess(`User role changed to ${newRole}`);
    } catch { setError('Failed to update user'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(users.filter(u => u._id !== id));
      setSuccess('User deleted');
    } catch { setError('Failed to delete user'); }
  };

  if (loading) return <LoadingSpinner text="Loading users..." />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FaUsers /> User Management</h1>
        <span className="user-count">{users.length} total users</span>
      </div>

      {error && <Message variant="error" onClose={() => setError('')}>{error}</Message>}
      {success && <Message variant="success" onClose={() => setSuccess('')}>{success}</Message>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="user-cell">
                  <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                  {user.name}
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? <FaCrown /> : <FaUser />}
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button className="btn-icon role-toggle" onClick={() => handleToggleRole(user)} title="Toggle role">
                    <FaCrown />
                  </button>
                  <button className="btn-icon delete" onClick={() => handleDelete(user._id)} title="Delete user">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserManagement;