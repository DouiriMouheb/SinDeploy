// Client/src/components/auth/OIDCCallback.jsx - OIDC Authentication Callbacks
import React, { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

/**
 * Sign-in callback component
 * Handles the redirect after successful authentication
 */
export const SignInCallback = () => {
  const auth = useAuth();

  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (auth.isLoading) {
          console.log('🔄 Processing OIDC sign-in callback...');
          return;
        }

        if (auth.error) {
          console.error('❌ OIDC sign-in callback error:', auth.error);
          navigate('/login?error=signin_failed');
          return;
        }

        if (auth.isAuthenticated) {
          console.log('✅ OIDC sign-in successful, redirecting to dashboard...');
          navigate('/');
          return;
        }

        // If we get here, something unexpected happened
        console.warn('⚠️ Unexpected state in sign-in callback');
        navigate('/login');
      } catch (error) {
        console.error('❌ Error in sign-in callback:', error);
        navigate('/login?error=callback_error');
      }
    };

    handleCallback();
  }, [auth.isLoading, auth.error, auth.isAuthenticated, navigate]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Signing you in...</h2>
          <p className="text-gray-600">Please wait while we complete your authentication.</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">There was a problem signing you in.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign-in Successful</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

/**
 * Sign-out callback component
 * Handles the redirect after successful logout
 */
export const SignOutCallback = () => {
  const navigate = (path) => {
    window.location.href = path;
  };

  useEffect(() => {
    console.log('✅ OIDC sign-out successful, redirecting to login...');
    // Small delay to show the success message
    const timer = setTimeout(() => {
      navigate('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-blue-500 text-6xl mb-4">👋</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Signed Out Successfully</h2>
        <p className="text-gray-600">Thank you for using SinDeploy. Redirecting to login...</p>
      </div>
    </div>
  );
};

export default { SignInCallback, SignOutCallback };
