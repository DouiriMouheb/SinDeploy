// src/components/common/StatCard.jsx - Enhanced version
import React from "react";
import {
  Users,
  Ticket,
  CheckCircle,
  AlertCircle,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

// Icon mapping for different stat types
const iconMap = {
  users: Users,
  ticket: Ticket,
  "check-circle": CheckCircle,
  "alert-circle": AlertCircle,
  "check-square": CheckSquare,
};

export const StatCard = ({
  title,
  value,
  subtitle,
  color = "bg-blue-500",
  icon = "check-circle",
  change,
  changeType,
  loading = false,
  onClick,
  className = "",
}) => {
  const IconComponent = iconMap[icon] || CheckCircle;

  const getChangeIcon = () => {
    switch (changeType) {
      case "positive":
        return <TrendingUp className="h-3 w-3" />;
      case "negative":
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white overflow-hidden shadow rounded-lg ${className}`}
      >
        <div className="p-5">
          <div className="animate-pulse">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`w-8 h-8 ${color} rounded-md flex items-center justify-center`}
            >
              <IconComponent className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-medium ${getChangeColor()} px-2 py-0.5 rounded-full`}
                  >
                    {getChangeIcon()}
                    <span className="ml-1">{change}</span>
                  </div>
                )}
              </dd>
              {subtitle && (
                <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
