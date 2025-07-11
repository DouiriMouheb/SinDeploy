// Example: src/components/users/UserProfileModal.jsx - Complete API integration example
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { ProfilePictureUpload } from "../common/ProfilePictureUpload";
import { User, Mail, Shield, Building2, Key, Save } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { userService } from "../../services/users";
import { showToast } from "../../utils/toast";
import { handleApiError, reportError } from "../../utils/errorHandler";

export const UserProfileModal = ({ isOpen, onClose }) => {
  const { user, refreshUser, updateUserData } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState({
    profile: false,
    picture: false,
    password: false,
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setProfileForm({
        name: user.name || "",
      });

      // Reset password form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear all errors
      setProfileErrors({});
      setPasswordErrors({});
    }
  }, [isOpen, user]);

  // Validate profile form
  const validateProfileForm = () => {
    const errors = {};

    if (!profileForm.name.trim()) {
      errors.name = "Name is required";
    } else if (profileForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (profileForm.name.trim().length > 100) {
      errors.name = "Name cannot exceed 100 characters";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (!passwordRegex.test(passwordForm.newPassword)) {
        errors.newPassword =
          "Password must contain uppercase, lowercase, number, and special character";
      }
    }

    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (
      passwordForm.currentPassword &&
      passwordForm.newPassword &&
      passwordForm.currentPassword === passwordForm.newPassword
    ) {
      errors.newPassword =
        "New password must be different from current password";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile form changes
  const handleProfileChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle password form changes
  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // FIXED: Update profile information with proper error handling
  const handleProfileUpdate = async () => {
    if (!validateProfileForm()) {
      showToast.error("Please fix the errors below");
      return;
    }

    setLoading((prev) => ({ ...prev, profile: true }));

    try {
      const response = await userService.updateProfile({
        name: profileForm.name.trim(),
      });

      if (response.success) {
        // Update user data in auth context
        updateUserData(response.data.user);
        showToast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      reportError(error, { action: "updateProfile", userId: user?.id });
      handleApiError(error, "profile update");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // FIXED: Handle profile picture upload with proper error handling
  const handlePictureUpload = async (file) => {
    setLoading((prev) => ({ ...prev, picture: true }));

    try {
      const response = await userService.uploadProfilePicture(file);

      if (response.success) {
        // Update user data in auth context with new profile picture
        updateUserData(response.data.user);
        showToast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error("Picture upload error:", error);
      reportError(error, {
        action: "uploadProfilePicture",
        fileSize: file?.size,
      });
      handleApiError(error, "profile picture upload");
    } finally {
      setLoading((prev) => ({ ...prev, picture: false }));
    }
  };

  // FIXED: Handle profile picture removal with proper error handling
  const handlePictureRemove = async () => {
    setLoading((prev) => ({ ...prev, picture: true }));

    try {
      const response = await userService.removeProfilePicture();

      if (response.success) {
        // Update user data in auth context
        updateUserData(response.data.user);
        showToast.success("Profile picture removed successfully");
      }
    } catch (error) {
      console.error("Picture removal error:", error);
      reportError(error, { action: "removeProfilePicture", userId: user?.id });
      handleApiError(error, "profile picture removal");
    } finally {
      setLoading((prev) => ({ ...prev, picture: false }));
    }
  };

  // FIXED: Handle password change with proper error handling
  const handlePasswordUpdate = async () => {
    if (!validatePasswordForm()) {
      showToast.error("Please fix the errors below");
      return;
    }

    setLoading((prev) => ({ ...prev, password: true }));

    try {
      const response = await userService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );

      if (response.success) {
        showToast.success(
          "Password changed successfully. You will be logged out.",
          { duration: 4000 }
        );

        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Password change error:", error);
      reportError(error, { action: "changePassword", userId: user?.id });
      handleApiError(error, "password change");
    } finally {
      setLoading((prev) => ({ ...prev, password: false }));
    }
  };

  // Component JSX would go here...
  // This is just showing the API integration patterns

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Profile">
      {/* Your existing JSX structure */}
      <div className="space-y-6">
        {/* Profile tab content */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <ProfilePictureUpload
              user={user}
              onUpload={handlePictureUpload}
              onRemove={handlePictureRemove}
              loading={loading.picture}
            />

            <Input
              label="Full Name"
              type="text"
              value={profileForm.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              error={profileErrors.name}
              placeholder="Enter your full name"
              icon={User}
              required
            />

            <Button
              onClick={handleProfileUpdate}
              disabled={loading.profile}
              className="w-full"
            >
              {loading.profile ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Saving...
                </div>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        )}

        {/* Password tab content */}
        {activeTab === "security" && (
          <div className="space-y-4">
            {/* Password form fields... */}

            <Button
              onClick={handlePasswordUpdate}
              disabled={loading.password}
              className="w-full"
            >
              {loading.password ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Changing...
                </div>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
