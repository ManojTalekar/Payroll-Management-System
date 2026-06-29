import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Route guard component to check authorization state and role claims
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("role") || "";
  const token = localStorage.getItem("accessToken");

  if (!isLoggedIn || !token) {
    // Session expired or unauthenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role unauthorized, redirect to relevant landing dashboard
    if (userRole === "admin" || userRole === "hr" || userRole === "manager") {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/employee-dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
