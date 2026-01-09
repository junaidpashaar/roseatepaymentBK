// src/services/authService.js
const axios = require('axios');
const hotelApiConfig = require('../config/hotelApi');

class AuthService {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.loginInProgress = null; // Promise to prevent concurrent login calls
  }

  /**
   * Get valid access token (cached or fresh)
   */
  async getAccessToken() {
    // Return cached token if still valid
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // If login is already in progress, wait for it
    if (this.loginInProgress) {
      return await this.loginInProgress;
    }

    // Start new login
    this.loginInProgress = this.login();
    
    try {
      const token = await this.loginInProgress;
      return token;
    } finally {
      this.loginInProgress = null;
    }
  }

  /**
   * Login to hotel API and cache token
   */
  async login() {
    try {
      const url = `${hotelApiConfig.baseUrl}/oauth/v1/tokens`;
      
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-app-key': hotelApiConfig.appKey,
        'enterpriseId': hotelApiConfig.enterpriseId,
        'Authorization': 'Basic ' + Buffer.from(
          `${hotelApiConfig.clientId}:${hotelApiConfig.clientSecret}`
        ).toString('base64')
      };

      const data = new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'urn:opc:hgbu:ws:__myscopes__'
      });

      const response = await axios.post(url, data.toString(), { headers });

      // Cache token with expiry (subtract 60 seconds as buffer)
      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000;

      console.log('Hotel API login successful, token cached');
      
      return this.token;
    } catch (error) {
      console.error('Hotel API login failed:', error.response?.data || error.message);
      throw new Error('Authentication with hotel API failed');
    }
  }

  /**
   * Clear cached token (for logout or error scenarios)
   */
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
    this.loginInProgress = null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired() {
    return !this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }
}

module.exports = new AuthService();