import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle unauthorized (401) responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on auth check endpoint to avoid loops
      if (!error.config.url.includes('/auth/login') && !error.config.url.includes('/auth/register')) {
        // clear local storage if token expired
        // localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Papers endpoints
export const paperService = {
  searchPapers: (query) => api.get(`/papers?q=${encodeURIComponent(query)}`),
  semanticSearch: (query) => api.get('/papers/semanticSearch', { params: { q: query } }),
  collectPapers: (query) => api.post('/papers', { query }),
};

// Research assistant endpoints
export const suggestionService = {
  uploadResearch: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/suggestions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  queryResearch: (question) => api.post('/suggestions/query', { question }),
};

// User admin endpoints
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
