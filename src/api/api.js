// src/api/api.js
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const TOKEN_KEY = 'accessToken';

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
});

// request: attach token from localStorage (keeps backward compatibility)
api.interceptors.request.use(
  (cfg) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) cfg.headers.Authorization = `Bearer ${token}`;
    } catch (e) { /* ignore */ }
    return cfg;
  },
  (err) => Promise.reject(err)
);

// response: if 401 -> broadcast event so AuthContext can logout / redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // app-level event that indicates unauthorized / token invalid
      window.dispatchEvent(new CustomEvent('api:unauthorized', { detail: err }));
    }
    return Promise.reject(err);
  }
);

export default api;