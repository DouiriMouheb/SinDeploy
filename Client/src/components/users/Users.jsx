// src/components/users/Users.jsx - Verified integration with proper modal handling
import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
  Users as UsersIcon,
} from "lucide-react";
import { useAuth } from "react-oidc-context";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { UserTable } from "./UserTable";
import { UserModal } from "./UserModal";
import { UserFilters } from "./UserFilters";
import { UserDetails } from "./UserDetails";
import { userService } from "../../services/users";
import { showToast } from "../../utils/toast";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedUserId, setSelectedUserId] = useState(null);

  // FIXED: Simplified confirmation modal state management
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "desc",
    search: "",
  });

  const { user, hasRole } = useAuth();

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const response = await userService.getUsers(cleanFilters);

      if (response.success) {
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || {});
      }
    } catch (err) {
      console.error("Error loading users:", err);
      const errorMessage = err.message || "Failed to load users";
      setError(errorMessage);
      showToast.user.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(
      user || {
        name: "",
        email: "",
        password: "",
        role: "user",
        department: hasRole("admin") ? "IT" : user?.department || "",
        isActive: true,
      }
    );
    setShowModal(true);
  };

  const viewUser = (user) => {
    setSelectedUserId(user.id || user._id);
    setViewMode("details");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedUserId(null);
  };

  const handleSave = async (userData) => {
    const loadingToastId = showToast.loading(
      modalMode === "create" ? "Creating user..." : "Updating user..."
    );

    try {
      setError(null);

      if (modalMode === "create") {
        const response = await userService.createUser(userData);
        if (response.success) {
          setUsers((prevUsers) => [response.data.user, ...prevUsers]);
          showToast.dismiss(loadingToastId);
          showToast.user.created();
          setShowModal(false);
          loadUsers(); // Reload to get fresh data and update pagination
        }
      } else if (modalMode === "edit") {
        const response = await userService.updateUser(
          selectedUser.id || selectedUser._id,
          userData
        );
        if (response.success) {
          setUsers((prevUsers) =>
            prevUsers.map((u) =>
              (u.id || u._id) === (selectedUser.id || selectedUser._id)
                ? response.data.user
                : u
            )
          );
          showToast.dismiss(loadingToastId);
          showToast.user.updated();
          setShowModal(false);
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
      showToast.dismiss(loadingToastId);
    }
  };

  const handleToggleStatus = async (userId, newStatus) => {
    try {
      const response = await userService.toggleUserStatus(userId, newStatus);
      if (response.success) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            (u.id || u._id) === userId ? response.data.user : u
          )
        );
        if (newStatus) {
          showToast.user.activated(response.data.user.name);
        } else {
          showToast.user.deactivated(response.data.user.name);
        }
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
    }
  };

  // Simple refresh callback for UserDetails after it handles deletion internally
  const handleUserDeleted = () => {
    loadUsers(); // Just refresh the list
  };

  // FIXED: Proper modal-triggered delete handling for table actions
  const handleDeleteRequest = (userId) => {
    const user = users.find((u) => (u.id || u._id) === userId);
    if (user) {
      setUserToDelete(user);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    try {
      const userId = userToDelete.id || userToDelete._id;
      await userService.deleteUser(userId);

      setUsers((prevUsers) =>
        prevUsers.filter((u) => (u.id || u._id) !== userId)
      );

      showToast.user.deleted();
      setShowDeleteModal(false);
      setUserToDelete(null);
      loadUsers(); // Reload to update pagination
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      const tempPassword = Math.random().toString(36).slice(-8) + "A1!";
      const response = await userService.resetUserPassword(
        userId,
        tempPassword,
        true
      );

      if (response.success) {
        showToast.user.passwordReset("User");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await userService.changeUserRole(userId, newRole);
      if (response.success) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            (u.id || u._id) === userId ? response.data.user : u
          )
        );
        showToast.user.roleChanged("User", newRole);
      }
    } catch (err) {
      console.error("Error changing role:", err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const dismissError = () => {
    setError(null);
  };

  // Access control
  const canCreateUser = hasRole("admin");
 
  const canEditUser = (targetUser) => {
    return (
      hasRole("admin") 
    );
  };
  const canDeleteUser = hasRole("admin");

  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to view user management.
          </p>
        </div>
      </div>
    );
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Show user details view
  if (viewMode === "details" && selectedUserId) {
    return (
      <UserDetails
        userId={selectedUserId}
        onBack={backToList}
        onEdit={(user) => {
          setViewMode("list");
          openModal("edit", user);
        }}
        onStatusToggle={handleToggleStatus}
        onResetPassword={handleResetPassword}
        onChangeRole={handleChangeRole}
        onDelete={handleUserDeleted} // Pass refresh callback instead of delete handler
      />
    );
  }

  // Show list view
  return (
    <div>
      <div className="mb-8">
        {/* Header - responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              User Management !!
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {hasRole("admin")
                ? "Manage all users across the organization"
                : ``}
            </p>
          </div>

          {/* Buttons - stay horizontal but move below title on mobile */}
          <div className="flex space-x-2 sm:mt-0">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button
              onClick={loadUsers}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            {canCreateUser && (
              <Button onClick={() => openModal("create")} size="sm">
                <Plus className="h-5 w-5 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-red-700">{error}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissError}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <UserFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          userRole={user.role}
          
        />
      )}

      {/* Users Table - FIXED: Proper prop passing */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <UserTable
          users={users}
          onView={viewUser}
          onEdit={(user) => openModal("edit", user)}
          onDelete={handleDeleteRequest} // FIXED: This now properly triggers the modal
          canEdit={canEditUser}
          canDelete={canDeleteUser}
          userRole={user.role}
        
          loading={loading}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing{" "}
              {Math.min(
                (pagination.currentPage - 1) * filters.limit + 1,
                pagination.totalUsers
              )}{" "}
              to{" "}
              {Math.min(
                pagination.currentPage * filters.limit,
                pagination.totalUsers
              )}{" "}
              of {pagination.totalUsers} users
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* User Create/Edit Modal */}
      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={selectedUser}
        onChange={setSelectedUser}
        onSave={handleSave}
        mode={modalMode}
        userRole={user.role}
       
      />

      {/* FIXED: Single delete confirmation modal for table actions */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will permanently remove the user account and all associated data."
        confirmText="Delete User"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
        itemName={
          userToDelete ? `${userToDelete.name} (${userToDelete.email})` : null
        }
        details={[
          "All user data will be permanently deleted",
          "Any tickets  assigned to this user will need to be reassigned",
          "This action cannot be reversed",
        ]}
      />
    </div>
  );
};
