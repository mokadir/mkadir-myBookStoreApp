import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import orderApi from '../../api/orderApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaArrowLeft, FaTruck, FaCreditCard, FaCheckCircle, FaTimesCircle, FaBox } from 'react-icons/fa';

const OrderDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderApi.getOrderById(id);
        setOrder(data);
      } catch {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // Auth check after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;

  const getStatusColor = (status) => {
    const colors = { pending: '#f0ad4e', processing: '#5bc0de', shipped: '#5cb85c', delivered: '#4cae4c', cancelled: '#d9534f' };
    return colors[status] || '#777';
  };

  if (loading) return <LoadingSpinner text="Loading order..." />;
  if (error) return <Message variant="error">{error}</Message>;
  if (!order) return <Message variant="error">Order not found</Message>;

  return (
    <div className="order-details-page">
      <Link to="/orders" className="back-link"><FaArrowLeft /> Back to Orders</Link>

      <div className="order-details-card">
        <div className="order-header">
          <h1>Order #{order._id.slice(-8).toUpperCase()}</h1>
          <span className="order-status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <p className="order-date">Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="order-sections">
          <div className="order-section">
            <h3><FaTruck /> Shipping Address</h3>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>

          <div className="order-section">
            <h3><FaCreditCard /> Payment Info</h3>
            <p>Method: {order.paymentMethod}</p>
            <p>Status: {order.isPaid ? <span className="paid"><FaCheckCircle /> Paid</span> : <span className="unpaid"><FaTimesCircle /> Unpaid</span>}</p>
            {order.paidAt && <p>Paid on: {new Date(order.paidAt).toLocaleDateString()}</p>}
          </div>
        </div>

        <div className="order-items-section">
          <h3><FaBox /> Items ({order.orderItems?.length})</h3>
          <div className="order-items-list">
            {order.orderItems?.map((item, index) => (
              <div key={index} className="order-item">
                <img src={item.coverImage || '/placeholder.jpg'} alt={item.title}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/60x80?text=No+Cover'; }} />
                <div className="order-item-info">
                  <Link to={`/books/${item.book}`}>{item.title}</Link>
                  <p>by {item.author}</p>
                </div>
                <span className="order-item-qty">x{item.quantity}</span>
                <span className="order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="order-total-section">
          <div className="total-row"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
          <div className="total-row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice?.toFixed(2)}`}</span></div>
          <div className="total-row"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
          <hr />
          <div className="total-row total"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
        </div>

        {order.trackingNumber && (
          <div className="tracking-info">
            <p><strong>Tracking Number:</strong> {order.trackingNumber}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;