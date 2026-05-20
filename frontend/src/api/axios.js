import axios from 'axios';

/**
 * Axios instance with base configuration
 * Automatically attaches JWT token to requests
 */
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - attaches auth token to every request
 */
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor - handles common errors
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear local storage on token expiry
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;