import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaShoppingCart, FaCheck, FaTruck, FaBox, FaTimes } from 'react-icons/fa';

const AdminOrderManagement = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = async (status = '') => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      const { data } = await adminApi.getAllOrders(params);
      setOrders(data.orders);
    } catch { setError('Failed to fetch orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(statusFilter); }, [statusFilter]);

  // Auth check after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const handleStatusUpdate = async (orderId, newStatus, trackingNumber = '') => {
    try {
      await adminApi.updateOrderStatus(orderId, { status: newStatus, trackingNumber });
      setSuccess(`Order status updated to ${newStatus}`);
      fetchOrders(statusFilter);
    } catch { setError('Failed to update order'); }
  };

  const getStatusColor = (status) => {
    const colors = { pending: '#f0ad4e', processing: '#5bc0de', shipped: '#5cb85c', delivered: '#4cae4c', cancelled: '#d9534f' };
    return colors[status] || '#777';
  };

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FaShoppingCart /> Order Management</h1>
        <div className="status-filters">
          <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter('')}>All</button>
          {statuses.map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error && <Message variant="error" onClose={() => setError('')}>{error}</Message>}
      {success && <Message variant="success" onClose={() => setSuccess('')}>{success}</Message>}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th>
              <th>Status</th><th>Payment</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="order-id-cell">#{order._id.slice(-8).toUpperCase()}</td>
                <td>{order.user?.name}<br /><small>{order.user?.email}</small></td>
                <td>{order.orderItems?.length}</td>
                <td>${order.totalPrice?.toFixed(2)}</td>
                <td>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </td>
                <td>{order.isPaid ? <FaCheck className="paid-icon" /> : <FaTimes className="unpaid-icon" />}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrderManagement;