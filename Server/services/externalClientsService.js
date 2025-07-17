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
   * Get all clients for a specific organization with pagination
   */
  async getClientsForOrganization(organizationCode, options = {}) {
    const { page = 1, limit = 10, search = '' } = options;
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

      logger.info('Raw API response received', {
        organizationCode,
        responseType: typeof response,
        hasData: !!response?.data,
        isArray: Array.isArray(response?.data)
      });

      // Handle the API response structure: { success: true, data: [...], message: "" }
      let clients = [];
      if (response && response.success && Array.isArray(response.data)) {
        clients = response.data;
      } else if (Array.isArray(response)) {
        // Fallback if response is directly an array
        clients = response;
      } else {
        logger.warn('Unexpected API response structure', {
          organizationCode,
          responseStructure: {
            success: response?.success,
            dataType: typeof response?.data,
            isValid: response?.isValid
          }
        });
        // Set empty array as fallback
        clients = [];
      }

      // Apply search filter if provided
      let filteredClients = clients;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredClients = clients.filter(client => {
          return (
            (client.ragsoc && client.ragsoc.toLowerCase().includes(searchLower)) ||
            (client.id && client.id.toString().includes(search.trim()))
          );
        });
      }

      // Apply pagination
      const totalCount = filteredClients.length;
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;
      const paginatedClients = filteredClients.slice(offset, offset + limit);

      logger.info('Successfully processed clients with pagination', {
        organizationCode,
        totalClients: clients.length,
        filteredCount: filteredClients.length,
        page,
        limit,
        totalPages,
        searchTerm: search
      });

      return {
        success: true,
        data: {
          organization: organization,
          clients: paginatedClients,
          pagination: {
            currentPage: parseInt(page),
            totalPages: totalPages,
            totalItems: totalCount,
            itemsPerPage: parseInt(limit),
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
          },
          searchTerm: search || null
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
   * Get client statistics for an organization
   */
  async getClientStats(organizationCode) {
    try {
      const result = await this.getClientsForOrganization(organizationCode);

      if (!result.success) {
        return result;
      }

      const clients = result.data.clients;

      // Ensure clients is an array
      if (!Array.isArray(clients)) {
        logger.warn('Clients data is not an array', {
          organizationCode,
          clientsType: typeof clients,
          clientsValue: clients
        });

        return {
          success: true,
          data: {
            organization: result.data.organization,
            statistics: {
              totalClients: 0,
              activeClients: 0,
              inactiveClients: 0,
              clientsWithEmail: 0,
              clientsWithPhone: 0
            }
          }
        };
      }

      const stats = {
        totalClients: clients.length,
        // Based on the API response structure, let's use available fields
        clientsWithPiva: clients.filter(c => c.piva && c.piva.trim()).length,
        clientsWithEmail: clients.filter(c => c.emaiL_ISTITUZIONALE && c.emaiL_ISTITUZIONALE.trim()).length,
        clientsWithPhone: clients.filter(c => c.tel && c.tel.trim()).length,
        clientsOnly: clients.filter(c => c.flG_CLIENTE === true).length,
        suppliersOnly: clients.filter(c => c.flG_FORNITORE === true).length,
        prospects: clients.filter(c => c.flG_PROSPECT === true).length
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
        error: error.message,
        stack: error.stack
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
