import API from './axios';

/**
 * Orders API calls
 */
const orderApi = {
  createOrder: (orderData) => API.post('/orders', orderData),
  getMyOrders: () => API.get('/orders/myorders'),
  getOrderById: (id) => API.get(`/orders/${id}`),
  createPaymentIntent: (id) => API.post(`/orders/${id}/pay`),
  updateOrderToPaid: (id, paymentResult) => API.put(`/orders/${id}/pay`, paymentResult),
};

export default orderApi;