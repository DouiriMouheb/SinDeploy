// src/services/processes.js - Updated for new API structure
import { apiClient } from "./api";

export const processService = {
  // Get all processes with their activities
  async getAll() {
    try {
      const response = await apiClient.get("/processes");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching processes:", error);
      throw error;
    }
  },

  // Alias for getAll - for compatibility
  async getProcesses() {
    return this.getAll();
  },

  // Get single process
  async getById(id) {
    try {
      const response = await apiClient.get(`/processes/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching process:", error);
      throw error;
    }
  },

  // Get activities for a specific process
  async getActivities(processId) {
    try {
      const response = await apiClient.get(
        `/processes/${processId}/activities`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching process activities:", error);
      throw error;
    }
  },

  // Get all activities from all processes
  async getAllActivities() {
    try {
      const processesResult = await this.getAll();
      const processes = processesResult.data?.processes || [];

      const allActivities = [];
      for (const process of processes) {
        try {
          const activitiesResult = await this.getActivities(process.id);
          const activities = activitiesResult.data?.activities || [];
          allActivities.push(...activities);
        } catch (error) {
          console.warn(
            `Failed to fetch activities for process ${process.id}:`,
            error
          );
        }
      }

      return {
        success: true,
        data: allActivities,
      };
    } catch (error) {
      console.error("Error fetching all activities:", error);
      throw error;
    }
  },

  // Create process (admin only)
  async create(data) {
    try {
      const response = await apiClient.post("/processes", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating process:", error);
      throw error;
    }
  },

  // Update process (admin only)
  async update(id, data) {
    try {
      const response = await apiClient.put(`/processes/${id}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating process:", error);
      throw error;
    }
  },

  // Delete process (admin only)
  async delete(id) {
    try {
      const response = await apiClient.delete(`/processes/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting process:", error);
      throw error;
    }
  },

  // Create activity for a process (admin only)
  async createActivity(processId, data) {
    try {
      const response = await apiClient.post(
        `/processes/${processId}/activities`,
        data
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },

  // Update activity (admin only)
  async updateActivity(processId, activityId, data) {
    try {
      const response = await apiClient.put(
        `/processes/${processId}/activities/${activityId}`,
        data
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  },

  // Delete activity (admin only)
  async deleteActivity(processId, activityId) {
    try {
      const response = await apiClient.delete(
        `/processes/${processId}/activities/${activityId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  },

  // Get all processes with activities (helper method)
  async getAllWithActivities() {
    try {
      const processesResult = await this.getAll();
      const processes = processesResult.data?.processes || [];

      // Fetch activities for each process
      const processesWithActivities = await Promise.all(
        processes.map(async (process) => {
          try {
            const activitiesResult = await this.getActivities(process.id);
            return {
              ...process,
              activities: activitiesResult.data?.activities || [],
            };
          } catch (error) {
            console.warn(
              `Failed to fetch activities for process ${process.id}:`,
              error
            );
            return {
              ...process,
              activities: [],
            };
          }
        })
      );

      return {
        success: true,
        data: {
          processes: processesWithActivities,
        },
      };
    } catch (error) {
      console.error("Error fetching processes with activities:", error);
      throw error;
    }
  },

  // Get all activities across all processes (for TimeSheetList)
  async getActivities() {
    try {
      const processesResult = await this.getAllWithActivities();
      if (processesResult.success) {
        // Extract all activities from all processes
        const allActivities = processesResult.data.processes.reduce(
          (acc, process) => {
            if (process.activities) {
              const activitiesWithProcess = process.activities.map(
                (activity) => ({
                  ...activity,
                  processId: process.id,
                  processName: process.name,
                })
              );
              acc.push(...activitiesWithProcess);
            }
            return acc;
          },
          []
        );
        return {
          success: true,
          data: allActivities,
        };
      }
      return processesResult;
    } catch (error) {
      console.error("Error fetching all activities:", error);
      throw error;
    }
  },

  // Create new process
  async create(processData) {
    try {
      const response = await apiClient.post("/processes", processData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating process:", error);
      throw error;
    }
  },

  // Update process
  async update(id, processData) {
    try {
      const response = await apiClient.put(`/processes/${id}`, processData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating process:", error);
      throw error;
    }
  },

  // Delete process
  async delete(id) {
    try {
      const response = await apiClient.delete(`/processes/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting process:", error);
      throw error;
    }
  },

  // Create activity for process
  async createActivity(processId, activityData) {
    try {
      const response = await apiClient.post(
        `/processes/${processId}/activities`,
        activityData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  },

  // Update activity
  async updateActivity(processId, activityId, activityData) {
    try {
      const response = await apiClient.put(
        `/processes/${processId}/activities/${activityId}`,
        activityData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating activity:", error);
      throw error;
    }
  },

  // Delete activity
  async deleteActivity(processId, activityId) {
    try {
      const response = await apiClient.delete(
        `/processes/${processId}/activities/${activityId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  },
};

export default processService;
