// src/components/Organization/Organizations.jsx - Complete organization management
import React, { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Filter,
  Building2,
  Users,
  Briefcase,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../common/Button";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { OrganizationTable } from "./OrganizationTable";
import { OrganizationModal } from "./OrganizationModal";
import { OrganizationDetails } from "./OrganizationDetails";
import { organizationService } from "../../services/organizations";
import { showToast } from "../../utils/toast";

export const Organizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user, isInitialized } = useAuth();

  useEffect(() => {
    if (isInitialized && user) {
      loadOrganizations();
    }
  }, [isInitialized, user]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the organization service instead of direct fetch
      const result = await organizationService.getUserOrganizations();
      console.log("Organizations service response:", result);

      if (result.success && Array.isArray(result.data)) {
        setOrganizations(result.data); // Ensure organizations are set correctly
      } else {
        console.error("Unexpected response format:", result);
        setOrganizations([]);
      }
    } catch (err) {
      console.error("Error loading organizations:", err);
      setError(err.message || "Failed to load organizations");
      showToast.error(err.message || "Failed to load organizations");
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setSelectedOrganization(null);
    setModalMode("create");
    setShowModal(true);
  };

  const openEditModal = (organization) => {
    setSelectedOrganization(organization);
    setModalMode("edit");
    setShowModal(true);
  };

  const openViewModal = (organization) => {
    setSelectedOrganization(organization);
    setModalMode("view");
    setShowModal(true);
  };

  const openDeleteModal = (organization) => {
    setOrganizationToDelete(organization);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!organizationToDelete) return;

    setIsDeleting(true);
    try {
      await organizationService.delete(organizationToDelete.id);
      setOrganizations((prev) =>
        prev.filter((o) => o.id !== organizationToDelete.id)
      );
      showToast.success("Organization deleted successfully");
    } catch (err) {
      console.error("Error deleting organization:", err);
      showToast.error("Failed to delete organization");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setOrganizationToDelete(null);
    }
  };

  const handleViewDetails = (organizationId) => {
    setSelectedOrganizationId(organizationId);
    setViewMode("details");
  };

  const handleBackToList = () => {
    setSelectedOrganizationId(null);
    setViewMode("list");
  };

  const handleSuccess = (organization, mode) => {
    if (mode === "create") {
      setOrganizations([organization, ...organizations]);
      showToast.success("Organization created successfully");
    } else if (mode === "edit") {
      setOrganizations(
        organizations.map((o) => (o.id === organization.id ? organization : o))
      );
      showToast.success("Organization updated successfully");
    }
    setShowModal(false);
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage all organizations and their details
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={loadOrganizations}
            variant="secondary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>

          {viewMode === "list" && (
            <Button onClick={openCreateModal} className="ml-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Organization
            </Button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-red-700">{error}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === "list" ? (
        <OrganizationTable
          organizations={organizations}
          onView={handleViewDetails}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          loading={loading}
        />
      ) : (
        <OrganizationDetails
          organizationId={selectedOrganizationId}
          onBack={handleBackToList}
          onRefresh={loadOrganizations}
        />
      )}

      {/* Organization Modal */}
      <OrganizationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        organization={selectedOrganization}
        mode={modalMode}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Organization"
        message={
          <>
            <p>
              Are you sure you want to delete{" "}
              <span className="font-bold">
                {organizationToDelete?.name || "this organization"}
              </span>
              ?
            </p>
            <p className="mt-2 text-red-600">
              This will also delete all associated customers and their data.
              This action cannot be undone.
            </p>
          </>
        }
        confirmText="Delete Organization"
        cancelText="Cancel"
        type="delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Organizations;
