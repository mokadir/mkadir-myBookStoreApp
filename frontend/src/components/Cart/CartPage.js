import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import BookImage from '../common/BookImage';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaMinus, FaPlus } from 'react-icons/fa';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const { items, loading, error, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) return <LoadingSpinner text="Loading cart..." />;

  const shippingCost = totalPrice >= 50 ? 0 : 5.99;
  const tax = totalPrice * 0.1;
  const orderTotal = totalPrice + shippingCost + tax;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1><FaShoppingBag /> Shopping Cart</h1>
        {items.length > 0 && (
          <button className="btn btn-outline btn-sm" onClick={clearCart}>
            <FaTrash /> Clear Cart
          </button>
        )}
      </div>

      {error && <Message variant="error">{error}</Message>}

      {items.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingBag size={80} />
          <h2>Your cart is empty</h2>
          <p>Browse our collection and add some books!</p>
          <Link to="/books" className="btn btn-primary">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="cart-item-image">
                  <BookImage
                    src={item.coverImage}
                    alt={item.title}
                  />
                </div>

                <div className="cart-item-info">
                  <Link to={`/books/${item.book}`} className="cart-item-title">{item.title}</Link>
                  <p className="cart-item-author">by {item.author}</p>
                  <p className="cart-item-price">${item.price?.toFixed(2)}</p>
                </div>

                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item._id, Math.max(0, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                  >
                    <FaMinus />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>

                <div className="cart-item-total">
                  <p>${(item.price * item.quantity).toFixed(2)}</p>
                </div>

                <button
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item._id)}
                  title="Remove item"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Items ({items.reduce((sum, i) => sum + i.quantity, 0)})</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
            {shippingCost > 0 && (
              <p className="free-shipping-note">Free shipping on orders over $50!</p>
            )}
            <div className="summary-row">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr />
            <div className="summary-row total">
              <span>Total</span>
              <span>${orderTotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-full">
              Proceed to Checkout
            </Link>
            <Link to="/books" className="btn btn-outline btn-full">
              <FaArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;