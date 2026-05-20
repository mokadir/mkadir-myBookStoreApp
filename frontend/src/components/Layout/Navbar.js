import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaBook, FaSun, FaMoon, FaBars, FaTimes, FaCog } from 'react-icons/fa';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <FaBook className="brand-icon" />
          <span className="brand-text">BookStore</span>
        </Link>

        {/* Mobile menu toggle */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation links */}
        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/books" className="nav-link" onClick={() => setMenuOpen(false)}>
            Browse Books
          </Link>

          <div className="nav-actions">
            {/* Theme toggle */}
            <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle theme">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Cart link */}
            {isAuthenticated && (
              <Link to="/cart" className="cart-link" onClick={() => setMenuOpen(false)}>
                <FaShoppingCart />
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="user-dropdown">
                <button
                  className="icon-btn user-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <FaUser />
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    >
                      <FaUser /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                    >
                      My Orders
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="dropdown-item"
                        onClick={() => { setDropdownOpen(false); setMenuOpen(false); }}
                      >
                        <FaCog /> Admin Panel
                      </Link>
                    )}
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;