// src/components/users/UserTable.jsx - Complete version with ProfilePicture integration
import React, { useState } from "react";
import {
  Eye,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Shield,
  Mail,
  Calendar,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";

const getRoleColor = (role) => {
  const colors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    user: "bg-green-100 text-green-800 border-green-200",
  };
  return colors[role] || "bg-gray-100 text-gray-800 border-gray-200";
};



const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.ceil((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
      });
    }
  } catch (error) {
    return "Invalid date";
  }
};

export const UserTable = ({
  users = [],
  onView,
  
  userRole = "user",
  
  loading = false,
}) => {
  const { user: currentUser } = useAuth();
  const [expandedUser, setExpandedUser] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  const canViewUser = (targetUser) => {
    return (
      userRole === "admin"  ||
      targetUser.id === currentUser.id ||
      targetUser._id === currentUser.id
    );
  };

  const toggleExpanded = (userId) => {
    setExpandedUser(expandedUser === userId ? null : userId);
    setActionMenuOpen(null); // Close any open action menus
  };

  const toggleActionMenu = (userId, event) => {
    event.stopPropagation();
    setActionMenuOpen(actionMenuOpen === userId ? null : userId);
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No users found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or create a new user
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => {
              const userId = user.id || user._id;
              const isExpanded = expandedUser === userId;
              const isCurrentUser =
                userId === currentUser.id || userId === currentUser._id;

              return (
                <React.Fragment key={userId}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isExpanded ? "bg-blue-50" : ""
                    } ${isCurrentUser ? "bg-yellow-50" : ""}`}
                    onClick={() => toggleExpanded(userId)}
                  >
                    {/* User Info with ProfilePicture - Enhanced for mobile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <ProfilePicture
                            user={user}
                            size="md"
                            className={`${
                              !user.isActive ? "opacity-50 grayscale" : ""
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-blue-600 font-semibold">
                                  (You)
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <p className="text-xs text-gray-500 truncate">
                              {user.email}
                            </p>
                          </div>
                          {/* Show role and status on mobile only */}
                          <div className="md:hidden mt-2 space-y-1">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                                  user.role
                                )}`}
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role}
                              </span>
                              {user.isActive ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <UserX className="h-3 w-3 mr-1" />
                                  Inactive
                                </span>
                              )}
                            </div>
                          
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role - Hidden on mobile */}
                    <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(
                          user.role
                        )}`}
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {user.role}
                      </span>
                    </td>

                  

                    {/* Status - Hidden on mobile */}
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Active
                            </span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-500 mr-2" />
                            <span className="text-sm text-red-700 font-medium">
                              Inactive
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                 

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canViewUser(user) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onView(user);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                            title="View user details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td
                        colSpan="6"
                        className="hidden lg:table-cell px-6 py-4"
                      >
                        <div className="max-w-4xl">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">
                                Account Created:
                              </span>
                              <p className="text-gray-700">
                                {formatDate(user.createdAt)}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Last Updated:
                              </span>
                              <p className="text-gray-700">
                                {formatDate(user.updatedAt)}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Account Status:
                              </span>
                              <p
                                className={`font-medium ${
                                  user.isActive
                                    ? "text-green-700"
                                    : "text-red-700"
                                }`}
                              >
                                {user.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>

                            <div>
                              <span className="font-medium text-gray-900">
                                Login Attempts:
                              </span>
                              <p className="text-gray-700">
                                {user.loginAttempts || 0} failed attempts
                              </p>
                            </div>

                            {user.lockUntil &&
                              new Date(user.lockUntil) > new Date() && (
                                <div className="md:col-span-2">
                                  <span className="font-medium text-red-900">
                                    Account Locked Until:
                                  </span>
                                  <p className="text-red-700">
                                    {new Date(user.lockUntil).toLocaleString()}
                                  </p>
                                </div>
                              )}

                            {/* Display profile picture info if available */}
                            {user.displayPicture && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Profile Picture:
                                </span>
                                <p className="text-gray-700">
                                  {user.displayPicture.type === "image"
                                    ? "Custom image uploaded"
                                    : "Using initials"}
                                </p>
                              </div>
                            )}
                          </div>

                          {isCurrentUser && (
                            <div className="mt-3 p-3 bg-blue-100 rounded-md">
                              <p className="text-sm text-blue-800">
                                💡 This is your account. Some management actions
                                are not available for your own account for
                                security reasons.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Mobile expanded view */}
                      <td colSpan="2" className="lg:hidden px-6 py-4">
                        <div className="space-y-3">
                        

                          {/* Account Info */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Account Info
                            </h4>
                            <div className="space-y-1 text-sm text-gray-700">
                              <p>Created: {formatDate(user.createdAt)}</p>
                              <p>Updated: {formatDate(user.updatedAt)}</p>
                              <p>Failed logins: {user.loginAttempts || 0}</p>
                            </div>
                          </div>

                          {user.lockUntil &&
                            new Date(user.lockUntil) > new Date() && (
                              <div>
                                <h4 className="text-sm font-medium text-red-900 mb-1">
                                  Account Locked
                                </h4>
                                <p className="text-sm text-red-700">
                                  Until:{" "}
                                  {new Date(user.lockUntil).toLocaleString()}
                                </p>
                              </div>
                            )}

                          {isCurrentUser && (
                            <div className="p-3 bg-blue-100 rounded-md">
                              <p className="text-sm text-blue-800">
                                💡 This is your account. Some management actions
                                are not available for your own account for
                                security reasons.
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
};
