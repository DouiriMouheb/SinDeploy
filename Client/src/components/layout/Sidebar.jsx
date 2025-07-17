import {
  Users,
  Settings,
  LogOut,
  Hourglass,
  Building2, // For Customers
  Workflow, // For Process
  Menu, // For toggle button
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ProfilePicture } from "../common/ProfilePicture";


export const Sidebar = ({
  currentPage,
  setCurrentPage,
  sidebarOpen,
  toggleSidebar,
  onOpenProfile,
}) => {
  const { user, logout, hasRole } = useAuth();

  const navigation = [
    { name: "TimeSheets", icon: Hourglass, page: "timesheets" },

  

    // Admin-only access
    ...(hasRole("admin")
      ? [
          { name: "Organizations", icon: Building2, page: "organizations" },
          { name: "Customers", icon: Building2, page: "customers" }, // Added customers page
          { name: "Process", icon: Workflow, page: "process" },
          { name: "Settings", icon: Settings, page: "settings" },
        ]
      : []),
  ];

  const handleNavClick = (page) => {
    setCurrentPage(page);
  };

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    }
  };

  const isOpen = sidebarOpen;

  return (
    <div
      className={`flex flex-col h-full bg-white shadow-xl border-r border-gray-200 overflow-x-hidden ${
        isOpen ? "w-64" : "w-16"
      } transition-all duration-300`}
    >
      <div
        className={`flex items-center ${
          isOpen ? "justify-between" : "justify-center"
        } h-16 px-4 bg-gradient-to-r from-blue-600 to-cyan-600`}
      >
        {isOpen ? (
          <>
            <h1 className="text-xl font-bold text-white">Company Portal</h1>
            <div className="flex items-center space-x-2">
              {/* Toggle button */}
              <button
                onClick={toggleSidebar}
                className="text-white hover:text-gray-200 p-1 rounded transition-colors"
                title="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-gray-200 p-2 rounded transition-colors"
            title="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => handleNavClick(item.page)}
            className={`w-full flex items-center ${
              isOpen ? "px-2" : "px-3 justify-center"
            } py-2 text-sm font-medium rounded-md transition-all duration-200 group relative ${
              currentPage === item.page
                ? "bg-blue-100 text-blue-900 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
            title={!isOpen ? item.name : ""}
          >
            <item.icon
              className={`${isOpen ? "mr-3" : ""} h-5 w-5 flex-shrink-0`}
            />
            {isOpen && <span>{item.name}</span>}

            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Profile Section */}
      <div
        className={`border-t border-gray-200 ${
          isOpen ? "p-4" : "p-2"
        } bg-white`}
      >
        <div
          className={`flex items-center ${
            !isOpen ? "justify-center" : ""
          } mb-2 cursor-pointer hover:bg-gray-100 rounded-md p-2 transition-colors group relative`}
          onClick={handleProfileClick}
          title={!isOpen ? "My Profile" : ""}
        >
          <ProfilePicture user={user} size="sm" className="flex-shrink-0" />

          {isOpen && (
            <div className="ml-2 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          )}

          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              My Profile
            </div>
          )}
        </div>

   
        <button
          onClick={logout}
          className={`w-full flex items-center ${
            isOpen ? "px-2" : "justify-center"
          } py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-slate-100 hover:text-slate-900 group relative transition-all duration-200`}
          title={!isOpen ? "Sign out" : ""}
        >
          <LogOut className={`${isOpen ? "mr-3" : ""} h-4 w-4 flex-shrink-0`} />
          {isOpen && <span>Sign out</span>}

          {!isOpen && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
              Sign out
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
