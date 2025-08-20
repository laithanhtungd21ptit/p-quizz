import { jwtDecode } from "jwt-decode";
import api from "./api";

// ✅ CHUẨN HÓA: Chỉ dùng 'token' làm key chính (vì được dùng nhiều nhất)
const TOKEN_KEY = "token";
const USER_KEY = "user";

function decodeToken(token) {
  try {
    const payload = jwtDecode(token);
    // Normalize roles extraction (support multiple claim names)
    let roles = [];
    if (payload.roles)
      roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
    else if (payload.role)
      roles = Array.isArray(payload.role) ? payload.role : [payload.role];
    else if (payload.authorities && Array.isArray(payload.authorities)) {
      roles = payload.authorities
        .map((a) => (typeof a === "string" ? a : a.authority))
        .filter(Boolean);
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
    const res = await api.post("/auth/login", { username, password });
    const token = res.data?.accessToken || res.data?.token || null;

    if (!token) {
      // backend didn't return token (edge case) -> return raw
      return { token: null, raw: res.data };
    }

    // ✅ CHUẨN HÓA: TOKEN_KEY = 'token', không cần duplicate
    localStorage.setItem(TOKEN_KEY, token);

    const decoded = decodeToken(token);
    const currentUser = {
      username: decoded.username || username,
      roles: decoded.roles || [],
      expiresAt: decoded.exp || null,
    };
    // ✅ CHUẨN HÓA: Sử dụng USER_KEY ('user') làm key duy nhất
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

    return { token, user: currentUser, raw: res.data };
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "Đăng nhập thất bại";
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
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
  localStorage.removeItem(TOKEN_KEY); // TOKEN_KEY = 'token'
  localStorage.removeItem(USER_KEY); // USER_KEY = 'user'
  // ✅ CLEANUP LEGACY: Xóa các duplicate keys
  localStorage.removeItem("accessToken"); // Legacy duplicate của 'token'
  localStorage.removeItem("currentUser"); // Legacy duplicate của 'user'
  // optional: call backend logout endpoint if exists:
  // await api.post('/auth/logout');
}

export async function registerApi({
  username,
  email,
  password,
  confirmPassword,
}) {
  try {
    const res = await api.post("/auth/register", {
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
      "Đăng ký thất bại";
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }
}

export async function forgotPasswordApi({ username }) {
  try {
    const res = await api.post("/auth/forgot-password", { username });
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "Yêu cầu quên mật khẩu thất bại";
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }
}

export async function verifyCodeApi({ username, code, newPassword }) {
  try {
    const payload = { username, code, newPassword };
    const res = await api.post("/auth/verify-code", payload);
    return res.data;
  } catch (err) {
    const message =
      err?.response?.data?.message ||
      err?.response?.data ||
      err.message ||
      "Xác thực thất bại";
    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message)
    );
  }
}
