// src/components/layout/Layout.jsx - Updated with UserProfileModal and mobile navigation
import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileHeader } from "./MobileHeader";
import { UserProfileModal } from "../users/UserProfileModal";

export const Layout = ({ children, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenProfile = () => {
    setShowProfileModal(true);
  };

  const handleCloseProfile = () => {
    setShowProfileModal(false);
  };

  return (
    <>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        {!isMobile && (
          <div
            className={`${
              sidebarOpen ? "w-64" : "w-16"
            } transition-all duration-300 ease-in-out flex-shrink-0`}
          >
            <Sidebar
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              sidebarOpen={sidebarOpen}
              toggleSidebar={toggleSidebar}
              onOpenProfile={handleOpenProfile}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header - Only show on mobile */}
          {isMobile && <MobileHeader onOpenProfile={handleOpenProfile} />}

          <main className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto bg-white p-4 md:p-6 pb-20 md:pb-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      {isMobile && (
        <MobileBottomNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={handleCloseProfile}
      />
    </>
  );
};
