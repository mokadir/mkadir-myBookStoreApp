import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import adminApi from '../../api/adminApi';
import LoadingSpinner from '../common/LoadingSpinner';
import Message from '../common/Message';
import { FaPlus, FaEdit, FaTrash, FaBook } from 'react-icons/fa';

const AdminBookManagement = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '', author: '', category: '', description: '', price: '',
    stockQuantity: '', coverImage: '', isbn: '', publishedYear: '', pages: '',
  });

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getAllBooks({ limit: 100 });
      setBooks(data.books);
    } catch { setError('Failed to fetch books'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBooks(); }, []);
  
  // Auth check must come after all hooks
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title, author: book.author, category: book.category,
      description: book.description, price: book.price, stockQuantity: book.stockQuantity,
      coverImage: book.coverImage || '', isbn: book.isbn || '', publishedYear: book.publishedYear || '',
      pages: book.pages || '',
    });
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', category: '', description: '', price: '',
      stockQuantity: '', coverImage: '', isbn: '', publishedYear: '', pages: '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingBook) {
        await adminApi.updateBook(editingBook._id, formData);
        setSuccess('Book updated successfully!');
      } else {
        await adminApi.createBook(formData);
        setSuccess('Book created successfully!');
      }
      setShowForm(false);
      fetchBooks();
    } catch (err) { setError(err.response?.data?.message || 'Operation failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await adminApi.deleteBook(id);
      setSuccess('Book deleted');
      fetchBooks();
    } catch { setError('Failed to delete book'); }
  };

  if (loading) return <LoadingSpinner text="Loading books..." />;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FaBook /> Book Management</h1>
        <button className="btn btn-primary" onClick={handleNew}><FaPlus /> Add Book</button>
      </div>

      {error && <Message variant="error" onClose={() => setError('')}>{error}</Message>}
      {success && <Message variant="success" onClose={() => setSuccess('')}>{success}</Message>}

      {showForm && (
        <div className="admin-form-overlay">
          <div className="admin-form">
            <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group"><label>Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} required /></div>
                <div className="form-group"><label>Author</label><input type="text" name="author" value={formData.author} onChange={handleChange} required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Category</label><input type="text" name="category" value={formData.category} onChange={handleChange} required /></div>
                <div className="form-group"><label>Price</label><input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required /></div>
                <div className="form-group"><label>Stock</label><input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required /></div>
              </div>
              <div className="form-group"><label>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows="3" required /></div>
              <div className="form-row">
                <div className="form-group"><label>Cover Image URL</label><input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} /></div>
                <div className="form-group"><label>ISBN</label><input type="text" name="isbn" value={formData.isbn} onChange={handleChange} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Published Year</label><input type="number" name="publishedYear" value={formData.publishedYear} onChange={handleChange} /></div>
                <div className="form-group"><label>Pages</label><input type="number" name="pages" value={formData.pages} onChange={handleChange} /></div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">{editingBook ? 'Update' : 'Create'} Book</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Cover</th><th>Title</th><th>Author</th><th>Category</th>
              <th>Price</th><th>Stock</th><th>Rating</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book._id}>
                <td><img src={book.coverImage || '/placeholder.jpg'} alt="" className="table-thumb"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40x60?text=No'; }} /></td>
                <td>{book.title}</td><td>{book.author}</td><td>{book.category}</td>
                <td>${book.price?.toFixed(2)}</td>
                <td><span className={`stock-count ${book.stockQuantity <= 5 ? 'low' : ''}`}>{book.stockQuantity}</span></td>
                <td>{book.ratings?.average?.toFixed(1)}</td>
                <td className="actions-cell">
                  <button className="btn-icon edit" onClick={() => handleEdit(book)} title="Edit"><FaEdit /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(book._id)} title="Delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBookManagement;