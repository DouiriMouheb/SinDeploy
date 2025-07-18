// Server/services/syncService.js - Sync external organizations and clients to local database
const { Organization, Customer, ExternalOrganization, ExternalClient } = require('../models');
const externalClientsService = require('./externalClientsService');
const logger = require('../utils/logger');

class SyncService {
  constructor() {
    // Predefined external organizations
    this.externalOrganizations = [
      { code: '41', name: 'Sinergia Consulenze' },
      { code: '410', name: 'Sinergia EPC' },
      { code: '411', name: 'Impronta' },
      { code: '412', name: 'Deep Reality' }
    ];
  }

  /**
   * Initialize external organizations in database
   */
  async initializeExternalOrganizations() {
    try {
      logger.info('Initializing external organizations');

      for (const extOrg of this.externalOrganizations) {
        const [externalOrg, created] = await ExternalOrganization.findOrCreate({
          where: { externalCode: extOrg.code },
          defaults: {
            externalCode: extOrg.code,
            externalName: extOrg.name,
            syncStatus: 'pending',
            isActive: true
          }
        });

        if (created) {
          logger.info(`Created external organization: ${extOrg.name} (${extOrg.code})`);
        }
      }

      return { success: true, message: 'External organizations initialized' };
    } catch (error) {
      logger.error('Failed to initialize external organizations', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync single organization and its clients
   */
  async syncOrganization(externalCode) {
    let externalOrg;
    
    try {
      // Find external organization record
      externalOrg = await ExternalOrganization.findOne({
        where: { externalCode, isActive: true }
      });

      if (!externalOrg) {
        throw new Error(`External organization with code ${externalCode} not found`);
      }

      // Update status to syncing
      await externalOrg.update({ syncStatus: 'syncing', syncError: null });

      logger.info(`Starting sync for organization: ${externalOrg.externalName} (${externalCode})`);

      // Step 1: Create or find local organization
      const localOrg = await this.createOrFindLocalOrganization(externalOrg);

      // Step 2: Fetch clients from external API
      const clientsResult = await externalClientsService.getClientsForOrganization(externalCode, {
        page: 1,
        limit: 1000, // Get all clients
        search: ''
      });

      if (!clientsResult.success) {
        throw new Error(`Failed to fetch clients: ${clientsResult.error.message}`);
      }

      const externalClients = clientsResult.data.clients;
      logger.info(`Fetched ${externalClients.length} clients from external API`);

      // Step 3: Sync clients
      const syncResults = await this.syncClients(externalOrg, localOrg, externalClients);

      // Step 4: Update sync status
      await externalOrg.update({
        syncStatus: 'completed',
        lastSyncAt: new Date(),
        clientsCount: syncResults.synced,
        localOrganizationId: localOrg.id
      });

      logger.info(`Sync completed for ${externalOrg.externalName}`, syncResults);

      return {
        success: true,
        data: {
          organization: externalOrg.externalName,
          localOrganization: localOrg.name,
          ...syncResults
        }
      };

    } catch (error) {
      logger.error(`Sync failed for organization ${externalCode}`, { error: error.message });

      // Update error status
      if (externalOrg) {
        await externalOrg.update({
          syncStatus: 'failed',
          syncError: error.message
        });
      }

      return {
        success: false,
        error: {
          code: 'SYNC_ERROR',
          message: error.message,
          organizationCode: externalCode
        }
      };
    }
  }

  /**
   * Create or find local organization
   */
  async createOrFindLocalOrganization(externalOrg) {
    // Check if already linked
    if (externalOrg.localOrganizationId) {
      const existing = await Organization.findByPk(externalOrg.localOrganizationId);
      if (existing) {
        return existing;
      }
    }

    // Create new local organization
    const localOrg = await Organization.create({
      name: `${externalOrg.externalName} (Synced)`,
      address: `External Organization - Code: ${externalOrg.externalCode}`,
      workLocation: 'External API'
    });

    logger.info(`Created local organization: ${localOrg.name}`);
    return localOrg;
  }

  /**
   * Sync clients to local database
   */
  async syncClients(externalOrg, localOrg, externalClients) {
    let synced = 0;
    let updated = 0;
    let errors = 0;

    for (const clientData of externalClients) {
      try {
        // Find or create external client record
        const [externalClient, created] = await ExternalClient.findOrCreate({
          where: {
            externalOrganizationId: externalOrg.id,
            externalId: clientData.id
          },
          defaults: {
            externalOrganizationId: externalOrg.id,
            externalId: clientData.id,
            externalData: clientData,
            ragsoc: clientData.ragsoc,
            codContabile: clientData.coD_CONTABILE,
            piva: clientData.piva,
            indirizzo: clientData.indirizzo,
            cap: clientData.cap,
            comune: clientData.comune,
            provincia: clientData.provincia,
            tel: clientData.tel,
            emailIstituzionale: clientData.emaiL_ISTITUZIONALE,
            emailAmministrativa: clientData.emaiL_AMMINISTRATIVA,
            flgCliente: clientData.flG_CLIENTE,
            flgFornitore: clientData.flG_FORNITORE,
            flgProspect: clientData.flG_PROSPECT,
            syncStatus: 'synced'
          }
        });

        if (!created) {
          // Update existing record
          await externalClient.update({
            externalData: clientData,
            ragsoc: clientData.ragsoc,
            codContabile: clientData.coD_CONTABILE,
            piva: clientData.piva,
            indirizzo: clientData.indirizzo,
            cap: clientData.cap,
            comune: clientData.comune,
            provincia: clientData.provincia,
            tel: clientData.tel,
            emailIstituzionale: clientData.emaiL_ISTITUZIONALE,
            emailAmministrativa: clientData.emaiL_AMMINISTRATIVA,
            flgCliente: clientData.flG_CLIENTE,
            flgFornitore: clientData.flG_FORNITORE,
            flgProspect: clientData.flG_PROSPECT,
            lastSyncAt: new Date(),
            syncStatus: 'synced'
          });
          updated++;
        } else {
          synced++;
        }

        // Create or update local customer
        await this.createOrUpdateLocalCustomer(externalClient, localOrg, clientData);

      } catch (error) {
        logger.error(`Failed to sync client ${clientData.id}`, { error: error.message });
        errors++;
      }
    }

    return { synced, updated, errors, total: externalClients.length };
  }

  /**
   * Create or update local customer from external client
   */
  async createOrUpdateLocalCustomer(externalClient, localOrg, clientData) {
    try {
      // Check if local customer already exists
      let localCustomer;
      if (externalClient.localCustomerId) {
        localCustomer = await Customer.findByPk(externalClient.localCustomerId);
      }

      const customerData = {
        name: clientData.ragsoc || `Client ${clientData.id}`,
        organizationId: localOrg.id,
        description: `Synced from external API - ID: ${clientData.id}`,
        contactEmail: clientData.emaiL_ISTITUZIONALE || clientData.emaiL_AMMINISTRATIVA || null,
        contactPhone: clientData.tel || null,
        address: this.buildFullAddress(clientData),
        workLocation: clientData.comune || null,
        isActive: clientData.flG_CLIENTE === true
      };

      if (localCustomer) {
        // Update existing customer
        await localCustomer.update(customerData);
      } else {
        // Create new customer
        localCustomer = await Customer.create(customerData);
        
        // Link back to external client
        await externalClient.update({
          localCustomerId: localCustomer.id,
          syncStatus: 'transformed'
        });
      }

      return localCustomer;
    } catch (error) {
      logger.error(`Failed to create/update local customer for external client ${clientData.id}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Build full address from external client data
   */
  buildFullAddress(clientData) {
    const parts = [];
    if (clientData.indirizzo) parts.push(clientData.indirizzo);
    if (clientData.cap) parts.push(clientData.cap);
    if (clientData.comune) parts.push(clientData.comune);
    if (clientData.provincia) parts.push(`(${clientData.provincia})`);
    return parts.join(', ') || null;
  }

  /**
   * Get sync status for all organizations
   */
  async getSyncStatus() {
    try {
      const externalOrgs = await ExternalOrganization.findAll({
        include: [
          {
            model: Organization,
            as: 'localOrganization',
            attributes: ['id', 'name']
          }
        ],
        order: [['externalCode', 'ASC']]
      });

      return {
        success: true,
        data: externalOrgs.map(org => ({
          externalCode: org.externalCode,
          externalName: org.externalName,
          syncStatus: org.syncStatus,
          lastSyncAt: org.lastSyncAt,
          clientsCount: org.clientsCount,
          syncError: org.syncError,
          localOrganization: org.localOrganization ? {
            id: org.localOrganization.id,
            name: org.localOrganization.name
          } : null
        }))
      };
    } catch (error) {
      logger.error('Failed to get sync status', { error: error.message });
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
module.exports = new SyncService();
