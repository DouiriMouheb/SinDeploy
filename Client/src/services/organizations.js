// services/organizations.js - Updated for new API structure
import { apiClient } from "./api";

export const organizationService = {
  // Get user's organizations (NEW - users can belong to multiple orgs)
  async getUserOrganizations() {
    try {
      const response = await apiClient.get("/organizations");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching user organizations:", error);
      throw error;
    }
  },

  // Get all organizations (admin only)
  async getAll() {
    try {
      const response = await apiClient.get("/organizations");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching all organizations:", error);
      throw error;
    }
  },

  // Get single organization
  async getById(id) {
    try {
      const response = await apiClient.get(`/organizations/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching organization:", error);
      throw error;
    }
  },

  // Create organization (admin only)
  async create(data) {
    try {
      const response = await apiClient.post("/organizations", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating organization:", error);
      throw error;
    }
  },

  // Update organization (admin only)
  async update(id, data) {
    try {
      const response = await apiClient.put(`/organizations/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating organization:", error);
      throw error;
    }
  },

  // Delete organization (admin only)
  async delete(id) {
    try {
      const response = await apiClient.delete(`/organizations/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting organization:", error);
      throw error;
    }
  },

  // Get customers for an organization (NEW)
  async getCustomers(organizationId) {
    try {
      const response = await apiClient.get(
        `/organizations/${organizationId}/customers`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching organization customers:", error);
      throw error;
    }
  },

  // Assign user to organization (admin only, NEW)
  async assignUser(organizationId, userData) {
    try {
      const response = await apiClient.post(
        `/organizations/${organizationId}/users`,
        userData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error assigning user to organization:", error);
      throw error;
    }
  },

  // Remove user from organization (admin only, NEW)
  async removeUser(organizationId, userId) {
    try {
      const response = await apiClient.delete(
        `/organizations/${organizationId}/users/${userId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error removing user from organization:", error);
      throw error;
    }
  },

  // Backward compatibility methods
  async getDetails(organizationId) {
    return this.getById(organizationId);
  },

  async getProcesses(organizationId) {
    // Processes are now independent, redirect to process service
    console.warn(
      "getProcesses is deprecated. Use processService.getAll() instead."
    );
    return {
      success: true,
      data: { processes: [] },
    };
  },
};

export default organizationService;
