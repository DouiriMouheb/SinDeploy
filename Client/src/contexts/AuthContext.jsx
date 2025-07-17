// src/contexts/AuthContext.jsx - Key fixes for better API integration
import React, { createContext, useState, useEffect } from "react";
import { apiClient } from "../services/api";
import { showToast } from "../utils/toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
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
          console.error("Failed to validate stored token:", error);
          clearAuthData();

          // Only show session expired if it was actually an auth error
          if (apiClient.isAuthError(error)) {
            showToast.auth.sessionExpired();
          }
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearAuthData();
    } finally {
      setIsInitialized(true);
    }
  };

  const clearAuthData = () => {
    setUser(null);
    setError(null);
    apiClient.clearTokens();
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiClient.login(email, password);

      if (result.success) {
        setUser(result.data.user);
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

  const logout = async () => {
    try {
      setLoading(true);
      await apiClient.logout();
      showToast.auth.logoutSuccess();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
      setLoading(false);
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

    // Actions
    login,
    logout,
    changePassword,
    refreshUser,
    clearError,
    updateUserData, // NEW: Add this helper

    // Helpers
    hasRole,
    isAuthenticated: !!user,
    userRole: user?.role,
    userName: user?.name,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
