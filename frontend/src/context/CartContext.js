import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import cartApi from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext();

/**
 * CartProvider - manages shopping cart state
 * Syncs with backend when user is authenticated
 */
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const { data } = await cartApi.getCart();
      setCart(data);
    } catch (err) {
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = useCallback(async (bookId, quantity = 1) => {
    setError('');
    try {
      const { data } = await cartApi.addToCart({ bookId, quantity });
      setCart(data);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Update cart item quantity
   */
  const updateQuantity = useCallback(async (itemId, quantity) => {
    setError('');
    try {
      const { data } = await cartApi.updateCartItem(itemId, { quantity });
      setCart(data);
      return true;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      setError(message);
      return false;
    }
  }, []);

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(async (itemId) => {
    setError('');
    try {
      const { data } = await cartApi.removeFromCart(itemId);
      setCart(data);
      return true;
    } catch (err) {
      setError('Failed to remove item');
      return false;
    }
  }, []);

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    try {
      await cartApi.clearCart();
      setCart({ items: [] });
    } catch (err) {
      setError('Failed to clear cart');
    }
  }, []);

  // Calculate derived values
  const totalItems = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  const value = {
    cart,
    items: cart.items || [],
    loading,
    error,
    totalItems,
    totalPrice,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;