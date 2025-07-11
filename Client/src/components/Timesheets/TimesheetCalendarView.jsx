// src/components/Timesheets/TimesheetCalendarView_Enhanced.jsx - Google Calendar-style timesheet view
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  Timer,
  Edit,
  Trash2,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { Button } from "../common/Button";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const TimesheetCalendarView = ({
  timeEntries = [],
  currentDate,
  onDateChange,
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onStartTimer,
  activeTimer,
  projects = [],
  activities = [],
  customers = [],
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'day'
  const [selectedDayDate, setSelectedDayDate] = useState(null);

  // Calculate calendar grid
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // First day of the calendar grid (might be from previous month)
    const calendarStart = new Date(firstDay);
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

    // Generate calendar grid (6 weeks = 42 days)
    const days = [];
    const currentCalendarDate = new Date(calendarStart);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentCalendarDate));
      currentCalendarDate.setDate(currentCalendarDate.getDate() + 1);
    }

    return {
      days,
      firstDay,
      lastDay,
      month,
      year,
    };
  }, [currentDate]);

  // Helper function to get local date string
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Group time entries by date
  const entriesByDate = useMemo(() => {
    const grouped = {};

    timeEntries.forEach((entry) => {
      const entryDate = new Date(entry.startTime || entry.date);
      const dateKey = getLocalDateString(entryDate);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    return grouped;
  }, [timeEntries]);

  // Calculate total hours for a date
  const getTotalHoursForDate = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    const entries = entriesByDate[dateKey] || [];

    return entries.reduce((total, entry) => {
      if (entry.duration) {
        return total + entry.duration / 3600; // Convert seconds to hours
      }
      return total;
    }, 0);
  };

  // Get entries for a specific date
  const getEntriesForDate = (date) => {
    const dateKey = getLocalDateString(date);
    return entriesByDate[dateKey] || [];
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date) => {
    return date.getMonth() === calendarData.month;
  };

  // Check if date is in the future
  const isFutureDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate > today;
  };

  // Format time duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`;
    }
    return `${minutes}m`;
  };

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find((p) => (p.id || p._id) === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Get activity name by ID
  const getActivityName = (activityId) => {
    const activity = activities.find((a) => (a.id || a._id) === activityId);
    return activity ? activity.name : "Unknown Activity";
  };

  // Get customer name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => (c.id || c._id) === customerId);
    return customer ? customer.name : "Unknown Customer";
  };

  // Get the display name for an entry based on its type
  const getEntryDisplayName = (entry) => {
    if (entry.entryType === "customer_based" && entry.workProjectId) {
      const project = projects.find(
        (p) => (p.id || p._id) === entry.workProjectId
      );
      if (project) {
        const customer = customers.find(
          (c) => (c.id || c._id) === project.customerId
        );
        return `${customer?.name || "Unknown Customer"} - ${project.name}`;
      }
      return getProjectName(entry.workProjectId);
    } else if (entry.entryType === "process_based" && entry.activityId) {
      const activity = activities.find(
        (a) => (a.id || a._id) === entry.activityId
      );
      if (activity) {
        // Get the process name from the activity
        const process = activity.process || activity.Process;
        return `${process?.name || "Unknown Process"} - ${activity.name}`;
      }
      return getActivityName(entry.activityId);
    }

    // Fallback for entries without entryType (legacy)
    if (entry.workProjectId) {
      return getProjectName(entry.workProjectId);
    } else if (entry.activityId) {
      return getActivityName(entry.activityId);
    }

    return "Unknown Entry";
  };

  // Get the secondary display info for an entry
  const getEntrySecondaryInfo = (entry) => {
    if (entry.entryType === "customer_based") {
      return "Customer Project";
    } else if (entry.entryType === "process_based") {
      return "Process Activity";
    }
    return null;
  };

  // Handle date click - Switch to day view (only for non-future dates)
  const handleDateClick = (date) => {
    if (isFutureDate(date)) {
      return; // Don't allow clicking on future dates
    }
    setSelectedDayDate(date);
    setViewMode("day");
    setExpandedDay(null); // Clear any expansion state
  };

  // Go back to month view
  const goBackToMonth = () => {
    setViewMode("month");
    setSelectedDayDate(null);
  };

  // Navigate between days in day view
  const goToPreviousDay = () => {
    if (selectedDayDate) {
      const newDate = new Date(selectedDayDate);
      newDate.setDate(newDate.getDate() - 1);
      setSelectedDayDate(newDate);
    }
  };

  const goToNextDay = () => {
    if (selectedDayDate) {
      const newDate = new Date(selectedDayDate);
      newDate.setDate(newDate.getDate() + 1);
      setSelectedDayDate(newDate);
    }
  };

  // Check if day is expanded
  const isDayExpanded = (date) => {
    return expandedDay === date.toDateString();
  };

  // Get visual indicators for day entries
  const getEntryIndicators = (entries) => {
    if (entries.length === 0) return null;

    const maxDots = 3;
    const dots = [];
    const count = Math.min(entries.length, maxDots);

    for (let i = 0; i < count; i++) {
      dots.push(
        <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
      );
    }

    if (entries.length > maxDots) {
      dots.push(
        <div key="more" className="text-xs text-gray-600 font-medium">
          +{entries.length - maxDots}
        </div>
      );
    }

    return dots;
  };

  // Handle adding new entry (only for non-future dates)
  const handleAddEntry = (date, hour = 9) => {
    if (isFutureDate(date)) {
      return; // Don't allow adding entries for future dates
    }

    const startTime = new Date(date);
    startTime.setHours(hour, 0, 0, 0);

    onAddEntry({
      date: getLocalDateString(date),
      startTime: startTime.toISOString(),
    });
  };

  // Check if we should show expansion for a specific index
  const shouldShowExpansion = (date, index) => {
    const isExpanded = isDayExpanded(date);
    // Show expansion at the end of each week (every 7th item)
    return isExpanded && (index + 1) % 7 === 0;
  };

  // Day view helper functions - Only show hours with entries
  const generateSmartHourlySlots = (entries) => {
    if (!entries || entries.length === 0) {
      return [];
    }

    // Get unique hours that actually have entries
    const hoursWithEntries = new Set();
    entries.forEach((entry) => {
      const startTime = new Date(entry.startTime || entry.date);
      hoursWithEntries.add(startTime.getHours());
    });

    // Convert to sorted array and create slots only for hours with entries
    const sortedHours = Array.from(hoursWithEntries).sort((a, b) => a - b);

    return sortedHours.map((hour) => ({
      hour,
      time: new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      entries: [],
    }));
  };

  const getEntriesForDayGroupedByHour = (date) => {
    const entries = getEntriesForDate(date);
    const slots = generateSmartHourlySlots(entries);

    // Group entries by their hour
    entries.forEach((entry) => {
      const startTime = new Date(entry.startTime || entry.date);
      const hour = startTime.getHours();
      const slot = slots.find((s) => s.hour === hour);
      if (slot) {
        // Sort entries within the hour by start time
        slot.entries.push(entry);
      }
    });

    // Sort entries within each slot by start time
    slots.forEach((slot) => {
      slot.entries.sort((a, b) => {
        const timeA = new Date(a.startTime || a.date);
        const timeB = new Date(b.startTime || b.date);
        return timeA.getTime() - timeB.getTime();
      });
    });

    return slots;
  };

  const formatDayViewDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Day view component
  const renderDayView = () => {
    if (!selectedDayDate) return null;

    const hourlySlots = getEntriesForDayGroupedByHour(selectedDayDate);
    const totalEntries = getEntriesForDate(selectedDayDate);
    const totalHours = getTotalHoursForDate(selectedDayDate);

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Day View Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={goBackToMonth}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Month</span>
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {formatDayViewDate(selectedDayDate)}
                </h2>
                <p className="text-sm text-gray-600">
                  {totalEntries.length} entries • {totalHours.toFixed(1)} hours
                  total
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousDay}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextDay}
                className="h-8 w-8 p-0"
                title="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              {isFutureDate(selectedDayDate) ? (
                <div className="ml-4 flex items-center space-x-2 px-3 py-1.5 bg-gray-200 rounded-md">
                  <Lock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 font-medium">
                    Future Date - No Entries Allowed
                  </span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddEntry(selectedDayDate)}
                  className="ml-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hourly Schedule */}
        <div className="max-h-[600px] overflow-y-auto">
          {hourlySlots.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {hourlySlots.map((slot) => (
                <div
                  key={slot.hour}
                  className="flex min-h-[80px] hover:bg-gray-50 transition-colors"
                >
                  {/* Time column */}
                  <div className="w-20 flex-shrink-0 p-4 text-right border-r border-gray-200">
                    <span className="text-sm font-medium text-gray-600">
                      {slot.time}
                    </span>
                  </div>

                  {/* Entries column */}
                  <div className="flex-1 p-3">
                    <div className="space-y-2">
                      {slot.entries.map((entry, index) => {
                        const startTime = new Date(
                          entry.startTime || entry.date
                        );
                        const endTime = entry.endTime
                          ? new Date(entry.endTime)
                          : null;

                        return (
                          <div
                            key={index}
                            className="relative bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-blue-100"
                          >
                            <div className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {getEntryDisplayName(entry)}
                                    </span>
                                    {getEntrySecondaryInfo(entry) && (
                                      <span className="text-xs px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                                        {getEntrySecondaryInfo(entry)}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-3 text-xs text-gray-600 mb-1">
                                    <span className="flex items-center font-mono bg-gray-100 px-2 py-1 rounded">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {startTime.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                      {endTime && (
                                        <>
                                          {" → "}
                                          {endTime.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </>
                                      )}
                                    </span>

                                    {entry.duration && (
                                      <span className="flex items-center font-medium text-blue-600">
                                        <Timer className="h-3 w-3 mr-1" />
                                        {formatDuration(entry.duration)}
                                      </span>
                                    )}
                                  </div>

                                  {entry.description && (
                                    <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 px-2 py-1 rounded italic">
                                      "{entry.description}"
                                    </p>
                                  )}

                                  {entry.taskName && (
                                    <p className="text-xs text-gray-700 mt-1 font-medium">
                                      Task: {entry.taskName}
                                    </p>
                                  )}
                                </div>

                                <div className="flex items-center space-x-1 ml-3">
                                  {onStartTimer && !activeTimer && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onStartTimer(entry)}
                                      className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Continue this entry"
                                    >
                                      <Play className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditEntry(entry)}
                                    className="h-7 w-7 p-0 hover:bg-gray-200"
                                    title="Edit entry"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteEntry(entry)}
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    title="Delete entry"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                {isFutureDate(selectedDayDate) ? (
                  <>
                    <Lock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      Future Date
                    </h3>
                    <p className="text-slate-600 mb-4">
                      You cannot add time entries for future dates.
                      <br />
                      {formatDayViewDate(selectedDayDate)}
                    </p>
                    <div className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 rounded-lg">
                      <Lock className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-600">
                        Time entries locked
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      No time entries
                    </h3>
                    <p className="text-slate-600 mb-4">
                      No time entries found for{" "}
                      {formatDayViewDate(selectedDayDate)}
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => handleAddEntry(selectedDayDate)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Entry
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {viewMode === "day" ? (
        renderDayView()
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-slate-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {MONTHS[calendarData.month]} {calendarData.year}
                </h2>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPreviousMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="secondary" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days with Google Calendar-style expansion */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.days.map((date, index) => {
                const entries = getEntriesForDate(date);
                const totalHours = getTotalHoursForDate(date);
                const isSelected =
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString();
                const isTodayDate = isToday(date);
                const isInCurrentMonth = isCurrentMonth(date);
                const isExpanded = isDayExpanded(date);
                const isFuture = isFutureDate(date);

                return (
                  <React.Fragment key={index}>
                    <div
                      className={`
                    relative min-h-[120px] p-2 border border-slate-200 
                    transition-all duration-200 group
                    ${
                      isFuture
                        ? "bg-slate-100 opacity-50 cursor-not-allowed"
                        : isExpanded
                        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-500/20 cursor-pointer"
                        : "bg-slate-50 hover:bg-slate-100 cursor-pointer"
                    }
                    ${!isInCurrentMonth ? "opacity-40" : ""}
                    ${isTodayDate ? "ring-2 ring-blue-500" : ""}
                  `}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => !isFuture && setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                    >
                      {/* Date number */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`
                      text-sm font-medium
                      ${
                        isTodayDate
                          ? "text-blue-600 font-bold"
                          : isInCurrentMonth
                          ? isFuture
                            ? "text-gray-400"
                            : "text-gray-900"
                          : "text-gray-400"
                      }
                    `}
                        >
                          {date.getDate()}
                        </span>

                        {/* Expansion indicator and add button */}
                        <div className="flex items-center space-x-1">
                          {entries.length > 0 && isInCurrentMonth && (
                            <div
                              className={`transition-transform duration-200 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            >
                              <ChevronDown className="h-3 w-3 text-slate-400" />
                            </div>
                          )}

                          {/* Add entry button (visible on hover for non-future dates) */}
                          {isInCurrentMonth &&
                            !isFuture &&
                            (hoveredDate === date || isSelected) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddEntry(date);
                                }}
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            )}

                          {/* Future date indicator */}
                          {isFuture && isInCurrentMonth && (
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              🔒
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total hours indicator */}
                      {totalHours > 0 && (
                        <div className="mb-2">
                          <div
                            className={`
                        text-xs px-2 py-1 rounded-full text-center font-medium
                        ${
                          totalHours >= 8
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : totalHours >= 4
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                            : "bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400"
                        }
                      `}
                          >
                            {totalHours.toFixed(1)}h
                          </div>
                        </div>
                      )}

                      {/* Entry indicators (dots) */}
                      {entries.length > 0 && !isExpanded && (
                        <div className="flex items-center justify-center space-x-1 mb-2">
                          {getEntryIndicators(entries)}
                        </div>
                      )}

                      {/* Compact time entries (when not expanded) */}
                      {!isExpanded && (
                        <div className="space-y-1">
                          {entries.slice(0, 2).map((entry, entryIndex) => (
                            <div
                              key={entryIndex}
                              className="text-xs p-1 rounded border-l-2 bg-slate-100 text-slate-700 border-blue-400 truncate"
                            >
                              {getEntryDisplayName(entry)}
                              {entry.duration && (
                                <span className="text-xs opacity-75 ml-1">
                                  {formatDuration(entry.duration)}
                                </span>
                              )}
                            </div>
                          ))}

                          {/* Show "+X more" if there are more entries */}
                          {entries.length > 2 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{entries.length - 2} more
                            </div>
                          )}
                        </div>
                      )}

                      {/* Running timer indicator */}
                      {activeTimer && isToday(date) && (
                        <div className="absolute top-1 right-1">
                          <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>

                    {/* Inline expanded view - Google Calendar style */}
                    {shouldShowExpansion(date, index) && (
                      <div className="col-span-7 bg-gray-50 border border-slate-200 rounded-lg p-4 mx-1 mb-2 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900">
                            {date.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddEntry(date)}
                              disabled={isFuture}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {isFuture ? "Future Date" : "Add Entry"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedDay(null)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Expanded entries list */}
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {entries.map((entry, entryIndex) => (
                            <div
                              key={entryIndex}
                              className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900 truncate">
                                    {getEntryDisplayName(entry)}
                                  </span>
                                  {getEntrySecondaryInfo(entry) && (
                                    <span className="text-sm text-gray-500 truncate">
                                      • {getEntrySecondaryInfo(entry)}
                                    </span>
                                  )}
                                </div>
                                {entry.taskName && (
                                  <div className="text-sm text-gray-600 truncate mb-1">
                                    {entry.taskName}
                                  </div>
                                )}
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(
                                      entry.startTime
                                    ).toLocaleTimeString("en-US", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                    {entry.endTime && (
                                      <>
                                        {" - "}
                                        {new Date(
                                          entry.endTime
                                        ).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </>
                                    )}
                                  </span>
                                  {entry.duration && (
                                    <span className="flex items-center">
                                      <Timer className="h-3 w-3 mr-1" />
                                      {formatDuration(entry.duration)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onEditEntry(entry)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteEntry(entry)}
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}

                          {entries.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>No time entries for this date</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
