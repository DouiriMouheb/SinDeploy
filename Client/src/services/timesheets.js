// src/services/timesheets.js - NEW Timesheet API service
import { apiClient } from "./api";

export const timesheetService = {
  // Create a new time entry
  async createTimeEntry(entryData) {
    try {
      const response = await apiClient.post("/timesheets/entries", entryData);
      // Always return the actual time entry object
      return {
        success: true,
        data:
          response.data?.data?.timeEntry ||
          response.data?.timeEntry ||
          response.data,
      };
    } catch (error) {
      console.error("Error creating time entry:", error);
      throw error;
    }
  },

  // Get time entries with filtering
  async getTimeEntries(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/timesheets/entries?${queryParams.toString()}`
      );

      return {
        success: true,
        data:
          response.data?.data?.timeEntries ||
          response.data?.timeEntries ||
          response.data ||
          [],
      };
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }
  },

  // Update time entry
  async updateTimeEntry(entryId, entryData) {
    try {
      const response = await apiClient.put(
        `/timesheets/entries/${entryId}`,
        entryData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating time entry:", error);
      throw error;
    }
  },

  // Delete time entry
  async deleteTimeEntry(entryId) {
    try {
      const response = await apiClient.delete(`/timesheets/entries/${entryId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting time entry:", error);
      throw error;
    }
  },

  // Get time entry by ID
  async getTimeEntry(entryId) {
    try {
      const response = await apiClient.get(`/timesheets/entries/${entryId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching time entry:", error);
      throw error;
    }
  },

  // Helper method to calculate duration in minutes
  calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return Math.floor((end - start) / (1000 * 60)); // Duration in minutes
  },

  // Helper method to format duration for display
  formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },

  // Helper method to get work location address based on type
  getWorkLocationAddress(workLocationType, organization, customer, user) {
    switch (workLocationType) {
      case "organization":
        return organization?.address || "";
      case "customer":
        return customer?.address || "";
      case "home":
        return user?.homeAddress || "";
      default:
        return "";
    }
  },

  // Backward compatibility methods
  async getEntries(params = {}) {
    return this.getTimeEntries(params);
  },

  async createManualEntry(entryData) {
    return this.createTimeEntry(entryData);
  },

  async updateEntry(entryId, entryData) {
    return this.updateTimeEntry(entryId, entryData);
  },

  async deleteEntry(entryId) {
    return this.deleteTimeEntry(entryId);
  },

  // Get time entries for current user (from legacy timesheet.js)
  async getUserTimeEntries(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/timer/entries?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw error;
    }
  },

  // Get time entries for specific user (admin/manager only) (from legacy timesheet.js)
  async getUserTimeEntriesById(userId, filters = {}) {
    try {
      const params = new URLSearchParams();

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/timer/users/${userId}/entries?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user time entries:", error);
      throw error;
    }
  },
};

// Backward compatibility - expose as timerService for existing code
export const timerService = timesheetService;
