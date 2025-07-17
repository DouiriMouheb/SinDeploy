// Server/services/oauth2Service.js - OAuth 2.0 Client Credentials Service
const axios = require('axios');
const logger = require('../utils/logger');

class OAuth2Service {
  constructor() {
    this.clientId = process.env.SINERGIA_CLIENT_ID;
    this.clientSecret = process.env.SINERGIA_CLIENT_SECRET;
    this.tokenUrl = process.env.SINERGIA_TOKEN_URL;
    this.apiBaseUrl = process.env.SINERGIA_API_BASE_URL;
    
    // Token cache
    this.accessToken = null;
    this.tokenExpiry = null;
    
    // Validate required environment variables
    this.validateConfig();
  }

  validateConfig() {
    const required = ['SINERGIA_CLIENT_ID', 'SINERGIA_CLIENT_SECRET', 'SINERGIA_TOKEN_URL', 'SINERGIA_API_BASE_URL'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Get access token using client credentials flow
   */
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      logger.info('Requesting new OAuth 2.0 access token');

      const response = await axios.post(this.tokenUrl, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      });

      const { access_token, expires_in, token_type } = response.data;

      if (!access_token) {
        throw new Error('No access token received from OAuth provider');
      }

      // Cache the token (subtract 60 seconds for safety margin)
      this.accessToken = access_token;
      this.tokenExpiry = Date.now() + ((expires_in - 60) * 1000);

      logger.info('OAuth 2.0 access token obtained successfully', {
        tokenType: token_type,
        expiresIn: expires_in
      });

      return access_token;

    } catch (error) {
      logger.error('Failed to obtain OAuth 2.0 access token', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // Clear cached token on error
      this.accessToken = null;
      this.tokenExpiry = null;

      throw new Error(`OAuth 2.0 authentication failed: ${error.message}`);
    }
  }

  /**
   * Make authenticated API request
   */
  async makeAuthenticatedRequest(endpoint, options = {}) {
    try {
      const token = await this.getAccessToken();
      const url = `${this.apiBaseUrl}${endpoint}`;

      const config = {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        timeout: 15000
      };

      logger.info('Making authenticated API request', { url, method: options.method || 'GET' });

      const response = await axios(url, config);
      return response.data;

    } catch (error) {
      logger.error('Authenticated API request failed', {
        endpoint,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // If token expired, clear cache and retry once
      if (error.response?.status === 401 && this.accessToken) {
        logger.info('Token expired, clearing cache and retrying');
        this.accessToken = null;
        this.tokenExpiry = null;
        
        // Retry once with new token
        return this.makeAuthenticatedRequest(endpoint, options);
      }

      throw error;
    }
  }

  /**
   * Clear cached token (useful for testing or manual refresh)
   */
  clearTokenCache() {
    this.accessToken = null;
    this.tokenExpiry = null;
    logger.info('OAuth 2.0 token cache cleared');
  }
}

// Export singleton instance
module.exports = new OAuth2Service();
