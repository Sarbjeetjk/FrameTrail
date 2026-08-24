import axios from 'axios';

const rawBaseUrl = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').trim();
const API_BASE_URL = rawBaseUrl === '/api'
  ? '/api'
  : rawBaseUrl.endsWith('/api')
  ? rawBaseUrl
  : rawBaseUrl.endsWith('/')
  ? `${rawBaseUrl}api`
  : `${rawBaseUrl}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('frametrail_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling 401 unauthorized & formatting server errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('frametrail_token');
      localStorage.removeItem('frametrail_user');
    }

    // Standardize user-friendly Server Error messages
    if (error.response && error.response.data && error.response.data.message) {
      error.message = error.response.data.message;
    } else if (error.response && error.response.status >= 500) {
      error.message = 'Server Error: Internal server issue occurred. Please try again.';
    } else if (!error.response) {
      error.message = 'Server Offline: Unable to connect to backend server service.';
    }

    return Promise.reject(error);
  }
);

export default api;
