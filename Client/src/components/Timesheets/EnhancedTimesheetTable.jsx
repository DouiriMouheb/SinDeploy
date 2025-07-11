// src/components/Timesheets/EnhancedTimeSheetTable.jsx - Enhanced time entries table with search, pagination, and column reordering
import React, { useState, useMemo } from "react";
import TimesheetCard from "./TimesheetCard";
import {
  Edit,
  Trash2,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  X,
  Briefcase,
  MonitorCheck,
  Building,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ProfilePicture } from "../common/ProfilePicture";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    const today = new Date();

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
    });
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

const formatDuration = (hours) => {
  if (!hours || hours === 0) return "0h";

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours > 0 && minutes > 0) {
    return `${wholeHours}h ${minutes}m`;
  } else if (wholeHours > 0) {
    return `${wholeHours}h`;
  } else {
    return `${minutes}m`;
  }
};

// Expanded column configuration to match timesheet modal fields
const DEFAULT_COLUMNS = [
  {
    id: "date",
    key: "startTime",
    label: "Date",
    sortable: true,
    visible: false, // Hide date column
    width: "120px",
  },
  {
    id: "organization",
    key: "organizationId",
    label: "Organization",
    sortable: true,
    visible: true,
    width: "auto",
  },
  {
    id: "startTime",
    key: "startTime",
    label: "Start Time",
    sortable: true,
    visible: true,
    width: "60px",
  },
  {
    id: "endTime",
    key: "endTime",
    label: "End Time",
    sortable: true,
    visible: true,
    width: "60px",
  },
  {
    id: "workLocation",
    key: "workLocation",
    label: "Work Location",
    sortable: false,
    visible: true,
    width: "60px",
  },
  {
    id: "customer",
    key: "customerId",
    label: "Customer",
    sortable: true,
    visible: true,
    width: "100px",
  },
  {
    id: "process",
    key: "processId",
    label: "Process",
    sortable: true,
    visible: true,
    width: "140px",
  },
  {
    id: "activity",
    key: "activityId",
    label: "Activity",
    sortable: true,
    visible: true,
    width: "140px",
  },

  {
    id: "notes",
    key: "notes",
    label: "Notes",
    sortable: false,
    visible: true,
    width: "120px",
  },

  {
    id: "totalHours",
    key: "totalHours",
    label: "Total Hours",
    sortable: true,
    visible: false, // Hide total hours column
    width: "100px",
  },
];

