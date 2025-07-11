// src/components/Customers/CustomerFilters.jsx - Customer filtering component
import React from "react";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { Search, X } from "lucide-react";

export const CustomerFilters = ({ filters, onFilterChange }) => {
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
        <h3 className="text-lg font-medium text-gray-900">Search Customers</h3>
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
          placeholder="Search customers by name..."
          value={filters.search}
          onChange={(e) => handleInputChange("search", e.target.value)}
          icon={Search}
        />
      </div>

      {/* Search Help */}
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <div className="text-sm text-gray-600">
          <strong>Search Tips:</strong>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Type a customer name to search</li>
            <li>Search is case-insensitive and matches partial text</li>
            <li>Only admins can manage customers</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
