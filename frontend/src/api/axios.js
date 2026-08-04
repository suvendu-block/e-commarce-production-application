import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Axios instance for the REAL backend (used when VITE_USE_MOCK=false).
// Kept per the design docs so going live requires zero component changes.
const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('userInfo');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore corrupted storage
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
