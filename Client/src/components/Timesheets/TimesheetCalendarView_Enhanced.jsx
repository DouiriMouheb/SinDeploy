// src/components/Timesheets/TimesheetCalendarView_Enhanced.jsx - Google Calendar-style timesheet view
import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Calendar,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "../common/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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

  // Group time entries by date
  const entriesByDate = useMemo(() => {
    const grouped = {};

    timeEntries.forEach((entry) => {
      try {
        const entryDate = new Date(entry.startTime || entry.date);
        const dateKey = entryDate.toISOString().split("T")[0];

        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(entry);
      } catch (error) {
        console.warn("Invalid date in entry:", entry);
      }
    });

    return grouped;
  }, [timeEntries]);

  // Get entries for a specific date
  const getEntriesForDate = (date) => {
    const dateKey = date.toISOString().split("T")[0];
    return entriesByDate[dateKey] || [];
  };

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

  // Memoized: Map hour (8-22) -> entries for that hour for currentDate
  const hourEntriesMap = useMemo(() => {
    const map = {};
    const dateKey = currentDate.toISOString().split("T")[0];
    const entries = entriesByDate[dateKey] || [];
    for (let hour = 8; hour <= 22; hour++) {
      map[hour] = [];
    }
    for (const entry of entries) {
      const entryStart = new Date(entry.startTime);
      const hour = entryStart.getHours();
      if (hour >= 8 && hour <= 22) {
        map[hour].push(entry);
      }
    }
    return map;
  }, [entriesByDate, currentDate]);

  // Navigation functions (only daily)
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
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

  // Handle date click - Google Calendar style
  const handleDateClick = (date) => {
    const entries = getEntriesForDate(date);
    const dayKey = date.toDateString();

    if (entries.length === 0) {
      // If no entries, directly add a new one
      handleAddEntry(date);
      return;
    }

    // Toggle expansion for days with entries
    setExpandedDay(expandedDay === dayKey ? null : dayKey);
    setSelectedDate(null); // Close bottom panel when using inline expansion
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
        <div key="more" className="text-xs text-slate-600 font-medium">
          +{entries.length - maxDots}
        </div>
      );
    }

    return dots;
  };

  // Handle adding new entry
  const handleAddEntry = (date) => {
    onAddEntry({
      date: date.toISOString().split("T")[0],
      startTime: date.toISOString().split("T")[0] + "T09:00:00",
    });
  };

  // Handle entry click for editing
  const handleEntryClick = (entry, event) => {
    event.stopPropagation();
    if (onEditEntry) {
      onEditEntry(entry);
    }
  };

  // Handle entry delete
  const handleEntryDelete = (entry, event) => {
    event.stopPropagation();
    if (onDeleteEntry) {
      onDeleteEntry(entry.id || entry._id);
    }
  };

  // Handle clicking on empty time slot to add entry
  const handleTimeSlotClick = (hour, minute = 0) => {
    const entryDate = new Date(currentDate);
    entryDate.setHours(hour, minute, 0, 0);

    if (onAddEntry) {
      onAddEntry({
        date: currentDate.toISOString().split("T")[0],
        startTime: entryDate.toISOString(),
      });
    }
  };

  // Check if we should show expansion for a specific index
  const shouldShowExpansion = (date, index) => {
    const isExpanded = isDayExpanded(date);
    // Show expansion at the end of each week (every 7th item)
    return isExpanded && (index + 1) % 7 === 0;
  };

  // --- NEW RESPONSIVE CALENDAR LAYOUT ---
  // Responsive: 1. Calculate container height based on viewport, fallback to 600px
  const [containerHeight, setContainerHeight] = React.useState(600);
  React.useEffect(() => {
    function handleResize() {
      const vh = Math.max(window.innerHeight || 0, 700);
      setContainerHeight(Math.max(600, Math.floor(vh * 0.7)));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 2. Prepare base entries for the current day first
  const dateKey = currentDate.toISOString().split("T")[0];
  const baseEntries = (entriesByDate[dateKey] || []).map((entry) => {
    function parseLocal(dateStr) {
      if (/Z$|[+-]\d{2}:?\d{2}$/.test(dateStr)) return new Date(dateStr);
      const [date, time] = dateStr.split("T");
      if (!time) return new Date(dateStr);
      const [h, m, s] = time.split(":");
      const [year, month, day] = date.split("-");
      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(h),
        Number(m),
        Number(s) || 0
      );
    }
    const start = parseLocal(entry.startTime);
    const end = entry.endTime
      ? parseLocal(entry.endTime)
      : new Date(start.getTime() + (entry.duration || 3600) * 1000);
    return { ...entry, _start: start, _end: end };
  });

  // 3. Calculate which hours have entries or should be shown
  const getHoursWithEntries = (entries) => {
    const hours = new Set();
    entries.forEach((entry) => {
      const startHour = entry._start.getHours();
      const endHour = entry._end.getHours();

      // Add all hours the entry spans
      for (let h = startHour; h <= endHour; h++) {
        hours.add(h);
      }
    });
    return Array.from(hours).sort((a, b) => a - b);
  };

  // 4. Define visible hours (hours with entries + key hours)
  const visibleHours = useMemo(() => {
    const entryHours = getHoursWithEntries(baseEntries);
    const keyHours = [9, 12, 17]; // 9 AM, 12 PM, 5 PM
    const allHours = [...new Set([...entryHours, ...keyHours])].sort(
      (a, b) => a - b
    );

    // If no entries, show a default range
    if (allHours.length === 0) {
      return [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
    }

    // Extend range slightly around entries
    const minHour = Math.max(0, Math.min(...allHours) - 1);
    const maxHour = Math.min(23, Math.max(...allHours) + 1);

    const expandedHours = [];
    for (let h = minHour; h <= maxHour; h++) {
      expandedHours.push(h);
    }

    return expandedHours;
  }, [baseEntries]);

  // 5. Calculate px per minute based on visible hours
  const pxPerMinute = containerHeight / (visibleHours.length * 60);

  // 6. Calculate overlaps and assign columns
  const entries = useMemo(() => {
    if (baseEntries.length === 0) return [];

    // Sort entries by start time
    const sortedEntries = [...baseEntries].sort((a, b) => a._start - b._start);

    // Assign columns to prevent overlap
    const columns = [];

    sortedEntries.forEach((entry) => {
      const entryStart = entry._start.getTime();
      const entryEnd = entry._end.getTime();

      // Find the first column where this entry doesn't overlap
      let columnIndex = 0;
      while (columnIndex < columns.length) {
        const column = columns[columnIndex];
        const hasOverlap = column.some((existingEntry) => {
          const existingStart = existingEntry._start.getTime();
          const existingEnd = existingEntry._end.getTime();

          // Check if times overlap (with 1 minute buffer)
          return (
            entryStart < existingEnd - 60000 && entryEnd > existingStart + 60000
          );
        });

        if (!hasOverlap) {
          break;
        }
        columnIndex++;
      }

      // Create new column if needed
      if (columnIndex >= columns.length) {
        columns.push([]);
      }

      // Add entry to column
      entry._column = columnIndex;
      entry._totalColumns = Math.max(columns.length, columnIndex + 1);
      columns[columnIndex].push(entry);
    });

    // Update total columns for all entries
    const maxColumns = columns.length;
    sortedEntries.forEach((entry) => {
      entry._totalColumns = maxColumns;
    });

    return sortedEntries;
  }, [baseEntries]);

  // State for collapsed/expanded sections
  const [collapsedSections, setCollapsedSections] = useState(new Set());

  // Toggle section collapse
  const toggleSection = (sectionStart, sectionEnd) => {
    const sectionKey = `${sectionStart}-${sectionEnd}`;
    const newCollapsed = new Set(collapsedSections);

    if (newCollapsed.has(sectionKey)) {
      newCollapsed.delete(sectionKey);
    } else {
      newCollapsed.add(sectionKey);
    }

    setCollapsedSections(newCollapsed);
  };

  // Get sections that can be collapsed (empty ranges between visible hours)
  const getCollapsibleSections = () => {
    const sections = [];

    for (let i = 0; i < visibleHours.length - 1; i++) {
      const currentHour = visibleHours[i];
      const nextHour = visibleHours[i + 1];

      // If there's a gap of more than 1 hour, it's collapsible
      if (nextHour - currentHour > 1) {
        sections.push({
          start: currentHour + 1,
          end: nextHour - 1,
          key: `${currentHour + 1}-${nextHour - 1}`,
        });
      }
    }

    return sections;
  };

  const collapsibleSections = getCollapsibleSections();

  // 4. Render
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      {/* Calendar Header with arrows and date picker */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            className="border border-gray-300 rounded-md flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Previous Day"
            type="button"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            className="border border-gray-300 rounded-md flex items-center justify-center transition-colors hover:bg-gray-100"
            aria-label="Next Day"
            type="button"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Responsive Daily Calendar */}
      <div className="p-2">
        <div
          className="relative w-full"
          style={{
            height: containerHeight,
            minHeight: 400,
            maxHeight: "90vh",
            overflow: "hidden",
          }}
        >
          {/* Hour lines and labels */}
          {visibleHours.map((hour, hourIndex) => {
            const top = hourIndex * 60 * pxPerMinute;
            return (
              <div key={hour}>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top,
                    height: 0,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      width: 56,
                      textAlign: "right",
                      fontSize: 12,
                      color: "#64748b",
                      paddingRight: 8,
                      top: -8,
                      height: 16,
                    }}
                  >
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>
                  <div
                    style={{
                      marginLeft: 56,
                      borderTop: "1px solid #e2e8f0",
                      width: "calc(100% - 56px)",
                    }}
                  />
                </div>

                {/* Collapsible sections */}
                {collapsibleSections.map((section) => {
                  if (section.start === hour + 1) {
                    const isCollapsed = collapsedSections.has(section.key);
                    return (
                      <div
                        key={section.key}
                        style={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: top + 60 * pxPerMinute,
                          zIndex: 3,
                        }}
                      >
                        <button
                          onClick={() =>
                            toggleSection(section.start, section.end)
                          }
                          className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 border-y border-slate-300 flex items-center justify-center text-xs text-slate-600 transition-colors"
                        >
                          {isCollapsed ? (
                            <>
                              <ChevronRight className="h-3 w-3 mr-1" />
                              Show {section.end - section.start + 1} hours (
                              {section.start.toString().padStart(2, "0")}:00 -{" "}
                              {section.end.toString().padStart(2, "0")}:59)
                            </>
                          ) : (
                            <>
                              <ChevronLeft className="h-3 w-3 mr-1" />
                              Hide empty hours
                            </>
                          )}
                        </button>

                        {!isCollapsed && (
                          <div className="bg-slate-50 border-b border-slate-200">
                            {Array.from(
                              { length: section.end - section.start + 1 },
                              (_, i) => {
                                const sectionHour = section.start + i;
                                const sectionTop = (i + 1) * 60 * pxPerMinute;
                                return (
                                  <div
                                    key={sectionHour}
                                    style={{
                                      position: "relative",
                                      height: 60 * pxPerMinute,
                                      borderBottom: "1px solid #e2e8f0",
                                    }}
                                  >
                                    <div
                                      style={{
                                        position: "absolute",
                                        left: 0,
                                        width: 56,
                                        textAlign: "right",
                                        fontSize: 12,
                                        color: "#94a3b8",
                                        paddingRight: 8,
                                        top: -8,
                                        height: 16,
                                      }}
                                    >
                                      {`${sectionHour
                                        .toString()
                                        .padStart(2, "0")}:00`}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            );
          })}
          {/* Entries */}
          {entries.map((entry, idx) => {
            // Clamp to calendar day
            let start = entry._start;
            let end = entry._end;
            const dayStart = new Date(currentDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(currentDate);
            dayEnd.setHours(23, 59, 59, 999);
            if (start < dayStart) start = dayStart;
            if (end > dayEnd) end = dayEnd;

            // Calculate position based on visible hours
            const startHour = start.getHours();
            const endHour = end.getHours();
            const startMinutes = start.getMinutes();
            const endMinutes = end.getMinutes();

            // Find the index of the start hour in visible hours
            const startHourIndex = visibleHours.indexOf(startHour);
            const endHourIndex = visibleHours.indexOf(endHour);

            // Skip if the entry is not in visible hours
            if (startHourIndex === -1 && endHourIndex === -1) return null;

            // Calculate top position based on visible hour index
            const top =
              (startHourIndex !== -1 ? startHourIndex : 0) * 60 * pxPerMinute +
              startMinutes * pxPerMinute;

            // Calculate height
            let height;
            if (startHourIndex !== -1 && endHourIndex !== -1) {
              // Both hours are visible
              height =
                ((endHourIndex - startHourIndex) * 60 +
                  (endMinutes - startMinutes)) *
                pxPerMinute;
            } else if (startHourIndex !== -1) {
              // Only start hour is visible
              height = (60 - startMinutes) * pxPerMinute;
            } else {
              // Only end hour is visible
              height = endMinutes * pxPerMinute;
            }

            height = Math.max(height, 18);
            const isShort = height <= 40;

            // Calculate column positioning
            const columnWidth =
              entry._totalColumns > 1
                ? `${Math.floor(80 / entry._totalColumns)}%`
                : "80%";
            const leftOffset =
              entry._totalColumns > 1
                ? 56 + entry._column * (80 / entry._totalColumns) + "%"
                : 56;

            return (
              <div
                key={idx}
                style={{
                  position: "absolute",
                  left: leftOffset,
                  top,
                  height,
                  zIndex: 2,
                  width: columnWidth,
                  minWidth: entry._totalColumns > 1 ? 80 : 60,
                  display: isShort ? "flex" : "block",
                  alignItems: isShort ? "center" : undefined,
                  padding: isShort ? "0 6px" : "8px 6px",
                  overflow: "hidden",
                  whiteSpace: isShort ? "nowrap" : "normal",
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.03)",
                  transition: "background 0.2s",
                  fontSize: 13,
                  cursor: "pointer",
                  marginRight: entry._totalColumns > 1 ? 2 : 0,
                }}
                className={
                  isShort
                    ? "hover:bg-slate-200 transition-colors text-xs overflow-hidden whitespace-nowrap"
                    : "hover:bg-slate-200 transition-colors text-xs overflow-hidden"
                }
                title={`${entry.organization?.name || "-"} ${
                  entry.activityId
                    ? "• " + getActivityName(entry.activityId)
                    : ""
                } ${entry.description || ""}`}
                onClick={(e) => handleEntryClick(entry, e)}
              >
                {isShort ? (
                  <>
                    <span className="font-medium text-slate-900 truncate mr-1">
                      {entry.organization?.name || "-"}
                    </span>
                    {entry.activityId && (
                      <span className="text-xs text-slate-500 truncate mr-1">
                        • {getActivityName(entry.activityId)}
                      </span>
                    )}
             
                    <span className="flex items-center text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {entry._start.toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                      {entry._end && (
                        <>
                          {"-"}
                          {entry._end.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-slate-900 truncate mb-0.5">
                      {entry.organization?.name || "-"}
                      {entry.activityId && (
                        <span className="text-xs text-slate-500 truncate ml-1">
                          • {getActivityName(entry.activityId)}
                        </span>
                      )}
                    </div>
                 
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {entry._start.toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                        {entry._end && (
                          <>
                            {" - "}
                            {entry._end.toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}
                          </>
                        )}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })}
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-100 bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
