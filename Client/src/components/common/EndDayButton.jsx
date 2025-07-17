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
  
  const [loading, setLoading] = useState(true);
  const [endingDay, setEndingDay] = useState(false);
  const [error, setError] = useState(null);







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
