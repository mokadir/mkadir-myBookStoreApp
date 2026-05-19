const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @desc    Create a new order from cart
 * @route   POST /api/orders
 * @access  Private
 */
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'stripe' } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock for all items and calculate prices
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const book = await Book.findById(item.book);
      if (!book) {
        return res.status(404).json({ message: `Book ${item.title} not found` });
      }
      if (book.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${book.title}". Available: ${book.stockQuantity}`,
        });
      }

      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        quantity: item.quantity,
      });

      itemsPrice += book.price * item.quantity;
    }

    // Calculate shipping (free over $50, otherwise $5.99)
    const shippingPrice = itemsPrice >= 50 ? 0 : 5.99;
    // Calculate tax (10%)
    const taxPrice = parseFloat((itemsPrice * 0.1).toFixed(2));
    const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: parseFloat(itemsPrice.toFixed(2)),
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'pending',
      isPaid: paymentMethod === 'cod' ? false : false,
    });

    // Clear the cart
    cart.items = [];
    await cart.save();

    // Reduce stock quantities
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user can only view their own orders (unless admin)
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

/**
 * @desc    Process Stripe payment for an order
 * @route   POST /api/orders/:id/pay
 * @access  Private
 */
const stripePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user owns this order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      amount: order.totalPrice,
    });
  } catch (error) {
    console.error('Stripe payment error:', error.message);
    res.status(500).json({ message: 'Server error processing payment' });
  }
};

/**
 * @desc    Update order to paid (after Stripe webhook confirmation)
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
const updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status || 'completed',
      update_time: req.body.update_time,
      email_address: req.body.email_address,
    };

    // If payment confirmed and it was Stripe, update status
    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Update payment error:', error.message);
    res.status(500).json({ message: 'Server error updating payment' });
  }
};

/**
 * @desc    Stripe webhook handler
 * @route   POST /api/orders/webhook
 * @access  Public (secured by Stripe signature)
 */
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.orderId;

      // Update order to paid
      await Order.findByIdAndUpdate(orderId, {
        isPaid: true,
        paidAt: Date.now(),
        status: 'processing',
        paymentResult: {
          id: paymentIntent.id,
          status: 'completed',
          email_address: paymentIntent.receipt_email,
        },
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).json({ message: `Webhook Error: ${error.message}` });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  stripePayment,
  updateOrderToPaid,
  stripeWebhook,
};