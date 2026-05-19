const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');

/**
 * Seed script to populate the database with sample data
 * Run with: npm run seed
 */
const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data (in development only)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await Book.deleteMany({});
      await Order.deleteMany({});
      console.log('Cleared existing data');
    }

    // ========================
    // CREATE USERS
    // ========================
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1-555-0100',
      address: {
        street: '123 Admin St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA',
      },
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+1-555-0200',
      address: {
        street: '456 Customer Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        country: 'USA',
      },
    });

    console.log('Users created:');
    console.log(`  Admin: admin@bookstore.com / admin123`);
    console.log(`  Customer: john@example.com / customer123`);

    // ========================
    // CREATE BOOKS
    // ========================
    const books = await Book.insertMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        category: 'fiction',
        description:
          'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan, of lavish parties on Long Island, and a masterpiece of American literature.',
        price: 12.99,
        coverImage: 'https://m.media-amazon.com/images/I/71FTLwJNpSL.jpg',
        stockQuantity: 50,
        ratings: { average: 4.4, count: 1245 },
        isbn: '978-0743273565',
        publishedYear: 1925,
        pages: 180,
        isFeatured: true,
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        category: 'fiction',
        description:
          'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill A Mockingbird became both an instant bestseller and a critical success.',
        price: 14.99,
        coverImage: 'https://m.media-amazon.com/images/I/71FxgtFKcML.jpg',
        stockQuantity: 45,
        ratings: { average: 4.8, count: 2103 },
        isbn: '978-0061120084',
        publishedYear: 1960,
        pages: 281,
        isFeatured: true,
      },
      {
        title: '1984',
        author: 'George Orwell',
        category: 'fiction',
        description:
          'Among the seminal texts of the 20th century, this dystopian novel is a powerful work at once and a devastating satire of totalitarianism.',
        price: 11.99,
        coverImage: 'https://m.media-amazon.com/images/I/71kxa1xJN4L.jpg',
        stockQuantity: 60,
        ratings: { average: 4.6, count: 1897 },
        isbn: '978-0451524935',
        publishedYear: 1949,
        pages: 328,
        isFeatured: true,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        category: 'technology',
        description:
          'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. This book covers principles, patterns, and practices of writing clean code.',
        price: 39.99,
        coverImage: 'https://m.media-amazon.com/images/I/41xShlnTZTL.jpg',
        stockQuantity: 30,
        ratings: { average: 4.7, count: 891 },
        isbn: '978-0132350884',
        publishedYear: 2008,
        pages: 464,
        isFeatured: false,
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt, David Thomas',
        category: 'technology',
        description:
          'Written as a series of self-contained sections and filled with entertaining anecdotes, this book covers topics from personal responsibility to career development.',
        price: 44.99,
        coverImage: 'https://m.media-amazon.com/images/I/41V-3KF0kDL.jpg',
        stockQuantity: 25,
        ratings: { average: 4.6, count: 765 },
        isbn: '978-0135957059',
        publishedYear: 2019,
        pages: 352,
        isFeatured: false,
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        category: 'technology',
        description:
          'This book explores the fundamental ideas behind reliable, scalable, and maintainable data systems, from data modeling to distributed systems.',
        price: 49.99,
        coverImage: 'https://m.media-amazon.com/images/I/51ZSpMlTdEL.jpg',
        stockQuantity: 20,
        ratings: { average: 4.8, count: 654 },
        isbn: '978-1449373320',
        publishedYear: 2017,
        pages: 616,
        isFeatured: true,
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        category: 'history',
        description:
          'A groundbreaking narrative of humanity\'s creation and evolution that explores how we came to be who we are today.',
        price: 18.99,
        coverImage: 'https://m.media-amazon.com/images/I/71u0o1hGSPL.jpg',
        stockQuantity: 40,
        ratings: { average: 4.5, count: 1567 },
        isbn: '978-0062316097',
        publishedYear: 2015,
        pages: 443,
        isFeatured: true,
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        category: 'science',
        description:
          'A landmark volume in science writing by one of the great minds of our time, exploring such topics as the nature of time and the universe.',
        price: 15.99,
        coverImage: 'https://m.media-amazon.com/images/I/61R1NICzJFL.jpg',
        stockQuantity: 35,
        ratings: { average: 4.4, count: 1123 },
        isbn: '978-0553380163',
        publishedYear: 1988,
        pages: 212,
        isFeatured: false,
      },
      {
        title: 'The Art of War',
        author: 'Sun Tzu',
        category: 'philosophy',
        description:
          'The ancient Chinese military treatise that has become a classic of strategy and philosophy, applied to business, sports, and life.',
        price: 9.99,
        coverImage: 'https://m.media-amazon.com/images/I/71jW2cHxk3L.jpg',
        stockQuantity: 70,
        ratings: { average: 4.3, count: 2034 },
        isbn: '978-1590302255',
        publishedYear: -500,
        pages: 273,
        isFeatured: false,
      },
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        category: 'technology',
        description:
          'A comprehensive textbook covering a broad range of algorithms in depth, used worldwide as a textbook for courses on algorithms.',
        price: 79.99,
        coverImage: 'https://m.media-amazon.com/images/I/61PgJmO9KmL.jpg',
        stockQuantity: 15,
        ratings: { average: 4.5, count: 432 },
        isbn: '978-0262033848',
        publishedYear: 2009,
        pages: 1312,
        isFeatured: false,
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        category: 'fiction',
        description:
          'The hero-narrator of this novel is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, secondhand description.',
        price: 13.99,
        coverImage: 'https://m.media-amazon.com/images/I/71nXPGjqQBL.jpg',
        stockQuantity: 55,
        ratings: { average: 4.0, count: 1876 },
        isbn: '978-0316769480',
        publishedYear: 1951,
        pages: 234,
        isFeatured: false,
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        category: 'business',
        description:
          'Most startups fail. But many of those failures are preventable. The Lean Startup is a new approach being adopted across the globe, changing the way companies are built.',
        price: 24.99,
        coverImage: 'https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg',
        stockQuantity: 40,
        ratings: { average: 4.3, count: 987 },
        isbn: '978-0307887894',
        publishedYear: 2011,
        pages: 336,
        isFeatured: true,
      },
    ]);

    console.log(`Books created: ${books.length}`);

    // ========================
    // SUCCESS MESSAGE
    // ========================
    console.log('\n✅ Database seeded successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Credentials:');
    console.log('  Admin:    admin@bookstore.com / admin123');
    console.log('  Customer: john@example.com   / customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();