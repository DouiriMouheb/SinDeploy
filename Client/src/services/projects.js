// src/services/projects.js - Project management service
import { apiClient } from "./api";

export const projectService = {
  // Get all projects (Admin only)
  async getProjects(filters = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = queryString ? `/projects?${queryString}` : "/projects";

      const response = await apiClient.get(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }
  },

  // Get project by ID
  async getProject(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching project:", error);
      throw error;
    }
  },

  // Get projects for a specific customer
  async getProjectsByCustomer(customerId, filters = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = queryString
        ? `/projects/customer/${customerId}?${queryString}`
        : `/projects/customer/${customerId}`;

      const response = await apiClient.get(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching customer projects:", error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const response = await apiClient.post("/projects", projectData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating project:", error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, projectData) {
    try {
      const response = await apiClient.put(
        `/projects/${projectId}`,
        projectData
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await apiClient.delete(`/projects/${projectId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },

  // Get time entries for a project
  async getProjectTimeEntries(projectId, filters = {}) {
    try {
      const params = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      const queryString = params.toString();
      const endpoint = queryString
        ? `/projects/${projectId}/time-entries?${queryString}`
        : `/projects/${projectId}/time-entries`;

      const response = await apiClient.get(endpoint);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching project time entries:", error);
      throw error;
    }
  },

  // Get project statistics
  async getProjectStats(projectId) {
    try {
      const response = await apiClient.get(`/projects/${projectId}/stats`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching project statistics:", error);
      throw error;
    }
  },

  // Helper method to filter projects by status
  filterProjectsByStatus(projects, status) {
    if (!status || status === "all") return projects;
    return projects.filter((project) => project.status === status);
  },

  // Helper method to get project status badge color
  getStatusBadgeColor(status) {
    const colors = {
      planning: "bg-yellow-100 text-yellow-800",
      active: "bg-green-100 text-green-800",
      "on-hold": "bg-orange-100 text-orange-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  },

  // Helper method to format project duration
  formatProjectDuration(startDate, endDate) {
    if (!startDate || !endDate) return "Duration not set";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day";
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.round(diffDays / 30)} months`;
    return `${Math.round(diffDays / 365)} years`;
  },
};
