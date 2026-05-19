const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ========================
// MIDDLEWARE CONFIGURATION
// ========================

// CORS - allow frontend to access API
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// IMPORTANT: Stripe webhook MUST come BEFORE express.json()
// because it needs the raw body to verify the signature
// The webhook is handled in the order routes
// We mount it first to ensure raw body is available

// Parse JSON bodies (for API routes)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

// ========================
// ROUTES
// ========================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Book Store API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Stripe webhook route (needs raw body, handled inside orderRoutes)
// We'll set this up separately

// ========================
// ERROR HANDLING
// ========================

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.statusCode || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ========================
// START SERVER
// ========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});

module.exports = app;