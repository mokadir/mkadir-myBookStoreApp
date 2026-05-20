import API from './axios';

/**
 * Books API calls
 */
const bookApi = {
  getBooks: (params) => API.get('/books', { params }),
  getBookById: (id) => API.get(`/books/${id}`),
  getCategories: () => API.get('/books/categories'),
  createReview: (id, review) => API.post(`/books/${id}/reviews`, review),
};

export default bookApi;