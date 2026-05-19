const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  stripePayment,
  updateOrderToPaid,
  stripeWebhook,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// Protected routes
router.use(protect);

router.route('/')
  .post(createOrder);

router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/pay', stripePayment);
router.put('/:id/pay', updateOrderToPaid);

module.exports = router;