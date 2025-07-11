import React, { useState, useEffect, useCallback } from "react";
import { Settings, Plus, Search, Activity, Zap } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { showToast } from "../../utils/toast";
import { processService } from "../../services";
import { useAuth } from "../../hooks/useAuth";
import { ProcessTable, ProcessModal, ProcessDetails } from "./index";

export const Process = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [showDetails, setShowDetails] = useState(false);
  const { user, isInitialized } = useAuth();

  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/processes`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const responseData = await response.json();
      let processes = [];
      if (Array.isArray(responseData)) {
        processes = responseData;
      } else if (
        responseData.success &&
        responseData.data &&
        responseData.data.processes
      ) {
        processes = responseData.data.processes;
      } else if (responseData.processes) {
        processes = responseData.processes;
      }
      setProcesses(processes);
      console.log("[loadProcesses] Updated processes:", processes); // Debug log
    } catch (error) {
      showToast.error("Failed to load processes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && user) {
      loadProcesses();
    }
  }, [isInitialized, user, loadProcesses]);

  const filteredProcesses = processes.filter(
    (process) =>
      process &&
      process.name &&
      process.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalActivities = processes.reduce(
    (total, process) => total + (process.activities?.length || 0),
    0
  );

  // Modal logic
  const handleOpenProcessModal = (mode, process = null) => {
    setModalMode(mode);
    setSelectedProcess(process);
    setShowProcessModal(true);
  };

  const handleOpenDetails = (process) => {
    setSelectedProcess(process);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedProcess(null);
  };

  // Only reload the list and close modal, do not call API or show toast
  const handleProcessSave = async () => {
    await loadProcesses();
    setShowProcessModal(false);
    setSelectedProcess(null);
    setSearchTerm(""); // Clear search so new process is visible
  };

  const handleDelete = async (process) => {
    try {
      await processService.delete(process.id);
      showToast.success("Process deleted successfully");
      await loadProcesses();
      setShowDeleteModal(false);
      setSelectedProcess(null);
    } catch (error) {
      showToast.error(`Failed to delete process: ${error.message}`);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Process Management
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage processes and their activities across the organization
          </p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search processes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => handleOpenProcessModal("create")}>
            <Plus className="h-5 w-5 mr-2" />
            Add Process
          </Button>
        </div>
      </div>

      {/* Process Table */}
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 mb-8">
        <ProcessTable
          processes={filteredProcesses}
          loading={loading}
          onView={handleOpenDetails}
          onEdit={(process) => handleOpenProcessModal("edit", process)}
          onDelete={(process) => {
            setSelectedProcess(process);
            setShowDeleteModal(true);
          }}
        />
      </div>

      {/* Process Modal */}
      <ProcessModal
        isOpen={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        mode={modalMode}
        process={selectedProcess}
        onSuccess={handleProcessSave}
      />

      {/* Process Details Modal */}
      <ProcessDetails
        isOpen={showDetails}
        onClose={handleCloseDetails}
        process={selectedProcess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => handleDelete(selectedProcess)}
        title="Delete Process"
        message={`Are you sure you want to delete the process "${selectedProcess?.name}"? This will also delete all associated activities.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};
