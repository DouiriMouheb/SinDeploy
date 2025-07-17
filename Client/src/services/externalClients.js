// Client/src/services/externalClients.js - External Sinergia API Service
import { apiClient } from "./api";

export const externalClientsService = {
  // Get all available organizations
  async getOrganizations() {
    try {
      const response = await apiClient.get("/external-clients/organizations");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }
  },

  // Get organization by code
  async getOrganizationByCode(code) {
    try {
      const response = await apiClient.get(`/external-clients/organizations/${code}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching organization:", error);
      throw error;
    }
  },

  // Get all clients for a specific organization with pagination
  async getClientsForOrganization(organizationCode, options = {}) {
    try {
      const { page = 1, limit = 10, search = "" } = options;
      const params = new URLSearchParams();

      params.append("page", page.toString());
      params.append("limit", limit.toString());

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const endpoint = `/external-clients/organizations/${organizationCode}/clients?${params.toString()}`;

      const response = await apiClient.get(endpoint);
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error fetching clients:", error);
      throw error;
    }
  },

  // Get client statistics for an organization
  async getClientStats(organizationCode) {
    try {
      const response = await apiClient.get(
        `/external-clients/organizations/${organizationCode}/stats`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching client statistics:", error);
      throw error;
    }
  },

  // Refresh OAuth token (for debugging)
  async refreshToken() {
    try {
      const response = await apiClient.post("/external-clients/refresh-token");
      return {
        success: true,
        data: response.data,
        message: response.message,
      };
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  },
};
