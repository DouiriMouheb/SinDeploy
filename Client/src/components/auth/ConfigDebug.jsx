// Client/src/components/auth/ConfigDebug.jsx - Configuration Debug Component
import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';

export const ConfigDebug = () => {
  const auth = useAuth();
  const [testResults, setTestResults] = useState({});

  const config = {
    authority: import.meta.env.VITE_COGNITO_AUTHORITY,
    client_id: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
    post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
    scope: import.meta.env.VITE_COGNITO_SCOPE,
    cognito_domain: import.meta.env.VITE_COGNITO_DOMAIN,
    aws_region: import.meta.env.VITE_AWS_REGION,
  };

  const testEndpoint = async (url, name) => {
    try {
      const response = await fetch(url, { method: 'GET', mode: 'cors' });
      setTestResults(prev => ({
        ...prev,
        [name]: { status: response.status, ok: response.ok }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: { error: error.message }
      }));
    }
  };

  const runConnectivityTests = async () => {
    setTestResults({});
    await testEndpoint(`${config.authority}/.well-known/openid_configuration`, 'wellKnown');
    await testEndpoint(`${config.authority}/oauth2/authorize`, 'authorize');
    await testEndpoint(`${config.authority}/oauth2/token`, 'token');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">🔍 OIDC Configuration Debug</h2>

      {/* Auth Status */}
      <div className="mb-6 p-4 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-semibold mb-2">Current Auth Status:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Is Loading:</strong> <span className={auth.isLoading ? 'text-yellow-600' : 'text-green-600'}>{auth.isLoading ? 'Yes' : 'No'}</span></p>
          <p><strong>Is Authenticated:</strong> <span className={auth.isAuthenticated ? 'text-green-600' : 'text-red-600'}>{auth.isAuthenticated ? 'Yes' : 'No'}</span></p>
          <p><strong>Has Error:</strong> <span className={auth.error ? 'text-red-600' : 'text-green-600'}>{auth.error ? 'Yes' : 'No'}</span></p>
          {auth.error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">Error Details:</p>
              <p className="text-red-700 text-xs">{auth.error.message}</p>
            </div>
          )}
        </div>
      </div>

      {/* Connectivity Tests */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Connectivity Tests:</h3>
          <button
            onClick={runConnectivityTests}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Run Tests
          </button>
        </div>
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-2 text-sm">
            {Object.entries(testResults).map(([name, result]) => (
              <div key={name} className="flex items-center">
                <span className={`mr-2 ${result.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {result.ok ? '✅' : '❌'}
                </span>
                <span className="font-medium">{name}:</span>
                <span className="ml-2">
                  {result.error ? result.error : `${result.status} ${result.ok ? 'OK' : 'Failed'}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Current Configuration:</h3>
          <div className="bg-gray-100 p-4 rounded font-mono text-sm">
            <pre>{JSON.stringify(config, null, 2)}</pre>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Expected AWS Cognito URLs:</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Authorization URL:</strong> {config.authority}/oauth2/authorize</p>
            <p><strong>Token URL:</strong> {config.authority}/oauth2/token</p>
            <p><strong>UserInfo URL:</strong> {config.authority}/oauth2/userInfo</p>
            <p><strong>Logout URL:</strong> https://{config.cognito_domain}.auth.{config.aws_region}.amazoncognito.com/logout</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Configuration Checklist:</h3>
          <div className="space-y-2 text-sm">
            <div className={`flex items-center ${config.authority ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{config.authority ? '✅' : '❌'}</span>
              Authority URL configured
            </div>
            <div className={`flex items-center ${config.client_id ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{config.client_id ? '✅' : '❌'}</span>
              Client ID configured
            </div>
            <div className={`flex items-center ${config.redirect_uri ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{config.redirect_uri ? '✅' : '❌'}</span>
              Redirect URI configured
            </div>
            <div className={`flex items-center ${config.scope ? 'text-green-600' : 'text-red-600'}`}>
              <span className="mr-2">{config.scope ? '✅' : '❌'}</span>
              Scopes configured
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="text-sm font-medium text-blue-800 mb-2">AWS Cognito App Client Settings Required:</h4>
          <div className="text-xs text-blue-700 space-y-1">
            <p>• <strong>Allowed callback URLs:</strong> {config.redirect_uri}</p>
            <p>• <strong>Allowed sign-out URLs:</strong> {config.post_logout_redirect_uri}</p>
            <p>• <strong>OAuth 2.0 grants:</strong> Authorization code grant</p>
            <p>• <strong>OAuth scopes:</strong> {config.scope}</p>
            <p>• <strong>Client type:</strong> Public client (no client secret)</p>
          </div>
        </div>
      </div>
    </div>
  );
};
