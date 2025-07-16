// src/components/Customers/Customers.jsx - Complete customer management
import React, { useState, useEffect, useCallback, useRef } from "react";
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
import { CustomerTable } from "./CustomerTable";
import { CustomerModal } from "./CustomerModal";
import { CustomerFilters } from "./CustomerFilters";
import { CustomerDetails } from "./CustomerDetails";
import { customerService } from "../../services/customers";
import { showToast } from "../../utils/toast";

export const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "details"
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCustomers: 0,
  });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: "",
    isActive: "true", // Default to showing active customers
  });

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalProjects: 0,
  });

  const { user, hasRole } = useAuth();
  const refreshTimeoutRef = useRef(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const response = await customerService.getCustomers(cleanFilters);

      if (response.success) {
        setCustomers(response.data.customers || []);
        setPagination(response.data.pagination || {});

        // Calculate stats
        const totalCustomers = response.data.pagination?.totalCustomers || 0;
        const activeCustomers =
          response.data.customers?.filter((c) => c.isActive).length || 0;
        const totalProjects =
          response.data.customers?.reduce(
            (sum, customer) => sum + (customer.workProjects?.length || 0),
            0
          ) || 0;

        setStats({
          total: totalCustomers,
          active: activeCustomers,
          totalProjects,
        });
      }
    } catch (err) {
      console.error("Error loading customers:", err);
      const errorMessage = err.message || "Failed to load customers";
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Debounced refresh function to avoid too many API calls
  const debouncedRefresh = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      loadCustomers();
    }, 500); // 500ms delay
  }, [loadCustomers]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const openModal = (mode, customer = null) => {
    setModalMode(mode);
    setSelectedCustomer(customer);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleModalSuccess = () => {
    loadCustomers();
  };

  const viewCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setViewMode("details");
  };

  const backToList = () => {
    setViewMode("list");
    setSelectedCustomerId(null);
  };

  const handleDeleteRequest = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;

    setIsDeleting(true);

    try {
      await customerService.deleteCustomer(customerToDelete.id);

      setCustomers((prevCustomers) =>
        prevCustomers.filter((c) => c.id !== customerToDelete.id)
      );

      showToast.success("Customer deleted successfully");
      setShowDeleteModal(false);
      setCustomerToDelete(null);
      loadCustomers(); // Reload to update pagination
    } catch (err) {
      console.error("Error deleting customer:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete customer";
      showToast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const dismissError = () => {
    setError(null);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  // Show customer details view
  if (viewMode === "details" && selectedCustomerId) {
    return (
      <CustomerDetails
        customerId={selectedCustomerId}
        onBack={backToList}
        onEdit={(customer) => {
          setViewMode("list");
          openModal("edit", customer);
        }}
        onDelete={async (customerId) => {
          await customerService.deleteCustomer(customerId);
          loadCustomers(); // Refresh the list
        }}
        onRefresh={debouncedRefresh} // Use debounced refresh callback
      />
    );
  }

  // Show list view
  return (
    <div>
      <div className="mb-8">
        {/* Header - responsive layout */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
             <h1 className="text-3xl font-bold text-gray-900">
              Customer Management
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Manage customers and their projects across the organization
            </p>
          </div>

          {/* Buttons - stack on mobile, inline on larger screens */}
          <div className="flex space-x-2 sm:mt-0">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="secondary"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              onClick={loadCustomers}
              variant="secondary"
              size="sm"
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button onClick={() => openModal("create")} size="sm">
              <Plus className="h-5 w-5 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-50 overflow-hidden shadow-lg rounded-lg border border-slate-200 ">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500  truncate">
                    Total Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-blac ">
                    {stats.total}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50  overflow-hidden shadow-lg rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">
                    Active Customers
                  </dt>
                  <dd className="text-2xl font-semibold text-slate-900 ">
                    {stats.active}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50  overflow-hidden shadow-lg rounded-lg border border-slate-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500  truncate">
                    Total Projects
                  </dt>
                  <dd className="text-2xl font-semibold text-slate-900">
                    {stats.totalProjects}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <div className="text-red-700 dark:text-red-300">{error}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissError}
              className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <CustomerFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Customers Table */}
      <div className="bg-slate-50 dark:bg-slate-800 shadow-lg rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
        <CustomerTable
          customers={customers}
          onView={viewCustomer}
          onEdit={(customer) => openModal("edit", customer)}
          onDelete={handleDeleteRequest}
        />
      </div>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showModal}
        onClose={closeModal}
        customer={selectedCustomer}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}?`}
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        itemName={customerToDelete?.name}
        details={[
          "This action cannot be undone",
          "Customer data will be permanently removed",
          customerToDelete?.workProjects?.length > 0
            ? "This customer has active projects that must be reassigned first"
            : "No active projects will be affected",
        ]}
      />
    </div>
  );
};
