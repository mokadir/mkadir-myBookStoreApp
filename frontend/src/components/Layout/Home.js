import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookApi from '../../api/bookApi';
import BookCard from '../Books/BookCard';
import LoadingSpinner from '../common/LoadingSpinner';
import { FaBook, FaTruck, FaShieldAlt, FaHeadset, FaArrowRight } from 'react-icons/fa';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await bookApi.getBooks({ featured: 'true', limit: 6 });
        setFeaturedBooks(data.books);
      } catch {
        // Fallback: get any books
        try {
          const { data } = await bookApi.getBooks({ limit: 6, sort: 'rating' });
          setFeaturedBooks(data.books);
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Discover Your Next<br />Great Read</h1>
          <p>Browse thousands of books across every genre. From bestsellers to hidden gems, find your perfect book today.</p>
          <div className="hero-actions">
            <Link to="/books" className="btn btn-primary btn-lg">
              Browse Books <FaArrowRight />
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg">
              Join Free
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-book-stack">
            <div className="hero-book hb-1"></div>
            <div className="hero-book hb-2"></div>
            <div className="hero-book hb-3"></div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="feature-card">
          <FaTruck className="feature-icon" />
          <h3>Free Shipping</h3>
          <p>Free shipping on orders over $50</p>
        </div>
        <div className="feature-card">
          <FaShieldAlt className="feature-icon" />
          <h3>Secure Payments</h3>
          <p>Protected by Stripe encrypted checkout</p>
        </div>
        <div className="feature-card">
          <FaHeadset className="feature-icon" />
          <h3>24/7 Support</h3>
          <p>Dedicated support team ready to help</p>
        </div>
        <div className="feature-card">
          <FaBook className="feature-icon" />
          <h3>Best Selection</h3>
          <p>Curated collection of top-rated books</p>
        </div>
      </section>

      {/* Featured Books */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Books</h2>
          <Link to="/books" className="btn btn-outline">
            View All <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading featured books..." />
        ) : (
          <div className="books-grid">
            {featuredBooks.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Reading?</h2>
          <p>Join thousands of happy readers. Create your account and start building your personal library today.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;