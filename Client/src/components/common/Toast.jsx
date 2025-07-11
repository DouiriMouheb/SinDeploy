// src/components/common/Toast.jsx
import React, { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toastStyles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconStyles = {
  success: "text-green-500",
  error: "text-red-500",
  warning: "text-yellow-500",
  info: "text-blue-500",
};

export const Toast = ({
  id,
  type = "info",
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const Icon = toastIcons[type];

  return (
    <div
      className={`
        flex items-start p-4 mb-3 border rounded-lg shadow-lg max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        animate-slide-in-right
        ${toastStyles[type]}
      `}
    >
      <div className="flex-shrink-0">
        <Icon className={`h-5 w-5 ${iconStyles[type]}`} />
      </div>

      <div className="ml-3 flex-1">
        {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
        <p className="text-sm">{message}</p>
      </div>

      <button
        onClick={() => onClose(id)}
        className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