export const EnhancedTimeSheetTable = ({
  timeEntries = [],
  onEdit,
  onDelete,
  canEdit = () => true,
  canDelete = () => true,
  loading = false,
  processes = [],
  activities = [],
  organizations = [],
  customers = [],
  viewMode = "table",
  currentDate = new Date(),
  onDateChange = () => {},
}) => {
  // Table/Card state - use shared currentDate prop
  // const [selectedDate, setSelectedDate] = useState(() => {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0);
  //   return today;
  // });
  // Remove sortConfig, always sort by startTime ascending (chronological)
  // const [sortConfig, setSortConfig] = useState({
  //   key: "startTime",
  //   direction: "asc",
  // });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fixed page size to 10
  // viewMode and setViewMode are now controlled by parent (TimeSheetList)

  // Use fixed columns - no customization
  const columns = DEFAULT_COLUMNS;

  // Helper functions
  const getProcessName = (processId) => {
    const process = processes.find((p) => (p.id || p._id) === processId);
    return process ? process.name : "Unknown Process";
  };

  const getActivityName = (activityId) => {
    const activity = activities.find((a) => (a.id || a._id) === activityId);
    return activity ? activity.name : "Unknown Activity";
  };

  const getOrganizationName = (organizationId) => {
    const organization = organizations.find(
      (o) => (o.id || o._id) === organizationId
    );
    return organization ? organization.name : "Unknown Organization";
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => (c.id || c._id) === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  // Get nested property value
  const getNestedValue = (obj, path) => {
    return path
      .split(".")
      .reduce(
        (current, prop) =>
          current && current[prop] !== undefined ? current[prop] : null,
        obj
      );
  };

  // Filter and search entries
  const filteredEntries = useMemo(() => {
    return timeEntries.filter((entry) => {
      if (!entry.startTime) return false;
      const entryDate = new Date(entry.startTime);
      entryDate.setHours(0, 0, 0, 0);
      const selectedDate = new Date(currentDate);
      selectedDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === selectedDate.getTime();
    });
  }, [timeEntries, currentDate]);

  // Sort entries: always by startTime ascending (chronological)
  const sortedEntries = useMemo(() => {
    return [...filteredEntries].sort((a, b) => {
      const aTime = a.startTime ? new Date(a.startTime).getTime() : 0;
      const bTime = b.startTime ? new Date(b.startTime).getTime() : 0;
      return aTime - bTime;
    });
  }, [filteredEntries]);

  // Paginate entries
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEntries.slice(startIndex, startIndex + pageSize);
  }, [sortedEntries, currentPage, pageSize]);

  // Pagination info
  const totalPages = Math.ceil(sortedEntries.length / pageSize);
  const startEntry = (currentPage - 1) * pageSize + 1;
  const endEntry = Math.min(currentPage * pageSize, sortedEntries.length);

  // Handlers
  // Sorting is always by startTime ascending, so handleSort is not needed
  // const handleSort = (key) => {
  //   setSortConfig((prev) => ({
  //     key,
  //     direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
  //   }));
  // };

  const resetFilters = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    onDateChange(today);
    setCurrentPage(1);
  };

  const visibleColumns = columns.filter((col) => col.visible);

  // Removed toggleExpanded function

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

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200">
      {/* Header with controls: Only date navigation here */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
        {/* Previous Day Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const prev = new Date(currentDate);
            prev.setDate(prev.getDate() - 1);
            onDateChange(prev);
          }}
          className="border border-gray-300 rounded-md flex items-center justify-center transition-colors hover:bg-gray-100"
          aria-label="Previous Day"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {/* Date Display with Calendar Popup */}
        <DatePicker
          selected={currentDate}
          onChange={(date) => date && onDateChange(date)}
          customInput={
            <button
              className="px-3 py-1 rounded-md border border-gray-300 bg-white text-gray-900 font-medium shadow hover:bg-gray-50 flex items-center gap-2"
              style={{ minWidth: 120 }}
              aria-label="Pick date"
              type="button"
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              {currentDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </button>
          }
          popperPlacement="bottom"
          popperClassName="!z-[9999]"
          calendarClassName="!shadow-lg !rounded-xl !border !border-gray-300"
          dayClassName={(date) =>
            date.toDateString() === new Date().toDateString()
              ? "!bg-blue-100 !text-blue-700"
              : undefined
          }
          todayButton="Today"
          showPopperArrow={false}
        />
        {/* Next Day Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const next = new Date(currentDate);
            next.setDate(next.getDate() + 1);
            onDateChange(next);
          }}
          className="border border-gray-300 rounded-md flex items-center justify-center transition-colors hover:bg-gray-100"
          aria-label="Next Day"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      {/* Content */}
      <div className="flex flex-row w-full gap-4">
        <div className="flex-1 overflow-x-auto">
          {sortedEntries.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No time entries found
              </h3>
            </div>
          ) : viewMode === "table" ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr className="hidden sm:table-row">
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <th
                        key={col.id}
                        className={`px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          col.id === "actions" ? "text-right" : ""
                        }`}
                        style={col.width ? { minWidth: col.width } : {}}
                      >
                        {col.label}
                      </th>
                    ))}
                </tr>
                <tr className="sm:hidden">
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start-End
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Process
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEntries.map((entry, idx) => {
                  if (!entry || (!entry.id && !entry._id)) return null;
                  const entryId = entry.id || entry._id;
                  const rowClass = idx % 2 === 0 ? "bg-white" : "bg-gray-200";
                  return [
                    // Desktop row
                    <tr
                      key={entryId + "-desktop"}
                      className={`hidden sm:table-row ${rowClass}`}
                      onClick={() => canEdit(entry) && onEdit(entry)}
                      style={{
                        cursor: canEdit(entry) ? "pointer" : undefined,
                      }}
                    >
                      {columns
                        .filter((col) => col.visible)
                        .map((col) => {
                          switch (col.id) {
                            case "date":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  <div className="flex items-center text-gray-900 justify-center">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    <div className="font-medium">
                                      {formatDate(entry.startTime)}
                                    </div>
                                  </div>
                                </td>
                              );
                            case "organization":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {entry.organization?.name || "-"}
                                </td>
                              );
                            case "customer":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {getCustomerName(entry.customerId)}
                                </td>
                              );
                            case "process":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {getProcessName(entry.processId)}
                                </td>
                              );
                            case "activity":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {getActivityName(entry.activityId)}
                                </td>
                              );
                            case "workLocation":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {entry.workPlaceType || "-"}
                                </td>
                              );
                            case "notes":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center truncate max-w-xs"
                                >
                                  {entry.description || "-"}
                                </td>
                              );
                            case "startTime":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {formatTime(entry.startTime)}
                                </td>
                              );
                            case "endTime":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {formatTime(entry.endTime)}
                                </td>
                              );
                            case "totalHours":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  {entry.totalHours != null
                                    ? entry.totalHours
                                    : "-"}
                                </td>
                              );
                            case "actions":
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-right w-32"
                                >
                                  <div className="flex items-center justify-end space-x-2">
                                    {canEdit(entry) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onEdit(entry);
                                        }}
                                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        title="Edit entry"
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {canDelete(entry) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onDelete(entryId);
                                        }}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        title="Delete entry"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              );
                            default:
                              return (
                                <td
                                  key={col.id}
                                  className="px-4 py-3 text-sm text-center"
                                >
                                  -
                                </td>
                              );
                          }
                        })}
                    </tr>,
                    // Mobile row
                    <tr
                      key={entryId + "-mobile"}
                      className={`sm:hidden ${rowClass}`}
                      onClick={() => canEdit(entry) && onEdit(entry)}
                      style={{
                        cursor: canEdit(entry) ? "pointer" : undefined,
                      }}
                    >
                      <td className="px-4 py-3 text-center text-base">
                        {(() => {
                          const name = getCustomerName(entry.customerId);
                          if (!name || name === "Unknown Customer") return "-";
                          const initials = name
                            .split(" ")
                            .map((n) => n[0])
                            .join(".")
                            .toUpperCase();
                          return initials;
                        })()}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {formatTime(entry.startTime)} -{" "}
                        {formatTime(entry.endTime)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        {getProcessName(entry.processId)}
                      </td>
                    </tr>,
                  ];
                })}
                {/* Pagination and Results Info for table view */}
                {sortedEntries.length > 0 && (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-3 border-t border-gray-200"
                    >
                      {totalPages > 1 && (
                        <div className="flex items-center space-x-1 order-2 sm:order-1 mt-2 sm:mt-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center space-x-1">
                            {Array.from(
                              { length: Math.min(5, totalPages) },
                              (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                  pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                  pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                  pageNum = totalPages - 4 + i;
                                } else {
                                  pageNum = currentPage - 2 + i;
                                }
                                if (pageNum < 1 || pageNum > totalPages)
                                  return null;
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={
                                      pageNum === currentPage
                                        ? "primary"
                                        : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-8 w-8 p-0 ${
                                      pageNum === currentPage
                                        ? "bg-blue-100 text-blue-700"
                                        : ""
                                    }`}
                                  >
                                    {pageNum}
                                  </Button>
                                );
                              }
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            // Card view
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {paginatedEntries.map((entry) => (
                  <TimesheetCard
                    key={entry.id || entry._id}
                    entry={entry}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    getCustomerName={getCustomerName}
                    getProcessName={getProcessName}
                    getActivityName={getActivityName}
                    getOrganizationName={getOrganizationName}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatDuration={formatDuration}
                  />
                ))}
              </div>
              {/* Pagination for card view */}
              {viewMode === "card" && sortedEntries.length > 0 && (
                <div className="px-4 py-3 border-t border-gray-200">
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-1 order-2 sm:order-1 mt-2 sm:mt-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            if (pageNum < 1 || pageNum > totalPages)
                              return null;
                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  pageNum === currentPage ? "primary" : "ghost"
                                }
                                size="sm"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`h-8 w-8 p-0 ${
                                  pageNum === currentPage
                                    ? "bg-blue-100 text-blue-700"
                                    : ""
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronsRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
