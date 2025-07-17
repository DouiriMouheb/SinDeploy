// Client/src/components/ExternalClients/ExternalClients.jsx - External Sinergia Clients Component
import React, { useState, useEffect } from "react";
import { Building2, Users, Search, RefreshCw, AlertCircle } from "lucide-react";
import { externalClientsService } from "../../services/externalClients";
import { showToast } from "../../utils/toast";

export const ExternalClients = () => {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingOrganizations, setLoadingOrganizations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);

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

  const loadClients = async () => {
    if (!selectedOrganization) return;

    try {
      setLoading(true);
      const response = await externalClientsService.getClientsForOrganization(
        selectedOrganization,
        searchTerm
      );
      
      setClients(response.data.clients || []);
      
      if (response.message) {
        showToast.success(response.message);
      }

      // Load statistics
      loadStats();
    } catch (error) {
      console.error("Error loading clients:", error);
      showToast.error("Failed to load clients from external API");
      setClients([]);
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
      loadClients();
    }
  };

  const handleRefresh = () => {
    if (selectedOrganization) {
      loadClients();
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
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {selectedOrgData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">
                Selected: {selectedOrgData.name} (Code: {selectedOrgData.code})
              </span>
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
          )}
        </div>
      )}
    </div>
  );
};
