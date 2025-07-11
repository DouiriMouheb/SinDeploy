// src/services/services.js
// Utility functions and helpers for services
// This file contains shared utilities used across different services

import { apiClient } from "./api";

// Generic API response handler
export const handleApiResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed with status ${response.status}`
    );
  }

  return data;
};

// Generic GET request with query parameters
export const fetchWithParams = async (endpoint, params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (Array.isArray(value)) {
        value.forEach((item) => queryParams.append(key, item));
      } else {
        queryParams.append(key, value);
      }
    }
  });

  const url = queryParams.toString()
    ? `${endpoint}?${queryParams.toString()}`
    : endpoint;
  const response = await apiClient.request(url);
  return handleApiResponse(response);
};

// Generic POST request
export const createResource = async (endpoint, data) => {
  const response = await apiClient.request(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
};

// Generic PUT request
export const updateResource = async (endpoint, data) => {
  const response = await apiClient.request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
};

// Generic PATCH request
export const patchResource = async (endpoint, data) => {
  const response = await apiClient.request(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
};

// Generic DELETE request
export const deleteResource = async (endpoint) => {
  const response = await apiClient.request(endpoint, {
    method: "DELETE",
  });
  return handleApiResponse(response);
};

// File upload helper
export const uploadFile = async (endpoint, file, additionalData = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await apiClient.request(endpoint, {
    method: "POST",
    body: formData,
    headers: {}, // Let browser set Content-Type for FormData
  });

  return handleApiResponse(response);
};

// Batch operations helper
export const batchUpdate = async (endpoint, updates) => {
  const response = await apiClient.request(`${endpoint}/batch`, {
    method: "PUT",
    body: JSON.stringify({ updates }),
  });
  return handleApiResponse(response);
};

// Search helper with debouncing support
export const searchResources = async (endpoint, query, filters = {}) => {
  const params = {
    q: query,
    ...filters,
  };

  return fetchWithParams(`${endpoint}/search`, params);
};

// Statistics helper
export const getResourceStats = async (endpoint, timeframe = "30d") => {
  return fetchWithParams(`${endpoint}/stats`, { timeframe });
};

// Export all service implementations

export { userService } from "./users";
export { authService } from "./auth";
