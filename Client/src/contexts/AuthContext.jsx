// src/contexts/AuthContext.jsx - Enhanced Dual Auth (JWT + OIDC) Context
import React, { createContext, useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { useCognitoOIDC } from "../services/cognitoOIDC";
import { showToast } from "../utils/toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Dual Auth State
  const [authMethod, setAuthMethod] = useState('oidc'); // 'jwt' or 'oidc'
  const [availableAuthMethods] = useState(['jwt', 'oidc']);

  // OIDC Auth Hook
  const oidcAuth = useCognitoOIDC();

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for saved auth method preference
      const savedAuthMethod = sessionStorage.getItem("authMethod") || 'oidc';
      setAuthMethod(savedAuthMethod);

      // Try to restore session based on auth method
      if (savedAuthMethod === 'oidc') {
        await initializeOIDCAuth();
      } else {
        await initializeJWTAuth();
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearAuthData();
    } finally {
      setIsInitialized(true);
    }
  };

  const initializeJWTAuth = async () => {
    // Check if we have tokens and user data in sessionStorage
    const savedUser = sessionStorage.getItem("user");
    const accessToken = sessionStorage.getItem("accessToken");

    if (savedUser && accessToken) {
      try {
        // Parse the saved user data first for immediate UI update
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);

        // Then validate the token in the background
        const currentUser = await apiClient.getCurrentUser();

        // Update with fresh data from server if different
        if (JSON.stringify(currentUser) !== JSON.stringify(parsedUser)) {
          setUser(currentUser);
          sessionStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (error) {
        // Token might be expired or invalid, clear stored data
        console.error("Failed to validate stored JWT token:", error);
        clearAuthData();

        // Only show session expired if it was actually an auth error
        if (apiClient.isAuthError(error)) {
          showToast.auth.sessionExpired();
        }
      }
    }
  };

  const initializeOIDCAuth = async () => {
    try {
      // OIDC initialization is handled by the AuthProvider in main.jsx
      // We just need to sync the state when OIDC auth is ready
      if (oidcAuth.isAuthenticated && oidcAuth.user) {
        setUser(oidcAuth.user);
        console.log('✅ Restored OIDC session:', oidcAuth.user.email);
      }
    } catch (error) {
      console.log('ℹ️ No existing OIDC session found');
      clearAuthData();
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setError(null);
    apiClient.clearTokens();
  };

  const login = async (email, password, method = authMethod) => {
    try {
      setLoading(true);
      setError(null);

      let result;
      if (method === 'oidc') {
        result = await loginWithOIDC();
      } else {
        result = await loginWithJWT(email, password);
      }

      if (result.success) {
        setUser(result.data.user);
        setAuthMethod(method);
        sessionStorage.setItem("authMethod", method);
        return { success: true, data: result.data };
      } else {
        throw result.error || new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithJWT = async (email, password) => {
    const result = await apiClient.login(email, password);
    return result;
  };

  const loginWithOIDC = async () => {
    const result = await oidcAuth.signIn();
    return result;
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Logout from the appropriate service
      if (authMethod === 'oidc') {
        await oidcAuth.signOut();
      } else {
        await apiClient.logout();
      }

      showToast.auth.logoutSuccess();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setLoading(false);
    }
  };

  // Note: User signup is not available - accounts must be created by administrators

  // Method to switch auth methods
  const switchAuthMethod = (newMethod) => {
    if (availableAuthMethods.includes(newMethod)) {
      setAuthMethod(newMethod);
      sessionStorage.setItem("authMethod", newMethod);
      console.log(`🔄 Switched to ${newMethod} authentication`);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setError(null);
      setLoading(true);

      const result = await apiClient.changePassword(
        currentPassword,
        newPassword
      );

      showToast.success("Password changed successfully. Please log in again.", {
        duration: 4000,
      });

      setTimeout(() => {
        logout();
      }, 1000);

      return { success: true };
    } catch (error) {
      console.error("Password change error:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;

    const roleHierarchy = { admin: 2, user: 1 };
    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  const clearError = () => {
    setError(null);
  };

  // FIXED: Enhanced refreshUser method
  const refreshUser = async () => {
    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
      sessionStorage.setItem("user", JSON.stringify(currentUser));
      return currentUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);

      if (apiClient.isAuthError(error)) {
        clearAuthData();
        showToast.auth.sessionExpired();
      }

      throw error;
    }
  };

  // FIXED: Helper to update user data (for profile updates)
  const updateUserData = (updates) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    sessionStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    // State
    user,
    loading,
    error,
    isInitialized,

    // Multi Auth State
    authMethod,
    availableAuthMethods,

    // Actions
    login,
    logout,
    changePassword,
    refreshUser,
    clearError,
    updateUserData,

    // Auth Method Switching
    switchAuthMethod,

    // Auth Method Specific Actions
    loginWithJWT,
    loginWithOIDC,

    // OIDC Auth Object (for advanced usage)
    oidcAuth,

    // Helpers
    hasRole,
    isAuthenticated: !!user,
    userRole: user?.role,
    userName: user?.name,

    // Auth Method Helpers
    isJWTAuth: authMethod === 'jwt',
    isOIDCAuth: authMethod === 'oidc',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
