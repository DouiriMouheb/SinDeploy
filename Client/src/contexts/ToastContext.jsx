// src/contexts/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: "info",
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "success",
        message,
        title: options.title || "Success",
        duration: options.duration || 4000,
        ...options,
      });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "error",
        message,
        title: options.title || "Error",
        duration: options.duration || 6000,
        ...options,
      });
    },
    [addToast]
  );

  const warning = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "warning",
        message,
        title: options.title || "Warning",
        duration: options.duration || 5000,
        ...options,
      });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({
        type: "info",
        message,
        title: options.title || "Info",
        duration: options.duration || 4000,
        ...options,
      });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};
