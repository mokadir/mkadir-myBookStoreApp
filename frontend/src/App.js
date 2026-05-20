import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './components/Layout/Home';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Auth/Profile';
import BookList from './components/Books/BookList';
import BookDetails from './components/Books/BookDetails';
import CartPage from './components/Cart/CartPage';
import Checkout from './components/Orders/Checkout';
import OrderHistory from './components/Orders/OrderHistory';
import OrderDetails from './components/Orders/OrderDetails';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminBookManagement from './components/Admin/AdminBookManagement';
import AdminUserManagement from './components/Admin/AdminUserManagement';
import AdminOrderManagement from './components/Admin/AdminOrderManagement';
import './styles/main.css';

/**
 * Main Application Component
 * Sets up routing and context providers
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Navbar />
              <main className="main-content">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<BookList />} />
                  <Route path="/books/:id" element={<BookDetails />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected User Routes */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<OrderHistory />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />

                  {/* Admin Routes */}
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/books" element={<AdminBookManagement />} />
                  <Route path="/admin/users" element={<AdminUserManagement />} />
                  <Route path="/admin/orders" element={<AdminOrderManagement />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;