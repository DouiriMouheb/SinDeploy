// src/components/Timesheets/TimeSheetModal.jsx - Updated version with entry type enforcement
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Input } from "../common/Input";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import { Calendar, Clock, Briefcase, Activity } from "lucide-react";

export const TimeSheetModal = ({
  isOpen,
  onClose,
  timeEntry,
  onChange,
  onSave,
  mode,
  projects = [],
  activities = [],
}) => {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for entry type selection
  const [entryType, setEntryType] = useState(""); // "customer_based" or "process_based"
  const [customers, setCustomers] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);

  const isReadOnly = mode === "view";
  const isCreating = mode === "create";
  const isEditing = mode === "edit";

  const title =
    {
      create: "Add Manual Time Entry",
      edit: "Edit Time Entry",
      view: "View Time Entry",
    }[mode] || "Time Entry";

  // Reset errors and initialize data when modal opens
  useEffect(() => {
    setErrors({});
    setIsSubmitting(false);
    if (isOpen) {
      loadCustomersAndProcesses();
      initializeFormData();
    }
  }, [isOpen, mode]);

  // Initialize form data based on existing entry or defaults
  const initializeFormData = () => {
    if (timeEntry && timeEntry.entryType) {
      // Editing an existing entry
      setEntryType(timeEntry.entryType);

      if (timeEntry.entryType === "customer_based" && timeEntry.workProjectId) {
        const project = projects.find((p) => p.id === timeEntry.workProjectId);
        if (project && project.customer) {
          setSelectedCustomer(project.customer);
        }
      } else if (
        timeEntry.entryType === "process_based" &&
        timeEntry.activityId
      ) {
        const activity = activities.find((a) => a.id === timeEntry.activityId);
        if (activity && activity.process) {
          setSelectedProcess(activity.process);
        }
      }
    } else {
      // New entry - reset everything
      setEntryType("");
      setSelectedCustomer(null);
      setSelectedProcess(null);
    }
  };

  // Load customers and processes data
  const loadCustomersAndProcesses = async () => {
    try {
      // Extract unique customers from projects
      const uniqueCustomers = projects.reduce((acc, project) => {
        if (
          project.customer &&
          !acc.find((c) => c.id === project.customer.id)
        ) {
          acc.push(project.customer);
        }
        return acc;
      }, []);
      setCustomers(uniqueCustomers);

      // Load processes from the timer service
      const response = await timerService.getProjectsAndActivities();
      if (response.success) {
        setProcesses(response.data.processes || []);
      }
    } catch (error) {
      console.error("Error loading customers and processes:", error);
    }
  };

  // Update filtered projects when customer is selected
  useEffect(() => {
    if (entryType === "customer_based" && selectedCustomer) {
      const customerProjects = projects.filter(
        (project) =>
          project.customer && project.customer.id === selectedCustomer.id
      );
      setFilteredProjects(customerProjects);
    } else {
      setFilteredProjects([]);
    }
  }, [selectedCustomer, projects, entryType]);

  // Update filtered activities when process is selected
  useEffect(() => {
    if (entryType === "process_based" && selectedProcess) {
      setFilteredActivities(selectedProcess.activities || []);
    } else {
      setFilteredActivities([]);
    }
  }, [selectedProcess, entryType]);

  const validateForm = () => {
    const validationErrors = [];

    // Validate entry type
    if (!entryType) {
      validationErrors.push("Entry type is required");
    }

    // Validate based on entry type
    if (entryType === "customer_based") {
      if (!timeEntry.workProjectId) {
        validationErrors.push("Project is required for customer-based entries");
      }
      if (timeEntry.activityId) {
        validationErrors.push("Customer-based entries cannot have an activity");
      }
    } else if (entryType === "process_based") {
      if (!timeEntry.activityId) {
        validationErrors.push("Activity is required for process-based entries");
      }
      if (timeEntry.workProjectId) {
        validationErrors.push("Process-based entries cannot have a project");
      }
    }

    // Validate common fields
    if (!timeEntry.taskName?.trim()) {
      validationErrors.push("Task name is required");
    }

    if (!timeEntry.date) {
      validationErrors.push("Date is required");
    }

    if (!timeEntry.startTime) {
      validationErrors.push("Start time is required");
    }

    if (!timeEntry.endTime) {
      validationErrors.push("End time is required");
    }

    if (timeEntry.startTime && timeEntry.endTime) {
      const start = new Date(`${timeEntry.date}T${timeEntry.startTime}`);
      const end = new Date(`${timeEntry.date}T${timeEntry.endTime}`);
      if (end <= start) {
        validationErrors.push("End time must be after start time");
      }
    }

    if (validationErrors.length > 0) {
      const errorObject = {};
      validationErrors.forEach((error) => {
        if (error.includes("Entry type")) {
          errorObject.entryType = error;
        } else if (error.includes("Project")) {
          errorObject.workProjectId = error;
        } else if (error.includes("Activity")) {
          errorObject.activityId = error;
        } else if (error.includes("Task name")) {
          errorObject.taskName = error;
        } else if (error.includes("Date")) {
          errorObject.date = error;
        } else if (error.includes("Start time")) {
          errorObject.startTime = error;
        } else if (error.includes("End time")) {
          errorObject.endTime = error;
        } else {
          errorObject.general = error;
        }
      });

      setErrors(errorObject);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isReadOnly || isSubmitting) return;

    if (!validateForm()) {
      showToast.error("Please fix the errors below and try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for submission with proper entry type structure
      const submitData = {
        entryType: entryType,
        taskName: timeEntry.taskName.trim(),
        description: timeEntry.description?.trim() || "",
        date: timeEntry.date,
        startTime: timeEntry.startTime,
        endTime: timeEntry.endTime,
        isManual: true,
      };

      // Add the appropriate ID based on entry type
      if (entryType === "customer_based") {
        submitData.workProjectId = timeEntry.workProjectId;
      } else if (entryType === "process_based") {
        submitData.activityId = timeEntry.activityId;
      }

      await onSave(submitData);
    } catch (error) {
      console.error("Error submitting time entry:", error);
      showToast.error("Failed to save time entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    onChange({ ...timeEntry, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear general errors
    if (errors.general) {
      setErrors((prev) => ({ ...prev, general: "" }));
    }
  };

  const handleProjectChange = (projectId) => {
    // Update timeEntry with selected project
    onChange({
      ...timeEntry,
      workProjectId: projectId,
      activityId: "", // Clear activity when project changes
    });

    // Clear errors
    if (errors.workProjectId) {
      setErrors((prev) => ({ ...prev, workProjectId: "", activityId: "" }));
    }
  };

  const handleActivityChange = (activityId) => {
    // Update timeEntry with selected activity
    onChange({
      ...timeEntry,
      activityId: activityId,
      workProjectId: "", // Clear project when activity changes
    });

    // Clear errors
    if (errors.activityId) {
      setErrors((prev) => ({ ...prev, activityId: "", workProjectId: "" }));
    }
  };

  // Handle entry type change
  const handleEntryTypeChange = (type) => {
    setEntryType(type);
    setSelectedCustomer(null);
    setSelectedProcess(null);

    // Clear project and activity selections
    onChange({
      ...timeEntry,
      workProjectId: "",
      activityId: "",
    });

    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      entryType: "",
      workProjectId: "",
      activityId: "",
    }));
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    setSelectedCustomer(customer);

    // Clear project selection
    onChange({
      ...timeEntry,
      workProjectId: "",
    });
  };

  // Handle process selection
  const handleProcessChange = (processId) => {
    const process = processes.find((p) => p.id === processId);
    setSelectedProcess(process);

    // Clear activity selection
    onChange({
      ...timeEntry,
      activityId: "",
    });
  };

  // Get current date for default
  const today = new Date().toISOString().split("T")[0];

  // Parse existing time entry data for editing
  const getDisplayValues = () => {
    if (!timeEntry) return { date: today, startTime: "", endTime: "" };

    // If editing an existing entry, extract date and time components
    if (timeEntry.startTime && timeEntry.endTime && !timeEntry.date) {
      const startDate = new Date(timeEntry.startTime);
      const endDate = new Date(timeEntry.endTime);

      return {
        date: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5),
      };
    }

    // For new entries or entries with separate date/time
    return {
      date: timeEntry.date || today,
      startTime: timeEntry.startTime || "",
      endTime: timeEntry.endTime || "",
    };
  };

  const displayValues = getDisplayValues();

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
      <div className="space-y-6 max-h-96 overflow-y-auto">
        {/* General Error Display */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Task Information */}
        <div className="space-y-4">
          <Input
            label="Task Name"
            type="text"
            value={timeEntry?.taskName || ""}
            onChange={(e) => handleInputChange("taskName", e.target.value)}
            disabled={isReadOnly}
            required
            error={errors.taskName}
            placeholder="What did you work on?"
            icon={Briefcase}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={timeEntry?.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              disabled={isReadOnly}
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add more details about what you worked on..."
            />
          </div>
        </div>

        {/* Entry Type Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entry Type *
            </label>
            <div className="relative">
              <select
                value={entryType}
                onChange={(e) => handleEntryTypeChange(e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.entryType ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              >
                <option value="">Choose entry type...</option>
                <option value="customer_based">Customer Project</option>
                <option value="process_based">Process Activity</option>
              </select>
              <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.entryType && (
              <p className="mt-1 text-sm text-red-600">{errors.entryType}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {entryType === "customer_based"
                ? "Track time for customer projects and deliverables"
                : entryType === "process_based"
                ? "Track time for internal processes and activities"
                : "Select whether this is customer work or internal process work"}
            </p>
          </div>

          {/* Customer-based Selection Flow */}
          {entryType === "customer_based" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <div className="relative">
                  <select
                    value={selectedCustomer?.id || ""}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    disabled={isReadOnly}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.customerId ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
                  >
                    <option value="">Select a customer...</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                  <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.customerId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.customerId}
                  </p>
                )}
              </div>

              {selectedCustomer && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project *
                  </label>
                  <div className="relative">
                    <select
                      value={timeEntry?.workProjectId || ""}
                      onChange={(e) => handleProjectChange(e.target.value)}
                      disabled={isReadOnly}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.workProjectId
                          ? "border-red-300"
                          : "border-gray-300"
                      } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
                    >
                      <option value="">Select a project...</option>
                      {filteredProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.workProjectId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.workProjectId}
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Process-based Selection Flow */}
          {entryType === "process_based" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Process *
                </label>
                <div className="relative">
                  <select
                    value={selectedProcess?.id || ""}
                    onChange={(e) => handleProcessChange(e.target.value)}
                    disabled={isReadOnly}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.processId ? "border-red-300" : "border-gray-300"
                    } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
                  >
                    <option value="">Select a process...</option>
                    {processes.map((process) => (
                      <option key={process.id} value={process.id}>
                        {process.name}
                      </option>
                    ))}
                  </select>
                  <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.processId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.processId}
                  </p>
                )}
              </div>

              {selectedProcess && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity *
                  </label>
                  <div className="relative">
                    <select
                      value={timeEntry?.activityId || ""}
                      onChange={(e) => handleActivityChange(e.target.value)}
                      disabled={isReadOnly}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                        errors.activityId ? "border-red-300" : "border-gray-300"
                      } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
                    >
                      <option value="">Select an activity...</option>
                      {filteredActivities.map((activity) => (
                        <option key={activity.id} value={activity.id}>
                          {activity.name}
                        </option>
                      ))}
                    </select>
                    <Activity className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.activityId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.activityId}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={displayValues.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                disabled={isReadOnly}
                max={today}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.date ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <div className="relative">
              <input
                type="time"
                value={displayValues.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startTime ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <div className="relative">
              <input
                type="time"
                value={displayValues.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                disabled={isReadOnly}
                className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endTime ? "border-red-300" : "border-gray-300"
                } ${isReadOnly ? "bg-gray-100" : "bg-white"}`}
              />
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
          </div>
        </div>

        {/* Read-only info for existing entries */}
        {!isCreating && timeEntry && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Entry Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <p className="font-medium">
                  {timeEntry.createdAt
                    ? new Date(timeEntry.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
              {timeEntry.isManual && (
                <div className="col-span-2">
                  <span className="text-gray-500">Type:</span>
                  <p className="font-medium text-purple-600">Manual Entry</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
