// src/services/customers.js - Customer management service (Updated for new API)
import { apiClient } from "./api";

export const customerService = {
  // Get all customers with optional filters (admin only)
  async getCustomers(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(`/customers?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw error;
    }
  },

  // Get customers by organization (NEW - customers are now filtered by organization)
  async getCustomersByOrganization(organizationId) {
    try {
      const response = await apiClient.get(
        `/organizations/${organizationId}/customers`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching customers by organization:", error);
      throw error;
    }
  },

  // Get customer by ID
  async getCustomer(customerId) {
    try {
      const response = await apiClient.get(`/customers/${customerId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw error;
    }
  },

  // Create new customer (admin only)
  async createCustomer(customerData) {
    try {
      console.log("Creating customer with data:", customerData);
      const response = await apiClient.post("/customers", customerData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  // Update customer (admin only)
  async updateCustomer(customerId, customerData) {
    try {
      console.log("Updating customer with data:", customerData);
      const response = await apiClient.put(
        `/customers/${customerId}`,
        customerData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  // Delete customer (admin only)
  async deleteCustomer(customerId) {
    try {
      const response = await apiClient.delete(`/customers/${customerId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};
