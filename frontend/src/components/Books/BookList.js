import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import bookApi from '../../api/bookApi';
import BookCard from './BookCard';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaFilter, FaSearch, FaTimes } from 'react-icons/fa';

const BookList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalBooks: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
  });

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await bookApi.getCategories();
        setCategories(data);
      } catch {
        // Silently fail
      }
    };
    fetchCategories();
  }, []);

  // Fetch books based on filters
  const fetchBooks = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'all') params.category = filters.category;
      if (filters.sort) params.sort = filters.sort;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;

      const { data } = await bookApi.getBooks(params);
      setBooks(data.books);
      setPagination({ page: data.page, totalPages: data.totalPages, totalBooks: data.totalBooks });
    } catch {
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.sort, filters.search, filters.minPrice, filters.maxPrice, filters.minRating]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(1);
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({ search: '', category: 'all', sort: 'newest', minPrice: '', maxPrice: '', minRating: '' });
    fetchBooks(1);
  };

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.minPrice || filters.maxPrice || filters.minRating;

  return (
    <div className="books-page">
      {/* Search bar */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              name="search"
              placeholder="Search by title, author, or description..."
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search</button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FaFilter /> Filters
          </button>
        </form>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select name="sort" value={filters.sort} onChange={handleFilterChange}>
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Min Price</label>
            <input
              type="number" name="minPrice" placeholder="$0"
              value={filters.minPrice} onChange={handleFilterChange}
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Max Price</label>
            <input
              type="number" name="maxPrice" placeholder="$999"
              value={filters.maxPrice} onChange={handleFilterChange}
              min="0"
            />
          </div>

          <div className="filter-group">
            <label>Min Rating</label>
            <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </div>

          <div className="filter-actions">
            <button className="btn btn-primary btn-sm" onClick={() => fetchBooks(1)}>Apply Filters</button>
            {hasActiveFilters && (
              <button className="btn btn-outline btn-sm" onClick={clearFilters}>
                <FaTimes /> Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results info */}
      <div className="results-info">
        <p>{pagination.totalBooks} books found</p>
      </div>

      {/* Error message */}
      {error && <Message variant="error">{error}</Message>}

      {/* Books grid */}
      {loading ? (
        <LoadingSpinner text="Loading books..." />
      ) : books.length === 0 ? (
        <div className="empty-state">
          <h3>No books found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => fetchBooks(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchBooks(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BookList;