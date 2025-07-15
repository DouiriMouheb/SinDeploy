// src/components/Process/Process.jsx - Complete process management
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
  Briefcase,
  ClipboardList,
  ListChecks,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ProcessTable } from "./ProcessTable";
import { ProcessModal } from "./ProcessModal";
import { ProcessFilters } from "./ProcessFilters";
import { ProcessDetails } from "./ProcessDetails";
import { processService } from "../../services";
import { showToast } from "../../utils/toast";

export const Process = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [selectedProcessId, setSelectedProcessId] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [viewMode, setViewMode] = useState("list");
  const [showFilters, setShowFilters] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProcesses: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    isActive: "true", // Default to showing active processes
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalActivities: 0,
  });

  const { user, hasRole } = useAuth();
  const refreshTimeoutRef = useRef(null);

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const result = await processService.getProcesses(cleanFilters);

      if (result && result.data) {
        const { processes = [], pagination: paginationData, stats: statsData } = result.data;

        setProcesses(processes);

        if (paginationData) {
          setPagination(paginationData);
        }

        if (statsData) {
          setStats(statsData);
        } else {
          // Calculate basic stats if not provided by API
          const totalActivities = processes.reduce(
            (total, process) => total + (process.activities?.length || 0),
            0
          );
          setStats({
            total: processes.length,
            active: processes.filter(p => p.isActive !== false).length,
            totalActivities
          });
        }
      } else {
        setProcesses([]);
        setPagination({ currentPage: 1, totalPages: 1, totalProcesses: 0 });
        setStats({ total: 0, active: 0, totalActivities: 0 });
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      setError(error.message || "Failed to load processes");
      showToast.error("Failed to load processes");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced refresh function
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      loadProcesses();
    }, 300);
  }, [loadProcesses]);

  useEffect(() => {
    if (user) {
      loadProcesses();
    }
  }, [user, loadProcesses]);

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  // Modal handlers
  const openModal = (mode, process = null) => {
    setModalMode(mode);
    setSelectedProcess(process);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProcess(null);
    setModalMode("create");
  };

  const handleModalSuccess = async () => {
    await loadProcesses();
    closeModal();
  };

  // View handlers
  const viewProcess = (processId) => {
    setSelectedProcessId(processId);
    setViewMode("details");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedProcessId(null);
  };

  // Delete handlers
  const handleDeleteRequest = (process) => {
    setSelectedProcess(process);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProcess) return;

    try {
      await processService.delete(selectedProcess.id);
      showToast.success("Process deleted successfully");
      await loadProcesses();
      setShowDeleteModal(false);
      setSelectedProcess(null);
    } catch (error) {
      console.error("Error deleting process:", error);
      showToast.error(`Failed to delete process: ${error.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSelectedProcess(null);
  };

  // Loading state
  if (loading && processes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading processes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && processes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <Button onClick={loadProcesses} variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show process details view
  if (viewMode === "details" && selectedProcessId) {
    return (
      <ProcessDetails
        processId={selectedProcessId}
        onBack={backToList}
        onEdit={(process) => {
          setViewMode("list");
          openModal("edit", process);
        }}
        onDelete={async (processId) => {
          await processService.delete(processId);
          loadProcesses(); // Refresh the list
        }}
        onRefresh={debouncedRefresh} // Use debounced refresh callback
      />
    );
  }

  // Show list view
  return (
    <div>
      <div className="mb-8">
        {/* Header - responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Process Management
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage processes and their activities across the organization
            </p>
          </div>

          {/* Buttons - stack on mobile, inline on larger screens */}
          <div className="flex space-x-2 sm:mt-0">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              onClick={loadProcesses}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => openModal("create")} size="sm">
              <Plus className="h-5 w-5 mr-2" />
              Add Process
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ProcessFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Processes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClipboardList className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Processes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.active}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ListChecks className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Activities
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {stats.totalActivities}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Processes Table */}
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <ProcessTable
          processes={processes}
          onView={viewProcess}
          onEdit={(process) => openModal("edit", process)}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Process Modal */}
      <ProcessModal
        isOpen={showModal}
        onClose={closeModal}
        process={selectedProcess}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Process"
        message={`Are you sure you want to delete "${selectedProcess?.name}"? This action cannot be undone and will also delete all associated activities.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
