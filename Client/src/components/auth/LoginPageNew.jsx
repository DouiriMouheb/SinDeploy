// src/components/auth/LoginPage.jsx - Simple OIDC Authentication Login Page
import React from "react";
import { useAuth } from "react-oidc-context";
import OIDCLoginForm from "./OIDCLoginForm";

export const LoginPage = () => {
  const auth = useAuth();

  // If already authenticated, redirect will be handled by App.jsx
  if (auth.isAuthenticated) {
    return null;
  }

  // Show loading state
  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full mx-4 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-700 mb-4">{auth.error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show OIDC login form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to SinDeploy
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sign in with your AWS Cognito account
          </p>
        </div>
        
        <OIDCLoginForm
          onSuccess={() => console.log('OIDC login successful')}
          onError={(error) => console.error('OIDC login error:', error)}
        />
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Sinergia Company Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
