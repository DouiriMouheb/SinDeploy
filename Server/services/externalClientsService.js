// Server/services/externalClientsService.js - External Sinergia API Client Service
const oauth2Service = require('./oauth2Service');
const logger = require('../utils/logger');

class ExternalClientsService {
  constructor() {
    // Predefined organizations
    this.organizations = [
      { code: '41', name: 'Sinergia Consulenze' },
      { code: '410', name: 'Sinergia EPC' },
      { code: '411', name: 'Impronta' },
      { code: '412', name: 'Deep Reality' }
    ];
  }

  /**
   * Get all available organizations
   */
  getOrganizations() {
    return this.organizations;
  }

  /**
   * Get organization by code
   */
  getOrganizationByCode(code) {
    return this.organizations.find(org => org.code === code);
  }

  /**
   * Get all clients for a specific organization
   */
  async getClientsForOrganization(organizationCode) {
    try {
      // Validate organization code
      const organization = this.getOrganizationByCode(organizationCode);
      if (!organization) {
        throw new Error(`Invalid organization code: ${organizationCode}`);
      }

      logger.info('Fetching clients for organization', {
        organizationCode,
        organizationName: organization.name
      });

      // Make API call to external service
      const endpoint = `/clientifornitori/getallclienti/${organizationCode}/cli/0`;
      const response = await oauth2Service.makeAuthenticatedRequest(endpoint, {
        method: 'GET'
      });

      logger.info('Successfully fetched clients', {
        organizationCode,
        clientCount: Array.isArray(response) ? response.length : 'unknown'
      });

      return {
        success: true,
        data: {
          organization: organization,
          clients: response,
          totalCount: Array.isArray(response) ? response.length : 0
        }
      };

    } catch (error) {
      logger.error('Failed to fetch clients for organization', {
        organizationCode,
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        error: {
          code: 'EXTERNAL_API_ERROR',
          message: `Failed to fetch clients: ${error.message}`,
          organizationCode
        }
      };
    }
  }

  /**
   * Search clients by name or other criteria
   */
  async searchClients(organizationCode, searchTerm) {
    try {
      const result = await this.getClientsForOrganization(organizationCode);
      
      if (!result.success) {
        return result;
      }

      // Filter clients based on search term
      const filteredClients = result.data.clients.filter(client => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (client.name && client.name.toLowerCase().includes(searchLower)) ||
          (client.code && client.code.toLowerCase().includes(searchLower)) ||
          (client.email && client.email.toLowerCase().includes(searchLower))
        );
      });

      return {
        success: true,
        data: {
          ...result.data,
          clients: filteredClients,
          totalCount: filteredClients.length,
          searchTerm
        }
      };

    } catch (error) {
      logger.error('Failed to search clients', {
        organizationCode,
        searchTerm,
        error: error.message
      });

      return {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: `Search failed: ${error.message}`,
          organizationCode,
          searchTerm
        }
      };
    }
  }

  /**
   * Get client statistics for an organization
   */
  async getClientStats(organizationCode) {
    try {
      const result = await this.getClientsForOrganization(organizationCode);
      
      if (!result.success) {
        return result;
      }

      const clients = result.data.clients;
      const stats = {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        inactiveClients: clients.filter(c => c.status === 'inactive').length,
        // Add more statistics as needed based on the API response structure
      };

      return {
        success: true,
        data: {
          organization: result.data.organization,
          statistics: stats
        }
      };

    } catch (error) {
      logger.error('Failed to get client statistics', {
        organizationCode,
        error: error.message
      });

      return {
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: `Failed to get statistics: ${error.message}`,
          organizationCode
        }
      };
    }
  }
}

// Export singleton instance
module.exports = new ExternalClientsService();
