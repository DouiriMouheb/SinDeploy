import toast from "react-hot-toast";

// Configuration for toast styling and behavior
export const toastConfig = {
  position: "top-right",
  duration: 4000,
  style: {
    borderRadius: "10px",
    background: "#333",
    color: "#fff",
    padding: "12px",
    fontSize: "14px",
    maxWidth: "400px",
  },
};

// Enhanced toast utility with specific methods for different use cases
export const showToast = {
  // Generic success message
  success: (message, options = {}) => {
    return toast.success(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        background: "#10B981",
        ...options.style,
      },
    });
  },

  // Generic error message
  error: (message, options = {}) => {
    return toast.error(message, {
      ...toastConfig,
      duration: 6000, // Longer duration for errors
      ...options,
      style: {
        ...toastConfig.style,
        background: "#EF4444",
        ...options.style,
      },
    });
  },

  // Generic warning message
  warning: (message, options = {}) => {
    return toast(message, {
      ...toastConfig,
      ...options,
      icon: "⚠️",
      style: {
        ...toastConfig.style,
        background: "#F59E0B",
        ...options.style,
      },
    });
  },

  // Generic info message
  info: (message, options = {}) => {
    return toast(message, {
      ...toastConfig,
      ...options,
      icon: "ℹ️",
      style: {
        ...toastConfig.style,
        background: "#3B82F6",
        ...options.style,
      },
    });
  },

  // Loading message
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...toastConfig,
      ...options,
      style: {
        ...toastConfig.style,
        background: "#6B7280",
        ...options.style,
      },
    });
  },

  // Dismiss specific toast or all toasts
  dismiss: (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  // Authentication-specific messages
  auth: {
    loginSuccess: (userName) => {
      return showToast.success(`Welcome back, ${userName}!`, {
        duration: 3000,
        icon: "👋",
      });
    },

    logoutSuccess: () => {
      return showToast.success("You have been logged out successfully", {
        duration: 3000,
        icon: "👋",
      });
    },

    sessionExpired: () => {
      return showToast.error("Your session has expired. Please log in again.", {
        duration: 8000,
        icon: "🔒",
      });
    },

    accountLocked: (details) => {
      return showToast.error(
        `Account temporarily locked. ${
          details?.suggestion || "Please try again later."
        }`,
        {
          duration: 10000,
          icon: "🔒",
        }
      );
    },

    attemptsWarning: (remainingAttempts) => {
      return showToast.warning(
        `${remainingAttempts} login attempt${
          remainingAttempts !== 1 ? "s" : ""
        } remaining before account is locked.`,
        {
          duration: 8000,
          icon: "⚠️",
        }
      );
    },

    passwordChanged: () => {
      return showToast.success("Password changed successfully", {
        duration: 4000,
        icon: "🔐",
      });
    },
  },

  // Ticket-specific messages
  ticket: {
    created: () => {
      return showToast.success("Ticket created successfully", {
        duration: 4000,
        icon: "🎫",
      });
    },

    updated: () => {
      return showToast.success("Ticket updated successfully", {
        duration: 3000,
        icon: "✏️",
      });
    },

    deleted: () => {
      return showToast.success("Ticket deleted successfully", {
        duration: 3000,
        icon: "🗑️",
      });
    },

    assigned: (assigneeName) => {
      return showToast.success(
        `Ticket assigned${assigneeName ? ` to ${assigneeName}` : ""}`,
        {
          duration: 4000,
          icon: "👤",
        }
      );
    },

    statusChanged: (newStatus) => {
      return showToast.success(`Ticket status updated to ${newStatus}`, {
        duration: 3000,
        icon: "🔄",
      });
    },

    commentAdded: () => {
      return showToast.success("Comment added successfully", {
        duration: 3000,
        icon: "💬",
      });
    },

    error: (message) => {
      return showToast.error(message || "An error occurred with the ticket", {
        duration: 5000,
        icon: "🎫",
      });
    },
  },

  // User-specific messages
  user: {
    created: () => {
      return showToast.success("User created successfully", {
        duration: 4000,
        icon: "👤",
      });
    },

    updated: () => {
      return showToast.success("User updated successfully", {
        duration: 3000,
        icon: "✏️",
      });
    },

    deleted: () => {
      return showToast.success("User deleted successfully", {
        duration: 3000,
        icon: "🗑️",
      });
    },

    profileUpdated: () => {
      return showToast.success("Profile updated successfully", {
        duration: 3000,
        icon: "👤",
      });
    },

    pictureUploaded: () => {
      return showToast.success("Profile picture updated successfully", {
        duration: 3000,
        icon: "📸",
      });
    },

    pictureRemoved: () => {
      return showToast.success("Profile picture removed successfully", {
        duration: 3000,
        icon: "🗑️",
      });
    },

    statusChanged: (isActive) => {
      return showToast.success(
        `User ${isActive ? "activated" : "deactivated"} successfully`,
        {
          duration: 3000,
          icon: isActive ? "✅" : "❌",
        }
      );
    },

    roleChanged: (newRole) => {
      return showToast.success(`User role changed to ${newRole}`, {
        duration: 4000,
        icon: "🔑",
      });
    },

    passwordReset: () => {
      return showToast.success("Password reset successfully", {
        duration: 4000,
        icon: "🔐",
      });
    },
  },

  // Customer-specific messages
  customer: {
    created: () => {
      return showToast.success("Customer created successfully", {
        duration: 4000,
        icon: "🏢",
      });
    },

    updated: () => {
      return showToast.success("Customer updated successfully", {
        duration: 3000,
        icon: "✏️",
      });
    },

    deleted: () => {
      return showToast.success("Customer deleted successfully", {
        duration: 3000,
        icon: "🗑️",
      });
    },

    activated: (customerName) => {
      return showToast.success(
        `Customer "${customerName}" has been activated`,
        {
          duration: 4000,
          icon: "✅",
        }
      );
    },

    deactivated: (customerName) => {
      return showToast.warning(
        `Customer "${customerName}" has been deactivated`,
        {
          duration: 4000,
          icon: "⏸️",
        }
      );
    },

    statusChanged: (isActive) => {
      return isActive
        ? showToast.success("Customer activated successfully", {
            duration: 3000,
            icon: "✅",
          })
        : showToast.warning("Customer deactivated successfully", {
            duration: 3000,
            icon: "⏸️",
          });
    },

    error: (message = "Customer operation failed") => {
      return showToast.error(message, {
        duration: 5000,
        icon: "🏢",
      });
    },
  },

  // System/Network messages
  system: {
    offline: () => {
      return showToast.error(
        "You are currently offline. Some features may be unavailable.",
        {
          duration: 8000,
          icon: "📡",
        }
      );
    },

    online: () => {
      return showToast.success("Connection restored", {
        duration: 3000,
        icon: "✅",
      });
    },

    maintenanceMode: () => {
      return showToast.warning(
        "System is in maintenance mode. Some features may be limited.",
        {
          duration: 10000,
          icon: "🔧",
        }
      );
    },

    updateAvailable: () => {
      return showToast.info(
        "A new version is available. Please refresh the page.",
        {
          duration: 10000,
          icon: "🔄",
        }
      );
    },

    dataLoaded: () => {
      return showToast.success("Data loaded successfully", {
        duration: 2000,
        icon: "📊",
      });
    },

    dataLoadFailed: () => {
      return showToast.error("Failed to load data", {
        duration: 5000,
        icon: "📊",
      });
    },

    serverError: () => {
      return showToast.error("Server error occurred. Please try again later.", {
        duration: 6000,
        icon: "⚠️",
      });
    },
  },

  // Custom toast with custom styling
  custom: (message, options = {}) => {
    return toast(message, {
      ...toastConfig,
      ...options,
    });
  },

  // Promise-based toast for async operations
  promise: (promise, messages, options = {}) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || "Loading...",
        success: messages.success || "Success!",
        error: messages.error || "Something went wrong",
      },
      {
        ...toastConfig,
        ...options,
      }
    );
  },
};

export default showToast;
