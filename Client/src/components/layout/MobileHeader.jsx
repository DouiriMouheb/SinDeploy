import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { ProfilePicture } from "../common/ProfilePicture";

export const MobileHeader = ({ onOpenProfile }) => {
  const { user, logout } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        {/* Center - App title */}
        <h1 className="text-lg font-bold text-gray-900">Company Portal</h1>

        {/* Right side - User actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenProfile}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            title="Profile"
          >
            <ProfilePicture user={user} size="sm" />
          </button>
          <button
            onClick={logout}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
