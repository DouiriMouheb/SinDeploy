// Client/src/services/cognitoOIDC.js - OIDC-based AWS Cognito Authentication Service
import { useAuth } from 'react-oidc-context';

/**
 * OIDC Configuration for AWS Cognito (matching Amazon's requirements)
 */
export const cognitoOIDCConfig = {
  authority: import.meta.env.VITE_COGNITO_AUTHORITY,
  client_id: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
  redirect_uri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
  post_logout_redirect_uri: import.meta.env.VITE_COGNITO_LOGOUT_URI,
  response_type: 'code',
  scope: import.meta.env.VITE_COGNITO_SCOPE,
  automaticSilentRenew: true,
  loadUserInfo: true,

  // Additional OIDC settings
  filterProtocolClaims: true,
  clockSkew: 300, // 5 minutes

  // Cognito specific settings
  metadata: {
    issuer: import.meta.env.VITE_COGNITO_AUTHORITY,
    authorization_endpoint: `${import.meta.env.VITE_COGNITO_AUTHORITY}/oauth2/authorize`,
    token_endpoint: `${import.meta.env.VITE_COGNITO_AUTHORITY}/oauth2/token`,
    userinfo_endpoint: `${import.meta.env.VITE_COGNITO_AUTHORITY}/oauth2/userInfo`,
    end_session_endpoint: `https://${import.meta.env.VITE_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com/logout`,
    jwks_uri: `${import.meta.env.VITE_COGNITO_AUTHORITY}/.well-known/jwks.json`
  }
};

/**
 * Custom logout function to match Amazon's expected behavior
 */
export const customSignOut = () => {
  const clientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID;
  const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI;
  const cognitoDomain = `https://${import.meta.env.VITE_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com`;

  window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};

/**
 * OIDC-based Cognito Authentication Service
 * Uses react-oidc-context for standard OIDC authentication flow
 */
export class CognitoOIDCService {
  constructor() {
    this.authListeners = [];
  }

  // Authentication Methods using OIDC
  async signIn() {
    // OIDC sign-in is handled by the AuthProvider
    // This method is for compatibility with existing code
    throw new Error('Use auth.signinRedirect() from useAuth hook instead');
  }

  async signOut() {
    // OIDC sign-out is handled by the AuthProvider
    // This method is for compatibility with existing code
    throw new Error('Use auth.signoutRedirect() from useAuth hook instead');
  }

  // Utility Methods
  addAuthListener(callback) {
    this.authListeners.push(callback);
  }

  removeAuthListener(callback) {
    this.authListeners = this.authListeners.filter(listener => listener !== callback);
  }

  notifyAuthListeners(event, data) {
    this.authListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Auth listener error:', error);
      }
    });
  }

  // Transform OIDC user to our app's user format
  transformOIDCUser(oidcUser) {
    if (!oidcUser || !oidcUser.profile) {
      return null;
    }

    const profile = oidcUser.profile;
    
    return {
      id: profile.sub,
      cognitoId: profile.sub,
      email: profile.email,
      firstName: profile.given_name || profile.name?.split(' ')[0] || '',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      role: profile['custom:role'] || 'user',
      emailVerified: profile.email_verified === true || profile.email_verified === 'true',
      tokens: {
        accessToken: oidcUser.access_token,
        idToken: oidcUser.id_token,
        refreshToken: oidcUser.refresh_token
      },
      // Additional OIDC properties
      oidcProfile: profile,
      tokenType: oidcUser.token_type,
      expiresAt: oidcUser.expires_at
    };
  }

  // Get current user from OIDC context
  getCurrentUserFromOIDC(oidcUser) {
    return this.transformOIDCUser(oidcUser);
  }

  // Check if user is authenticated
  isAuthenticated(oidcAuth) {
    return oidcAuth.isAuthenticated && !oidcAuth.isLoading && !oidcAuth.error;
  }

  // Get auth token for API calls
  getAuthToken(oidcUser) {
    return oidcUser?.access_token || null;
  }

  // Format OIDC errors
  formatError(error) {
    if (!error) return null;

    return {
      message: error.message || 'Authentication error occurred',
      code: error.error || 'UnknownError',
      details: error
    };
  }
}

// Create singleton instance
export const cognitoOIDCService = new CognitoOIDCService();

/**
 * Custom hook to use OIDC Cognito authentication
 * Provides a consistent interface with the existing auth system
 */
export function useCognitoOIDC() {
  const auth = useAuth();

  // Transform auth state to match existing interface
  const user = cognitoOIDCService.getCurrentUserFromOIDC(auth.user);
  const isAuthenticated = cognitoOIDCService.isAuthenticated(auth);
  const authToken = cognitoOIDCService.getAuthToken(auth.user);

  // Sign in method
  const signIn = async () => {
    try {
      await auth.signinRedirect();
      return { success: true };
    } catch (error) {
      console.error('OIDC sign in error:', error);
      return {
        success: false,
        error: cognitoOIDCService.formatError(error)
      };
    }
  };

  // Sign out method
  const signOut = async () => {
    try {
      // Custom sign out with redirect to Cognito logout endpoint
      const clientId = import.meta.env.VITE_COGNITO_APP_CLIENT_ID;
      const logoutUri = import.meta.env.VITE_COGNITO_LOGOUT_URI || window.location.origin;
      const cognitoDomain = `https://${import.meta.env.VITE_COGNITO_DOMAIN}.auth.${import.meta.env.VITE_AWS_REGION}.amazoncognito.com`;
      
      // Clear local session first
      await auth.removeUser();
      
      // Redirect to Cognito logout
      window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
      
      return { success: true };
    } catch (error) {
      console.error('OIDC sign out error:', error);
      return {
        success: false,
        error: cognitoOIDCService.formatError(error)
      };
    }
  };

  // Get current user
  const getCurrentUser = async () => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    return user;
  };

  return {
    // State
    user,
    isAuthenticated,
    isLoading: auth.isLoading,
    error: cognitoOIDCService.formatError(auth.error),
    authToken,

    // Methods
    signIn,
    signOut,
    getCurrentUser,

    // Raw OIDC auth object for advanced usage
    oidcAuth: auth,

    // Helper methods
    hasRole: (role) => user?.role === role,
    isAdmin: () => user?.role === 'admin',
    isUser: () => user?.role === 'user'
  };
}

export default cognitoOIDCService;
