import API from './axios';

/**
 * Admin API calls
 */
const adminApi = {
  // Book management
  getAllBooks: (params) => API.get('/admin/books', { params }),
  createBook: (bookData) => API.post('/admin/books', bookData),
  updateBook: (id, bookData) => API.put(`/admin/books/${id}`, bookData),
  deleteBook: (id) => API.delete(`/admin/books/${id}`),

  // User management
  getAllUsers: () => API.get('/admin/users'),
  getUserById: (id) => API.get(`/admin/users/${id}`),
  updateUser: (id, userData) => API.put(`/admin/users/${id}`, userData),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),

  // Order management
  getAllOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),

  // Statistics
  getStats: (period) => API.get('/admin/stats', { params: { period } }),
};

export default adminApi;