import API from './axios';

/**
 * Cart API calls
 */
const cartApi = {
  getCart: () => API.get('/cart'),
  addToCart: (data) => API.post('/cart', data),
  updateCartItem: (itemId, data) => API.put(`/cart/${itemId}`, data),
  removeFromCart: (itemId) => API.delete(`/cart/${itemId}`),
  clearCart: () => API.delete('/cart'),
};

export default cartApi;