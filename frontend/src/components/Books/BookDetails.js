import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import bookApi from '../../api/bookApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, FaArrowLeft, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';

const BookDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await bookApi.getBookById(id);
        setBook(data);
      } catch {
        setError('Book not found');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<FaStar key={i} className="star filled" />);
      else if (i === fullStars && hasHalf) stars.push(<FaStarHalfAlt key={i} className="star half" />);
      else stars.push(<FaRegStar key={i} className="star empty" />);
    }
    return stars;
  };

  const handleAddToCart = async () => {
    const success = await addToCart(book._id, quantity);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 3000);
    }
  };

  if (loading) return <LoadingSpinner text="Loading book details..." />;
  if (error) return <Message variant="error">{error}</Message>;
  if (!book) return <Message variant="error">Book not found</Message>;

  return (
    <div className="book-details-page">
      <Link to="/books" className="back-link">
        <FaArrowLeft /> Back to Books
      </Link>

      <div className="book-details">
        <div className="book-details-image">
          <img
            src={book.coverImage || '/images/default-book.jpg'}
            alt={book.title}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/400x600?text=No+Cover'; }}
          />
          {book.isFeatured && <span className="featured-badge">Featured</span>}
        </div>

        <div className="book-details-info">
          <span className="book-category">{book.category}</span>
          <h1>{book.title}</h1>
          <p className="book-author">by {book.author}</p>

          <div className="book-rating-large">
            <div className="stars">{renderStars(book.ratings?.average)}</div>
            <span>{book.ratings?.average?.toFixed(1)} ({book.ratings?.count} reviews)</span>
          </div>

          <h2 className="book-price">${book.price?.toFixed(2)}</h2>

          <p className="book-description">{book.description}</p>

          <div className="book-meta">
            {book.isbn && <span><strong>ISBN:</strong> {book.isbn}</span>}
            {book.publishedYear && <span><strong>Published:</strong> {book.publishedYear}</span>}
            {book.pages && <span><strong>Pages:</strong> {book.pages}</span>}
          </div>

          <div className="stock-info">
            {book.stockQuantity > 0 ? (
              <span className="in-stock"><FaCheckCircle /> In Stock ({book.stockQuantity} available)</span>
            ) : (
              <span className="out-of-stock"><FaInfoCircle /> Out of Stock</span>
            )}
          </div>

          {isAuthenticated && book.stockQuantity > 0 && (
            <div className="add-to-cart-section">
              <div className="quantity-control">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(book.stockQuantity, quantity + 1))} disabled={quantity >= book.stockQuantity}>+</button>
              </div>
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart}>
                <FaShoppingCart /> Add to Cart
              </button>
            </div>
          )}

          {addedToCart && (
            <Message variant="success">Added to cart successfully!</Message>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;