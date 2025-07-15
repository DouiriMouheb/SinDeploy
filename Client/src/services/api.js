// src/services/api.js - Fixed version for backend integration
class ApiClient {
  constructor() {
    // Use Caddy proxy - API calls go through the same domain
    this.baseURL = import.meta.env.VITE_API_URL || "/api";
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  // Save authentication tokens
  saveTokens(accessToken, refreshToken) {
    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", refreshToken);
  }

  // Clear authentication tokens
  clearTokens() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
  }

  // Get stored access token
  getAccessToken() {
    return sessionStorage.getItem("accessToken");
  }

  // Get stored refresh token
  getRefreshToken() {
    return sessionStorage.getItem("refreshToken");
  }

  // Enhanced error parser for structured error responses
  parseErrorResponse(response, data) {
    // Handle structured error responses from backend
    if (data && data.error) {
      return {
        success: false,
        error: {
          code: data.error.code,
          message: data.error.message,
          type: data.error.type,
          details: data.error.details,
          statusCode: response.status,
        },
      };
    }

    // Handle simple error responses
    if (data && data.message) {
      return {
        success: false,
        error: {
          code: "API_ERROR",
          message: data.message,
          type: "server",
          statusCode: response.status,
        },
      };
    }

    // Fallback error based on status code
    return {
      success: false,
      error: {
        code: "HTTP_ERROR",
        message: this.getStatusErrorMessage(response.status),
        type: "server",
        statusCode: response.status,
      },
    };
  }

  // Get user-friendly error messages for HTTP status codes
  getStatusErrorMessage(status) {
    const statusMessages = {
      400: "The request was invalid. Please check your input and try again.",
      401: "Your session has expired. Please log in again.",
      403: "You don't have permission to perform this action.",
      404: "The requested resource was not found.",
      408: "The request timed out. Please check your connection and try again.",
      409: "There was a conflict with your request. Please refresh and try again.",
      422: "The data you provided is invalid. Please check and try again.",
      429: "Too many requests. Please wait a moment before trying again.",
      500: "A server error occurred. Please try again later.",
      502: "The server is temporarily unavailable. Please try again later.",
      503: "The service is temporarily unavailable. Please try again later.",
      504: "The request timed out. Please try again later.",
    };

    return (
      statusMessages[status] ||
      `An unexpected error occurred (${status}). Please try again.`
    );
  }

  // Enhanced network error handling
  handleNetworkError(error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message:
            "Unable to connect to the server. Please check your internet connection and try again.",
          type: "network",
          details: {
            suggestion:
              "Check your internet connection, then refresh the page and try again.",
          },
        },
      };
    }

    if (error.name === "AbortError") {
      return {
        success: false,
        error: {
          code: "REQUEST_CANCELLED",
          message: "The request was cancelled. Please try again.",
          type: "network",
        },
      };
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred. Please try again.",
        type: "unknown",
        details: {
          suggestion: "If this problem persists, please contact support.",
        },
      },
    };
  }

  // Main request method with enhanced error handling
  async request(endpoint, options = {}) {
    const {
      method = "GET",
      body,
      headers = {},
      skipAuth = false,
      timeout = 30000,
      ...otherOptions
    } = options;

    const url = `${this.baseURL}${endpoint}`;
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add authorization header if not skipped and token exists
    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    // Create AbortController for request timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
      ...otherOptions,
    };

    if (body && method !== "GET") {
      requestOptions.body = body;
    }

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Try to parse JSON response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        // If response is not JSON, create a generic error
        data = {
          message: response.statusText || "Invalid response from server",
        };
      }

      // Handle successful responses
      if (response.ok) {
        // Return the data directly - backend already returns proper structure
        return data;
      }

      // Handle 401 (Unauthorized) - try to refresh token
      if (
        response.status === 401 &&
        !skipAuth &&
        !endpoint.includes("/auth/refresh") &&
        !endpoint.includes("/auth/login")
      ) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry the original request with new token
          requestHeaders.Authorization = `Bearer ${this.getAccessToken()}`;

          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(
            () => retryController.abort(),
            timeout
          );

          try {
            const retryResponse = await fetch(url, {
              ...requestOptions,
              headers: requestHeaders,
              signal: retryController.signal,
            });
            clearTimeout(retryTimeoutId);

            const retryData = await retryResponse.json();

            if (retryResponse.ok) {
              return retryData;
            } else {
              return this.parseErrorResponse(retryResponse, retryData);
            }
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            return this.handleNetworkError(retryError);
          }
        } else {
          // Refresh failed, clear tokens and return auth error
          this.clearTokens();
          return {
            success: false,
            error: {
              code: "SESSION_EXPIRED",
              message: "Your session has expired. Please log in again.",
              type: "authentication",
              details: {
                suggestion: "Please log in again to continue.",
                requiresLogin: true,
              },
            },
          };
        }
      }

      // Parse and return error for non-401 errors
      return this.parseErrorResponse(response, data);
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle specific error types
      if (error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "REQUEST_TIMEOUT",
            message: "The request took too long to complete. Please try again.",
            type: "network",
            details: {
              suggestion: "Check your internet connection and try again.",
            },
          },
        };
      }

      return this.handleNetworkError(error);
    }
  }

  // Enhanced refresh token method
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const result = await this.request("/auth/refresh", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ refreshToken }),
      });

      if (result.success && result.data.tokens) {
        this.saveTokens(
          result.data.tokens.accessToken,
          result.data.tokens.refreshToken
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }

  // Convenience methods for common HTTP verbs
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // Enhanced auth-specific methods
  async login(email, password) {
    try {
      const result = await this.request("/auth/login", {
        method: "POST",
        skipAuth: true,
        body: JSON.stringify({ email, password }),
      });

      if (result.success) {
        this.saveTokens(
          result.data.tokens.accessToken,
          result.data.tokens.refreshToken
        );
        sessionStorage.setItem("user", JSON.stringify(result.data.user));
        return result;
      } else {
        throw result.error;
      }
    } catch (error) {
      if (error.code && error.message) {
        throw error;
      }

      throw {
        code: "LOGIN_ERROR",
        message: error.message || "Login failed due to an unexpected error.",
        type: "unknown",
        details: {
          suggestion:
            "Please try again. If the problem persists, contact support.",
        },
      };
    }
  }

  async getCurrentUser() {
    try {
      const result = await this.request("/auth/me");

      if (result.success) {
        return result.data.user;
      } else {
        throw result.error;
      }
    } catch (error) {
      if (error.code && error.message) {
        throw error;
      }

      throw {
        code: "PROFILE_ERROR",
        message: error.message || "Failed to get user profile.",
        type: "server",
      };
    }
  }

  async logout() {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        await this.request("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const result = await this.request("/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (result.success) {
        return result;
      } else {
        throw result.error;
      }
    } catch (error) {
      if (error.code && error.message) {
        throw error;
      }

      throw {
        code: "PASSWORD_CHANGE_ERROR",
        message: error.message || "Failed to change password.",
        type: "server",
      };
    }
  }

  // Helper method to check if an error requires user login
  isAuthError(error) {
    return (
      error &&
      (error.code === "SESSION_EXPIRED" ||
        error.code === "INVALID_TOKEN" ||
        error.code === "TOKEN_EXPIRED" ||
        error.details?.requiresLogin === true)
    );
  }

  // Helper method to format error for display
  formatErrorForDisplay(error) {
    if (!error) return "An unknown error occurred.";
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    return "An unexpected error occurred.";
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export { ApiClient };
