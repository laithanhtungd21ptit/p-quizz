// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loginApi, getCurrentUser, logoutLocal, getAccessToken } from '../api/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // helper: check token expiry (if available)
  const isTokenExpired = useCallback(() => {
    try {
      const token = getAccessToken();
      if (!token) return true;
      // decode quickly via jwt-decode in auth.js? we don't re-import, just check stored user expiry
      const stored = getCurrentUser();
      if (!stored?.expiresAt) return false; // unknown -> assume ok
      return Date.now() > stored.expiresAt;
    } catch {
      return true;
    }
  }, []);

  // login wrapper: calls loginApi then set context
  const login = async ({ username, password }) => {
    setLoading(true);
    try {
      const { token, user: loggedUser } = await loginApi({ username, password });
      // set user state based on response
      if (loggedUser) {
        setUser(loggedUser);
      } else {
        // fallback: decode from token if token present
        const stored = getCurrentUser();
        setUser(stored);
      }
      setLoading(false);
      return { success: true, user: getCurrentUser() };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async (opts = { redirect: true }) => {
    // cleanup local storage
    await logoutLocal();
    setUser(null);
    if (opts.redirect) navigate('/login', { replace: true });
  };

  // listen for global unauthorized event from api interceptor
  useEffect(() => {
    const handler = (e) => {
      // token invalid/expired -> force logout
      logout({ redirect: true });
    };
    window.addEventListener('api:unauthorized', handler);
    return () => window.removeEventListener('api:unauthorized', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // on mount, if token expired -> logout
  useEffect(() => {
    if (isTokenExpired()) {
      logout({ redirect: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !isTokenExpired()
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}