// src/AppCognito.jsx - Simple App with Custom Cognito Hook
import React from "react";
import { useAuth } from "./hooks/useCognito";
import { CognitoLogin } from "./components/auth/CognitoLogin";
import { CognitoDashboard } from "./components/auth/CognitoDashboard";

function AppCognito() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md w-full mx-4 p-6 bg-white border border-red-200 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Authentication Error</h2>
          <p className="text-red-700 mb-4">{error}</p>
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

  // Show login or dashboard based on authentication status
  return isAuthenticated ? <CognitoDashboard /> : <CognitoLogin />;
}

export default AppCognito;
