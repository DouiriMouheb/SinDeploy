// Client/src/components/auth/OIDCTestPage.jsx - OIDC Test Component
import { useAuth } from "react-oidc-context";

export const OIDCTestPage = () => {
  const auth = useAuth();

  const signOutRedirect = () => {
    const clientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
    const cognitoDomain = `https://${import.meta.env.VITE_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com`;

    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (auth.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-green-800 mb-6">✅ OIDC Authentication Successful!</h1>

            {/* AWS Documentation Format */}
            <div className="mb-6 p-4 bg-gray-100 rounded font-mono text-sm">
              <pre>Hello: {auth.user?.profile?.email}</pre>
              <pre>ID Token: {auth.user?.id_token?.substring(0, 50)}...</pre>
              <pre>Access Token: {auth.user?.access_token?.substring(0, 50)}...</pre>
              <pre>Refresh Token: {auth.user?.refresh_token?.substring(0, 50)}...</pre>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {auth.user?.profile?.email || 'N/A'}</p>
                  <p><strong>Name:</strong> {auth.user?.profile?.name || 'N/A'}</p>
                  <p><strong>Subject:</strong> {auth.user?.profile?.sub || 'N/A'}</p>
                  <p><strong>Username:</strong> {auth.user?.profile?.['cognito:username'] || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Token Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Token Type:</strong> {auth.user?.token_type || 'Bearer'}</p>
                  <p><strong>Expires:</strong> {auth.user?.expires_at ? new Date(auth.user.expires_at * 1000).toLocaleString() : 'N/A'}</p>
                  <p><strong>Scope:</strong> {auth.user?.scope || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3">Tokens (for debugging)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Token:</label>
                  <textarea 
                    className="w-full h-20 p-2 border border-gray-300 rounded text-xs font-mono"
                    value={auth.user?.id_token || 'N/A'}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Token:</label>
                  <textarea 
                    className="w-full h-20 p-2 border border-gray-300 rounded text-xs font-mono"
                    value={auth.user?.access_token || 'N/A'}
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => auth.removeUser()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign out
              </button>
              <button
                onClick={signOutRedirect}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Sign out (Redirect)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-6">OIDC Test Page</h2>
        <p className="text-gray-600 text-center mb-6">
          Test the OIDC authentication with AWS Cognito
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => auth.signinRedirect()}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Sign in
          </button>
          <button 
            onClick={signOutRedirect}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Sign out
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Configuration Info:</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Authority:</strong> {import.meta.env.VITE_COGNITO_AUTHORITY}</p>
            <p><strong>Client ID:</strong> {import.meta.env.VITE_COGNITO_APP_CLIENT_ID}</p>
            <p><strong>Redirect URI:</strong> {import.meta.env.VITE_COGNITO_REDIRECT_URI}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OIDCTestPage;
