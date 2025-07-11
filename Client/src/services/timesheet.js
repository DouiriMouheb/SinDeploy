// src/services/timesheet.js - Timesheet reporting service
import { apiClient } from "./api";

export const timesheetService = {
  // Get time entries for current user
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

  // Get time entries for specific user (admin/manager only)
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
