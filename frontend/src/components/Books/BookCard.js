import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import BookImage from '../common/BookImage';

const BookCard = ({ book }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  /**
   * Render star rating
   */
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAuthenticated) {
      addToCart(book._id);
    }
  };

  return (
    <Link to={`/books/${book._id}`} className="book-card">
      <div className="book-card-image">
        <BookImage
          src={book.coverImage}
          alt={book.title}
        />
        {book.stockQuantity <= 5 && book.stockQuantity > 0 && (
          <span className="stock-badge low-stock">Only {book.stockQuantity} left</span>
        )}
        {book.stockQuantity === 0 && (
          <span className="stock-badge out-of-stock">Out of Stock</span>
        )}
      </div>

      <div className="book-card-body">
        <span className="book-category">{book.category}</span>
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">by {book.author}</p>

        <div className="book-rating">
          <div className="stars">{renderStars(book.ratings?.average)}</div>
          <span className="rating-count">({book.ratings?.count})</span>
        </div>

        <div className="book-card-footer">
          <span className="book-price">${book.price?.toFixed(2)}</span>
          {isAuthenticated && book.stockQuantity > 0 && (
            <button className="btn btn-primary btn-sm" onClick={handleAddToCart}>
              <FaShoppingCart /> Add
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default BookCard;