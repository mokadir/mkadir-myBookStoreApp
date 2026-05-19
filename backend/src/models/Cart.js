const mongoose = require('mongoose');

/**
 * Cart Item Schema (embedded sub-document)
 */
const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

/**
 * Cart Schema
 * Stores user shopping cart with items
 */
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

/**
 * Calculate total price of all items in cart
 */
cartSchema.methods.getTotalPrice = function () {
  return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Get total item count
 */
cartSchema.methods.getTotalItems = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

module.exports = mongoose.model('Cart', cartSchema);