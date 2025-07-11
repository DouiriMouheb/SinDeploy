// src/services/auth.js
import { apiClient } from "./api";

export const authService = {
  // Login user
  async login(email, password) {
    return apiClient.login(email, password);
  },

  // Get current user profile
  async getCurrentUser() {
    return apiClient.getCurrentUser();
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    return apiClient.changePassword(currentPassword, newPassword);
  },

  // Logout user
  async logout() {
    return apiClient.logout();
  },

  // Refresh access token
  async refreshToken() {
    return apiClient.refreshToken();
  },

  // Additional auth-related methods not in the main API client

  // Request password reset
  async requestPasswordReset(email) {
    try {
      const response = await apiClient.request("/auth/forgot-password", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset request failed");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Password reset request failed");
    }
  },

  // Reset password with token
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.request("/auth/reset-password", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Password reset failed");
    }
  },

  // Verify email address
  async verifyEmail(token) {
    try {
      const response = await apiClient.request("/auth/verify-email", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Email verification failed");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Email verification failed");
    }
  },

  // Resend verification email
  async resendVerificationEmail(email) {
    try {
      const response = await apiClient.request("/auth/resend-verification", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Failed to resend verification email");
    }
  },

  // Check if user session is valid
  async validateSession() {
    try {
      const response = await apiClient.request("/auth/validate");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Session validation failed");
      }

      return data.data.valid;
    } catch (error) {
      console.error("Session validation error:", error);
      return false;
    }
  },

  // Update user profile (basic info)
  async updateProfile(profileData) {
    try {
      const response = await apiClient.request("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Profile update failed");
      }

      // Update stored user data
      const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...data.data.user };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return data;
    } catch (error) {
      throw new Error(error.message || "Profile update failed");
    }
  },

  // Get user preferences
  async getPreferences() {
    try {
      const response = await apiClient.request("/auth/preferences");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to get preferences");
      }

      return data.data.preferences;
    } catch (error) {
      throw new Error(error.message || "Failed to get preferences");
    }
  },

  // Update user preferences
  async updatePreferences(preferences) {
    try {
      const response = await apiClient.request("/auth/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update preferences");
      }

      return data.data.preferences;
    } catch (error) {
      throw new Error(error.message || "Failed to update preferences");
    }
  },
};
