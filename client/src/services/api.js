import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('codex_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthenticated 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If expired token, clear and optionally redirect if not already on login
      if (
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register' &&
        localStorage.getItem('codex_token')
      ) {
        localStorage.removeItem('codex_token');
        localStorage.removeItem('codex_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
