import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import orderApi from '../../api/orderApi';
import Message from '../common/Message';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaCreditCard, FaTruck, FaCheck } from 'react-icons/fa';

// Simplified checkout without Stripe requiring real keys
const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orderId, setOrderId] = useState('');

  const [shippingAddress, setShippingAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'USA',
  });

  const [paymentMethod, setPaymentMethod] = useState('stripe');

  if (!isAuthenticated) return <Navigate to="/login" />;

  const shippingCost = totalPrice >= 50 ? 0 : 5.99;
  const tax = totalPrice * 0.1;
  const orderTotal = totalPrice + shippingCost + tax;

  const handleAddressChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await orderApi.createOrder({
        shippingAddress,
        paymentMethod,
      });
      setOrderId(data._id);
      setSuccess('Order placed successfully!');
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !success) {
    return <Navigate to="/cart" />;
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      {/* Progress steps */}
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">{step > 1 ? <FaCheck /> : 1}</div>
          <span>Shipping</span>
        </div>
        <div className="step-divider" />
        <div className={`step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">{step > 2 ? <FaCheck /> : 2}</div>
          <span>Payment</span>
        </div>
        <div className="step-divider" />
        <div className={`step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number"><FaCheck /></div>
          <span>Confirmation</span>
        </div>
      </div>

      {error && <Message variant="error">{error}</Message>}
      {success && <Message variant="success">{success}</Message>}

      {/* Step 1: Shipping Address */}
      {step === 1 && (
        <div className="checkout-section">
          <h2><FaTruck /> Shipping Address</h2>
          <div className="address-form">
            <div className="form-group">
              <label>Street Address</label>
              <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={shippingAddress.city} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={shippingAddress.state} onChange={handleAddressChange} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ZIP Code</label>
                <input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input type="text" name="country" value={shippingAddress.country} onChange={handleAddressChange} required />
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setStep(2)}>
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="checkout-section">
          <h2><FaCreditCard /> Payment Method</h2>
          <div className="payment-options">
            <label className="payment-option">
              <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
              <FaCreditCard /> Credit/Debit Card (Stripe)
            </label>
            <label className="payment-option">
              <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              Cash on Delivery
            </label>
          </div>

          <div className="order-summary-preview">
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item._id} className="summary-item">
                <span>{item.title} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <hr />
            <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span></div>
            <div className="summary-row"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="summary-row total"><span>Total</span><span>${orderTotal.toFixed(2)}</span></div>
          </div>

          <div className="checkout-actions">
            <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
            <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
              {loading ? 'Processing...' : `Place Order - $${orderTotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="checkout-section confirmation">
          <FaCheck className="confirmation-icon" />
          <h2>Order Confirmed!</h2>
          <p>Your order has been placed successfully.</p>
          {orderId && <p>Order ID: <strong>{orderId}</strong></p>}
          <p>A confirmation email will be sent to {user?.email}</p>
          <div className="checkout-actions">
            <Link to={`/orders/${orderId}`} className="btn btn-primary">View Order</Link>
            <Link to="/books" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;