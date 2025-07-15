// src/components/Customers/CustomerModal.jsx - Customer create/edit modal
import React, { useState, useEffect } from "react";
import { X, Building2, Mail, Phone, MapPin, FileText } from "lucide-react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { customerService } from "../../services/customers";
import { showToast } from "../../utils/toast";

export const CustomerModal = ({
  isOpen,
  onClose,
  customer,
  mode = "create",
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    organizationId: customer?.organizationId || "",
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && customer) {
        setFormData({
          name: customer.name || "",
          description: customer.description || "",
          contactEmail: customer.contactEmail || "",
          contactPhone: customer.contactPhone || "",
          address: customer.address || "",
          organizationId: customer.organizationId || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          contactEmail: "",
          contactPhone: "",
          address: "",
          organizationId: customer?.organizationId || "",
        });
      }
      setErrors({});
      loadOrganizations();
    }
  }, [isOpen, mode, customer]);

  const loadOrganizations = async () => {
    setLoadingOrganizations(true);
    try {
      // Direct call to the backend API to ensure we're getting the data
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/organizations`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setOrganizations(data.data); // Correctly set the organizations array
      } else {
        console.error("Unexpected response format:", data);
        showToast.error("Invalid organization data format");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Customer name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Customer name must be at least 2 characters";
    }

    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Trim all string values
      const cleanedData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        contactEmail: formData.contactEmail.trim() || null,
        contactPhone: formData.contactPhone.trim() || null,
        address: formData.address.trim() || null,
        organizationId: formData.organizationId,
      };

      let responseData;

      if (mode === "create") {
        const response = await customerService.createCustomer(cleanedData);
       
        responseData = response.data ? response.data.customer : response;
        showToast.success("Customer created successfully");
      } else {
        const response = await customerService.updateCustomer(
          customer.id,
          cleanedData
        );
       
        responseData = response.data ? response.data.customer : response;
        showToast.success("Customer updated successfully");
      }

      

      // Pass the created/updated customer back to the parent component
      onSuccess(responseData);
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      const errorMessage =
        error.response?.data?.message || `Failed to ${mode} customer`;
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Building2 className="h-5 w-5 mr-2 text-blue-500" />
          {mode === "create" ? "Add New Customer" : "Edit Customer"}
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
        {/* Organization Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Organization
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <select
              className={`pl-10 w-full border ${
                errors.organizationId ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              value={formData.organizationId}
              onChange={(e) =>
                handleInputChange("organizationId", e.target.value)
              }
              disabled={loadingOrganizations} // Always enable dropdown for creation
            >
              <option value="">Select Organization</option>
              {organizations.map((org) => (
                <option key={org.id || org._id} value={org.id || org._id}>
                  {org.name}
                </option>
              ))}
            </select>
            {errors.organizationId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.organizationId}
              </p>
            )}
            {loadingOrganizations && (
              <p className="mt-1 text-sm text-gray-500">
                Loading organizations...
              </p>
            )}
          </div>
        </div>

        {/* Customer Name */}
        <div>
          <Input
            label="Customer Name"
            type="text"
            placeholder="Enter customer name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
            icon={Building2}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              placeholder="Enter customer description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              maxLength={1000}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Contact Email"
              type="email"
              placeholder="customer@example.com"
              value={formData.contactEmail}
              onChange={(e) =>
                handleInputChange("contactEmail", e.target.value)
              }
              error={errors.contactEmail}
              icon={Mail}
            />
          </div>

          <div>
            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.contactPhone}
              onChange={(e) =>
                handleInputChange("contactPhone", e.target.value)
              }
              icon={Phone}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <textarea
              placeholder="Enter customer address (optional)"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              rows={2}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              maxLength={500}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {formData.address.length}/500 characters
          </p>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {mode === "create" ? "Creating..." : "Updating..."}
              </div>
            ) : mode === "create" ? (
              "Create Customer"
            ) : (
              "Update Customer"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
