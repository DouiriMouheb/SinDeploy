// src/utils/errorHandler.js - Enhanced error handling for API integration
import { showToast } from "./toast";

// Enhanced error handler that works with backend error structure
export const handleApiError = (error, context = "operation") => {
  console.error(`API Error in ${context}:`, error);

  // Handle network errors first
  if (!navigator.onLine) {
    return showToast.error(
      "You appear to be offline. Please check your connection.",
      {
        duration: 8000,
      }
    );
  }

  // Handle structured errors from backend
  if (error?.code && error?.message) {
    switch (error.type) {
      case "authentication":
        return handleAuthError(error);

      case "account_status":
        return handleAccountStatusError(error);

      case "validation":
        return handleValidationError(error);

      case "permission":
        return handlePermissionError(error);

      case "rate_limit":
        return handleRateLimitError(error);

      case "network":
        return handleNetworkError(error);

      case "server":
        return handleServerError(error);

      default:
        return showToast.error(error.message || "An unexpected error occurred");
    }
  }

  // Handle simple error messages
  if (typeof error === "string") {
    return showToast.error(error);
  }

  if (error?.message) {
    return showToast.error(error.message);
  }

  // Fallback for unknown errors
  return showToast.error("An unexpected error occurred. Please try again.");
};

// Specific error type handlers
const handleAuthError = (error) => {
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      showToast.error("Invalid email or password. Please try again.", {
        duration: 5000,
      });

      // Show attempts warning if applicable
      if (
        error.details?.attemptsRemaining !== undefined &&
        error.details.attemptsRemaining <= 2
      ) {
        setTimeout(() => {
          showToast.auth.attemptsWarning(error.details.attemptsRemaining);
        }, 1500);
      }
      break;

    case "USER_NOT_FOUND":
      showToast.error("No account found with this email address.", {
        duration: 6000,
      });
      break;

    case "SESSION_EXPIRED":
      showToast.auth.sessionExpired();
      break;

    case "INVALID_TOKEN":
      showToast.auth.sessionExpired();
      break;

    default:
      showToast.error(error.message || "Authentication failed");
  }
};

const handleAccountStatusError = (error) => {
  switch (error.code) {
    case "ACCOUNT_LOCKED":
      showToast.auth.accountLocked(error.details);
      break;

    case "ACCOUNT_INACTIVE":
      showToast.error(
        "Your account has been deactivated. Please contact an administrator.",
        {
          duration: 10000,
        }
      );
      break;

    case "ACCOUNT_SUSPENDED":
      showToast.error(
        "Your account has been suspended. Please contact support.",
        {
          duration: 10000,
        }
      );
      break;

    default:
      showToast.error(error.message || "Account status error");
  }
};

const handleValidationError = (error) => {
  // For validation errors, show the specific message
  showToast.error(error.message, {
    duration: 6000,
  });

  // If there are field-specific details, you might want to handle them differently
  if (error.details?.field) {
    console.log(`Validation error on field: ${error.details.field}`);
  }
};

const handlePermissionError = (error) => {
  switch (error.code) {
    case "INSUFFICIENT_PERMISSIONS":
      showToast.error("You don't have permission to perform this action.", {
        duration: 6000,
      });
      break;

    case "DEPARTMENT_RESTRICTED":
      showToast.error("You can only access resources in your department.", {
        duration: 6000,
      });
      break;

    case "ROLE_REQUIRED":
      showToast.error(
        `This action requires ${
          error.details?.requiredRole || "higher"
        } permissions.`,
        {
          duration: 6000,
        }
      );
      break;

    default:
      showToast.error(error.message || "Access denied");
  }
};

const handleRateLimitError = (error) => {
  const retryAfter = error.details?.retryAfter;
  const message = retryAfter
    ? `Too many requests. Please wait ${retryAfter} seconds before trying again.`
    : "Too many requests. Please wait before trying again.";

  showToast.error(message, {
    duration: 8000,
  });
};

const handleNetworkError = (error) => {
  switch (error.code) {
    case "NETWORK_ERROR":
      showToast.error(
        "Unable to connect to server. Please check your connection.",
        {
          duration: 8000,
        }
      );
      break;

    case "REQUEST_TIMEOUT":
      showToast.error("Request timed out. Please try again.", {
        duration: 6000,
      });
      break;

    case "CONNECTION_REFUSED":
      showToast.error(
        "Server is currently unavailable. Please try again later.",
        {
          duration: 8000,
        }
      );
      break;

    default:
      showToast.error(error.message || "Network error occurred");
  }
};

const handleServerError = (error) => {
  switch (error.code) {
    case "DATABASE_ERROR":
      showToast.error("A database error occurred. Please try again later.", {
        duration: 8000,
      });
      break;

    case "FILE_UPLOAD_ERROR":
      showToast.error(
        "File upload failed. Please check the file and try again.",
        {
          duration: 6000,
        }
      );
      break;

    case "EMAIL_SEND_ERROR":
      showToast.error("Failed to send email notification.", {
        duration: 6000,
      });
      break;

    case "EXTERNAL_SERVICE_ERROR":
      showToast.error("An external service is currently unavailable.", {
        duration: 8000,
      });
      break;

    default:
      showToast.error(error.message || "Server error occurred");
  }
};

// Helper to check if error requires immediate action
export const isErrorCritical = (error) => {
  if (!error?.code) return false;

  const criticalCodes = [
    "ACCOUNT_LOCKED",
    "ACCOUNT_INACTIVE",
    "SESSION_EXPIRED",
    "INSUFFICIENT_PERMISSIONS",
    "RATE_LIMITED",
  ];

  return criticalCodes.includes(error.code);
};

// Helper to get user-friendly error message without showing toast
export const getErrorMessage = (error) => {
  if (!error) return "An unknown error occurred";

  if (typeof error === "string") return error;

  if (error.message) return error.message;

  return "An unexpected error occurred";
};

// Helper to extract error suggestions
export const getErrorSuggestion = (error) => {
  return error?.details?.suggestion || null;
};

// Enhanced error reporting for development
export const reportError = (error, context = {}) => {
  if (process.env.NODE_ENV === "development") {
    console.group(`🚨 Error Report: ${context.action || "Unknown Action"}`);
    console.error("Error:", error);
    console.log("Context:", context);
    console.log("User Agent:", navigator.userAgent);
    console.log("Timestamp:", new Date().toISOString());
    console.groupEnd();
  }

  // In production, you might want to send this to an error reporting service
  // Example: Sentry.captureException(error, { extra: context });
};
