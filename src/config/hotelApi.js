// src/config/hotelApi.js
require('dotenv').config();

const config = {
  baseUrl: process.env.HOTEL_API_BASE_URL,
  clientId: process.env.HOTEL_CLIENT_ID,
  clientSecret: process.env.HOTEL_CLIENT_SECRET,
  appKey: process.env.HOTEL_APP_KEY,
  enterpriseId: process.env.HOTEL_ENTERPRISE_ID,
  tokenCacheDuration: parseInt(process.env.TOKEN_CACHE_DURATION) || 28800000
};

// Validate required configuration
const requiredFields = ['baseUrl', 'clientId', 'clientSecret', 'appKey', 'enterpriseId'];
for (const field of requiredFields) {
  if (!config[field]) {
    throw new Error(`Missing required configuration: ${field}`);
  }
}

module.exports = config;