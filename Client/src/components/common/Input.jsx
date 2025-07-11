// src/components/common/Input.jsx
import React from "react";
import { AlertCircle, CheckCircle, Info } from "lucide-react";

export const Input = ({
  label,
  error,
  success,
  hint,
  className = "",
  required = false,
  showValidation = true,
  icon: Icon,
  ...props
}) => {
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;
  const hasValue = props.value && props.value.length > 0;

  // Determine input state styles
  const getStateStyles = () => {
    if (hasError) {
      return {
        border: "border-red-300 focus:border-red-500",
        ring: "focus:ring-red-500",
        bg: "bg-red-50",
      };
    }

    if (hasSuccess) {
      return {
        border: "border-green-300 focus:border-green-500",
        ring: "focus:ring-green-500",
        bg: "bg-green-50",
      };
    }

    return {
      border: "border-gray-300 focus:border-blue-500",
      ring: "focus:ring-blue-500",
      bg: "bg-white",
    };
  };

  const stateStyles = getStateStyles();

  // Generate unique ID for accessibility
  const inputId =
    props.id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="space-y-1">
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon
              className={`h-5 w-5 ${
                hasError ? "text-red-400" : "text-gray-400"
              }`}
            />
          </div>
        )}

        {/* Input field */}
        <input
          id={inputId}
          className={`
            block w-full px-3 py-2 rounded-md shadow-sm transition-all duration-200
            ${Icon ? "pl-10" : ""}
            ${showValidation && (hasError || hasSuccess) ? "pr-10" : ""}
            ${stateStyles.bg}
            ${stateStyles.border}
            focus:outline-none focus:ring-2 ${stateStyles.ring}
            disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
            placeholder:text-gray-400
            text-gray-900
            ${className}
          `}
          aria-invalid={hasError}
          aria-describedby={`
            ${error ? errorId : ""} 
            ${hint ? hintId : ""}
          `.trim()}
          {...props}
        />

        {/* Validation icon */}
        {showValidation && (hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError && <AlertCircle className="h-5 w-5 text-red-500" />}
            {hasSuccess && <CheckCircle className="h-5 w-5 text-green-500" />}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div
          id={errorId}
          className="flex items-start space-x-1 text-sm text-red-600 animate-in slide-in-from-top-1 duration-200"
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success message */}
      {success && !error && (
        <div className="flex items-start space-x-1 text-sm text-green-600 animate-in slide-in-from-top-1 duration-200">
          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Hint text */}
      {hint && !error && !success && (
        <div
          id={hintId}
          className="flex items-start space-x-1 text-sm text-gray-500"
        >
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
    </div>
  );
};
