const Book = require('../models/Book');
const User = require('../models/User');
const Order = require('../models/Order');

/**
 * ========================
 *  BOOK MANAGEMENT
 * ========================
 */

/**
 * @desc    Create a new book (admin)
 * @route   POST /api/admin/books
 * @access  Private/Admin
 */
const createBook = async (req, res) => {
  try {
    const book = await Book.create({ ...req.body });
    res.status(201).json(book);
  } catch (error) {
    console.error('Create book error:', error.message);
    res.status(500).json({ message: 'Server error creating book' });
  }
};

/**
 * @desc    Update a book (admin)
 * @route   PUT /api/admin/books/:id
 * @access  Private/Admin
 */
const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    console.error('Update book error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error updating book' });
  }
};

/**
 * @desc    Delete a book (admin) - soft delete by setting isActive to false
 * @route   DELETE /api/admin/books/:id
 * @access  Private/Admin
 */
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ message: 'Server error deleting book' });
  }
};

/**
 * @desc    Get all books including inactive (admin)
 * @route   GET /api/admin/books
 * @access  Private/Admin
 */
const getAllBooksAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Book.countDocuments({});

    res.json({
      books,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error('Admin get books error:', error.message);
    res.status(500).json({ message: 'Server error fetching books' });
  }
};

/**
 * ========================
 *  USER MANAGEMENT
 * ========================
 */

/**
 * @desc    Get all users (admin)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error.message);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

/**
 * @desc    Get user by ID (admin)
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

/**
 * @desc    Update user (admin) - can change role, etc.
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.role = req.body.role || user.role;
    user.isActive = req.body.isActive !== undefined ? req.body.isActive : user.isActive;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error.message);
    res.status(500).json({ message: 'Server error updating user' });
  }
};

/**
 * @desc    Delete user (admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

/**
 * ========================
 *  ORDER MANAGEMENT
 * ========================
 */

/**
 * @desc    Get all orders (admin)
 * @route   GET /api/admin/orders
 * @access  Private/Admin
 */
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const filter = {};
    if (status) filter.status = status;

    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total,
    });
  } catch (error) {
    console.error('Get all orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

/**
 * @desc    Update order status (admin)
 * @route   PUT /api/admin/orders/:id/status
 * @access  Private/Admin
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status || order.status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Set timestamps based on status
    if (status === 'delivered') {
      order.deliveredAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

/**
 * ========================
 *  SALES STATISTICS
 * ========================
 */

/**
 * @desc    Get sales statistics (admin)
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
const getSalesStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query; // 'day', 'week', 'month', 'year', 'all'

    // Calculate date range
    let startDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0); // Beginning of time
    }

    // Order statistics
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
    });

    const paidOrders = await Order.countDocuments({
      createdAt: { $gte: startDate },
      isPaid: true,
    });

    const revenueResult = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, isPaid: true } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Books statistics
    const totalBooks = await Book.countDocuments({ isActive: true });

    // Users statistics
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const newUsers = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: startDate },
    });

    // Category breakdown for revenue
    const categoryRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, isPaid: true } },
      { $unwind: '$orderItems' },
      {
        $lookup: {
          from: 'books',
          localField: 'orderItems.book',
          foreignField: '_id',
          as: 'bookDetails',
        },
      },
      { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$bookDetails.category',
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
          count: { $sum: '$orderItems.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    // Monthly revenue for chart
    const monthlyRevenue = await Order.aggregate([
      { $match: { isPaid: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 },
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalOrders,
      paidOrders,
      totalRevenue,
      totalBooks,
      totalUsers,
      newUsers,
      categoryRevenue,
      monthlyRevenue,
      recentOrders,
      period,
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};

module.exports = {
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
};