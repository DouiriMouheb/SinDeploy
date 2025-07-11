// src/components/users/UserModal.jsx - Enhanced user creation/editing modal
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { User, Mail, Shield, Building2, Key, UserCheck } from "lucide-react";

export const UserModal = ({
  isOpen,
  onClose,
  user,
  onChange,
  onSave,
  mode,
  userRole = "user",
  userDepartment = "",
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isReadOnly = mode === "view";
  const isCreating = mode === "create";
  const isEditing = mode === "edit";

  const title =
    {
      create: "Create New User",
      edit: "Edit User",
      view: "View User",
    }[mode] || "User";

  // Reset errors when modal opens/closes or mode changes
  useEffect(() => {
    setErrors({});
    setIsSubmitting(false);
  }, [isOpen, mode]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!user?.name?.trim()) {
      newErrors.name = "Name is required";
    } else if (user.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (user.name.trim().length > 100) {
      newErrors.name = "Name cannot exceed 100 characters";
    }

    // Email validation
    if (!user?.email?.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email.trim())) {
        newErrors.email = "Please enter a valid email address";
      }
    }

    // Password validation (only for creation)
    if (isCreating) {
      if (!user?.password?.trim()) {
        newErrors.password = "Password is required";
      } else if (user.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else {
        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
        if (!passwordRegex.test(user.password)) {
          newErrors.password =
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
      }
    }

    // Role validation
    if (!user?.role) {
      newErrors.role = "Role is required";
    }

    // Department validation
    if (!user?.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReadOnly || isSubmitting) return;

    if (!validateForm()) {
      showToast.error("Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const submitData = {
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        role: user.role,
        department: user.department,
        isActive: user.isActive !== false, // Default to true if not specified
      };

      // Add password for creation
      if (isCreating) {
        submitData.password = user.password;
      }

      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting user:", error);
      // Error handling is done in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    onChange({ ...user, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generatePassword = () => {
    // Generate a secure password
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&";
    let password = "";

    // Ensure at least one character from each required category
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "@$!%*?&"[Math.floor(Math.random() * 7)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");

    handleInputChange("password", password);
    showToast.success(
      "Password generated! Make sure to copy it before saving."
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Check if current user can modify certain fields
  const canModifyRole = userRole === "admin";
  const canModifyDepartment = userRole === "admin";
  const canModifyStatus = userRole === "admin" || userRole === "manager";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        !isReadOnly && (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isCreating ? "Creating..." : "Saving..."}
                </div>
              ) : isCreating ? (
                "Create User"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )
      }
    >
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* Basic Information */}
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={user?.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.name}
            placeholder="Enter user's full name"
            icon={User}
          />

          <Input
            label="Email Address"
            type="email"
            value={user?.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.email}
            placeholder="user@company.com"
            icon={Mail}
          />

          {/* Password field - only for creation */}
          {isCreating && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  disabled={isReadOnly}
                  className="text-xs"
                >
                  Generate
                </Button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={user?.password || ""}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  disabled={isReadOnly}
                  required
                  error={errors.password}
                  placeholder="Enter a secure password"
                  icon={Key}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isReadOnly}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters with uppercase,
                lowercase, number, and special character
              </p>
            </div>
          )}
        </div>

        {/* Role and Department */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role *
            </label>
            <div className="relative">
              <select
                value={user?.role || "user"}
                onChange={(e) => handleInputChange("role", e.target.value)}
                disabled={isReadOnly || !canModifyRole}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.role ? "border-red-300" : "border-gray-300"
                } ${isReadOnly || !canModifyRole ? "bg-gray-100" : "bg-white"}`}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
            {!canModifyRole && (
              <p className="mt-1 text-xs text-gray-500">
                Only admins can change user roles
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <div className="relative">
              <select
                value={user?.department || userDepartment}
                onChange={(e) =>
                  handleInputChange("department", e.target.value)
                }
                disabled={isReadOnly || (!canModifyDepartment && !isCreating)}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.department ? "border-red-300" : "border-gray-300"
                } ${
                  isReadOnly || (!canModifyDepartment && !isCreating)
                    ? "bg-gray-100"
                    : "bg-white"
                }`}
              >
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Legal">Legal</option>
                <option value="Executive">Executive</option>
              </select>
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
            {!canModifyDepartment && !isCreating && (
              <p className="mt-1 text-xs text-gray-500">
                Only admins can change departments
              </p>
            )}
          </div>
        </div>

        {/* Account Status - only for editing */}
        {!isCreating && (
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={user?.isActive !== false}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                disabled={isReadOnly || !canModifyStatus}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  isReadOnly || !canModifyStatus ? "opacity-50" : ""
                }`}
              />
              <UserCheck className="h-4 w-4 ml-2 mr-1 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Account Active
              </span>
            </label>
            {!canModifyStatus && (
              <p className="mt-1 text-xs text-gray-500">
                Only managers and admins can change account status
              </p>
            )}
          </div>
        )}

        {/* Read-only fields for existing users */}
        {!isCreating && user && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Account Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">{formatDateTime(user.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <p className="font-medium">{formatDateTime(user.updatedAt)}</p>
              </div>
              <div>
                <span className="text-gray-500">Last Login:</span>
                <p className="font-medium">
                  {formatDateTime(user.lastLogin) || "Never"}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Failed Login Attempts:</span>
                <p className="font-medium">{user.loginAttempts || 0}</p>
              </div>
              {user.lockUntil && new Date(user.lockUntil) > new Date() && (
                <div className="col-span-2">
                  <span className="text-red-500">Account Locked Until:</span>
                  <p className="font-medium text-red-700">
                    {formatDateTime(user.lockUntil)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Role Permissions Info */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Role Permissions
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            {user?.role === "admin" && (
              <div className="p-2 bg-red-50 rounded">
                <strong>Admin:</strong> Full system access, can manage all
                users, tickets, and settings
              </div>
            )}
            {user?.role === "manager" && (
              <div className="p-2 bg-blue-50 rounded">
                <strong>Manager:</strong> Can manage users and tickets within
                their department
              </div>
            )}
            {user?.role === "user" && (
              <div className="p-2 bg-green-50 rounded">
                <strong>User:</strong> Can create and manage their own tickets
              </div>
            )}
          </div>
        </div>

        {/* Warning for sensitive operations */}
        {isCreating && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="text-sm text-yellow-700">
              <strong>Important:</strong> Make sure to copy the password before
              saving. The user will need this to log in for the first time.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
