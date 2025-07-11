import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option...",
  searchable = false,
  clearable = false,
  disabled = false,
  error = null,
  loading = false,
  icon: Icon = null,
  className = "",
  maxHeight = "200px",
  emptyMessage = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);
  const searchRef = useRef(null);

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.label?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {/* Select Button */}
      <div
        onClick={handleToggle}
        className={`
          relative w-full px-3 py-2 border rounded-lg cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            disabled
              ? "bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400"
              : isOpen
              ? "border-blue-500 ring-2 ring-blue-200 bg-white"
              : error
              ? "border-red-500 hover:border-red-600 bg-white"
              : "border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50"
          }
          ${isOpen ? "shadow-lg" : "shadow-sm"}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            {/* Icon */}
            {Icon && (
              <Icon className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
            )}

            {/* Selected value or placeholder */}
            <span
              className={`truncate ${
                selectedOption ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {selectedOption?.label || selectedOption?.name || placeholder}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-2">
            {/* Loading spinner */}
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}

            {/* Clear button */}
            {clearable && selectedOption && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                type="button"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}

            {/* Dropdown arrow */}
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {isOpen && (
        <div
          className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-[60]"
          style={{
            maxHeight: "300px",
            minHeight: "100px",
          }}
        >
          {/* Search input */}
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: searchable ? "200px" : "250px",
              scrollbarWidth: "thin",
              scrollbarColor: "#CBD5E0 #F7FAFC",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-center text-sm">
                {searchTerm ? "No matches found" : emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors duration-150
                    flex items-center justify-between
                    ${
                      option.value === value
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50 text-gray-900"
                    }
                  `}
                >
                  <span className="truncate">
                    {option.label || option.name}
                  </span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
