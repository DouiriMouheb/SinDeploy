import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Trash2, AlertCircle, Info } from "lucide-react";

const iconMap = {
  danger: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  delete: Trash2,
};

const colorMap = {
  danger: {
    icon: "text-red-500",
    bg: "bg-red-50",
    confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: "text-yellow-500",
    bg: "bg-yellow-50",
    confirmButton: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
  },
  info: {
    icon: "text-blue-500",
    bg: "bg-blue-50",
    confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  },
  delete: {
    icon: "text-red-500",
    bg: "bg-red-50",
    confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
};

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger", // danger, warning, info, delete
  isLoading = false,
  details = null, // Additional details to show
  itemName = null, // Name of the item being acted upon
}) => {
  const Icon = iconMap[type];
  const colors = colorMap[type];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-slate-200">
        {/* Header */}
        <div className="px-6 pt-6">
          <div className="flex items-center">
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full ${colors.bg} flex items-center justify-center`}
            >
              <Icon className={`h-6 w-6 ${colors.icon}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-slate-900">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <div className="text-sm text-slate-700">
            <p className="mb-3">{message}</p>

            {itemName && (
              <div className="bg-slate-100 rounded-md p-3 mb-3">
                <p className="font-medium text-slate-900">
                  Item to be affected:
                </p>
                <p className="text-slate-700 mt-1">{itemName}</p>
              </div>
            )}

            {details && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    {Array.isArray(details) ? (
                      <ul className="list-disc list-inside space-y-1">
                        {details.map((detail, index) => (
                          <li key={index}>{detail}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{details}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {type === "delete" && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">
                      Warning: This action cannot be undone!
                    </p>
                    <p className="mt-1">
                      All associated data will be permanently removed.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="transition-colors"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`text-white transition-all ${colors.confirmButton} ${
              isLoading ? "cursor-not-allowed opacity-75" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
