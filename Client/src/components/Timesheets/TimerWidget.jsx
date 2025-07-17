import React, { useState, useEffect } from "react";
import { Square, Clock, AlertCircle } from "lucide-react";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";

export const TimerWidget = ({ onTimerUpdate, activeTimer, onRefresh }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [stopDescription, setStopDescription] = useState("");

  // Update local state when activeTimer prop changes
  useEffect(() => {
    if (activeTimer) {
      // Timer is running if endTime is null
      const isActive = !activeTimer.endTime;
      setIsRunning(isActive);
      if (isActive) {
        calculateCurrentTime();
      }
    } else {
      setIsRunning(false);
      setCurrentTime(0);
    }
  }, [activeTimer]);

  // Timer tick effect
  useEffect(() => {
    let interval;

    if (isRunning && activeTimer) {
      interval = setInterval(() => {
        calculateCurrentTime();
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, activeTimer]);

  const calculateCurrentTime = () => {
    if (!activeTimer?.startTime) return;

    const start = new Date(activeTimer.startTime);
    const now = new Date();
    const diffInSeconds = Math.floor((now - start) / 1000);
    setCurrentTime(Math.max(0, diffInSeconds));
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStop = async () => {
    if (loading) return;

    setLoading(true);
    try {
      await timerService.stopTimer(stopDescription);
      setIsRunning(false);
      setCurrentTime(0);
      setShowStopConfirm(false);
      setStopDescription("");
      showToast.success("Timer stopped and time entry saved");
      onTimerUpdate?.();
    } catch (error) {
      console.error("Error stopping timer:", error);
      showToast.error("Failed to stop timer");
    } finally {
      setLoading(false);
    }
  };

  const handleStopClick = () => {
    setShowStopConfirm(true);
  };

  const cancelStop = () => {
    setShowStopConfirm(false);
    setStopDescription("");
  };

  if (!activeTimer) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-center text-gray-500">
          <Clock className="h-8 w-8 mr-3" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700">No Active Timer</p>
            <p className="text-sm">Start timing your work to track progress</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {/* Timer Display */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${
                  isRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              />
              <div>
                <div className="text-3xl font-mono font-bold text-gray-900">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-gray-500">
                  {!activeTimer.endTime ? "Running" : "Completed"}
                </div>
              </div>
            </div>

            {/* Project Info */}
            <div className="border-l border-gray-200 pl-4 ml-4">
              <div className="text-sm font-medium text-gray-900">
                {activeTimer.workProject?.name || "Unknown Project"}
              </div>
              <div className="text-sm text-gray-500">
                {activeTimer.activity?.name || "Unknown Activity"}
              </div>
            
              {activeTimer.workProject?.customer?.name && (
                <div className="text-xs text-gray-500">
                  Client: {activeTimer.workProject.customer.name}
                </div>
              )}
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleStopClick}
              disabled={loading}
              variant="danger"
              size="sm"
              className="flex items-center"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>

            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="ghost"
              size="sm"
              className="text-gray-500"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Additional Info */}
        {activeTimer.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>Description:</strong> {activeTimer.description}
            </p>
          </div>
        )}
      </div>

      {/* Stop Confirmation Modal */}
      {showStopConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Stop Timer
              </h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  You've been working for{" "}
                  <strong>{formatTime(currentTime)}</strong>. Add a description
                  for this time entry (optional):
                </p>

                <textarea
                  value={stopDescription}
                  onChange={(e) => setStopDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={3}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={cancelStop}
                  variant="secondary"
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleStop}
                  variant="danger"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Stopping...
                    </div>
                  ) : (
                    "Stop Timer"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
