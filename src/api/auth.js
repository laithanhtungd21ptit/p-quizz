import {jwtDecode} from 'jwt-decode';
import api from './api';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'currentUser';

function decodeToken(token) {
  try {
    const payload = jwtDecode(token);
    // Normalize roles extraction (support multiple claim names)
    let roles = [];
    if (payload.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
    else if (payload.role) roles = Array.isArray(payload.role) ? payload.role : [payload.role];
    else if (payload.authorities && Array.isArray(payload.authorities)) {
      roles = payload.authorities.map(a => (typeof a === 'string' ? a : a.authority)).filter(Boolean);
    }

    const username = payload.sub || payload.username || payload.user || null;
    const exp = payload.exp ? payload.exp * 1000 : null; // ms

    return { username, roles, exp, raw: payload };
  } catch (e) {
    return { username: null, roles: [], exp: null, raw: null };
  }
}

export async function loginApi({ username, password }) {
  try {
    const res = await api.post('/auth/login', { username, password });
    const token = res.data?.accessToken || res.data?.token || null;

    if (!token) {
      // backend didn't return token (edge case) -> return raw
      return { token: null, raw: res.data };
    }

    localStorage.setItem(TOKEN_KEY, token);
    // keep legacy keys for backward compatibility
    localStorage.setItem('token', token);

    const decoded = decodeToken(token);
    const currentUser = {
      username: decoded.username || username,
      roles: decoded.roles || [],
      expiresAt: decoded.exp || null
    };
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    localStorage.setItem('user', JSON.stringify(currentUser)); // Thêm key 'user'

    return { token, user: currentUser, raw: res.data };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      'Đăng nhập thất bại';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export async function logoutLocal() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('token'); // Xóa key 'token'
  localStorage.removeItem('user'); // Xóa key 'user'
  // optional: call backend logout endpoint if exists:
  // await api.post('/auth/logout');
}

export async function registerApi({ username, email, password, confirmPassword }) {
  try {
    const res = await api.post('/auth/register', {
      username,
      email,
      password,
      confirmPassword,
    });
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      'Đăng ký thất bại';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

export async function forgotPasswordApi({ username }) {
  try {
    const res = await api.post('/auth/forgot-password', { username });
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      'Yêu cầu quên mật khẩu thất bại';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}

export async function verifyCodeApi({ username, code, newPassword }) {
  try {
    const payload = { username, code, newPassword };
    const res = await api.post('/auth/verify-code', payload);
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      'Xác thực thất bại';
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
}