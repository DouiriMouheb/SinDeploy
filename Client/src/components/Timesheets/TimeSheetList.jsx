// src/components/Timesheets/TimeSheetList.jsx - Main container with calendar views
import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  List,
  ChevronLeft,
  ChevronRight,
  Play,
  Clock,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { EnhancedTimeSheetTable } from "./EnhancedTimesheetTable";
import { NewTimeEntryModal } from "./NewTimeEntryModal";
import { TimesheetCalendarView } from "./TimesheetCalendarView";
import { TimesheetCalendarView as TimesheetCalendarLandscapeView } from "./TimesheetCalendarView_Enhanced";
import TimesheetTimeline from "./TimesheetTimeline";
import { timesheetService } from "../../services/timesheets";
import { processService } from "../../services/processes";
import { organizationService } from "../../services/organizations";
import { customerService } from "../../services/customers";
import { showToast } from "../../utils/toast";

export const TimeSheetList = () => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal states
  const [showTimeEntryModal, setShowTimeEntryModal] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState(null);
  const [modalMode, setModalMode] = useState("create");

  // View states
  // "list" = table, "card" = card, "calendar" = month calendar, "calendarLand" = calendar landscape view, "timeline" = timeline view
  const [viewMode, setViewMode] = useState("list");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Data for dropdowns
  const [processes, setProcesses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    hasNext: false,
    hasPrev: false,
  });

  const { user, isInitialized } = useAuth();

  useEffect(() => {
    // Only load data if user is authenticated and auth is initialized
    if (isInitialized && user) {
      loadInitialData();
    }
  }, [isInitialized, user]);

  useEffect(() => {
    // Only load time entries if user is authenticated
    if (isInitialized && user) {
      loadTimeEntries();
    }
  }, [currentDate, viewMode, isInitialized, user]);

  const loadInitialData = async () => {
    try {
      // Load all data in parallel (processes will also load activities)
      await Promise.all([
        loadOrganizations(),
        loadProcesses(), // This now also loads activities
        loadCustomers(),
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await organizationService.getUserOrganizations();
      if (response.success) {
        setOrganizations(response.data.organizations || []); // Extract organizations array
      } else {
        console.error("Failed to load organizations:", response);
        showToast.error("Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error(`Error loading organizations: ${error.message}`);
    }
  };

  const loadProcesses = async () => {
    try {
      const response = await processService.getProcesses();
      if (response.success) {
        const processesData = response.data?.processes || response.data || [];
        setProcesses(processesData);

        // Extract activities from the loaded processes
        const allActivities = [];
        processesData.forEach((process) => {
          if (process.activities && Array.isArray(process.activities)) {
            process.activities.forEach((activity) => {
              allActivities.push({
                ...activity,
                processId: process.id,
                processName: process.name,
              });
            });
          }
        });
        setActivities(allActivities);
      } else {
        console.error("Failed to load processes:", response);
        showToast.error("Failed to load processes");
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error(`Error loading processes: ${error.message}`);
    }
  };

  const loadActivities = async () => {
    try {
      // Get activities from the processes we already loaded instead of making separate API calls
      if (processes.length > 0) {
        const allActivities = [];
        processes.forEach((process) => {
          if (process.activities && Array.isArray(process.activities)) {
            process.activities.forEach((activity) => {
              allActivities.push({
                ...activity,
                processId: process.id,
                processName: process.name,
              });
            });
          }
        });
        setActivities(allActivities);
      } else {
        // If no processes loaded yet, just set empty array
        setActivities([]);
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast.error(`Error loading activities: ${error.message}`);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getCustomers();
      if (response.success) {
        setCustomers(response.data.customers || []); // Extract customers array
      } else {
        console.error("Failed to load customers:", response);
        showToast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error(`Error loading customers: ${error.message}`);
    }
  };

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      setError(null);

      // Apply date filtering for all views to keep them in sync
      let queryParams = {};
      const dateRange = getDateRangeForView();

      // For list and card views, use daily range (same as timeline)
      // For calendar views, use appropriate range
      if (
        viewMode === "list" ||
        viewMode === "card" ||
        viewMode === "timeline"
      ) {
        // Use daily range for list, card, and timeline views
        const date = new Date(currentDate);
        queryParams.startDate = date.toISOString().split("T")[0];
        queryParams.endDate = date.toISOString().split("T")[0];
      } else {
        // Use the calculated range for calendar views
        queryParams.startDate = dateRange.start;
        queryParams.endDate = dateRange.end;
      }

      const response = await timesheetService.getTimeEntries(queryParams);

      if (response.success) {
        setTimeEntries(response.data || []);
        // TODO: Add pagination support if needed
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalEntries: response.data?.length || 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (err) {
      console.error("Error loading time entries:", err);
      const errorMessage = err.message || "Failed to load time entries";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeForView = () => {
    const date = new Date(currentDate);

    switch (viewMode) {
      case "daily":
      case "timeline":
        return {
          start: date.toISOString().split("T")[0],
          end: date.toISOString().split("T")[0],
        };

      case "weekly":
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return {
          start: startOfWeek.toISOString().split("T")[0],
          end: endOfWeek.toISOString().split("T")[0],
        };

      case "monthly":
      case "calendar":
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
          start: startOfMonth.toISOString().split("T")[0],
          end: endOfMonth.toISOString().split("T")[0],
        };

      default:
        return { start: "", end: "" };
    }
  };

  const openTimeEntryModal = (mode, entry = null, dateInfo = null) => {
    setModalMode(mode);

    let defaultEntry = {
      organizationId: "",
      customerId: "",
      processId: "",
      activityId: "",
      workLocation: "",
      notes: "",
      startTime: "",
      endTime: "",
      totalHours: 0,
    };

    // If dateInfo is provided (from calendar), use it
    if (dateInfo) {
      defaultEntry = {
        ...defaultEntry,
        startTime: dateInfo.startTime || "",
      };
    }

    setSelectedTimeEntry(entry || defaultEntry);
    setShowTimeEntryModal(true);
  };

  const openTimerStartModal = () => {
    setShowTimerStartModal(true);
  };

  const handleTimeEntrySave = async (entryData) => {
    // Only update state, do not close modal or reload here. Modal handles API and close.
    if (modalMode === "create") {
      setTimeEntries((prev) => [entryData, ...prev]);
      loadTimeEntries();
    } else if (modalMode === "edit") {
      setTimeEntries((prev) =>
        prev.map((entry) =>
          (entry.id || entry._id) === (entryData.id || entryData._id)
            ? entryData
            : entry
        )
      );
      loadTimeEntries();
    }
  };

  const handleDeleteRequest = (entryId) => {
    const entry = timeEntries.find((e) => (e.id || e._id) === entryId);
    if (entry) {
      setEntryToDelete(entry);
      setShowDeleteModal(true);
    }
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;

    setIsDeleting(true);

    try {
      const entryId = entryToDelete.id || entryToDelete._id;
      await timesheetService.deleteTimeEntry(entryId);

      setTimeEntries((prev) =>
        prev.filter((entry) => (entry.id || entry._id) !== entryId)
      );

      showToast.success("Time entry deleted successfully");
      setShowDeleteModal(false);
      setEntryToDelete(null);
      loadTimeEntries();
    } catch (err) {
      console.error("Error deleting time entry:", err);
      showToast.error("Failed to delete time entry");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setEntryToDelete(null);
    }
  };

  if (loading && timeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* Header */}
        <div className="mb-6">
          {/* Title Section */}
          {/* <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Timesheet</h1>
              <p className="mt-2 text-sm text-gray-600">
                Track your time and manage entries
              </p>
            </div>
          </div>*/}

          {/* Controls Section */}
          <div className="flex flex-col lg:flex-row lg:justify-start lg:items-start space-y-4 lg:space-y-0">
            {" "}
            {/* View Mode Selector */}
            <div className="flex flex-row items-center gap-2 w-full max-w-xs mb-2">
              {/* Refresh Button */}
              <Button
                onClick={loadTimeEntries}
                variant="secondary"
                disabled={loading}
                className="px-2 py-1"
                aria-label="Refresh"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              </Button>
              {/* Add Time Entry Button */}
              <Button
                onClick={() => openTimeEntryModal("create")}
                className="px-2 py-1"
                aria-label="New Entry"
              >
                <Plus className="h-4 w-4" />
              </Button>
              {/* Table View Toggle */}
              <Button
                variant={viewMode === "list" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={
                  viewMode === "list" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Table View"
              >
                <List className="h-4 w-4" />
              </Button>
              {/* Card View Toggle */}
              <Button
                variant={viewMode === "card" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("card")}
                className={
                  viewMode === "card" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Card View"
              >
                <Clock className="h-4 w-4" />
              </Button>
              {/* Calendar Landscape View Toggle */}
              <Button
                variant={viewMode === "calendarLand" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("calendarLand")}
                className={
                  viewMode === "calendarLand" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Calendar Landscape View"
              >
                <CalendarDays className="h-4 w-4" />
              </Button>
              {/* Timeline View Toggle */}
              <Button
                variant={viewMode === "timeline" ? "primary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={
                  viewMode === "timeline" ? "bg-blue-100 text-blue-700" : ""
                }
                title="Timeline View"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
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
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Time Entries View - All views mounted, only one visible for smooth transitions */}
        <div style={{ position: "relative" }}>
          <div style={{ display: viewMode === "calendar" ? "block" : "none" }}>
            <TimesheetCalendarView
              timeEntries={timeEntries}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAddEntry={(dateInfo) =>
                openTimeEntryModal("create", null, dateInfo)
              }
              onEditEntry={(entry) => openTimeEntryModal("edit", entry)}
              onDeleteEntry={handleDeleteRequest}
              processes={processes}
              activities={activities}
              organizations={organizations}
              customers={customers}
              loading={loading}
            />
          </div>
          <div
            style={{ display: viewMode === "calendarLand" ? "block" : "none" }}
          >
            <TimesheetCalendarLandscapeView
              timeEntries={timeEntries}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onAddEntry={(dateInfo) =>
                openTimeEntryModal("create", null, dateInfo)
              }
              onEditEntry={(entry) => openTimeEntryModal("edit", entry)}
              onDeleteEntry={handleDeleteRequest}
              processes={processes}
              activities={activities}
              organizations={organizations}
              customers={customers}
              loading={loading}
            />
          </div>
          <div style={{ display: viewMode === "timeline" ? "block" : "none" }}>
            <TimesheetTimeline
              entries={timeEntries}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onEdit={(entry) => openTimeEntryModal("edit", entry)}
              canEdit={() => true}
              getCustomerName={(customerId) => {
                const customer = customers.find(
                  (c) => (c.id || c._id) === customerId
                );
                return customer ? customer.name : "Unknown Customer";
              }}
              getOrganizationName={(organizationId) => {
                const organization = organizations.find(
                  (o) => (o.id || o._id) === organizationId
                );
                return organization
                  ? organization.name
                  : "Unknown Organization";
              }}
              getActivityName={(activityId) => {
                const activity = activities.find(
                  (a) => (a.id || a._id) === activityId
                );
                return activity ? activity.name : "Unknown Activity";
              }}
              formatTime={(timeString) => {
                if (!timeString) return "";
                const date = new Date(timeString);
                return date.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }}
              containerHeight={600}
            />
          </div>
          <div
            style={{
              display:
                viewMode !== "calendar" &&
                viewMode !== "calendarLand" &&
                viewMode !== "timeline"
                  ? "block"
                  : "none",
            }}
          >
            <EnhancedTimeSheetTable
              timeEntries={timeEntries}
              onEdit={(entry) => openTimeEntryModal("edit", entry)}
              onDelete={handleDeleteRequest}
              processes={processes}
              activities={activities}
              organizations={organizations}
              customers={customers}
              loading={loading}
              viewMode={viewMode === "card" ? "card" : "table"}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
            />
          </div>
        </div>

        {/* Time Entry Modal */}
        <NewTimeEntryModal
          isOpen={showTimeEntryModal}
          onClose={() => setShowTimeEntryModal(false)}
          timeEntry={selectedTimeEntry}
          onSave={handleTimeEntrySave}
          mode={modalMode}
          processes={processes}
          activities={activities}
          organizations={organizations}
          customers={customers}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Time Entry"
          message="Are you sure you want to delete this time entry? This action cannot be undone."
          confirmText="Delete Entry"
          cancelText="Cancel"
          type="delete"
          isLoading={isDeleting}
          itemName={entryToDelete ? "Time Entry" : null}
        />
      </div>
    </>
  );
};
