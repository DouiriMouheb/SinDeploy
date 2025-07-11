// src/components/common/DailyLoginTracker.jsx - Daily login status display
import React, { useState, useEffect } from "react";
import { Calendar, Coffee, AlertCircle } from "lucide-react";
import { dailyLoginService } from "../../services/dailyLogin";

export const DailyLoginTracker = ({
  className = "",
  variant = "card", // "card" | "compact" | "inline"
  userId = null, // If provided, fetch data for specific user (admin/manager view)
}) => {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTodayTracker();
  }, [userId]); // Re-fetch when userId changes

  const loadTodayTracker = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = userId
        ? await dailyLoginService.getUserTodayTracker(userId)
        : await dailyLoginService.getTodayTracker();

      if (response.success) {
        setTracker(response.data.tracker);
      }
    } catch (err) {
      console.error("Error loading today's tracker:", err);
      setError(err.message || "Failed to load daily tracker");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  const formatTimeShort = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return "Invalid time";
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center text-red-600 text-sm ${className}`}>
        <AlertCircle className="h-4 w-4 mr-2" />
        Failed to load daily tracker
      </div>
    );
  }

  if (!tracker) {
    const message = userId
      ? "User hasn't started working today"
      : "No login recorded today";

    return (
      <div
        className={`flex items-center text-gray-500 dark:text-gray-400 text-sm ${className}`}
      >
        <Calendar className="h-4 w-4 mr-2" />
        {message}
      </div>
    );
  }

  // Compact variant for headers/sidebars
  if (variant === "compact") {
    return (
      <div className={`flex items-center text-sm ${className}`}>
        <Coffee className="h-4 w-4 mr-2 text-green-500" />
        <span className="text-gray-600 dark:text-gray-400">Started:</span>
        <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
          {formatTimeShort(tracker.firstLoginTime)}
        </span>
      </div>
    );
  }

  // Inline variant for embedding in other components
  if (variant === "inline") {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="flex items-center text-sm">
          <Coffee className="h-4 w-4 mr-2 text-green-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Day started at
          </span>
          <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
            {formatTimeShort(tracker.firstLoginTime)}
          </span>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Today's Schedule
          </h3>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Coffee className="h-4 w-4 mr-2 text-green-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Started at:
              </span>
              <span className="ml-1 font-medium text-gray-900 dark:text-gray-100">
                {formatTime(tracker.firstLoginTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
