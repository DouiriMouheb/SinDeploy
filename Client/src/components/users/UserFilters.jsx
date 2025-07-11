// src/components/users/UserFilters.jsx - Simplified user filtering component
import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Search, X } from "lucide-react";

export const UserFilters = ({
  filters,
  onFilterChange,
  userRole,
  userDepartment,
}) => {
  const handleInputChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: "",
    });
  };

  const hasActiveFilters = filters.search !== "";

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Search Users</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Search
          </Button>
        )}
      </div>

      {/* Search Input - Full Width */}
      <div className="w-full">
        <Input
          type="text"
          placeholder="Search users by name or email..."
          value={filters.search}
          onChange={(e) => handleInputChange("search", e.target.value)}
          icon={Search}
        />
      </div>
    </div>
  );
};
