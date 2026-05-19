# 📚 Online Book Store

A full-stack online bookstore web application built with React, Node.js/Express, and MongoDB.

## Features

### 👥 User Features
- User registration and login with JWT authentication
- Browse, search, and filter books by category, price, and rating
- View book details with ratings and stock status
- Add/remove items from shopping cart
- Update cart quantities
- Checkout and place orders (Cash on Delivery or Stripe)
- View order history and order details
- Update personal profile

### 🔐 Admin Features
- Admin dashboard with sales statistics
- Add, edit, and delete books
- Manage inventory (stock quantities)
- Manage users (change roles, delete)
- View all orders and update order statuses
- View revenue by category

### 🎨 UI/UX
- Modern responsive design (mobile, tablet, desktop)
- Dark mode / Light mode toggle
- Smooth animations and transitions
- Star ratings visualization
- Loading spinners and toast notifications

## Tech Stack

### Frontend
- **React 18** with React Router v6
- **Axios** for API calls
- **Context API** for state management (Auth, Cart, Theme)
- **React Icons** for iconography
- **CSS Custom Properties** for theming
- **Fully responsive** design

### Backend
- **Node.js** with **Express**
- **MongoDB** with **Mongoose** ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **Stripe** payment gateway integration
- **CORS** enabled

## Project Structure

```
bookStoreApp/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth & admin middleware
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # Axios API calls
│   │   ├── components/      # React components
│   │   │   ├── Admin/       # Admin dashboard & management
│   │   │   ├── Auth/        # Login, Register, Profile
│   │   │   ├── Books/       # Book listing & details
│   │   │   ├── Cart/        # Shopping cart
│   │   │   ├── Layout/      # Navbar, Footer, Home
│   │   │   ├── Orders/      # Checkout, Order history
│   │   │   └── common/      # Shared components
│   │   ├── context/         # React context providers
│   │   ├── styles/          # CSS styles
│   │   ├── App.js           # Main app with routing
│   │   └── index.js         # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
```

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Login user | Public |
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |

### Book Routes (`/api/books`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all books (search, filter, paginate) | Public |
| GET | `/:id` | Get single book | Public |
| GET | `/categories` | Get all categories | Public |
| POST | `/:id/reviews` | Add book review | Private |

### Cart Routes (`/api/cart`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get user's cart | Private |
| POST | `/` | Add item to cart | Private |
| PUT | `/:itemId` | Update cart item | Private |
| DELETE | `/:itemId` | Remove from cart | Private |
| DELETE | `/` | Clear cart | Private |

### Order Routes (`/api/orders`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create order from cart | Private |
| GET | `/myorders` | Get user's orders | Private |
| GET | `/:id` | Get order by ID | Private |
| POST | `/:id/pay` | Create Stripe payment | Private |
| PUT | `/:id/pay` | Update payment status | Private |

### Admin Routes (`/api/admin`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/books` | Get all books (admin) | Admin |
| POST | `/books` | Create book | Admin |
| PUT | `/books/:id` | Update book | Admin |
| DELETE | `/books/:id` | Delete book | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/orders` | Get all orders | Admin |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/stats` | Get sales statistics | Admin |

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or Atlas URI)
- Stripe account (for payment integration)

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/bookstore
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_your_key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_KEY=pk_test_your_key
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates sample data including:
- **Admin:** admin@bookstore.com / admin123
- **Customer:** john@example.com / customer123
- 12 sample books across multiple categories

### 4. Start the Application

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (in a new terminal, from frontend directory)
npm start
```

The API runs on `http://localhost:5000` and the frontend on `http://localhost:3000`.

## Security Features

- JWT-based authentication with token expiry
- Passwords hashed with bcrypt (12 salt rounds)
- Input validation on all API endpoints
- Protected routes with middleware
- Admin-only route restrictions
- CORS configuration
- Environment variables for sensitive data
- Stripe webhook signature verification

## License

MIT