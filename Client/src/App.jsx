import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "react-oidc-context";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./components/auth/LoginPageNew";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { SignInCallback, SignOutCallback } from "./components/auth/OIDCCallback";
import { OIDCTestPage } from "./components/auth/OIDCTestPage";
import { ConfigDebug } from "./components/auth/ConfigDebug";
import { TimeSheetList } from "./components/Timesheets/TimeSheetList";
import { Users } from "./components/users/Users";
import { Organizations } from "./components/Organization/Organizations";
import { Customers } from "./components/Customers/Customers";
import { Process } from "./components/Process/Process";
import { ExternalClients } from "./components/ExternalClients/ExternalClients";
import { Settings } from "./components/settings/Settings";
import { toastConfig } from "./utils/toast";

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState("timesheets"); // Default to Timesheet page
  const auth = useAuth();
  const { isLoading, isAuthenticated } = auth;

  // Handle OIDC callback routes
  const currentPath = window.location.pathname;
  if (currentPath === '/signin-oidc') {
    return <SignInCallback />;
  }
  if (currentPath === '/signout-oidc') {
    return <SignOutCallback />;
  }
  if (currentPath === '/oidc-test') {
    return <OIDCTestPage />;
  }
  if (currentPath === '/config-debug') {
    return <ConfigDebug />;
  }

  // Reset to default page when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentPage("timesheets");
    }
  }, [isAuthenticated]);

  const renderPage = () => {
    switch (currentPage) {
      case "timesheets":
        return <TimeSheetList />;

      case "users":
        return (
          <ProtectedRoute requiredRole="admin">
            <Users />user
          </ProtectedRoute>
        );

      case "organizations":
        return (
          <ProtectedRoute requiredRole="admin">
            <Organizations />
          </ProtectedRoute>
        );

      case "customers":
        return (
          <ProtectedRoute requiredRole="admin">
            <Customers />
          </ProtectedRoute>
        );

      case "process":
        return (
          <ProtectedRoute requiredRole="admin">
            <Process />
          </ProtectedRoute>
        );

      case "external-clients":
        return (
          <ProtectedRoute requiredRole="user">
            <ExternalClients />
          </ProtectedRoute>
        );

      case "settings":
        return (
          <ProtectedRoute requiredRole="admin">
            <Settings />
          </ProtectedRoute>
        );

      default:
        return <TimeSheetList />;
    }
  };

  // Show minimal loading only during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Show main app if authenticated
  return (
    <>
      <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
        {renderPage()}
      </Layout>
    </>
  );
};

const App = () => {
  return (
    <>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>

      {/* Toast container - positioned globally */}
      <Toaster
        position={toastConfig.position}
        toastOptions={{
          duration: toastConfig.duration,
          style: toastConfig.style,
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
        reverseOrder={false}
      />
    </>
  );
};

export default App;
