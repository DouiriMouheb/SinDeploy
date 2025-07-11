// src/components/Process/ProcessModal.jsx - Process create/edit modal
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { processService } from "../../services/processes";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Process name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
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
      if (result && result.success && result.data) {
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "create" ? "Create Process" : "Edit Process"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Process Name *
          </label>
          <Input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter process name"
            error={errors.name}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter process description (optional)"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
          />
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            type="button"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
              ? "Create"
              : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
