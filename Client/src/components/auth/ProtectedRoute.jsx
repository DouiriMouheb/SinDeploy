import React from "react";
import { useAuth } from "react-oidc-context";
import { LoginPage } from "./LoginPageNew";

export const ProtectedRoute = ({ children, requiredRole = "user" }) => {
  const auth = useAuth();

  // Show loading state
  if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!auth.isAuthenticated) {
    return <LoginPage />;
  }

  // For now, we'll skip role-based access control since we're using OIDC
  // You can implement role checking based on OIDC user claims later
  // const userRole = auth.user?.profile?.['custom:role'] || 'user';
  // if (requiredRole && userRole !== requiredRole) {
  //   return access denied component
  // }

  return children;
};
