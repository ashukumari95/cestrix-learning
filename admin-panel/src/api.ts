import axios from 'axios';

// Get the token from local storage
const getToken = () => {
  return localStorage.getItem('token') || '';
};

// Create an Axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1', // Backend runs on 5000 by default
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
