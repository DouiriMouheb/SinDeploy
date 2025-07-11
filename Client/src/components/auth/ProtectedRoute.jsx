import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { LoginPage } from "./LoginPage";

export const ProtectedRoute = ({ children, requiredRole = "user" }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <LoginPage />;
  }

  if (!hasRole(requiredRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
};
