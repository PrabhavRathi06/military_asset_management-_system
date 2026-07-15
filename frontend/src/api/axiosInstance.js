// =============================================
// api/axiosInstance.js
// Central Axios configuration
// All API calls go through this instance so we
// always send the JWT token automatically
// =============================================

import axios from 'axios';

// Base URL of our backend API
// In development: http://localhost:5000/api
// In production: the Render URL (set in .env)
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create a custom axios instance with default settings
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// -----------------------------------------------
// Request Interceptor
// This runs BEFORE every API request is sent
// It adds the JWT token from localStorage to headers
// -----------------------------------------------
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the stored token from localStorage
    const token = localStorage.getItem('token');

    if (token) {
      // Add it to the Authorization header
      // Backend will verify this token to know who is calling
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// -----------------------------------------------
// Response Interceptor
// This runs AFTER every API response comes back
// If we get a 401 (Unauthorized), log the user out
// -----------------------------------------------
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
