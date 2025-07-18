// Server/routes/sync.js - Sync external data to local database
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');
const { catchAsync } = require('../middleware/errorHandler');
const syncService = require('../services/syncService');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication and admin role to all routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * @route   POST /api/sync/initialize
 * @desc    Initialize external organizations in database
 * @access  Admin
 */
router.post('/initialize', catchAsync(async (req, res) => {
  logger.info('Initializing external organizations', {
    userId: req.user.id,
    userEmail: req.user.email
  });

  const result = await syncService.initializeExternalOrganizations();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize external organizations',
      error: result.error
    });
  }

  res.json({
    success: true,
    message: result.message
  });
}));

/**
 * @route   POST /api/sync/organization/:code
 * @desc    Sync specific organization and its clients
 * @access  Admin
 */
router.post('/organization/:code', catchAsync(async (req, res) => {
  const { code } = req.params;

  logger.info('Starting organization sync', {
    organizationCode: code,
    userId: req.user.id,
    userEmail: req.user.email
  });

  const result = await syncService.syncOrganization(code);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: `Failed to sync organization ${code}`,
      error: result.error
    });
  }

  res.json({
    success: true,
    message: `Successfully synced organization: ${result.data.organization}`,
    data: result.data
  });
}));

/**
 * @route   POST /api/sync/all
 * @desc    Sync all organizations and their clients
 * @access  Admin
 */
router.post('/all', catchAsync(async (req, res) => {
  logger.info('Starting full sync of all organizations', {
    userId: req.user.id,
    userEmail: req.user.email
  });

  // Initialize first
  await syncService.initializeExternalOrganizations();

  const organizations = ['41', '410', '411', '412'];
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const code of organizations) {
    try {
      logger.info(`Syncing organization ${code}`);
      const result = await syncService.syncOrganization(code);
      
      if (result.success) {
        successCount++;
        results.push({
          code,
          status: 'success',
          data: result.data
        });
      } else {
        errorCount++;
        results.push({
          code,
          status: 'error',
          error: result.error
        });
      }
    } catch (error) {
      errorCount++;
      results.push({
        code,
        status: 'error',
        error: { message: error.message }
      });
      logger.error(`Failed to sync organization ${code}`, { error: error.message });
    }
  }

  const overallSuccess = errorCount === 0;
  const statusCode = overallSuccess ? 200 : 207; // 207 = Multi-Status

  res.status(statusCode).json({
    success: overallSuccess,
    message: `Sync completed: ${successCount} successful, ${errorCount} failed`,
    summary: {
      total: organizations.length,
      successful: successCount,
      failed: errorCount
    },
    results
  });
}));

/**
 * @route   GET /api/sync/status
 * @desc    Get sync status for all organizations
 * @access  Admin
 */
router.get('/status', catchAsync(async (req, res) => {
  const result = await syncService.getSyncStatus();

  if (!result.success) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: result.error
    });
  }

  res.json({
    success: true,
    data: {
      organizations: result.data,
      summary: {
        total: result.data.length,
        completed: result.data.filter(org => org.syncStatus === 'completed').length,
        pending: result.data.filter(org => org.syncStatus === 'pending').length,
        syncing: result.data.filter(org => org.syncStatus === 'syncing').length,
        failed: result.data.filter(org => org.syncStatus === 'failed').length
      }
    }
  });
}));

/**
 * @route   DELETE /api/sync/organization/:code
 * @desc    Reset sync for specific organization (for testing)
 * @access  Admin
 */
router.delete('/organization/:code', catchAsync(async (req, res) => {
  const { code } = req.params;

  logger.info('Resetting organization sync', {
    organizationCode: code,
    userId: req.user.id
  });

  try {
    const { ExternalOrganization, ExternalClient } = require('../models');

    const externalOrg = await ExternalOrganization.findOne({
      where: { externalCode: code }
    });

    if (!externalOrg) {
      return res.status(404).json({
        success: false,
        message: `External organization with code ${code} not found`
      });
    }

    // Delete external clients
    await ExternalClient.destroy({
      where: { externalOrganizationId: externalOrg.id }
    });

    // Reset organization status
    await externalOrg.update({
      syncStatus: 'pending',
      lastSyncAt: null,
      clientsCount: 0,
      syncError: null,
      localOrganizationId: null
    });

    res.json({
      success: true,
      message: `Reset sync status for organization: ${externalOrg.externalName}`
    });

  } catch (error) {
    logger.error(`Failed to reset organization ${code}`, { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to reset organization sync',
      error: error.message
    });
  }
}));

module.exports = router;
