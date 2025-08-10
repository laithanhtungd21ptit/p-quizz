// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute usage:
 * <Route element={<ProtectedRoute/>}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 *
 * For role-based:
 * <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
 *   <Route path="/admin/accounts" element={<AdminAccounts/>} />
 * </Route>
 */
const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const roles = (user?.roles || []).map(r => String(r).toUpperCase());
    const hasRole = roles.some(r => r.includes(requiredRole) || r.includes(`ROLE_${requiredRole}`));
    if (!hasRole) {
      // optional: go to 403 page or dashboard
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;