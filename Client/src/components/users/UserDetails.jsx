// src/components/users/UserDetails.jsx - Fixed to use proper confirmation modal
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  Activity,
  LogIn,
  AlertTriangle,
  Download,
  FileText,
  Save,
  X,
} from "lucide-react";
import { useAuth } from "react-oidc-context";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { userService } from "../../services/users";
import { timesheetService } from "../../services/timesheets";
import { generateTimesheetPDF } from "../../utils/pdfGenerator";
import { showToast } from "../../utils/toast";
import { ProfilePicture } from "../common/ProfilePicture"; // ADDED: Import ProfilePicture


const getRoleColor = (role) => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    user: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
};

const formatDateTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid date";
  }
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return formatDateTime(dateString);
    }
  } catch (error) {
    return "Invalid date";
  }
};

export const UserDetails = ({
  userId,
  onBack,
  onEdit,
  onStatusToggle,
  onResetPassword,
  onChangeRole,
  onDelete,
}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // FIXED: Added state for confirmation modals instead of window.confirm()
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Timesheet download states
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [savingChanges, setSavingChanges] = useState(false);

  const { user: currentUser, hasRole } = useAuth();

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getUser(userId);

      if (response.success) {
        setUser(response.data.user);
        // Set form data for editing
        setEditForm({
          name: response.data.user.name || "",
          email: response.data.user.email || "",
          role: response.data.user.role || "",
        });
      }
    } catch (err) {
      console.error("Error loading user:", err);
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Updated to use modal instead of window.confirm()
  const handleStatusToggleRequest = () => {
    setShowStatusModal(true);
  };

  const confirmStatusToggle = async () => {
    if (!user || actionLoading) return;

    setActionLoading("status");

    try {
      const newStatus = !user.isActive;
      await onStatusToggle(userId, newStatus);

      // Update local state
      setUser((prev) => ({ ...prev, isActive: newStatus }));

      showToast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (err) {
      console.error("Error toggling status:", err);
    } finally {
      setActionLoading(null);
      setShowStatusModal(false);
    }
  };

  // Download timesheet PDF
  const downloadTimesheetPDF = async () => {
    if (!user || downloadingPDF) return;

    setDownloadingPDF(true);

    try {
      showToast.loading("Checking timesheet entries...");

      // Get timesheet data for the user
      const response = await timesheetService.getUserTimeEntriesById(userId, {
        limit: 1000, // Get all entries
      });

      if (response.success && response.data) {
        const timesheets = response.data.entries || [];

        if (timesheets.length === 0) {
          showToast.dismiss(); // Dismiss loading toast
          showToast.warning(
            "No timesheet entries found for this user. Nothing to generate."
          );
          return;
        }

        // Update loading message when we start generating
        showToast.loading("Generating timesheet PDF...");

        // Generate PDF
        const filename = generateTimesheetPDF(user, timesheets);
        showToast.dismiss(); // Dismiss loading toast
        showToast.success(`Timesheet PDF downloaded: ${filename}`);
      } else {
        showToast.dismiss(); // Dismiss loading toast
        showToast.error("Failed to fetch timesheet data from server");
      }
    } catch (err) {
      console.error("Error downloading timesheet PDF:", err);

      // Dismiss loading toast first
      showToast.dismiss();

      // More specific error messages
      if (err.message.includes("No timesheet entries")) {
        showToast.warning("No timesheet entries available to generate PDF");
      } else if (err.message.includes("User information")) {
        showToast.error("User information missing - cannot generate PDF");
      } else if (err.message.includes("Valid timesheet data")) {
        showToast.error("Invalid timesheet data received from server");
      } else {
        showToast.error("Failed to generate timesheet PDF");
      }
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
    // Reset form with current user data
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original data
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      showToast.error("Name and email are required");
      return;
    }

    setSavingChanges(true);
    try {
      const response = await userService.updateUser(userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
      });

      if (response.success) {
        setUser(response.data.user);
        setIsEditing(false);
        showToast.success("User updated successfully");
      } else {
        showToast.error(response.message || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      showToast.error("Failed to update user");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!user || actionLoading) return;

    setActionLoading("delete");

    try {
      const response = await userService.deleteUser(userId);

      if (response.success) {
        showToast.success("User deleted successfully");
        setShowDeleteModal(false);

        // Notify parent to refresh the list
        if (onDelete) {
          onDelete();
        }

        onBack(); // Navigate back to list
      } else {
        showToast.error(response.message || "Failed to delete user");
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast.error("Failed to delete user");
      setShowDeleteModal(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
  };

  // Access control checks
  const isCurrentUser = userId === currentUser.id || userId === currentUser._id;
  const canEdit = () => {
    return (
      hasRole("admin") 
    );
  };
  const canToggleStatus = () => !isCurrentUser && canEdit();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Error Loading User
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {error || "User not found"}
        </p>
        <div className="mt-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isAccountLocked =
    user.lockUntil && new Date(user.lockUntil) > new Date();

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4">
            {/* Back button and user info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Users</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    {/* FIXED: Use ProfilePicture instead of simple div */}
                    <ProfilePicture
                      user={user}
                      size="lg"
                      className="mr-3 flex-shrink-0"
                    />
                    {user.name}
                    {isCurrentUser && (
                      <span className="ml-3 text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        You
                      </span>
                    )}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">{user.email}</p>

                 
             
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {canEdit() && !isEditing && (
                <Button onClick={handleStartEdit} variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
              )}

              {canEdit() && isEditing && (
                <>
                  <Button
                    onClick={handleSaveEdit}
                    variant="primary"
                    size="sm"
                    disabled={savingChanges}
                  >
                    {savingChanges ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="secondary"
                    size="sm"
                    disabled={savingChanges}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}

              {/* Download Timesheet button - available for admins */}
              {( hasRole("admin")) && (
                <Button
                  onClick={downloadTimesheetPDF}
                  variant="secondary"
                  size="sm"
                  disabled={downloadingPDF}
                >
                  {downloadingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download Timesheet
                    </>
                  )}
                </Button>
              )}

              {/* Delete User button - only for admins and not for current user */}
              {hasRole("admin") && !isCurrentUser && !isEditing && (
                <Button
                  onClick={handleDeleteRequest}
                  variant="danger"
                  size="sm"
                  disabled={actionLoading === "delete"}
                >
                  {actionLoading === "delete" ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    "Delete User"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h2>

              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Full Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.name}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        placeholder="Enter full name"
                        disabled={savingChanges}
                      />
                    ) : (
                      user.name
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Email Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {isEditing ? (
                      <Input
                        type="email"
                        value={editForm.email}
                        onChange={(e) =>
                          handleFormChange("email", e.target.value)
                        }
                        placeholder="Enter email address"
                        disabled={savingChanges}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1 text-gray-400" />
                        {user.email}
                      </div>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-sm font-medium text-gray-500">Role</dt>
                  <dd className="mt-1">
                    {isEditing ? (
                      <select
                        value={editForm.role}
                        onChange={(e) =>
                          handleFormChange("role", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={savingChanges}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Account Status */}
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Account Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center">
                    {user.isActive ? (
                      <UserCheck className="h-5 w-5 text-green-500 mr-3" />
                    ) : (
                      <UserX className="h-5 w-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Account Status
                      </p>
                      <p
                        className={`text-sm ${
                          user.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                  {canToggleStatus() && (
                    <Button
                      onClick={handleStatusToggleRequest}
                      variant={user.isActive ? "danger" : "primary"}
                      size="sm"
                      disabled={actionLoading === "status"}
                    >
                      {actionLoading === "status" ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : user.isActive ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  )}
                </div>

                {isAccountLocked && (
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-red-900">
                          Account Locked
                        </p>
                        <p className="text-sm text-red-700">
                          Locked until {formatDateTime(user.lockUntil)} due to
                          multiple failed login attempts
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                 

                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Failed Attempts</p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.loginAttempts || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Login Tracker - only show for current user or if viewing others as admin 
            {(isCurrentUser || canEdit()) && (
              <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Daily Activity
                </h2>
                <div className="space-y-4">
                  <DailyLoginTracker
                    variant="card"
                    className="border-0 bg-transparent p-0"
                    userId={!isCurrentUser ? userId : null}
                  />
                </div>
              </div>
            )}*/}

            {/* Account Timeline 
            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Account Timeline
              </h2>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Account Created
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(user.updatedAt)}
                    </p>
                  </div>
                </div>

                {user.lastLogin && (
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Last Login
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>*/}
          </div>
        </div>
      </div>

      {/* FIXED: Added confirmation modals instead of window.confirm() */}

      {/* Status Toggle Confirmation Modal */}
      <ConfirmationModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={confirmStatusToggle}
        title={`${user.isActive ? "Deactivate" : "Activate"} User`}
        message={`Are you sure you want to ${
          user.isActive ? "deactivate" : "activate"
        } ${user.name}'s account?`}
        confirmText={user.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        type={user.isActive ? "warning" : "info"}
        isLoading={actionLoading === "status"}
        itemName={`${user.name} (${user.email})`}
        details={
          user.isActive
            ? [
                "User will not be able to log in",
                "User will be logged out of all active sessions",
                "User can be reactivated later",
              ]
            : [
                "User will be able to log in again",
                "User will regain access to their account",
                "User will need to log in with their existing credentials",
              ]
        }
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.name}?`}
        confirmText="Delete User"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading === "delete"}
        itemName={`${user.name} (${user.email})`}
        details={[
          "This action cannot be undone",
          "User data will be permanently removed",
          "All associated timesheet entries will be affected",
          "User will be immediately logged out of all sessions",
        ]}
      />
    </>
  );
};
