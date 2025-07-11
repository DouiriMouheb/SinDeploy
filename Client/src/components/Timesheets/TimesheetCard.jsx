import React from "react";
import { Building, User, MonitorCheck, MapPin, Clock } from "lucide-react";

const TimesheetCard = ({
  entry,
  onEdit,
  canEdit,
  getCustomerName,
  getOrganizationName,
  getActivityName,
  formatTime,
  style, // For positioning on timeline
  isTimelineView = false, // Flag to enable timeline styling
}) => {
  const entryId = entry.id || entry._id;

  // Calculate duration for timeline view
  const getDuration = () => {
    if (entry.startTime && entry.endTime) {
      const start = new Date(entry.startTime);
      const end = new Date(entry.endTime);
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes}m`;
      }
      return `${diffMinutes}m`;
    }
    return "";
  };

  if (isTimelineView) {
    return (
      <div
        className="bg-white shadow-sm rounded-lg border border-gray-200 p-3 flex flex-col gap-2 relative hover:shadow-md transition cursor-pointer timeline-card"
        style={{
          ...style,
          minHeight: "80px",
          fontSize: "12px",
        }}
        onClick={() => canEdit(entry) && onEdit(entry)}
      >
        {/* Timeline card header */}
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-800">
              {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
            </span>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
            {getDuration()}
          </span>
        </div>

        {/* Organization */}
        <div className="flex items-center gap-1 mb-1">
          <Building className="w-3 h-3 text-gray-400" />
          <span className="text-xs font-medium text-gray-700 truncate">
            {entry.organization?.name || "-"}
          </span>
        </div>

        {/* Customer and Activity */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">
              {getCustomerName(entry.customerId)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MonitorCheck className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-600 truncate">
              {getActivityName(entry.activityId)}
            </span>
          </div>
        </div>

        {/* Location badge */}
        {entry.workPlaceType && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">
              {entry.workPlaceType}
            </span>
          </div>
        )}

        {/* Notes */}
        {entry.description && (
          <div
            className="text-xs text-gray-500 mt-1 truncate"
            title={entry.description}
          >
            {entry.description}
          </div>
        )}
      </div>
    );
  }

  // Original card view for non-timeline use
  return (
    <div
      className="bg-white shadow rounded-lg border border-gray-200 p-4 flex flex-col gap-2 relative hover:shadow-lg transition cursor-pointer"
      onClick={() => canEdit(entry) && onEdit(entry)}
    >
      {/* Top row: Time range and location */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-gray-800">
          {formatTime(entry.startTime)} &rarr; {formatTime(entry.endTime)}
        </span>
        <span className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-xs text-gray-700 border border-gray-300">
          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
          {entry.workPlaceType || "Location"}
        </span>
      </div>
      {/* Organization and client */}
      <div className="flex flex-col gap-1 mb-2">
        <span className="flex items-center text-gray-700 text-sm">
          <Building className="w-4 h-4 mr-1 text-gray-400" />
          {entry.organization?.name || "-"}
        </span>
        <span className="flex items-center text-gray-700 text-sm">
          <User className="w-4 h-4 mr-1 text-gray-400" />
          {getCustomerName(entry.customerId)}
        </span>
        <span className="flex items-center text-gray-700 text-sm">
          <MonitorCheck className="w-4 h-4 mr-1 text-gray-400" />
          {getActivityName(entry.activityId)}
        </span>
      </div>
      {/* Notes */}
      {entry.description && (
        <div className="text-xs text-gray-500 mt-2">{entry.description} </div>
      )}
    </div>
  );
};

export default TimesheetCard;
