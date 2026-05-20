import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaBook, FaUsers, FaShoppingCart, FaDollarSign, FaArrowUp, FaArrowDown, FaBox, FaUserPlus } from 'react-icons/fa';

const AdminDashboard = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminApi.getStats('month');
        setStats(data);
      } catch {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Auth check after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;
  if (error) return <Message variant="error">{error}</Message>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav-links">
          <Link to="/admin/books" className="btn btn-outline btn-sm"><FaBook /> Books</Link>
          <Link to="/admin/users" className="btn btn-outline btn-sm"><FaUsers /> Users</Link>
          <Link to="/admin/orders" className="btn btn-outline btn-sm"><FaShoppingCart /> Orders</Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue"><FaDollarSign /></div>
          <div className="stat-info">
            <h3>${stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <p>Total Revenue (30d)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orders"><FaShoppingCart /></div>
          <div className="stat-info">
            <h3>{stats?.totalOrders || 0}</h3>
            <p>Orders (30d)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon books"><FaBook /></div>
          <div className="stat-info">
            <h3>{stats?.totalBooks || 0}</h3>
            <p>Active Books</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon users"><FaUsers /></div>
          <div className="stat-info">
            <h3>{stats?.totalUsers || 0}</h3>
            <p>Total Customers</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Recent Orders */}
        <div className="dashboard-section">
          <h3>Recent Orders</h3>
          <div className="recent-orders">
            {stats?.recentOrders?.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="recent-order-item">
                  <div className="recent-order-info">
                    <span className="order-user">{order.user?.name}</span>
                    <span className="order-total">${order.totalPrice?.toFixed(2)}</span>
                  </div>
                  <span className={`order-status-dot ${order.status}`}></span>
                </div>
              ))
            ) : (
              <p className="no-data">No recent orders</p>
            )}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="dashboard-section">
          <h3>Revenue by Category</h3>
          <div className="category-stats">
            {stats?.categoryRevenue?.length > 0 ? (
              stats.categoryRevenue.map((cat) => (
                <div key={cat._id} className="category-stat-item">
                  <span className="cat-name">{cat._id || 'Unknown'}</span>
                  <span className="cat-revenue">${cat.revenue?.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No category data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <Link to="/admin/books/new" className="action-card">
            <FaBook /> Add New Book
          </Link>
          <Link to="/admin/orders" className="action-card">
            <FaBox /> View All Orders
          </Link>
          <Link to="/admin/users" className="action-card">
            <FaUserPlus /> Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;