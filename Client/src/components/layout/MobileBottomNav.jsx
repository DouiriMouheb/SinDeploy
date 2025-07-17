import React from "react";
import { Hourglass, Users, Building2, Workflow, Settings } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export const MobileBottomNav = ({ currentPage, setCurrentPage }) => {
  const { hasRole } = useAuth();

  const navigation = [
    { name: "TimeSheets", icon: Hourglass, page: "timesheets" },

   

    // Admin-only access
    ...(hasRole("admin")
      ? [
          { name: "Organization", icon: Building2, page: "organizations" },
          { name: "Process", icon: Workflow, page: "process" },
          { name: "Settings", icon: Settings, page: "settings" },
        ]
      : []),
  ];

  // Limit to 5 items for mobile to fit well
  const mobileNavigation = navigation.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 backdrop-blur-lg bg-opacity-95 z-50 md:hidden">
      <div className="flex justify-around items-center py-2">
        {mobileNavigation.map((item) => (
          <button
            key={item.name}
            onClick={() => setCurrentPage(item.page)}
            className={`flex flex-col items-center justify-center p-2 min-w-0 flex-1 transition-colors duration-200 ${
              currentPage === item.page ? "text-blue-600" : "text-gray-500"
            }`}
          >
            <item.icon
              className={`h-5 w-5 mb-1 ${
                currentPage === item.page ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <span className="text-xs font-medium truncate w-full text-center">
              {item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
