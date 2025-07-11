// src/services/index.js
// Main services export file - Updated for new API structure

// Core API client
export { apiClient, ApiClient } from "./api";

// Individual services
export { authService } from "./auth";
export { timesheetService, timerService } from "./timesheets"; // NEW: timesheets service, timer for backward compatibility
export { customerService } from "./customers";
export { projectService } from "./projects";
export { userService } from "./users";
export { dailyLoginService } from "./dailyLogin";
export { organizationService } from "./organizations";
export { processService } from "./processes";

// Import services for the combined object
import { authService } from "./auth";
import { timesheetService } from "./timesheets";
import { customerService } from "./customers";
import { projectService } from "./projects";
import { userService } from "./users";
import { dailyLoginService } from "./dailyLogin";
import { organizationService } from "./organizations";
import { processService } from "./processes";

// Combined services object for convenience
export const services = {
  auth: authService,
  timesheets: timesheetService, // NEW: primary timesheet service
  timer: timesheetService, // Backward compatibility
  customers: customerService,
  projects: projectService,
  users: userService,
  dailyLogin: dailyLoginService,
  organizations: organizationService,
  processes: processService,
};

// Helper function to handle common API errors
export const handleApiError = (error) => {
  console.error("API Error:", error);

  // Check for network errors
  if (
    error.message?.includes("Network Error") ||
    error.message?.includes("fetch")
  ) {
    return "Unable to connect to server. Please check your internet connection.";
  }

  // Check for specific HTTP status codes
  if (
    error.message?.includes("401") ||
    error.message?.includes("Unauthorized")
  ) {
    return "Your session has expired. Please log in again.";
  }

  if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
    return "You do not have permission to perform this action.";
  }

  if (error.message?.includes("404") || error.message?.includes("Not Found")) {
    return "The requested resource was not found.";
  }

  if (
    error.message?.includes("500") ||
    error.message?.includes("Internal Server Error")
  ) {
    return "A server error occurred. Please try again later.";
  }

  if (
    error.message?.includes("502") ||
    error.message?.includes("Bad Gateway")
  ) {
    return "Server is temporarily unavailable. Please try again later.";
  }

  if (
    error.message?.includes("503") ||
    error.message?.includes("Service Unavailable")
  ) {
    return "Service is temporarily unavailable. Please try again later.";
  }

  // Return the original error message if no specific pattern matches
  return error.message || "An unexpected error occurred.";
};

// Validation helpers
export const validateRequiredFields = (data, requiredFields) => {
  const missing = [];

  requiredFields.forEach((field) => {
    const value = data[field];
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0)
    ) {
      missing.push(field);
    }
  });

  return missing;
};

// Helper to validate email format
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to format API responses consistently
export const formatApiResponse = (data, message = "Success") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

// Helper to format API errors consistently
export const formatApiError = (error, code = "UNKNOWN_ERROR") => {
  return {
    success: false,
    error: {
      code,
      message: error.message || "An unexpected error occurred",
      details: error.details || null,
    },
    timestamp: new Date().toISOString(),
  };
};

// Debounce helper for API calls (useful for search inputs)
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Helper to convert query parameters to URL string
export const buildQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, item));
      } else {
        searchParams.append(key, value);
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};
