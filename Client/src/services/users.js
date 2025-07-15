// src/services/users.js - Enhanced and fixed for backend integration
import { apiClient } from "./api";

export const userService = {
  // Get all users (managers and admins only)
  async getUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/admin/users${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw {
        message: error.message || "Failed to fetch users",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get single user by ID
  async getUser(id) {
    try {
   
      const response = await apiClient.get(`/admin/users/${id}`);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch user");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      throw {
        message: error.message || "Failed to fetch user",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get current user's complete profile
  async getProfile() {
    try {
      const response = await apiClient.get("/users/me");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw {
        message: error.message || "Failed to fetch profile",
        code: error.code || "FETCH_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Update current user's profile
  async updateProfile(userData) {
    try {
      const response = await apiClient.put("/users/me", userData);

      if (response.success) {
        // Update stored user data
        const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        return response;
      } else {
        throw response.error || new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw {
        message: error.message || "Failed to update profile",
        code: error.code || "UPDATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Upload profile picture - FIXED VERSION
  async uploadProfilePicture(file) {
    try {
      // Validate file before upload
      if (!file) {
        throw {
          message: "No file selected",
          code: "VALIDATION_ERROR",
          type: "validation",
        };
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        throw {
          message:
            "Invalid file type. Only JPEG, PNG, and WebP images are allowed.",
          code: "INVALID_FILE_TYPE",
          type: "validation",
        };
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        throw {
          message: "File too large. Maximum size is 5MB.",
          code: "FILE_TOO_LARGE",
          type: "validation",
        };
      }

      // Create FormData
      const formData = new FormData();
      formData.append("profilePicture", file);

      // Get token and make request
      const token = apiClient.getAccessToken();
      if (!token) {
        throw {
          message: "Not authenticated",
          code: "NOT_AUTHENTICATED",
          type: "authentication",
        };
      }

      const response = await fetch(
        `${apiClient.baseURL}/users/me/profile-picture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - let browser set it for FormData
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw data.error || new Error(data.message || "Upload failed");
      }

      // Update stored user data with new profile picture
      const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...data.data.user };
      sessionStorage.setItem("user", JSON.stringify(updatedUser));

      return data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);

      // Re-throw structured errors
      if (error.code && error.message) {
        throw error;
      }

      throw {
        message: error.message || "Failed to upload profile picture",
        code: error.code || "UPLOAD_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Remove profile picture
  async removeProfilePicture() {
    try {
      const response = await apiClient.delete("/users/me/profile-picture");

      if (response.success) {
        // Update stored user data
        const currentUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, ...response.data.user };
        sessionStorage.setItem("user", JSON.stringify(updatedUser));

        return response;
      } else {
        throw response.error || new Error("Failed to remove profile picture");
      }
    } catch (error) {
      console.error("Error removing profile picture:", error);
      throw {
        message: error.message || "Failed to remove profile picture",
        code: error.code || "DELETE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      throw {
        message: error.message || "Failed to change password",
        code: error.code || "PASSWORD_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Create new user (admin only)
  async createUser(userData) {
    try {
      const response = await apiClient.post("/users", userData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw {
        message: error.message || "Failed to create user",
        code: error.code || "CREATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Update user by ID (role-based permissions)
  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, userData);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      throw {
        message: error.message || "Failed to update user",
        code: error.code || "UPDATE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Activate/deactivate user
  async toggleUserStatus(id, isActive) {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, { isActive });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      throw {
        message: error.message || "Failed to update user status",
        code: error.code || "STATUS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Reset user password (admin only)
  async resetUserPassword(id, newPassword = null, forcePasswordChange = true) {
    try {
      // If no password provided, let backend generate one
      const payload = { forcePasswordChange };
      if (newPassword) {
        payload.password = newPassword;
      }

      const response = await apiClient.put(
        `/admin/users/${id}/reset-password`,
        payload
      );

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to reset password");
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      throw {
        message: error.message || "Failed to reset password",
        code: error.code || "PASSWORD_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Change user role (admin only)
  async changeUserRole(id, role) {
    try {
      const response = await apiClient.put(`/admin/users/${id}`, { role });

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to change user role");
      }
    } catch (error) {
      console.error("Error changing user role:", error);
      throw {
        message: error.message || "Failed to change user role",
        code: error.code || "ROLE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/admin/users/${id}`);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      throw {
        message: error.message || "Failed to delete user",
        code: error.code || "DELETE_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Get user statistics (admin only)
  async getUserStats() {
    try {
      const response = await apiClient.get("/admin/users/stats");

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to fetch user statistics");
      }
    } catch (error) {
      console.error("Error fetching user statistics:", error);
      throw {
        message: error.message || "Failed to fetch user statistics",
        code: error.code || "STATS_ERROR",
        type: error.type || "server",
      };
    }
  },

  // Export users (admin only)
  async exportUsers(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/admin/users/export${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await apiClient.get(endpoint);

      if (response.success) {
        return response;
      } else {
        throw response.error || new Error("Failed to export users");
      }
    } catch (error) {
      console.error("Error exporting users:", error);
      throw {
        message: error.message || "Failed to export users",
        code: error.code || "EXPORT_ERROR",
        type: error.type || "server",
      };
    }
  },
};
