// src/components/Timesheets/NewTimeEntryModal.jsx - Cascading workflow implementation
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { CustomSelect } from "../common/CustomSelect";
import { showToast } from "../../utils/toast";
import {
  organizationService,
  customerService,
  processService,
  timesheetService,
} from "../../services";
import {
  Building,
  Users,
  Settings,
  Activity,
  Calendar,
  Clock,
  MapPin,
  X,
  Save,
  Trash2,
  Plus,
  Edit3,
} from "lucide-react";

export const NewTimeEntryModal = ({
  isOpen,
  onClose,
  onSave,
  timeEntry = null,
  mode = "create",
  customers = [], // Accept customers as prop for name lookup
}) => {
  // Helper to get customer name by id (for modal display)
  const getCustomerName = (customerId) => {
    const customer = (
      data.customers && data.customers.length > 0 ? data.customers : customers
    ).find((c) => (c.id || c._id) === customerId);
    return customer ? customer.name : "Unknown Customer";
  };
  const [formData, setFormData] = useState({
    organizationId: "",
    customerId: "",
    processId: "",
    activityId: "",
    workPlaceType: "organization",
 
    description: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
  });

  const [data, setData] = useState({
    organizations: [],
    customers: [],
    processes: [],
    activities: [],
  });

  const [loading, setLoading] = useState({
    organizations: false,
    customers: false,
    processes: false,
    activities: false,
    saving: false,
  });

  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // Load initial data when modal opens
  useEffect(() => {
    let isMounted = true;
    async function prepareForm() {
      setFormReady(false);
      resetForm();
      await Promise.all([loadOrganizations(), loadProcesses()]);
      if (mode === "edit" && timeEntry) {
        await populateFormForEdit();
      }
      // Wait at least 0.5s after data is ready
      setTimeout(() => {
        if (isMounted) setFormReady(true);
      }, 100);
    }
    if (isOpen) {
      prepareForm();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, mode, timeEntry]);

  // Load customers when organization changes
  useEffect(() => {
    if (formData.organizationId) {
      loadCustomers(formData.organizationId);
    } else {
      setData((prev) => ({ ...prev, customers: [] }));
      setFormData((prev) => ({ ...prev, customerId: "", activityId: "" }));
    }
  }, [formData.organizationId]);

  // Load activities when process changes
  useEffect(() => {
    if (formData.processId) {
      loadActivitiesForProcess(formData.processId);
    } else {
      setData((prev) => ({ ...prev, activities: [] }));
      setFormData((prev) => ({ ...prev, activityId: "" }));
    }
  }, [formData.processId]);

  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    // Round to nearest 5 minutes
    now.setMinutes(Math.round(now.getMinutes() / 5) * 5, 0, 0);
    const startTime = now.toTimeString().slice(0, 5);
    const end = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour later
    const endTime = end.toTimeString().slice(0, 5);
    setFormData({
      organizationId: "",
      customerId: "",
      processId: "",
      activityId: "",
      workPlaceType: "organization",
   
      description: "",
      date: today,
      startTime,
      endTime,
    });
    setData({
      organizations: [],
      customers: [],
      processes: [],
      activities: [],
    });
    setErrors({});
  };

  const populateFormForEdit = async () => {
    if (timeEntry) {
      const startDate = timeEntry.startTime
        ? new Date(timeEntry.startTime)
        : new Date();
      const endDate = timeEntry.endTime ? new Date(timeEntry.endTime) : null;

      setFormData({
        organizationId: timeEntry.organizationId || "",
        customerId: timeEntry.customerId || "",
        processId: timeEntry.processId || "",
        activityId: timeEntry.activityId || "",
        workPlaceType: timeEntry.workPlaceType || "organization",
    
        description: timeEntry.description || "",
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate ? endDate.toTimeString().slice(0, 5) : "",
      });
    }
  };

  const loadOrganizations = async () => {
    setLoading((prev) => ({ ...prev, organizations: true }));
    try {
      const result = await organizationService.getUserOrganizations();
      if (result.success) {
        const organizations =
          result.data?.data?.organizations ||
          result.data?.organizations ||
          result.data ||
          [];
        setData((prev) => ({ ...prev, organizations }));
      } else {
        showToast.error("Failed to load organizations");
      }
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoading((prev) => ({ ...prev, organizations: false }));
    }
  };

  const loadCustomers = async (organizationId) => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const result = await customerService.getCustomers({ organizationId });
      if (result.success) {
        const customers = result.data?.customers || result.data || [];
        setData((prev) => ({ ...prev, customers }));
      } else {
        showToast.error("Failed to load customers");
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      showToast.error("Failed to load customers");
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  const loadProcesses = async () => {
    setLoading((prev) => ({ ...prev, processes: true }));
    try {
      const result = await processService.getProcesses();
      if (result.success) {
        const processes = result.data?.processes || result.data || [];
        setData((prev) => ({ ...prev, processes }));
      } else {
        showToast.error("Failed to load processes");
      }
    } catch (error) {
      console.error("Error loading processes:", error);
      showToast.error("Failed to load processes");
    } finally {
      setLoading((prev) => ({ ...prev, processes: false }));
    }
  };

  const loadActivitiesForProcess = async (processId) => {
    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      const selectedProcess = data.processes.find((p) => p.id === processId);
      if (selectedProcess && selectedProcess.activities) {
        setData((prev) => ({
          ...prev,
          activities: selectedProcess.activities,
        }));
      } else {
        const result = await processService.getById(processId);
        if (result.success && result.data?.activities) {
          setData((prev) => ({ ...prev, activities: result.data.activities }));
        } else {
          setData((prev) => ({ ...prev, activities: [] }));
        }
      }
    } catch (error) {
      console.error("Error loading activities:", error);
      showToast.error("Failed to load activities");
      setData((prev) => ({ ...prev, activities: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    if (field === "organizationId") {
      setFormData((prev) => ({ ...prev, customerId: "", activityId: "" }));
    } else if (field === "processId") {
      setFormData((prev) => ({ ...prev, activityId: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationId)
      newErrors.organizationId = "Organization is required";
    if (!formData.customerId) newErrors.customerId = "Customer is required";
    if (!formData.processId) newErrors.processId = "Process is required";
    if (!formData.activityId) newErrors.activityId = "Activity is required";
 

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      selectedDate.setHours(0, 0, 0, 0); // Normalize time to midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time to midnight

      if (selectedDate > today) {
        newErrors.date = "Cannot add entries for future dates";
      }
    }

    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";

    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date} ${formData.startTime}`);
      const end = new Date(`${formData.date} ${formData.endTime}`);

      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Please fix the errors before submitting");
      return;
    }

    setLoading((prev) => ({ ...prev, saving: true }));

    try {
      const timeEntryData = {
        organizationId: formData.organizationId,
        customerId: formData.customerId,
        processId: formData.processId,
        activityId: formData.activityId,
        workPlaceType: formData.workPlaceType,
      
        description: formData.description.trim(),
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      let result;
      if (mode === "create") {
        result = await timesheetService.createTimeEntry(timeEntryData);
        showToast.success("Time entry created successfully");
      } else {
        result = await timesheetService.updateTimeEntry(
          timeEntry.id,
          timeEntryData
        );
        showToast.success("Time entry updated successfully");
      }

      if (result.success) {
        onSave && onSave(result.data);
        onClose();
      }
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast.error(`Failed to ${mode} time entry. Please try again.`);
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const getMaxDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="form" showHeader={false}>
        {!formReady ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading entry data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="">
            {/* Form Fields */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Organization Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Building className="h-4 w-4 inline mr-2" />
                    Organization *
                  </label>
                  <CustomSelect
                    value={formData.organizationId}
                    onChange={(value) =>
                      handleInputChange("organizationId", value)
                    }
                    options={data.organizations.map((org) => ({
                      value: org.id,
                      label: org.name,
                    }))}
                    placeholder="Select an organization..."
                    searchable={true}
                    clearable={true}
                    disabled={loading.organizations}
                    loading={loading.organizations}
                    error={errors.organizationId}
                    icon={Building}
                    emptyMessage="No organizations available"
                  />
                </div>

                {/* Customer Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Users className="h-4 w-4 inline mr-2" />
                    Customer *
                  </label>
                  <CustomSelect
                    value={formData.customerId}
                    onChange={(value) => handleInputChange("customerId", value)}
                    options={data.customers.map((customer) => ({
                      value: customer.id,
                      label: customer.name,
                    }))}
                    placeholder={
                      !formData.organizationId
                        ? "Select an organization first..."
                        : loading.customers
                        ? "Loading customers..."
                        : "Select a customer..."
                    }
                    searchable={true}
                    clearable={true}
                    disabled={!formData.organizationId || loading.customers}
                    loading={loading.customers}
                    error={errors.customerId}
                    icon={Users}
                    emptyMessage="No customers available"
                  />
                </div>

                {/* Work Location Type */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="h-4 w-4 inline mr-2" />
                    Work Location
                  </label>
                  <CustomSelect
                    value={formData.workPlaceType}
                    onChange={(value) =>
                      handleInputChange("workPlaceType", value)
                    }
                    options={[
                      {
                        value: "organization",
                        label: "Organization Location",
                      },
                      { value: "customer", label: "Customer Location" },
                      { value: "home", label: "Work from Home" },
                    ]}
                    placeholder="Select work location..."
                    icon={MapPin}
                  />
                </div>

                {/* Process Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Settings className="h-4 w-4 inline mr-2" />
                    Process *
                  </label>
                  <CustomSelect
                    value={formData.processId}
                    onChange={(value) => handleInputChange("processId", value)}
                    options={data.processes.map((process) => ({
                      value: process.id,
                      label: process.name,
                    }))}
                    placeholder="Select a process..."
                    searchable={true}
                    clearable={true}
                    disabled={loading.processes}
                    loading={loading.processes}
                    error={errors.processId}
                    icon={Settings}
                    emptyMessage="No processes available"
                  />
                </div>

                {/* Activity Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Activity className="h-4 w-4 inline mr-2" />
                    Activity *
                  </label>
                  <CustomSelect
                    value={formData.activityId}
                    onChange={(value) => handleInputChange("activityId", value)}
                    options={data.activities.map((activity) => ({
                      value: activity.id,
                      label: activity.name,
                    }))}
                    placeholder={
                      !formData.processId
                        ? "Select a process first..."
                        : loading.activities
                        ? "Loading activities..."
                        : "Select an activity..."
                    }
                    searchable={true}
                    clearable={true}
                    disabled={!formData.processId || loading.activities}
                    loading={loading.activities}
                    error={errors.activityId}
                    icon={Activity}
                    emptyMessage="No activities available"
                  />
                </div>

              

                {/* Date Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    max={getMaxDate()}
                    error={errors.date}
                    disabled={mode === "edit"}
                  />
                  {mode === "edit" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Date cannot be changed when editing
                    </p>
                  )}
                </div>

                {/* Start Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Start Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    error={errors.startTime}
                  />
                </div>

                {/* End Time */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Clock className="h-4 w-4 inline mr-2" />
                    End Time *
                  </label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    error={errors.endTime}
                  />
                </div>
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Task Description
              </h3>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Optional task description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
                title="Cancel"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Cancel</span>
              </Button>

              <div className="flex space-x-2">
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Delete</span>
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading.saving}
                  className="flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-2"
                  title={mode === "create" ? "Create Entry" : "Update Entry"}
                >
                  {loading.saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="hidden sm:inline ml-2">Saving...</span>
                    </>
                  ) : mode === "create" ? (
                    <>
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Create</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Update</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        size="sm"
        showHeader={false}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Delete Time Entry
          </h3>
          <p className="mb-4">
            Are you sure you want to delete this time entry? This action cannot
            be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={async () => {
                setIsDeleting(true);
                try {
                  const result = await timesheetService.deleteTimeEntry(
                    timeEntry.id || timeEntry._id
                  );
                  if (result.success) {
                    showToast.success("Time entry deleted successfully");
                    setShowDeleteModal(false);
                    onClose();
                    onSave && onSave({ ...timeEntry, _deleted: true });
                  } else {
                    showToast.error("Failed to delete time entry");
                  }
                } catch (error) {
                  showToast.error("Failed to delete time entry");
                } finally {
                  setIsDeleting(false);
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Entry"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
