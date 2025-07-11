// src/components/Customers/ProjectModal.jsx - Project creation/editing modal
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { Modal } from "../common/Modal";

export const ProjectModal = ({
  isOpen,
  onClose,
  onSave,
  project = null,
  customerId,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        description: project.description || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Project name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Project name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const projectData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    // Add customerId for new projects
    if (!project) {
      projectData.customerId = customerId;
    }

    await onSave(projectData);
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

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {project ? "Edit Project" : "Add New Project"}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <Input
            label="Project Name"
            type="text"
            placeholder="Enter project name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={errors.name}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Enter project description (optional)"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isLoading}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.description
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300"
            } ${isLoading ? "bg-gray-50 cursor-not-allowed" : ""}`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {project ? "Updating..." : "Creating..."}
              </div>
            ) : project ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
