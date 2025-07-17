// src/services/dailyLogin.js - Daily login tracking service
import { apiClient } from "./api";

export const dailyLoginService = {
 

  /**
   * End the current day for the user
   * @param {string} notes - Optional notes about the day
   * @param {string} location - Optional location info
   */
  async endDay(notes = null, location = null) {
    try {
      const response = await apiClient.post("/daily-login/end-day", {
        notes,
        location,
      });
      return response;
    } catch (error) {
      console.error("Error ending day:", error);
      throw error;
    }
  },

  /**
   * Get login history for current user
   * @param {Object} options - Query options
   * @param {string} options.startDate - Start date filter (YYYY-MM-DD)
   * @param {string} options.endDate - End date filter (YYYY-MM-DD)
   * @param {number} options.limit - Maximum number of records
   * @param {number} options.offset - Number of records to skip
   */
  async getHistory(options = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/daily-login/history?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching login history:", error);
      throw error;
    }
  },

  /**
   * Get login history for a specific user (admin only)
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   */
  async getUserHistory(userId, options = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/daily-login/user/${userId}/history?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching user login history:", error);
      throw error;
    }
  },

  /**
   * Get team overview (admin only)
   * @param {Object} options - Query options
   * @param {string} options.date - Specific date (YYYY-MM-DD)
   * @param {string} options.startDate - Start date filter
   * @param {string} options.endDate - End date filter
   */
  async getTeamOverview(options = {}) {
    try {
      const params = new URLSearchParams();
      Object.entries(options).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await apiClient.get(
        `/daily-login/team-overview?${params.toString()}`
      );
      return response;
    } catch (error) {
      console.error("Error fetching team overview:", error);
      throw error;
    }
  },


  /**
   * Format working hours for display
   * @param {number} hours - Hours as decimal (e.g., 8.5)
   * @returns {string} Formatted string (e.g., "8h 30m")
   */
  formatWorkingHours(hours) {
    if (!hours || hours <= 0) return "0h 0m";

    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    return `${wholeHours}h ${minutes}m`;
  },

  /**
   * Format time for display
   * @param {string|Date} dateString - Date string or Date object
   * @returns {string} Formatted time string
   */
  formatTime(dateString) {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return "Invalid time";
    }
  },

  /**
   * Format date for display
   * @param {string|Date} dateString - Date string or Date object
   * @returns {string} Formatted date string
   */
  formatDate(dateString) {
    if (!dateString) return "N/A";

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  },
};
