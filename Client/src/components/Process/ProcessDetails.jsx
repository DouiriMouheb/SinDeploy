// src/components/Process/ProcessDetails.jsx - Process details view
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Briefcase,
  Calendar,
  Clock,
  AlertCircle,
  ListChecks,
  Plus,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ActivityModal } from "./ActivityModal";
import { processService } from "../../services/processes";
import { showToast } from "../../utils/toast";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid Date";
  }
};

export const ProcessDetails = ({
  processId,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [process, setProcess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
  });

  // Activity modal states
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityModalMode, setActivityModalMode] = useState("create");

  // Load process data
  useEffect(() => {
    const loadProcess = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await processService.getProcess(processId);
        if (result && result.data) {
          setProcess(result.data.process || result.data);
        } else {
          setError("Failed to load process details");
        }
      } catch (err) {
        console.error("Error loading process:", err);
        setError(err.message || "Failed to load process details");
      } finally {
        setLoading(false);
      }
    };

    if (processId) {
      loadProcess();
    }
  }, [processId]);

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false);
    } else {
      // Start editing
      setEditForm({
        name: process?.name || "",
        description: process?.description || "",
      });
      setIsEditing(true);
    }
  };

  // Handle edit form changes
  const handleEditChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save process changes
  const handleSaveChanges = async () => {
    if (!editForm.name.trim()) {
      showToast.error("Process name is required");
      return;
    }

    try {
      setActionLoading("save");
      const result = await processService.update(processId, {
        name: editForm.name.trim(),
        description: editForm.description.trim()
      });

      if (result && result.data) {
        setProcess(prev => ({
          ...prev,
          name: editForm.name.trim(),
          description: editForm.description.trim()
        }));
        setIsEditing(false);
        showToast.success("Process updated successfully");
      }
    } catch (err) {
      console.error("Error updating process:", err);
      showToast.error(err.message || "Failed to update process");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete process
  const handleDeleteProcess = async () => {
    try {
      setActionLoading("delete");
      await onDelete(processId);
      showToast.success("Process deleted successfully");
      onBack(); // Navigate back to list
    } catch (err) {
      console.error("Error deleting process:", err);
      showToast.error(err.message || "Failed to delete process");
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  // Activity handlers
  const openActivityModal = (mode, activity = null) => {
    setActivityModalMode(mode);
    setSelectedActivity(activity);
    setShowActivityModal(true);
  };

  const handleActivitySuccess = async () => {
    try {
      // Always reload the process data to get updated activities
      const result = await processService.getProcess(processId);
      if (result && result.data) {
        setProcess(result.data.process || result.data);
      }

      // Also call onRefresh if provided (for parent component)
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error refreshing process:", err);
      showToast.error("Failed to refresh process data");
    }

    setShowActivityModal(false);
    setSelectedActivity(null);
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await processService.deleteActivity(processId, activityId);
      showToast.success("Activity deleted successfully");

      // Always reload the process data to get updated activities
      const result = await processService.getProcess(processId);
      if (result && result.data) {
        setProcess(result.data.process || result.data);
      }

      // Also call onRefresh if provided (for parent component)
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting activity:", err);
      showToast.error(err.message || "Failed to delete activity");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Loading process details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={onBack} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Processes
          </Button>
        </div>
      </div>
    );
  }

  // No process found
  if (!process) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <Briefcase className="h-8 w-8 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600  mb-4">Process not found</p>
          <Button onClick={onBack} variant="secondary" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Processes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col space-y-4">
            {/* Back button and process info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Processes</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                    </div>
                    {isEditing ? (
                      <Input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => handleEditChange("name", e.target.value)}
                        className="text-2xl font-bold border-none p-0 focus:ring-0"
                        disabled={actionLoading === "save"}
                      />
                    ) : (
                      process.name
                    )}
                  </h1>
                  {process.description && !isEditing && (
                    <p className="text-sm text-slate-500 mt-1">
                      {process.description}
                    </p>
                  )}
                  {isEditing && (
                    <textarea
                      value={editForm.description}
                      onChange={(e) => handleEditChange("description", e.target.value)}
                      placeholder="Process description..."
                      className="mt-2 w-full text-sm text-slate-500 border border-slate-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      disabled={actionLoading === "save"}
                    />
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={toggleEditMode}
                      variant="ghost"
                      size="sm"
                      disabled={actionLoading === "save"}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      size="sm"
                      loading={actionLoading === "save"}
                      disabled={actionLoading === "save"}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={toggleEditMode}
                      variant="ghost"
                      size="sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setShowDeleteModal(true)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Process Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white  overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Created
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatDate(process.createdAt)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white  overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Last Updated
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {formatDate(process.updatedAt)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white  overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ListChecks className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Activities
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {process.activities?.length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activities Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-slate-200 ">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-slate-900">
                Activities ({process.activities?.length || 0})
              </h3>
              <Button
                onClick={() => openActivityModal("create")}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </div>
          </div>

          <div className="p-6">
            {process.activities && process.activities.length > 0 ? (
              <div className="space-y-4">
                {process.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900 ">
                        {activity.name}
                      </h4>
                      {activity.description && (
                        <p className="text-sm text-slate-500  mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openActivityModal("edit", activity)}
                        className="text-slate-600 hover:text-slate-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ListChecks className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">
                  No activities
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Get started by creating a new activity for this process.
                </p>
                <div className="mt-6">
                  <Button
                    onClick={() => openActivityModal("create")}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Activity
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        activity={selectedActivity}
        mode={activityModalMode}
        processId={processId}
        onSuccess={handleActivitySuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProcess}
        title="Delete Process"
        message={`Are you sure you want to delete "${process.name}"? This action cannot be undone and will also delete all associated activities.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};