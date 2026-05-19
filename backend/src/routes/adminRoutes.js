const express = require('express');
const router = express.Router();
const {
  // Book management
  createBook,
  updateBook,
  deleteBook,
  getAllBooksAdmin,
  // User management
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  // Order management
  getAllOrders,
  updateOrderStatus,
  // Sales stats
  getSalesStats,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// All admin routes require authentication + admin role
router.use(protect, adminOnly);

// Book management
router.get('/books', getAllBooksAdmin);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Order management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Sales statistics
router.get('/stats', getSalesStats);

module.exports = router;