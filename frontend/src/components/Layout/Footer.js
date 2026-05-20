import React from 'react';
import { Link } from 'react-router-dom';
import { FaBook, FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-brand">
            <FaBook className="brand-icon" />
            <span className="brand-text">BookStore</span>
          </div>
          <p className="footer-description">
            Your premier online destination for discovering and purchasing books
            across all genres. Quality reads delivered to your doorstep.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/books" className="footer-link">Browse Books</Link>
          <Link to="/cart" className="footer-link">Shopping Cart</Link>
          <Link to="/orders" className="footer-link">My Orders</Link>
        </div>

        <div className="footer-section">
          <h3>Categories</h3>
          <Link to="/books?category=fiction" className="footer-link">Fiction</Link>
          <Link to="/books?category=technology" className="footer-link">Technology</Link>
          <Link to="/books?category=science" className="footer-link">Science</Link>
          <Link to="/books?category=history" className="footer-link">History</Link>
        </div>

        <div className="footer-section">
          <h3>Contact</h3>
          <a href="mailto:support@bookstore.com" className="footer-link">
            <FaEnvelope /> support@bookstore.com
          </a>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaGithub />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <FaTwitter />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} BookStore. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;