// src/components/Timesheets/TimesheetCalendarView.jsx - Modern calendar view for timesheets
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
} from "lucide-react";
import { Button } from "../common/Button";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
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
    
    timeEntries.forEach(entry => {
      const entryDate = new Date(entry.startTime || entry.date);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  }, [timeEntries]);

  // Calculate total hours for a date
  const getTotalHoursForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    const entries = entriesByDate[dateKey] || [];
    
    return entries.reduce((total, entry) => {
      if (entry.duration) {
        return total + (entry.duration / 3600); // Convert seconds to hours
      }
      return total;
    }, 0);
  };

  // Get entries for a specific date
  const getEntriesForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
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

  // Format time duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
    return `${minutes}m`;
  };

  // Get project name by ID
  const getProjectName = (projectId) => {
    const project = projects.find(p => (p.id || p._id) === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Get activity name by ID
  const getActivityName = (activityId) => {
    const activity = activities.find(a => (a.id || a._id) === activityId);
    return activity ? activity.name : 'Unknown Activity';
  };

  // Handle date click
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
        <div
          key={i}
          className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full"
        />
      );
    }
    
    if (entries.length > maxDots) {
      dots.push(
        <div
          key="more"
          className="text-xs text-slate-600 dark:text-slate-400 font-medium"
        >
          +{entries.length - maxDots}
        </div>
      );
    }
    
    return dots;
  };

  // Handle adding new entry
  const handleAddEntry = (date) => {
    onAddEntry({
      date: date.toISOString().split('T')[0],
      startTime: date.toISOString().split('T')[0] + 'T09:00:00',
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
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
          {DAYS_OF_WEEK.map(day => (
            <div 
              key={day}
              className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarData.days.map((date, index) => {
            const entries = getEntriesForDate(date);
            const totalHours = getTotalHoursForDate(date);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(date);
            const isInCurrentMonth = isCurrentMonth(date);
            
            return (
              <div
                key={index}
                className={`
                  relative min-h-[120px] p-2 border border-slate-200 dark:border-slate-600 
                  cursor-pointer transition-colors group
                  ${isSelected 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600' 
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                  }
                  ${!isInCurrentMonth ? 'opacity-40' : ''}
                  ${isTodayDate ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''}
                `}
                onClick={() => handleDateClick(date)}
                onMouseEnter={() => setHoveredDate(date)}
                onMouseLeave={() => setHoveredDate(null)}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`
                    text-sm font-medium
                    ${isTodayDate 
                      ? 'text-blue-600 dark:text-blue-400 font-bold' 
                      : isInCurrentMonth 
                        ? 'text-slate-900 dark:text-slate-100' 
                        : 'text-slate-400 dark:text-slate-500'
                    }
                  `}>
                    {date.getDate()}
                  </span>
                  
                  {/* Add entry button (visible on hover) */}
                  {isInCurrentMonth && (hoveredDate === date || isSelected) && (
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
                </div>

                {/* Total hours indicator */}
                {totalHours > 0 && (
                  <div className="mb-2">
                    <div className={`
                      text-xs px-2 py-1 rounded-full text-center font-medium
                      ${totalHours >= 8 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : totalHours >= 4 
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                          : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                      }
                    `}>
                      {totalHours.toFixed(1)}h
                    </div>
                  </div>
                )}

                {/* Time entries */}
                <div className="space-y-1">
                  {entries.slice(0, 3).map((entry, entryIndex) => (
                    <div
                      key={entryIndex}
                      className="group relative"
                    >
                      <div className={`
                        text-xs p-1 rounded border-l-2 
                        bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300
                        border-blue-400 dark:border-blue-500
                        hover:bg-slate-200 dark:hover:bg-slate-500 cursor-pointer
                        transition-colors
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEntry(entry);
                      }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate text-xs font-medium">
                            {getProjectName(entry.workProjectId)}
                          </span>
                          {entry.duration && (
                            <span className="text-xs opacity-75 ml-1">
                              {formatDuration(entry.duration)}
                            </span>
                          )}
                        </div>
                        {entry.activityId && (
                          <div className="text-xs opacity-75 truncate">
                            {getActivityName(entry.activityId)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Show "+X more" if there are more entries */}
                  {entries.length > 3 && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 text-center py-1">
                      +{entries.length - 3} more
                    </div>
                  )}
                </div>

                {/* Running timer indicator */}
                {activeTimer && isToday(date) && (
                  <div className="absolute top-1 right-1">
                    <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleAddEntry(selectedDate)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>

          {/* Entries for selected date */}
          <div className="space-y-2">
            {getEntriesForDate(selectedDate).map((entry, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {getProjectName(entry.workProjectId)}
                    </span>
                    {entry.activityId && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        • {getActivityName(entry.activityId)}
                      </span>
                    )}
                  </div>
                  {entry.taskName && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {entry.taskName}
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(entry.startTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {entry.endTime && (
                        <>
                          {' - '}
                          {new Date(entry.endTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
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
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditEntry(entry)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteEntry(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {getEntriesForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No time entries for this date</p>
                <p className="text-sm">Click "Add Entry" to create one</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};
