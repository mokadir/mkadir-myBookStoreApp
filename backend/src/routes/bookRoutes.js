const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  getCategories,
  createBookReview,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);

// Protected routes (authenticated users can review)
router.post('/:id/reviews', protect, createBookReview);

module.exports = router;