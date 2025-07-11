// src/components/Customers/CustomerDetails.jsx - Customer details view
import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Edit,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  Briefcase,
  Plus,
  MoreVertical,
  Trash2,
  Save,
  X,
} from "lucide-react";
import { Button } from "../common/Button";
import { Input } from "../common/Input";
import { ConfirmationModal } from "../common/ConfirmationModal";
import { ProjectModal } from "./ProjectModal";
import { customerService } from "../../services/customers";
import { projectService } from "../../services/projects";
import { showToast } from "../../utils/toast";

const formatDateTime = (dateString) => {
  if (!dateString) return "Never";

  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "Invalid date";
  }
};

export const CustomerDetails = ({
  customerId,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
}) => {
  const [customer, setCustomer] = useState(null);
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
    contactEmail: "",
    contactPhone: "",
    address: "",
  });
  const [savingChanges, setSavingChanges] = useState(false);

  // Project management states
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectModalMode, setProjectModalMode] = useState("create");
  const [showProjectDeleteModal, setShowProjectDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    if (customerId) {
      loadCustomer();
    }
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerService.getCustomer(customerId);

      if (response.success) {
        setCustomer(response.data.customer);
        // Set form data for editing
        setEditForm({
          name: response.data.customer.name || "",
          description: response.data.customer.description || "",
          contactEmail: response.data.customer.contactEmail || "",
          contactPhone: response.data.customer.contactPhone || "",
          address: response.data.customer.address || "",
        });
      }
    } catch (err) {
      console.error("Error loading customer:", err);
      setError(err.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  // Project management functions
  const openProjectModal = (mode, project = null) => {
    setProjectModalMode(mode);
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const closeProjectModal = () => {
    setShowProjectModal(false);
    setSelectedProject(null);
  };

  const handleProjectSave = async (projectData) => {
    try {
      setActionLoading("project");

      let response;
      if (projectModalMode === "create") {
        response = await projectService.createProject(projectData);
        showToast.success("Project created successfully");
      } else {
        response = await projectService.updateProject(
          selectedProject.id,
          projectData
        );
        showToast.success("Project updated successfully");
      }

      if (response.success) {
        // Reload customer data to get updated projects
        await loadCustomer();
        closeProjectModal();

        // Refresh the parent customer list to update project counts
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (err) {
      console.error("Error saving project:", err);
      showToast.error(
        `Failed to ${
          projectModalMode === "create" ? "create" : "update"
        } project`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleProjectDeleteRequest = (project) => {
    setProjectToDelete(project);
    setShowProjectDeleteModal(true);
  };

  const confirmProjectDelete = async () => {
    if (!projectToDelete) return;

    setActionLoading("deleteProject");

    try {
      await projectService.deleteProject(projectToDelete.id);
      showToast.success("Project deleted successfully");

      // Reload customer data to get updated projects
      await loadCustomer();
      setShowProjectDeleteModal(false);
      setProjectToDelete(null);

      // Refresh the parent customer list to update project counts
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      showToast.error("Failed to delete project");
    } finally {
      setActionLoading(null);
    }
  };

  // Edit functions
  const handleStartEdit = () => {
    setIsEditing(true);
    // Reset form with current customer data
    setEditForm({
      name: customer.name || "",
      description: customer.description || "",
      contactEmail: customer.contactEmail || "",
      contactPhone: customer.contactPhone || "",
      address: customer.address || "",
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original data
    setEditForm({
      name: customer.name || "",
      description: customer.description || "",
      contactEmail: customer.contactEmail || "",
      contactPhone: customer.contactPhone || "",
      address: customer.address || "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim()) {
      showToast.error("Customer name is required");
      return;
    }

    setSavingChanges(true);
    try {
      const response = await customerService.updateCustomer(customerId, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        contactEmail: editForm.contactEmail.trim(),
        contactPhone: editForm.contactPhone.trim(),
        address: editForm.address.trim(),
      });

      if (response.success) {
        setCustomer(response.data.customer);
        setIsEditing(false);
        showToast.success("Customer updated successfully");
      } else {
        showToast.error(response.message || "Failed to update customer");
      }
    } catch (err) {
      console.error("Error updating customer:", err);
      showToast.error("Failed to update customer");
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
    if (!customer || actionLoading) return;

    setActionLoading("delete");

    try {
      await onDelete(customerId);
      showToast.success("Customer deleted successfully");
      onBack(); // Go back to list after deletion
    } catch (err) {
      console.error("Error deleting customer:", err);
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
          <p className="mt-4 text-slate-600">Loading customer details...</p>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">
          Error Loading Customer
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {error || "Customer not found"}
        </p>
        <div className="mt-6">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
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
            {/* Back button and customer info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={onBack} variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Customers</span>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    {customer.name}
                  </h1>
                  {customer.description && (
                    <p className="text-sm text-slate-500 mt-1">
                      {customer.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              {!isEditing && (
                <Button onClick={handleStartEdit} variant="secondary" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
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

              {!isEditing && (
                <Button
                  onClick={handleDeleteRequest}
                  variant="danger"
                  size="sm"
                  disabled={actionLoading === "delete"}
                >
                  {actionLoading === "delete" ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    "Delete Customer"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-lg rounded-lg p-6 border border-slate-200">
            <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Customer Information
            </h2>

            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-slate-500">
                  Customer Name
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {isEditing ? (
                    <Input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      placeholder="Enter customer name"
                      disabled={savingChanges}
                    />
                  ) : (
                    customer.name
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500 ">
                  Description
                </dt>
                <dd className="mt-1 text-sm text-slate-900 ">
                  {isEditing ? (
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        handleFormChange("description", e.target.value)
                      }
                      placeholder="Enter customer description (optional)"
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300  rounded-md bg-white  text-slate-900  placeholder-slate-400  focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      disabled={savingChanges}
                    />
                  ) : customer.description ? (
                    customer.description
                  ) : (
                    <span className="text-slate-400  italic">
                      No description provided
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500 ">
                  Contact Email
                </dt>
                <dd className="mt-1 text-sm text-slate-900 ">
                  {isEditing ? (
                    <Input
                      type="email"
                      value={editForm.contactEmail}
                      onChange={(e) =>
                        handleFormChange("contactEmail", e.target.value)
                      }
                      placeholder="Enter contact email (optional)"
                      disabled={savingChanges}
                    />
                  ) : customer.contactEmail ? (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-slate-400 " />
                      <a
                        href={`mailto:${customer.contactEmail}`}
                        className="text-blue-600 hover:text-blue-800  "
                      >
                        {customer.contactEmail}
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400  italic">
                      No email provided
                    </span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-slate-500 ">
                  Contact Phone
                </dt>
                <dd className="mt-1 text-sm text-slate-900 ">
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={editForm.contactPhone}
                      onChange={(e) =>
                        handleFormChange("contactPhone", e.target.value)
                      }
                      placeholder="Enter contact phone (optional)"
                      disabled={savingChanges}
                    />
                  ) : customer.contactPhone ? (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1 text-slate-400 " />
                      <a
                        href={`tel:${customer.contactPhone}`}
                        className="text-blue-600 hover:text-blue-800  "
                      >
                        {customer.contactPhone}
                      </a>
                    </div>
                  ) : (
                    <span className="text-slate-400  italic">
                      No phone provided
                    </span>
                  )}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-slate-500 ">Address</dt>
                <dd className="mt-1 text-sm text-slate-900 ">
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) =>
                        handleFormChange("address", e.target.value)
                      }
                      placeholder="Enter customer address (optional)"
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-300  rounded-md bg-white  text-slate-900  placeholder-slate-400  focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
                      disabled={savingChanges}
                    />
                  ) : customer.address ? (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-slate-400  mt-0.5 flex-shrink-0" />
                      <span>{customer.address}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400  italic">
                      No address provided
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Projects */}
          <div className="bg-white  shadow-lg rounded-lg p-6 border border-slate-200 ">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-slate-900  flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Projects ({customer.workProjects?.length || 0})
              </h2>
              <Button
                onClick={() => openProjectModal("create")}
                variant="primary"
                size="sm"
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Project
              </Button>
            </div>

            {customer.workProjects && customer.workProjects.length > 0 ? (
              <div className="space-y-3">
                {customer.workProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-slate-200  rounded-lg hover:bg-slate-100  transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-slate-900 ">
                            {project.name}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => openProjectModal("edit", project)}
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-900  "
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() =>
                                handleProjectDeleteRequest(project)
                              }
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-900  "
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {project.description && (
                          <p className="text-sm text-slate-500  mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="mx-auto h-12 w-12 text-slate-400 " />
                <p className="mt-2 text-sm text-slate-500 ">No projects yet</p>
                <p className="text-xs text-slate-400 ">
                  Click "Add Project" to create the first project for this
                  customer
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white  shadow-lg rounded-lg p-6 border border-slate-200 ">
            <h2 className="text-lg font-medium text-slate-900  mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Customer Timeline
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 ">
                    Customer Created
                  </p>
                  <p className="text-sm text-slate-500 ">
                    {formatDateTime(customer.createdAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 ">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-500 ">
                    {formatDateTime(customer.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}

      {/* Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={closeProjectModal}
        onSave={handleProjectSave}
        project={selectedProject}
        customerId={customerId}
        isLoading={actionLoading === "project"}
      />

      {/* Project Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showProjectDeleteModal}
        onClose={() => setShowProjectDeleteModal(false)}
        onConfirm={confirmProjectDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"?`}
        confirmText="Delete Project"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading === "deleteProject"}
        itemName={projectToDelete?.name}
        details={[
          "This action cannot be undone",
          "Project data will be permanently removed",
          "Any time entries for this project will be affected",
        ]}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customer.name}?`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        isLoading={actionLoading === "delete"}
        itemName={customer.name}
        details={[
          "This action cannot be undone",
          "Customer data will be permanently removed",
          customer.workProjects?.length > 0
            ? "This customer has active projects that must be reassigned first"
            : "No active projects will be affected",
        ]}
      />
    </>
  );
};
