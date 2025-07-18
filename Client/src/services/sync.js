// Client/src/services/sync.js - Sync service for external data
import { apiClient } from "./api";

export const syncService = {
  // Initialize external organizations
  async initialize() {
    try {
      const response = await apiClient.post("/sync/initialize");
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error initializing sync:", error);
      throw error;
    }
  },

  // Sync specific organization
  async syncOrganization(organizationCode) {
    try {
      const response = await apiClient.post(`/sync/organization/${organizationCode}`);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error syncing organization:", error);
      throw error;
    }
  },

  // Sync all organizations
  async syncAll() {
    try {
      const response = await apiClient.post("/sync/all");
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error syncing all organizations:", error);
      throw error;
    }
  },

  // Get sync status
  async getStatus() {
    try {
      const response = await apiClient.get("/sync/status");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error getting sync status:", error);
      throw error;
    }
  },

  // Reset organization sync (for testing)
  async resetOrganization(organizationCode) {
    try {
      const response = await apiClient.delete(`/sync/organization/${organizationCode}`);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error resetting organization sync:", error);
      throw error;
    }
  },
};
