// src/components/common/EndDayButton.jsx - End day button component
import React, { useState, useEffect } from "react";
import { Moon, Clock, AlertCircle } from "lucide-react";
import { dailyLoginService } from "../../services/dailyLogin";
import { Button } from "./Button";
import { showToast } from "../../utils/toast";

export const EndDayButton = ({
  className = "",
  variant = "default", // "default" | "compact" | "sidebar"
  onDayEnded = null,
}) => {
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [endingDay, setEndingDay] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTodayTracker();

    // Auto-refresh every minute to update working time
    const interval = setInterval(loadTodayTracker, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayTracker = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dailyLoginService.getTodayTracker();
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

  const handleEndDay = async () => {
    if (!tracker || endingDay) return;

    setEndingDay(true);
    try {
      const response = await dailyLoginService.endDay();
      if (response.success) {
        setTracker(response.data.tracker);
        showToast.success("Working day ended successfully!");
        if (onDayEnded) {
          onDayEnded(response.data.tracker);
        }
      }
    } catch (err) {
      console.error("Error ending day:", err);
      showToast.error("Failed to end working day");
    } finally {
      setEndingDay(false);
    }
  };

  const calculateWorkingTime = () => {
    if (!tracker?.firstLoginTime) return "0h 0m";

    const startTime = new Date(tracker.firstLoginTime);
    const endTime = tracker.dayEndTime
      ? new Date(tracker.dayEndTime)
      : new Date();
    const diffMs = endTime - startTime;
    const diffHours = Math.max(0, diffMs / (1000 * 60 * 60));

    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);

    return `${hours}h ${minutes}m`;
  };

  const formatTime = (dateString) => {
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
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center text-red-600 text-xs ${className}`}>
        <AlertCircle className="h-3 w-3 mr-1" />
        Error loading tracker
      </div>
    );
  }

  // Don't show anything if no login recorded today
  if (!tracker) {
    return null;
  }

  // Don't show if day already ended
  if (tracker.dayEndTime) {
    if (variant === "compact") {
      return (
        <div className={`text-xs text-gray-500 ${className}`}>
          <div className="flex items-center">
            <Moon className="h-3 w-3 mr-1" />
            Day ended at {formatTime(tracker.dayEndTime)}
          </div>
        </div>
      );
    }
    return null;
  }

  // Sidebar variant - very compact
  if (variant === "sidebar") {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="text-xs text-gray-500 flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Working: {calculateWorkingTime()}
        </div>
        <Button
          onClick={handleEndDay}
          variant="secondary"
          size="sm"
          disabled={endingDay}
          className="w-full text-xs py-1"
        >
          {endingDay ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
              Ending...
            </>
          ) : (
            <>
              <Moon className="h-3 w-3 mr-1" />
              End Day
            </>
          )}
        </Button>
      </div>
    );
  }

  // Compact variant
  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="text-xs text-gray-500">
          Working: {calculateWorkingTime()}
        </div>
        <Button
          onClick={handleEndDay}
          variant="secondary"
          size="sm"
          disabled={endingDay}
        >
          {endingDay ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
              Ending...
            </>
          ) : (
            <>
              <Moon className="h-3 w-3 mr-1" />
              End Day
            </>
          )}
        </Button>
      </div>
    );
  }

  // Default variant
  return (
    <div className={`${className}`}>
      <div className="mb-2 text-sm text-gray-600">
        Started at {formatTime(tracker.firstLoginTime)} • Working:{" "}
        {calculateWorkingTime()}
      </div>
      <Button
        onClick={handleEndDay}
        variant="primary"
        size="sm"
        disabled={endingDay}
        className="w-full"
      >
        {endingDay ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Ending Working Day...
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 mr-2" />
            End Working Day
          </>
        )}
      </Button>
    </div>
  );
};
