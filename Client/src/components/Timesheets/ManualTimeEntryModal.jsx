// src/components/Timesheets/ManualTimeEntryModal.jsx - New workflow for manual entries
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import {
  organizationService,
  customerService,
  processService,
} from "../../services";
import {
  Building,
  Users,
  Settings,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";

export const ManualTimeEntryModal = ({
  isOpen,
  onClose,
  onSave,
  timeEntry = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    organizationId: "",
    customerId: "",
    processId: "",
    activityId: "",
    workPlaceType: "organization",
    workPlaceAddress: "",
    taskName: "",
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
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isReadOnly = mode === "view";
  const isCreating = mode === "create";
  const isEditing = mode === "edit";

  const title =
    {
      create: "Create Manual Time Entry",
      edit: "Edit Time Entry",
      view: "View Time Entry",
    }[mode] || "Time Entry";

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      initializeForm();
      loadOrganizations();
      loadProcesses(); // Load all processes regardless of organization
    }
  }, [isOpen, timeEntry, mode]);

  // Load activities when a process is selected
  useEffect(() => {
    if (formData.processId) {
      loadActivities(formData.processId);
    }
  }, [formData.processId]);

  const initializeForm = () => {
    if (timeEntry && isEditing) {
      // Extract date and time from existing entry
      const startDate = new Date(timeEntry.startTime);
      const endDate = new Date(timeEntry.endTime);

      setFormData({
        organizationId: timeEntry.organizationId || "",
        customerId: timeEntry.customerId || "",
        processId: timeEntry.processId || "",
        activityId: timeEntry.activityId || "",
        workPlaceType: timeEntry.workPlaceType || "organization",
        workPlaceAddress: timeEntry.workPlaceAddress || "",
        taskName: timeEntry.taskName || "",
        description: timeEntry.description || "",
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
      });
    } else {
      // Reset for new entry
      setFormData({
        organizationId: "",
        customerId: "",
        processId: "",
        activityId: "",
        workPlaceType: "organization",
        workPlaceAddress: "",
        taskName: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        startTime: "",
        endTime: "",
      });
    }
    setErrors({});
  };

  // Load data functions
  const loadOrganizations = async () => {
    setLoading((prev) => ({ ...prev, organizations: true }));
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

      const responseData = await response.json();
      console.log("Organizations API direct response:", responseData);

      // Handle different response formats
      let organizations = [];
      if (Array.isArray(responseData)) {
        organizations = responseData;
      } else if (
        responseData.success &&
        responseData.data &&
        responseData.data.organizations
      ) {
        organizations = responseData.data.organizations;
      } else if (responseData.organizations) {
        organizations = responseData.organizations;
      }

      console.log(
        `Found ${organizations.length} organizations:`,
        organizations
      );
      setData((prev) => ({ ...prev, organizations }));
    } catch (error) {
      showToast.error("Failed to load organizations");
      console.error("Error loading organizations:", error);
    } finally {
      setLoading((prev) => ({ ...prev, organizations: false }));
    }
  };

  const loadCustomers = async (organizationId) => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      console.log(`Loading customers for organization: ${organizationId}`);

      // Direct call to the backend API
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/customers?organizationId=${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Customers API direct response:", responseData);

      // Extract customers from the correct response structure
      let customers = [];
      if (
        responseData.success &&
        responseData.data &&
        responseData.data.customers
      ) {
        customers = responseData.data.customers;
      } else if (Array.isArray(responseData)) {
        customers = responseData;
      } else if (responseData.customers) {
        customers = responseData.customers;
      }

      console.log(
        `Found ${customers.length} customers for organization ${organizationId}:`,
        customers
      );
      setData((prev) => ({ ...prev, customers }));
    } catch (error) {
      showToast.error("Failed to load customers");
      console.error("Error loading customers:", error);
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  const loadProcesses = async () => {
    setLoading((prev) => ({ ...prev, processes: true }));
    try {
      // Direct call to the backend API
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/processes`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Processes API direct response:", responseData);

      const processes = Array.isArray(responseData)
        ? responseData
        : responseData.data?.processes || responseData.processes || [];

      setData((prev) => ({ ...prev, processes }));
    } catch (error) {
      showToast.error("Failed to load processes");
      console.error("Error loading processes:", error);
    } finally {
      setLoading((prev) => ({ ...prev, processes: false }));
    }
  };

  const loadActivities = async (processId) => {
    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      // Direct call to the backend API
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5000/api"
        }/processes/${processId}/activities`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Activities API direct response:", responseData);

      const activities = Array.isArray(responseData)
        ? responseData
        : responseData.data?.activities || responseData.activities || [];

      setData((prev) => ({ ...prev, activities }));
    } catch (error) {
      showToast.error("Failed to load activities");
      console.error("Error loading activities:", error);
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  // Using the loadProcesses function defined above

  // Handle form changes
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Handle cascading selections
    if (field === "organizationId") {
      console.log(`Organization selected: ${value}`);
      setFormData((prev) => ({
        ...prev,
        customerId: "",
      }));
      setData((prev) => ({
        ...prev,
        customers: [],
      }));
      if (value) {
        console.log(`Loading customers for organization: ${value}`);
        loadCustomers(value);
      }
    } else if (field === "processId") {
      setFormData((prev) => ({
        ...prev,
        activityId: "",
      }));
      setData((prev) => ({
        ...prev,
        activities: [],
      }));
      if (value) {
        loadActivities(value);
        // Set default workplace address to organization's work location
        const selectedOrg = data.organizations.find((org) => org.id === value);
        if (selectedOrg) {
          setFormData((prev) => ({
            ...prev,
            workPlaceAddress: selectedOrg.workLocation || "",
          }));
        }
      }
    }

    if (field === "processId") {
      setFormData((prev) => ({ ...prev, activityId: "" }));
      setData((prev) => ({ ...prev, activities: [] }));
      if (value) {
        loadActivities(value);
      }
    }

    if (field === "customerId") {
      // Set workplace address to customer's work location if available
      const selectedCustomer = data.customers.find(
        (customer) => customer.id === value
      );
      if (selectedCustomer && formData.workPlaceType === "customer") {
        setFormData((prev) => ({
          ...prev,
          workPlaceAddress: selectedCustomer.workLocation || "",
        }));
      }
    }

    if (field === "workPlaceType") {
      // Update workplace address based on type
      if (value === "organization") {
        const selectedOrg = data.organizations.find(
          (org) => org.id === formData.organizationId
        );
        if (selectedOrg) {
          setFormData((prev) => ({
            ...prev,
            workPlaceAddress: selectedOrg.workLocation || "",
          }));
        }
      } else if (value === "customer") {
        const selectedCustomer = data.customers.find(
          (customer) => customer.id === formData.customerId
        );
        if (selectedCustomer) {
          setFormData((prev) => ({
            ...prev,
            workPlaceAddress: selectedCustomer.workLocation || "",
          }));
        }
      } else if (value === "home") {
        // You might want to get this from user profile
        setFormData((prev) => ({ ...prev, workPlaceAddress: "Home" }));
      }
    }
  };

  // Handle organization selection
  const handleOrganizationChange = (organizationId) => {
    setFormData((prev) => ({
      ...prev,
      organizationId,
      customerId: "",
    }));

    // Reset customers when organization changes
    setData((prev) => ({
      ...prev,
      customers: [],
    }));

    if (organizationId) {
      loadCustomers(organizationId);
    }
  };

  // Handle process selection
  const handleProcessChange = (processId) => {
    setFormData((prev) => ({
      ...prev,
      processId,
      activityId: "",
    }));

    // Reset activities when process changes
    setData((prev) => ({
      ...prev,
      activities: [],
    }));

    if (processId) {
      loadActivities(processId);
    }
  };

  // Load processes when component mounts or when in edit mode
  useEffect(() => {
    if (isOpen) {
      loadProcesses();
    }
  }, [isOpen]);

  // Load dependent data for edit mode
  useEffect(() => {
    if (timeEntry && isEditing && formData.organizationId) {
      loadCustomers(formData.organizationId);
    }
  }, [timeEntry, isEditing, formData.organizationId]);

  useEffect(() => {
    if (timeEntry && isEditing && formData.processId) {
      loadActivities(formData.processId);
    }
  }, [timeEntry, isEditing, formData.processId]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.organizationId) {
      newErrors.organizationId = "Organization is required";
    }
    if (!formData.customerId) {
      newErrors.customerId = "Customer is required";
    }
    if (!formData.processId) {
      newErrors.processId = "Process is required";
    }
    if (!formData.activityId) {
      newErrors.activityId = "Activity is required";
    }
    if (!formData.taskName.trim()) {
      newErrors.taskName = "Task name is required";
    }
    if (!formData.date) {
      newErrors.date = "Date is required";
    }
    if (!formData.startTime) {
      newErrors.startTime = "Start time is required";
    }
    if (!formData.endTime) {
      newErrors.endTime = "End time is required";
    }

    // Validate time logic
    if (formData.startTime && formData.endTime) {
      const start = new Date(`${formData.date}T${formData.startTime}`);
      const end = new Date(`${formData.date}T${formData.endTime}`);
      if (end <= start) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    if (!formData.workPlaceAddress.trim()) {
      newErrors.workPlaceAddress = "Workplace address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReadOnly || isSubmitting) return;

    if (!validateForm()) {
      showToast.error("Please fix the errors below");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
      showToast.success(
        isCreating
          ? "Time entry created successfully"
          : "Time entry updated successfully"
      );
    } catch (error) {
      console.error("Error saving time entry:", error);
      showToast.error("Failed to save time entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        !isReadOnly && (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isCreating ? "Creating..." : "Saving..."}
                </div>
              ) : isCreating ? (
                "Create Entry"
              ) : (
                "Save Changes"
              )}
            </Button>
          </>
        )
      }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-h-96 overflow-y-auto"
      >
        {/* Organization Selection */}
        <div className="form-group">
          <label
            htmlFor="organization"
            className="flex items-center space-x-2 mb-2"
          >
            <Building className="h-4 w-4" />
            <span className="block text-sm font-medium text-gray-700">
              Organization *
            </span>
          </label>
          <select
            id="organization"
            value={formData.organizationId}
            onChange={(e) => handleChange("organizationId", e.target.value)}
            disabled={loading.organizations || isReadOnly}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.organizationId ? "border-red-500" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100" : ""}`}
          >
            <option value="">Select organization...</option>
            {console.log("Current organizations in state:", data.organizations)}
            {data.organizations && data.organizations.length > 0 ? (
              data.organizations.map((org) => (
                <option key={org.id || org._id} value={org.id || org._id}>
                  {org.name || "Unnamed organization"}
                </option>
              ))
            ) : loading.organizations ? (
              <option value="" disabled>
                Loading organizations...
              </option>
            ) : (
              <option value="" disabled>
                No organizations available
              </option>
            )}
          </select>
          {errors.organizationId && (
            <p className="text-red-500 text-sm mt-1">{errors.organizationId}</p>
          )}
        </div>

        {/* Customer Selection */}
        <div className="form-group">
          <label
            htmlFor="customer"
            className="flex items-center space-x-2 mb-2"
          >
            <Users className="h-4 w-4" />
            <span className="block text-sm font-medium text-gray-700">
              Customer *
            </span>
          </label>
          <select
            id="customer"
            value={formData.customerId}
            onChange={(e) => handleChange("customerId", e.target.value)}
            disabled={
              loading.customers || isReadOnly || !formData.organizationId
            }
            className={`w-full px-3 py-2 border rounded-md ${
              errors.customerId ? "border-red-500" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100" : ""}`}
          >
            <option value="">Select customer...</option>
            {data.customers?.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {errors.customerId && (
            <p className="text-red-500 text-sm mt-1">{errors.customerId}</p>
          )}
        </div>

        {/* Process Selection */}
        <div className="form-group">
          <label htmlFor="process" className="flex items-center space-x-2 mb-2">
            <Settings className="h-4 w-4" />
            <span className="block text-sm font-medium text-gray-700">
              Process *
            </span>
          </label>
          <select
            id="process"
            value={formData.processId}
            onChange={(e) => handleChange("processId", e.target.value)}
            disabled={loading.processes || isReadOnly}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.processId ? "border-red-500" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100" : ""}`}
          >
            <option value="">Select process...</option>
            {data.processes?.map((process) => (
              <option key={process.id} value={process.id}>
                {process.name}
              </option>
            ))}
          </select>
          {errors.processId && (
            <p className="text-red-500 text-sm mt-1">{errors.processId}</p>
          )}
        </div>

        {/* Activity Selection */}
        <div className="form-group">
          <label
            htmlFor="activity"
            className="flex items-center space-x-2 mb-2"
          >
            <Activity className="h-4 w-4" />
            <span className="block text-sm font-medium text-gray-700">
              Activity *
            </span>
          </label>
          <select
            id="activity"
            value={formData.activityId}
            onChange={(e) => handleChange("activityId", e.target.value)}
            disabled={loading.activities || isReadOnly || !formData.processId}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.activityId ? "border-red-500" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100" : ""}`}
          >
            <option value="">Select activity...</option>
            {data.activities?.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name} (Process: {activity.processName})
              </option>
            ))}
          </select>
          {errors.activityId && (
            <p className="text-red-500 text-sm mt-1">{errors.activityId}</p>
          )}
        </div>

        {/* Workplace Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workplace Type *
          </label>
          <div className="space-y-2">
            {[
              { value: "organization", label: "Organization Office" },
              { value: "customer", label: "Customer Site" },
              { value: "home", label: "Home/Remote" },
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={formData.workPlaceType === option.value}
                  onChange={(e) =>
                    handleChange("workPlaceType", e.target.value)
                  }
                  disabled={isReadOnly}
                  className="mr-2"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Workplace Address */}
        <div>
          <Input
            label="Workplace Address *"
            value={formData.workPlaceAddress}
            onChange={(e) => handleChange("workPlaceAddress", e.target.value)}
            disabled={isReadOnly}
            error={errors.workPlaceAddress}
            placeholder="Enter workplace address"
          />
        </div>

        {/* Task Name */}
        <div>
          <Input
            label="Task Name *"
            value={formData.taskName}
            onChange={(e) => handleChange("taskName", e.target.value)}
            disabled={isReadOnly}
            error={errors.taskName}
            placeholder="Enter task name"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            disabled={isReadOnly}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md ${
              isReadOnly ? "bg-gray-100" : ""
            }`}
            placeholder="Enter task description (optional)"
          />
        </div>

        {/* Date */}
        <div>
          <label className="flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4" />
            <span className="block text-sm font-medium text-gray-700">
              Date *
            </span>
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => handleChange("date", e.target.value)}
            disabled={isReadOnly}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.date ? "border-red-500" : "border-gray-300"
            } ${isReadOnly ? "bg-gray-100" : ""}`}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date}</p>
          )}
        </div>

        {/* Time Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="block text-sm font-medium text-gray-700">
                Start Time *
              </span>
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.startTime ? "border-red-500" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : ""}`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4" />
              <span className="block text-sm font-medium text-gray-700">
                End Time *
              </span>
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.endTime ? "border-red-500" : "border-gray-300"
              } ${isReadOnly ? "bg-gray-100" : ""}`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ManualTimeEntryModal;
