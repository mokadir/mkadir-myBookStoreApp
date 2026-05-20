import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/orderApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaBox, FaChevronRight } from 'react-icons/fa';

const OrderHistory = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await orderApi.getMyOrders();
        setOrders(data);
      } catch {
        setError('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Auth check after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f0ad4e',
      processing: '#5bc0de',
      shipped: '#5cb85c',
      delivered: '#4cae4c',
      cancelled: '#d9534f',
    };
    return colors[status] || '#777';
  };

  if (loading) return <LoadingSpinner text="Loading orders..." />;

  return (
    <div className="orders-page">
      <h1><FaBox /> My Orders</h1>

      {error && <Message variant="error">{error}</Message>}

      {orders.length === 0 ? (
        <div className="empty-state">
          <FaBox size={60} />
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here!</p>
          <Link to="/books" className="btn btn-primary">Browse Books</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order._id}`} key={order._id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order._id.slice(-8).toUpperCase()}</span>
                <span className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                  {order.status}
                </span>
              </div>
              <div className="order-card-body">
                <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                <p className="order-items-count">{order.orderItems?.length} item(s)</p>
              </div>
              <div className="order-card-footer">
                <span className="order-total">${order.totalPrice?.toFixed(2)}</span>
                <span className="order-payment">{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                <FaChevronRight className="order-arrow" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;