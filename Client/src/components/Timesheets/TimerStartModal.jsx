// src/components/Timesheets/TimerStartModal.jsx - New 5-step workflow
import React, { useState, useEffect } from "react";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { showToast } from "../../utils/toast";
import {
  Building,
  Users,
  Settings,
  Activity,
  MapPin,
  Play,
} from "lucide-react";
import {
  organizationService,
  customerService,
  processService,
} from "../../services";

const STEPS = {
  ORGANIZATION: 1,
  CUSTOMER: 2,
  PROCESS: 3,
  ACTIVITY: 4,
  WORKPLACE: 5,
};

export const TimerStartModal = ({ isOpen, onClose, onStart }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.ORGANIZATION);
  const [timerData, setTimerData] = useState({
    organizationId: "",
    customerId: "",
    processId: "",
    activityId: "",
    workPlaceType: "",
    workPlaceAddress: "",
    taskName: "",
    description: "",
  });

  const [data, setData] = useState({
    organizations: [],
    customers: [],
    processes: [],
    activities: [],
    workplaces: [],
  });

  const [loading, setLoading] = useState({
    organizations: false,
    customers: false,
    processes: false,
    activities: false,
    workplaces: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(STEPS.ORGANIZATION);
      setTimerData({
        organizationId: "",
        customerId: "",
        processId: "",
        activityId: "",
        workPlaceType: "",
        workPlaceAddress: "",
        taskName: "",
        description: "",
      });
      setData({
        organizations: [],
        customers: [],
        processes: [],
        activities: [],
        workplaces: [],
      });
      setErrors({});
      loadOrganizations();
    }
  }, [isOpen]);

  // Load organizations
  const loadOrganizations = async () => {
    setLoading((prev) => ({ ...prev, organizations: true }));
    try {
      const result = await organizationService.getAll();
      const organizations = result.success
        ? result.data?.data?.organizations || result.data?.organizations || []
        : [];
      setData((prev) => ({ ...prev, organizations }));
    } catch (error) {
      showToast.error("Failed to load organizations");
      console.error("Error loading organizations:", error);
    } finally {
      setLoading((prev) => ({ ...prev, organizations: false }));
    }
  };

  // Load customers for selected organization
  const loadCustomers = async (organizationId) => {
    setLoading((prev) => ({ ...prev, customers: true }));
    try {
      const customers = await customerService.getCustomersByOrganization(
        organizationId
      );
      setData((prev) => ({ ...prev, customers }));
    } catch (error) {
      showToast.error("Failed to load customers");
      console.error("Error loading customers:", error);
    } finally {
      setLoading((prev) => ({ ...prev, customers: false }));
    }
  };

  // Load processes
  const loadProcesses = async () => {
    setLoading((prev) => ({ ...prev, processes: true }));
    try {
      const processes = await processService.getAll();
      setData((prev) => ({ ...prev, processes }));
    } catch (error) {
      showToast.error("Failed to load processes");
      console.error("Error loading processes:", error);
    } finally {
      setLoading((prev) => ({ ...prev, processes: false }));
    }
  };

  // Load activities for selected process
  const loadActivities = async (processId) => {
    setLoading((prev) => ({ ...prev, activities: true }));
    try {
      const activities = await processService.getActivities(processId);
      setData((prev) => ({ ...prev, activities }));
    } catch (error) {
      showToast.error("Failed to load activities");
      console.error("Error loading activities:", error);
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }));
    }
  };

  // Load workplaces for selected organization and customer
  const loadWorkplaces = async (organizationId, customerId) => {
    setLoading((prev) => ({ ...prev, workplaces: true }));
    try {
      // TODO: Replace with new API
      // const workplaces = await workplaceService.getWorkplaces(organizationId, customerId);
      const workplaces = []; // Placeholder for now
      setData((prev) => ({ ...prev, workplaces }));
    } catch (error) {
      showToast.error("Failed to load workplaces");
      console.error("Error loading workplaces:", error);
    } finally {
      setLoading((prev) => ({ ...prev, workplaces: false }));
    }
  };

  // Handle selection changes
  const handleSelection = (field, value) => {
    setTimerData((prev) => ({ ...prev, [field]: value }));

    // Clear dependent fields when parent changes
    if (field === "organizationId") {
      setTimerData((prev) => ({
        ...prev,
        customerId: "",
        processId: "",
        activityId: "",
        workPlaceType: "",
        workPlaceAddress: "",
      }));
      setData((prev) => ({
        ...prev,
        customers: [],
        activities: [],
        workplaces: [],
      }));
      if (value) {
        loadCustomers(value);
      }
    }

    if (field === "processId") {
      setTimerData((prev) => ({
        ...prev,
        activityId: "",
      }));
      setData((prev) => ({
        ...prev,
        activities: [],
      }));
      if (value) {
        loadActivities(value);
      }
    }
  };

  // Handle next step
  const handleNext = () => {
    const errors = validateCurrentStep();
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      if (currentStep === STEPS.CUSTOMER) {
        loadProcesses();
      }
      if (currentStep === STEPS.ACTIVITY) {
        loadWorkplaces(timerData.organizationId, timerData.customerId);
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.WORKPLACE));
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, STEPS.ORGANIZATION));
    setErrors({});
  };

  // Validate current step
  const validateCurrentStep = () => {
    const errors = {};

    switch (currentStep) {
      case STEPS.ORGANIZATION:
        if (!timerData.organizationId) {
          errors.organizationId = "Please select an organization";
        }
        break;
      case STEPS.CUSTOMER:
        if (!timerData.customerId) {
          errors.customerId = "Please select a customer";
        }
        break;
      case STEPS.PROCESS:
        if (!timerData.processId) {
          errors.processId = "Please select a process";
        }
        break;
      case STEPS.ACTIVITY:
        if (!timerData.activityId) {
          errors.activityId = "Please select an activity";
        }
        break;
      case STEPS.WORKPLACE:
        if (!timerData.workPlaceType || !timerData.workPlaceAddress) {
          errors.workplace = "Please select a workplace";
        }
        if (!timerData.taskName.trim()) {
          errors.taskName = "Task name is required";
        }
        break;
    }

    return errors;
  };

  // Handle workplace selection
  const handleWorkplaceSelection = (workplace) => {
    setTimerData((prev) => ({
      ...prev,
      workPlaceType: workplace.type,
      workPlaceAddress: workplace.address,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    const errors = validateCurrentStep();
    setErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsSubmitting(true);
      try {
        await onStart(timerData);
        onClose();
      } catch (error) {
        showToast.error("Failed to start timer");
        console.error("Error starting timer:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.ORGANIZATION:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Select Organization</h3>
            </div>

            {loading.organizations ? (
              <div className="text-center py-8">Loading organizations...</div>
            ) : (
              <div className="space-y-2">
                {data.organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelection("organizationId", org.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      timerData.organizationId === org.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-gray-500">
                      {org.workLocation}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.organizationId && (
              <p className="text-red-500 text-sm">{errors.organizationId}</p>
            )}
          </div>
        );

      case STEPS.CUSTOMER:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Select Customer</h3>
            </div>

            {loading.customers ? (
              <div className="text-center py-8">Loading customers...</div>
            ) : data.customers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No customers found for this organization
              </div>
            ) : (
              <div className="space-y-2">
                {data.customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => handleSelection("customerId", customer.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      timerData.customerId === customer.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-500">
                      {customer.workLocation}
                    </div>
                    {customer.description && (
                      <div className="text-sm text-gray-400 mt-1">
                        {customer.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {errors.customerId && (
              <p className="text-red-500 text-sm">{errors.customerId}</p>
            )}
          </div>
        );

      case STEPS.PROCESS:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Settings className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Select Process</h3>
            </div>

            {loading.processes ? (
              <div className="text-center py-8">Loading processes...</div>
            ) : (
              <div className="space-y-2">
                {data.processes.map((process) => (
                  <button
                    key={process.id}
                    onClick={() => handleSelection("processId", process.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      timerData.processId === process.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{process.name}</div>
                    {process.description && (
                      <div className="text-sm text-gray-500">
                        {process.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {errors.processId && (
              <p className="text-red-500 text-sm">{errors.processId}</p>
            )}
          </div>
        );

      case STEPS.ACTIVITY:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Select Activity</h3>
            </div>

            {loading.activities ? (
              <div className="text-center py-8">Loading activities...</div>
            ) : data.activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No activities found for this process
              </div>
            ) : (
              <div className="space-y-2">
                {data.activities.map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => handleSelection("activityId", activity.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      timerData.activityId === activity.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{activity.name}</div>
                    {activity.description && (
                      <div className="text-sm text-gray-500">
                        {activity.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {errors.activityId && (
              <p className="text-red-500 text-sm">{errors.activityId}</p>
            )}
          </div>
        );

      case STEPS.WORKPLACE:
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">
                Select Workplace & Add Details
              </h3>
            </div>

            {loading.workplaces ? (
              <div className="text-center py-8">Loading workplaces...</div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  {data.workplaces.map((workplace) => (
                    <button
                      key={`${workplace.type}-${workplace.address}`}
                      onClick={() => handleWorkplaceSelection(workplace)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        timerData.workPlaceAddress === workplace.address
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-medium">{workplace.label}</div>
                      <div className="text-sm text-gray-500">
                        {workplace.address}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Task Name *
                    </label>
                    <input
                      type="text"
                      value={timerData.taskName}
                      onChange={(e) =>
                        setTimerData((prev) => ({
                          ...prev,
                          taskName: e.target.value,
                        }))
                      }
                      placeholder="Describe what you'll be working on"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.taskName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.taskName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={timerData.description}
                      onChange={(e) =>
                        setTimerData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Additional details about the task"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {errors.workplace && (
              <p className="text-red-500 text-sm">{errors.workplace}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Progress indicator
  const renderProgress = () => {
    const steps = [
      { number: 1, label: "Organization", icon: Building },
      { number: 2, label: "Customer", icon: Users },
      { number: 3, label: "Process", icon: Settings },
      { number: 4, label: "Activity", icon: Activity },
      { number: 5, label: "Workplace", icon: MapPin },
    ];

    return (
      <div className="flex items-center justify-between mb-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCompleted
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="ml-2 text-xs text-gray-600 hidden sm:block">
                {step.label}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 mx-2 ${
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start New Timer" size="lg">
      <div className="p-6">
        {renderProgress()}
        {renderStepContent()}

        <div className="flex justify-between mt-6">
          <Button
            variant="secondary"
            onClick={
              currentStep === STEPS.ORGANIZATION ? onClose : handlePrevious
            }
          >
            {currentStep === STEPS.ORGANIZATION ? "Cancel" : "Previous"}
          </Button>

          {currentStep === STEPS.WORKPLACE ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isSubmitting ? "Starting..." : "Start Timer"}</span>
            </Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </div>
    </Modal>
  );
};
