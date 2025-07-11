// src/components/Organization/OrganizationDetails.jsx - Organization details with its customers (read-only)
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Users,
  Edit,
  Briefcase,
  Save,
  X,
  Trash2,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { organizationService } from "../../services/organizations";
import { showToast } from "../../utils/toast";

export const OrganizationDetails = ({ organizationId, onBack, onRefresh }) => {
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    workLocation: "",
  });
  const [savingChanges, setSavingChanges] = useState(false);

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (organizationId) {
      loadOrganizationDetails();
    }
  }, [organizationId]);

  const loadOrganizationDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the organization service instead of direct fetch
      const result = await organizationService.getById(organizationId);

      if (result.success && result.data) {
        console.log("Organization details loaded:", result.data);
        const organizationData =
          result.data.data?.organization ||
          result.data.organization ||
          result.data;
        console.log(
          "Clients:",
          organizationData.clients ? organizationData.clients.length : 0
        );
        setOrganization(organizationData);
        // Set form data for editing
        setEditForm({
          name: organizationData.name || "",
          workLocation: organizationData.workLocation || "",
        });
      } else {
        throw new Error("Failed to load organization details");
      }
    } catch (err) {
      console.error("Error loading organization details:", err);
      setError(err.message || "Failed to load organization details");
      showToast.error(err.message || "Failed to load organization details");
    } finally {
      setLoading(false);
    }
  };

  // Edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
    // Reset form with current organization data
    setEditForm({
      name: organization.name || "",
      workLocation: organization.workLocation || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original data
    setEditForm({
      name: organization.name || "",
      workLocation: organization.workLocation || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!organization || savingChanges) return;

    // Basic validation
    if (!editForm.name.trim()) {
      showToast.error("Organization name is required");
      return;
    }

    setSavingChanges(true);

    try {
      const updateData = {
        name: editForm.name.trim(),
        workLocation: editForm.workLocation.trim(),
      };

      const response = await organizationService.update(
        organizationId,
        updateData
      );

      if (response.success) {
        setOrganization(response.data.organization || response.data);
        setIsEditing(false);
        showToast.success("Organization updated successfully");

        // Refresh parent list if callback provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        throw new Error(response.error || "Failed to update organization");
      }
    } catch (err) {
      console.error("Error updating organization:", err);
      showToast.error(err.message || "Failed to update organization");
    } finally {
      setSavingChanges(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteRequest = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!organization || actionLoading) return;

    setActionLoading("delete");

    try {
      const response = await organizationService.delete(organizationId);
      if (response.success) {
        showToast.success("Organization deleted successfully");
        onBack(); // Go back to list after deletion
      } else {
        throw new Error("Failed to delete organization");
      }
    } catch (err) {
      console.error("Error deleting organization:", err);
      showToast.error(err.message || "Failed to delete organization");
    } finally {
      setActionLoading(null);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organization details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-red-800 font-semibold mb-2">Error</h3>
        <p className="text-red-600">{error}</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Organizations
        </Button>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-yellow-800 font-semibold mb-2">Not Found</h3>
        <p className="text-yellow-600">Organization not found</p>
        <Button onClick={onBack} variant="secondary" className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Organizations
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col space-y-4">
          {/* Back button and organization info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button onClick={onBack} variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
                <span className="hidden sm:inline">Back to Organizations</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  {organization.name}
                </h1>
                {organization.workLocation && (
                  <p className="text-sm text-gray-500 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {organization.workLocation}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {!isEditing && (
              <>
                <Button onClick={handleStartEdit} variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Organization
                </Button>
                <Button
                  onClick={handleDeleteRequest}
                  variant="danger"
                  size="sm"
                  disabled={actionLoading === "delete"}
                >
                  {actionLoading === "delete" ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Organization
                    </>
                  )}
                </Button>
              </>
            )}

            {isEditing && (
              <>
                <Button
                  onClick={handleSaveEdit}
                  variant="primary"
                  size="sm"
                  disabled={savingChanges}
                >
                  {savingChanges ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancelEdit}
                  variant="secondary"
                  size="sm"
                  disabled={savingChanges}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Organization Information */}
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Organization Information
          </h2>

          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">
                Organization Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    placeholder="Enter organization name"
                    disabled={savingChanges}
                  />
                ) : (
                  organization.name
                )}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">
                Work Location
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {isEditing ? (
                  <Input
                    type="text"
                    value={editForm.workLocation}
                    onChange={(e) =>
                      handleFormChange("workLocation", e.target.value)
                    }
                    placeholder="Enter work location (optional)"
                    disabled={savingChanges}
                  />
                ) : organization.workLocation ? (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                    {organization.workLocation}
                  </div>
                ) : (
                  <span className="text-gray-400 italic">
                    No location specified
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>

        {/* Customers Section - Read Only */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <Users className="h-5 w-5 mr-2" /> Customers
              {organization.clients && organization.clients.length > 0 && (
                <span className="ml-2 bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                  {organization.clients.length}
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500">
              View only • Manage customers in the Customers section
            </p>
          </div>

          {/* Customers list - Read Only */}
          {organization.clients && organization.clients.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organization.clients.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-semibold text-lg">
                              {customer.name
                                ? customer.name.charAt(0).toUpperCase()
                                : "?"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {customer.name || "Unnamed Customer"}
                            </div>
                            {customer.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {customer.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {customer.contactEmail || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.contactPhone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.workLocation ? (
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {customer.workLocation}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not specified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center border">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No customers assigned
              </h3>
              <p className="text-gray-500 mt-1">
                This organization currently has no customers assigned to it.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Use the Customers section to manage customer assignments.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Organization"
        message={`Are you sure you want to delete "${organization?.name}"?`}
        confirmText="Delete Organization"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading === "delete"}
        itemName={organization ? `${organization.name}` : ""}
        details={[
          "This action cannot be undone",
          "Organization data will be permanently removed",
          "All associated customers and projects will be affected",
        ]}
      />
    </div>
  );
};
