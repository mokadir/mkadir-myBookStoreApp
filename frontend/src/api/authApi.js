import API from './axios';

/**
 * Authentication API calls
 */
const authApi = {
  register: (userData) => API.post('/auth/register', userData),
  login: (credentials) => API.post('/auth/login', credentials),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (userData) => API.put('/auth/profile', userData),
};

export default authApi;