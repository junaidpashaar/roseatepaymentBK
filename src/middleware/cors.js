// src/middleware/cors.js
const cors = require('cors');

module.exports = cors({
  origin: true, // reflects request origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-hotelid',
    'x-app-key'
  ],
  optionsSuccessStatus: 200
});
