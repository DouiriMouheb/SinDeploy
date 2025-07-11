// src/components/auth/LoginPage.jsx - Improved with button loading state
import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { showToast } from "../../utils/toast";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Clock,
  Shield,
  User,
} from "lucide-react";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [lastErrorType, setLastErrorType] = useState(null);

  const { login, clearError } = useAuth();

  // Clear field errors when user starts typing
  useEffect(() => {
    if (fieldErrors.email || fieldErrors.password) {
      setFieldErrors({});
    }
  }, [email, password]);

  // Enhanced error display based on error type
  const showEnhancedError = (error) => {
    // Clear any existing field errors
    setFieldErrors({});
    setLastErrorType(error.type);

    switch (error.type) {
      case "account_status":
        if (error.code === "ACCOUNT_LOCKED") {
          showToast.auth.accountLocked(error.details);
        } else if (error.code === "ACCOUNT_INACTIVE") {
          showToast.error(error.message, {
            duration: 10000,
          });
        } else {
          showToast.error(error.message, { duration: 8000 });
        }
        break;

      case "authentication":
        if (error.code === "INVALID_CREDENTIALS") {
          showToast.error(
            "The password you entered is incorrect. Please try again.",
            {
              duration: 5000,
            }
          );

          // Show remaining attempts warning if applicable
          if (
            error.details?.attemptsRemaining !== undefined &&
            error.details.attemptsRemaining <= 2
          ) {
            setTimeout(() => {
              showToast.auth.attemptsWarning(error.details.attemptsRemaining);
            }, 1500);
          }
        } else if (error.code === "USER_NOT_FOUND") {
          showToast.error("No account found with this email address.", {
            duration: 6000,
          });
        } else {
          showToast.error(error.message, { duration: 5000 });
        }
        break;

      case "validation":
        if (error.details?.field) {
          setFieldErrors({ [error.details.field]: error.message });
        } else {
          showToast.error(error.message, {
            duration: 5000,
          });
        }
        break;

      case "rate_limit":
        showToast.error(
          "Too many login attempts. Please wait before trying again.",
          {
            duration: 8000,
          }
        );
        break;

      case "network":
        showToast.error(
          "Unable to connect to server. Please check your connection.",
          {
            duration: 6000,
          }
        );
        break;

      default:
        showToast.error(error.message || "Login failed. Please try again.", {
          duration: 5000,
        });
    }

    // Show suggestion if available and not a validation error
    if (error.details?.suggestion && error.type !== "validation") {
      setTimeout(() => {
        showToast(`💡 ${error.details.suggestion}`, {
          duration: 7000,
          style: {
            background: "#3B82F6",
            color: "#fff",
          },
          icon: "💡",
        });
      }, 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Don't submit if already submitting
    if (isSubmitting) return;

    // Clear previous errors
    setFieldErrors({});
    setLastErrorType(null);
    clearError();

    // Enhanced client-side validation
    const errors = {};

    if (!email.trim()) {
      errors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address";
    }

    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      showToast.error("Please fix the errors below and try again.", {
        duration: 5000,
      });
      return;
    }

    // Start loading state
    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);

      if (result.success) {
        // Show success toast
        showToast.auth.loginSuccess(result.data.user.name);

        // Clear form
        setEmail("");
        setPassword("");
        setFieldErrors({});
        setLastErrorType(null);

        // Note: The redirect to dashboard happens automatically through the
        // AuthContext state change and the App component's conditional rendering
        // No need to manually redirect here
      }
    } catch (error) {
      console.error("Login submission error:", error);

      // Handle structured errors from the API
      if (error && typeof error === "object" && error.code) {
        showEnhancedError(error);
      } else {
        // Handle unexpected errors
        showToast.error("An unexpected error occurred. Please try again.", {
          duration: 5000,
        });
      }
    } finally {
      // Always stop loading, regardless of success or failure
      setIsSubmitting(false);
    }
  };

  const canSubmit = email.trim() && password.trim() && !isSubmitting;

  // Enhanced status indicator component
  const StatusIndicator = ({ type }) => {
    const indicators = {
      account_status: {
        icon: Shield,
        color: "text-red-500",
        bgColor: "bg-red-50",
      },
      authentication: {
        icon: User,
        color: "text-orange-500",
        bgColor: "bg-orange-50",
      },
      validation: {
        icon: AlertCircle,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
      },
      rate_limit: {
        icon: Clock,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
      },
    };

    const indicator = indicators[type];
    if (!indicator) return null;

    const { icon: Icon, color, bgColor } = indicator;

    return (
      <div
        className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} mb-4`}
      >
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h3 className="mt-2 text-sm text-gray-600">
            Sign in to your Company Portal
          </h3>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
          {/* Status Indicator */}
          {lastErrorType && (
            <div className="flex justify-center">
              <StatusIndicator type={lastErrorType} />
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="email"
                placeholder="Enter your email"
                error={fieldErrors.email}
                className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.email ? "border-red-300 focus:ring-red-500" : ""
                }`}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                error={fieldErrors.password}
                className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                  fieldErrors.password
                    ? "border-red-300 focus:ring-red-500"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between">
              <label className="flex items-center"></label>

              <button
                type="button"
                disabled={isSubmitting}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`
                w-full relative transition-all duration-200 transform
                ${canSubmit && !isSubmitting ? "hover:scale-105" : ""}
                ${isSubmitting ? "cursor-not-allowed" : ""}
                ${
                  fieldErrors.email || fieldErrors.password
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
                }
              `}
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Need an account?</span>
              </p>
              <p className="text-xs text-gray-500">
                Contact your system administrator to create an account.
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-blue-50 rounded-md">
              <div className="flex items-start">
                <Shield className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    Your account will be temporarily locked after 5 failed login
                    attempts. Always use strong, unique passwords and never
                    share your credentials.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2025 Sinergia Company Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
