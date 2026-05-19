const Cart = require('../models/Cart');
const Book = require('../models/Book');

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      // Create empty cart if none exists
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    res.json(cart);
  } catch (error) {
    console.error('Get cart error:', error.message);
    res.status(500).json({ message: 'Server error fetching cart' });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    // Validate book exists and has stock
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    if (book.stockQuantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Find or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if book already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > book.stockQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }
      cart.items[existingItemIndex].quantity = newQty;
    } else {
      // Add new item to cart
      cart.items.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        quantity,
      });
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Add to cart error:', error.message);
    res.status(500).json({ message: 'Server error adding to cart' });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/:itemId
 * @access  Private
 */
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // Find the item
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    // Validate stock
    const book = await Book.findById(item.book);
    if (book && quantity > book.stockQuantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      cart.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error('Update cart error:', error.message);
    res.status(500).json({ message: 'Server error updating cart' });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:itemId
 * @access  Private
 */
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    res.json(cart);
  } catch (error) {
    console.error('Remove from cart error:', error.message);
    res.status(500).json({ message: 'Server error removing from cart' });
  }
};

/**
 * @desc    Clear entire cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error('Clear cart error:', error.message);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };