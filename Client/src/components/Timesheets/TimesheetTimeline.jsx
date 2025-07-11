import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "../common/Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import TimesheetCard from "./TimesheetCard";

const TimesheetTimeline = ({
  entries = [],
  onEdit,
  canEdit,
  getCustomerName,
  getOrganizationName,
  getActivityName,
  formatTime,
  containerHeight = 600,
  currentDate,
  onDateChange,
}) => {
  // Sort entries by start time
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const timeA = new Date(a.startTime).getTime();
      const timeB = new Date(b.startTime).getTime();
      return timeA - timeB;
    });
  }, [entries]);

  // Navigation functions
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

  return (
    <div className="relative w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      {/* Timeline header with date navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
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
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {/* Timeline container */}
      <div
        className="relative w-full overflow-y-auto p-6"
        style={{ minHeight: containerHeight }}
      >
        {/* Central timeline line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-300 transform -translate-x-1/2"></div>

        {/* Timeline entries */}
        <div className="relative">
          {sortedEntries.map((entry, index) => {
            const isLeft = index % 2 === 0;
            const entryTime = new Date(entry.startTime);

            return (
              <div
                key={entry.id || entry._id || index}
                className={`relative flex items-center mb-8 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-1/2 top-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2 z-10"></div>

                {/* Time label */}
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 ${
                    isLeft ? "-translate-y-12" : "translate-y-12"
                  } text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full border border-gray-200 shadow-sm`}
                >
                  {formatTime(entry.startTime)}
                </div>

                {/* Card container */}
                <div className={`w-5/12 ${isLeft ? "pr-8" : "pl-8"}`}>
                  <div
                    className={`transform transition-transform hover:scale-105 ${
                      isLeft ? "hover:translate-x-2" : "hover:-translate-x-2"
                    }`}
                  >
                    <TimesheetCard
                      entry={entry}
                      onEdit={onEdit}
                      canEdit={canEdit}
                      getCustomerName={getCustomerName}
                      getOrganizationName={getOrganizationName}
                      getActivityName={getActivityName}
                      formatTime={formatTime}
                      isTimelineView={true}
                    />
                  </div>
                </div>

                {/* Connector line */}
                <div
                  className={`absolute left-1/2 top-1/2 w-8 h-0.5 bg-blue-300 transform -translate-y-1/2 ${
                    isLeft ? "-translate-x-full" : "translate-x-0"
                  }`}
                ></div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {entries.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                No entries for today
              </h3>
              <p className="text-sm text-gray-500">
                Timeline will appear when entries are added
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimesheetTimeline;
