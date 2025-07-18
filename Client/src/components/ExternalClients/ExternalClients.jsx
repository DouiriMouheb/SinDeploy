// Client/src/components/ExternalClients/ExternalClients.jsx - External Sinergia Clients Component
import React, { useState, useEffect } from "react";
import { Building2, Users, Search, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, Download, Database } from "lucide-react";
import { externalClientsService } from "../../services/externalClients";
import { syncService } from "../../services/sync";
import { showToast } from "../../utils/toast";

export const ExternalClients = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false
  });

  // Load organizations on component mount
  useEffect(() => {
    loadOrganizations();
  }, []);

  // Load clients when organization is selected
  useEffect(() => {
    if (selectedOrganization) {
      loadClients();
    } else {
      setClients([]);
      setStats(null);
    }
  }, [selectedOrganization]);

  const loadOrganizations = async () => {
    try {
      setLoadingOrganizations(true);
      const response = await externalClientsService.getOrganizations();
      setOrganizations(response.data.organizations);
    } catch (error) {
      console.error("Error loading organizations:", error);
      showToast.error("Failed to load organizations");
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const loadClients = async (page = 1) => {
    if (!selectedOrganization) return;

    try {
      setLoading(true);
      const response = await externalClientsService.getClientsForOrganization(
        selectedOrganization,
        {
          page: page,
          limit: 10,
          search: searchTerm
        }
      );

      setClients(response.data.clients || []);
      setPagination(response.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });

      if (response.message) {
        showToast.success(response.message);
      }

      // Load statistics
      loadStats();
    } catch (error) {
      console.error("Error loading clients:", error);
      showToast.error("Failed to load clients from external API");
      setClients([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!selectedOrganization) return;

    try {
      const response = await externalClientsService.getClientStats(selectedOrganization);
      setStats(response.data.statistics);
    } catch (error) {
      console.error("Error loading statistics:", error);
      // Don't show error toast for stats as it's not critical
    }
  };

  const handleOrganizationChange = (e) => {
    const orgCode = e.target.value;
    setSelectedOrganization(orgCode);
    setSearchTerm(""); // Clear search when changing organization
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (selectedOrganization) {
      loadClients(1); // Reset to first page when searching
    }
  };

  const handleRefresh = () => {
    if (selectedOrganization) {
      loadClients(pagination.currentPage);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadClients(newPage);
    }
  };

  const handleSyncOrganization = async () => {
    if (!selectedOrganization) {
      showToast.error("Please select an organization first");
      return;
    }

    try {
      setSyncing(true);
      setSyncStatus("Initializing sync...");

      // Initialize external organizations first
      await syncService.initialize();
      setSyncStatus("Syncing organization data...");

      // Sync the selected organization
      const result = await syncService.syncOrganization(selectedOrganization);

      if (result.success) {
        showToast.success(result.message);
        setSyncStatus(`Sync completed: ${result.data.synced} clients synced, ${result.data.updated} updated`);

        // Refresh the client list to show any changes
        loadClients(1);
      } else {
        showToast.error("Sync failed");
        setSyncStatus("Sync failed");
      }
    } catch (error) {
      console.error("Sync error:", error);
      showToast.error("Failed to sync organization data");
      setSyncStatus("Sync failed");
    } finally {
      setSyncing(false);
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const selectedOrgData = organizations.find(org => org.code === selectedOrganization);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">External Clients</h1>
            <p className="text-gray-600">Manage clients from Sinergia Cloud API</p>
          </div>
        </div>
      </div>

      {/* Organization Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              Select Organization
            </label>
            <select
              id="organization"
              value={selectedOrganization}
              onChange={handleOrganizationChange}
              disabled={loadingOrganizations}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">
                {loadingOrganizations ? "Loading organizations..." : "Choose an organization"}
              </option>
              {organizations.map((org) => (
                <option key={org.code} value={org.code}>
                  {org.code} - {org.name}
                </option>
              ))}
            </select>
          </div>

          {selectedOrganization && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={loading || syncing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleSyncOrganization}
                disabled={loading || syncing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Database className={`h-4 w-4 ${syncing ? 'animate-pulse' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Sync to DB'}</span>
              </button>
            </div>
          )}
        </div>

        {selectedOrgData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Selected: {selectedOrgData.name} (Code: {selectedOrgData.code})
                </span>
              </div>

              {syncStatus && (
                <div className="flex items-center space-x-2 text-sm">
                  {syncing && <RefreshCw className="h-4 w-4 animate-spin text-green-600" />}
                  <span className={syncing ? "text-green-700" : "text-gray-700"}>
                    {syncStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search and Stats */}
      {selectedOrganization && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Search
              </button>
            </form>

            {stats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>Total: {stats.totalClients}</span>
                </div>
              </div>
            )}

            {pagination.totalItems > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>
                  Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{" "}
                  {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{" "}
                  {pagination.totalItems} results
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clients Table */}
      {selectedOrganization && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Clients {searchTerm && `matching "${searchTerm}"`}
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading clients...</span>
            </div>
          ) : clients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center">
                {searchTerm ? "No clients found matching your search" : "No clients found for this organization"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name (Ragsoc)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {client.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {client.ragsoc || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={loading}
                            className={`px-3 py-1 border rounded-md text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage || loading}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
