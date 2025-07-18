import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from 'react-oidc-context'
import './index.css'
import App from './App.jsx'

// OIDC Configuration for AWS Cognito - Following AWS Documentation
const cognitoAuthConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  response_type: "code",
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  automaticSilentRenew: true,
  loadUserInfo: true,
  onSigninCallback: () => {
    // Remove the query parameters from URL after successful sign-in
    window.history.replaceState({}, document.title, window.location.pathname);
  }
};

console.log('🔧 OIDC Configuration:', {
  authority: cognitoAuthConfig.authority,
  client_id: cognitoAuthConfig.client_id,
  redirect_uri: cognitoAuthConfig.redirect_uri,
  scope: cognitoAuthConfig.scope
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </StrictMode>,
)
