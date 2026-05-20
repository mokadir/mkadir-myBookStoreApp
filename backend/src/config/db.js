const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Reads connection URI from environment variables
 * Constructs the URI with credentials when provided
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;

    // If MONGODB_URI does not contain credentials and they are provided separately
    let connectionUri = uri;
    if (username && password && !uri.includes('@')) {
      // Insert credentials into the URI: mongodb://user:pass@host:port/db
      connectionUri = uri.replace('mongodb://', `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}@`);
    }

    const conn = await mongoose.connect(connectionUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;