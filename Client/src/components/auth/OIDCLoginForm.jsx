// Client/src/components/auth/OIDCLoginForm.jsx - OIDC Login Component
import React from 'react';
import { useCognitoOIDC } from '../../services/cognitoOIDC';
import { showToast } from '../../utils/toast';

const OIDCLoginForm = ({ onSuccess, onError }) => {
  const { signIn, isLoading, error, isAuthenticated, user } = useCognitoOIDC();

  // Handle sign in
  const handleSignIn = async () => {
    try {
      const result = await signIn();
      
      if (result.success) {
        showToast.success('Redirecting to AWS Cognito...');
        onSuccess?.(result);
      } else {
        throw new Error(result.error?.message || 'Sign in failed');
      }
    } catch (error) {
      console.error('OIDC sign in error:', error);
      showToast.error(error.message || 'Failed to initiate sign in');
      onError?.(error);
    }
  };

  // If already authenticated, show user info
  if (isAuthenticated && user) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Signed in as <strong>{user.email}</strong>
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">User Information</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Email Verified:</strong> {user.emailVerified ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || 'An error occurred during authentication'}
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Error Details</h3>
          <div className="text-sm text-red-700">
            <p><strong>Code:</strong> {error.code}</p>
            <p><strong>Message:</strong> {error.message}</p>
          </div>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Signing you in...
          </h2>
          <p className="text-gray-600">
            Please wait while we redirect you to AWS Cognito.
          </p>
        </div>
      </div>
    );
  }

  // Default sign in form
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Sign in with AWS Cognito
        </h2>
        <p className="text-gray-600">
          Secure authentication powered by Amazon Web Services
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-500 text-xl">🔐</div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">OIDC Authentication</h3>
            <p className="text-sm text-blue-700">
              You'll be redirected to AWS Cognito for secure authentication. 
              After signing in, you'll be brought back to the application.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
      >
        <span>🚀</span>
        <span>Sign in with AWS Cognito</span>
      </button>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
};

export default OIDCLoginForm;
