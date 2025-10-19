import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

/**
 * ProtectedRoute props:
 * - children: component to render
 * - roles: optional array of allowed roles, e.g. ['admin','faculty']
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // show nothing while loading (or a spinner)
  if (loading) return null;

  // not logged in
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // role check (if provided)
  if (roles && roles.length > 0) {
    // user may have .role or not; if not, allow (you can tighten later)
    const uRole = user.role;
    if (!uRole || !roles.includes(uRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // all good
  return children;
}
