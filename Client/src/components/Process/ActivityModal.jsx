// src/components/Process/ActivityModal.jsx - Activity create/edit modal
import React, { useState, useEffect } from "react";
import { X, ListChecks, FileText } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { processService } from "../../services/processes";
import { showToast } from "../../utils/toast";

export const ActivityModal = ({
  isOpen,
  onClose,
  activity = null,
  mode = "create",
  processId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        name: activity.name || "",
        description: activity.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
    setErrors({});
  }, [activity, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Activity name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Activity name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const activityData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    setLoading(true);
    try {
      let result;
      if (mode === "create") {
        result = await processService.createActivity(processId, activityData);
        showToast.success("Activity created successfully");
      } else {
        result = await processService.updateActivity(processId, activity.id, activityData);
        showToast.success("Activity updated successfully");
      }

      if (result && result.success) {
        onSuccess && onSuccess(result.data);
      }

      onClose();
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} activity:`, error);
      showToast.error(`Failed to ${mode === "create" ? "create" : "update"} activity: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <ListChecks className="h-5 w-5 mr-2 text-blue-500" />
          {mode === "create" ? "Add New Activity" : "Edit Activity"}
        </h3>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={loading}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <Input
            label="Activity Name"
            type="text"
            placeholder="Enter activity name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            disabled={loading}
            required
            icon={ListChecks}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Description
          </label>
          <textarea
            placeholder="Enter activity description (optional)"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={loading}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create Activity"
              : "Update Activity"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
