// src/components/Process/ProcessModal.jsx - Process create/edit modal
import React, { useState, useEffect } from "react";
import { X, Briefcase, FileText } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { processService } from "../../services/processes";
import { showToast } from "../../utils/toast";

export const ProcessModal = ({
  isOpen,
  onClose,
  process,
  mode = "create",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && process) {
        setFormData({
          name: process.name || "",
          description: process.description || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, process, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Process name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Process name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let result;
      if (mode === "create") {
        result = await processService.create(formData);
        showToast.success("Process created successfully");
      } else {
        result = await processService.update(process.id, formData);
        showToast.success("Process updated successfully");
      }

      // Pass the newly created or updated process data to the parent component
      if (result && result.data) {
        onSuccess && onSuccess(result.data);
      }

      onClose();
    } catch (error) {
      showToast.error(`Failed to ${mode} process: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
          {mode === "create" ? "Add New Process" : "Edit Process"}
        </h2>
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
            label="Process Name"
            type="text"
            placeholder="Enter process name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            disabled={loading}
            required
            icon={Briefcase}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 inline mr-1" />
            Description
          </label>
          <textarea
            placeholder="Enter process description (optional)"
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
              ? "Create Process"
              : "Update Process"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
