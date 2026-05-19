const Book = require('../models/Book');

/**
 * @desc    Get all books with filtering, searching, and pagination
 * @route   GET /api/books
 * @access  Public
 */
const getBooks = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      minRating,
      sort,
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    // Build filter query
    const filter = { isActive: true };

    // Text search across title, author, description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Minimum rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: Number(minRating) };
    }

    // Featured books filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    // Sort options
    let sortOption = { createdAt: -1 }; // Default: newest first
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'ratings.average': -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      default:
        break;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with pagination
    const books = await Book.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const totalBooks = await Book.countDocuments(filter);
    const totalPages = Math.ceil(totalBooks / limitNum);

    res.json({
      books,
      page: pageNum,
      totalPages,
      totalBooks,
      hasMore: pageNum < totalPages,
    });
  } catch (error) {
    console.error('Get books error:', error.message);
    res.status(500).json({ message: 'Server error fetching books' });
  }
};

/**
 * @desc    Get single book by ID
 * @route   GET /api/books/:id
 * @access  Public
 */
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    console.error('Get book error:', error.message);
    // Handle invalid ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error fetching book' });
  }
};

/**
 * @desc    Get all unique categories
 * @route   GET /api/books/categories
 * @access  Public
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    res.json(categories.sort());
  } catch (error) {
    console.error('Get categories error:', error.message);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

/**
 * @desc    Create a book review / rating
 * @route   POST /api/books/:id/reviews
 * @access  Private
 */
const createBookReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = book.reviews?.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Book already reviewed' });
    }

    // Add review (if reviews array exists on the schema, otherwise we update ratings directly)
    // For simplicity with our schema, we'll update the ratings average directly
    const newCount = book.ratings.count + 1;
    const newAverage =
      (book.ratings.average * book.ratings.count + Number(rating)) / newCount;

    book.ratings.average = Math.round(newAverage * 10) / 10; // Round to 1 decimal
    book.ratings.count = newCount;

    await book.save();

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Review error:', error.message);
    res.status(500).json({ message: 'Server error adding review' });
  }
};

module.exports = { getBooks, getBookById, getCategories, createBookReview };