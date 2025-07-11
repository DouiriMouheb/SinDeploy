// src/components/Timesheets/TimeSheetFilters.jsx - Comprehensive filtering
import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Search, X, Calendar, Filter } from "lucide-react";

export const TimeSheetFilters = ({
  filters,
  onFilterChange,
  projects = [],
  activities = [],
  customers = [],
}) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      startDate: "",
      endDate: "",
      workProjectId: "",
      activityId: "",
      customerId: "",
      search: "",
    });
  };

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== "page" && key !== "limit" && value !== ""
  );

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filter Time Entries
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search tasks and descriptions..."
          value={filters.search}
          onChange={(e) => handleInputChange("search", e.target.value)}
          icon={Search}
        />
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Project and Activity Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <select
            value={filters.customerId}
            onChange={(e) => handleInputChange("customerId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={filters.workProjectId}
            onChange={(e) => handleInputChange("workProjectId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
                {project.customer && ` (${project.customer.name})`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity
          </label>
          <select
            value={filters.activityId}
            onChange={(e) => handleInputChange("activityId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="">All Activities</option>
            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Active Filters:</p>
            <div className="flex flex-wrap gap-1">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.startDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  From: {filters.startDate}
                </span>
              )}
              {filters.endDate && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                  To: {filters.endDate}
                </span>
              )}
              {filters.customerId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                  Customer:{" "}
                  {customers.find((c) => c.id === filters.customerId)?.name ||
                    "Selected"}
                </span>
              )}
              {filters.workProjectId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Project:{" "}
                  {projects.find((p) => p.id === filters.workProjectId)?.name ||
                    "Selected"}
                </span>
              )}
              {filters.activityId && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Activity:{" "}
                  {activities.find((a) => a.id === filters.activityId)?.name ||
                    "Selected"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
