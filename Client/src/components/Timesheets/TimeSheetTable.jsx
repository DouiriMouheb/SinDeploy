// src/components/Timesheets/TimeSheetTable.jsx - Time entries display
import React, { useState } from "react";
import {
  Edit,
  Trash2,
  Clock,
  Calendar,
  Play,
  Pause,
  Square,
  AlertCircle,
  Briefcase,
  User,
} from "lucide-react";
import { Button } from "../common/Button";
import { ProfilePicture } from "../common/ProfilePicture";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
      });
    }
  } catch (error) {
    return "Invalid date";
  }
};

const formatTime = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch (error) {
    return "N/A";
  }
};

const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString();
  } catch (error) {
    return "N/A";
  }
};

export const TimeSheetTable = ({
  timeEntries = [],
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
  loading = false,
  showUser = false, // For admin/manager views
}) => {
  const [expandedEntry, setExpandedEntry] = useState(null);

  const toggleExpanded = (entryId) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading time entries...</span>
        </div>
      </div>
    );
  }

  if (timeEntries.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
        <div className="text-center">
          <Clock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No time entries found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start tracking your time or adjust your filters
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
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task & Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>

              {showUser && (
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {timeEntries.map((entry) => {
              const entryId = entry.id || entry._id;
              const isExpanded = expandedEntry === entryId;

              return (
                <React.Fragment key={entryId}>
                  <tr
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                      isExpanded ? "bg-blue-50" : ""
                    }`}
                    onClick={() => toggleExpanded(entryId)}
                  >
                    {/* Task & Project - Hidden on mobile */}
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.taskName}
                            </p>
                            {entry.isManual && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                Manual
                              </span>
                            )}
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center text-xs text-gray-500">
                              <Briefcase className="h-3 w-3 mr-1" />
                              <span className="truncate">
                                {entry.workProject?.name || "Unknown Project"}
                              </span>
                              {entry.workProject?.customer?.name && (
                                <span className="ml-1 truncate">
                                  ({entry.workProject.customer.name})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <span className="truncate">
                                {entry.activity?.name || "Unknown Activity"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time - Enhanced for mobile */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(entry.startTime)}
                        </div>
                        <div className="flex items-center text-gray-500 mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(entry.startTime)} -{" "}
                          {formatTime(entry.endTime)}
                        </div>
                        {/* Show task name on mobile only */}
                        <div className="md:hidden mt-2 text-xs">
                          <p className="font-medium text-gray-900 truncate">
                            {entry.taskName}
                          </p>
                          {entry.isManual && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                              Manual
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* User (for admin/manager views) - Hidden on mobile */}
                    {showUser && (
                      <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ProfilePicture
                            user={entry.user}
                            size="sm"
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">
                            {entry.user?.name || "Unknown User"}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(entry);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                          title="Edit details"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {canDelete(entry) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(entryId);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {isExpanded && (
                    <tr className="bg-blue-50">
                      <td
                        colSpan={showUser ? 6 : 5}
                        className="hidden md:table-cell px-6 py-4"
                      >
                        <div className="max-w-4xl">
                          {/* Description */}
                          {entry.description && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">
                                Description
                              </h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {entry.description}
                              </p>
                            </div>
                          )}

                          {/* Additional Details */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">
                                Created:
                              </span>
                              <p className="text-gray-700">
                                {entry.createdAt
                                  ? new Date(entry.createdAt).toLocaleString()
                                  : "N/A"}
                              </p>
                            </div>

                            {entry.endTime && (
                              <div>
                                <span className="font-medium text-gray-900">
                                  Completed:
                                </span>
                                <p className="text-gray-700">
                                  {new Date(entry.endTime).toLocaleString()}
                                </p>
                              </div>
                            )}

                            <div>
                              <span className="font-medium text-gray-900">
                                Type:
                              </span>
                              <p
                                className={`font-medium ${
                                  entry.isManual
                                    ? "text-purple-600"
                                    : "text-blue-600"
                                }`}
                              >
                                {entry.isManual
                                  ? "Manual Entry"
                                  : "Timer Entry"}
                              </p>
                            </div>

                            {entry.workProject?.description && (
                              <div className="md:col-span-3">
                                <span className="font-medium text-gray-900">
                                  Project Description:
                                </span>
                                <p className="text-gray-700 mt-1">
                                  {entry.workProject.description}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Entry Type Info */}
                        </div>
                      </td>
                      {/* Mobile expanded view */}
                      <td colSpan="3" className="md:hidden px-6 py-4">
                        <div className="space-y-3">
                          {/* Task and Project Info */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-1">
                              Project & Activity
                            </h4>
                            <div className="text-sm text-gray-700">
                              <div className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                <span>
                                  {entry.workProject?.name || "Unknown Project"}
                                </span>
                              </div>
                              <div className="ml-4 text-xs text-gray-500">
                                {entry.activity?.name || "Unknown Activity"}
                              </div>
                              {entry.workProject?.customer?.name && (
                                <div className="ml-4 text-xs text-gray-500">
                                  Customer: {entry.workProject.customer.name}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Description */}
                          {entry.description && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                Description
                              </h4>
                              <p className="text-sm text-gray-700">
                                {entry.description}
                              </p>
                            </div>
                          )}

                          {/* User info if shown */}
                          {showUser && entry.user && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                User
                              </h4>
                              <div className="flex items-center">
                                <ProfilePicture
                                  user={entry.user}
                                  size="sm"
                                  className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                  {entry.user.name}
                                </span>
                              </div>
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
    </div>
  );
};
