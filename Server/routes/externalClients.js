// Server/routes/externalClients.js - External Sinergia API Routes
const express = require('express');
const { authenticate } = require('../middleware/auth');
const { requireUser } = require('../middleware/rbac');
const { catchAsync } = require('../middleware/errorHandler');
const externalClientsService = require('../services/externalClientsService');
const logger = require('../utils/logger');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);
router.use(requireUser);

/**
 * @route   GET /api/external-clients/organizations
 * @desc    Get all available organizations
 * @access  Private
 */
router.get('/organizations', catchAsync(async (req, res) => {
  const organizations = externalClientsService.getOrganizations();
  
  res.json({
    success: true,
    data: {
      organizations,
      totalCount: organizations.length
    }
  });
}));

/**
 * @route   GET /api/external-clients/organizations/:code
 * @desc    Get organization by code
 * @access  Private
 */
router.get('/organizations/:code', catchAsync(async (req, res) => {
  const { code } = req.params;
  const organization = externalClientsService.getOrganizationByCode(code);
  
  if (!organization) {
    return res.status(404).json({
      success: false,
      message: `Organization with code '${code}' not found`
    });
  }
  
  res.json({
    success: true,
    data: { organization }
  });
}));

/**
 * @route   GET /api/external-clients/organizations/:code/clients
 * @desc    Get all clients for a specific organization
 * @access  Private
 */
router.get('/organizations/:code/clients', catchAsync(async (req, res) => {
  const { code } = req.params;
  const { search } = req.query;
  
  logger.info('Fetching external clients', {
    organizationCode: code,
    userId: req.user.id,
    searchTerm: search
  });

  let result;
  
  if (search && search.trim()) {
    // Search clients
    result = await externalClientsService.searchClients(code, search.trim());
  } else {
    // Get all clients
    result = await externalClientsService.getClientsForOrganization(code);
  }

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.message,
      error: result.error
    });
  }

  res.json({
    success: true,
    data: result.data,
    message: search ? 
      `Found ${result.data.totalCount} clients matching "${search}"` : 
      `Retrieved ${result.data.totalCount} clients`
  });
}));

/**
 * @route   GET /api/external-clients/organizations/:code/stats
 * @desc    Get client statistics for an organization
 * @access  Private
 */
router.get('/organizations/:code/stats', catchAsync(async (req, res) => {
  const { code } = req.params;
  
  logger.info('Fetching client statistics', {
    organizationCode: code,
    userId: req.user.id
  });

  const result = await externalClientsService.getClientStats(code);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.message,
      error: result.error
    });
  }

  res.json({
    success: true,
    data: result.data
  });
}));

/**
 * @route   POST /api/external-clients/refresh-token
 * @desc    Manually refresh OAuth token (for testing/debugging)
 * @access  Private
 */
router.post('/refresh-token', catchAsync(async (req, res) => {
  const oauth2Service = require('../services/oauth2Service');
  
  logger.info('Manual token refresh requested', {
    userId: req.user.id
  });

  try {
    oauth2Service.clearTokenCache();
    const token = await oauth2Service.getAccessToken();
    
    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        tokenObtained: !!token,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
}));

module.exports = router;
