const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for authenticated users
 * @param {string} userId - MongoDB _id of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

module.exports = generateToken;