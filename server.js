// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const fs = require('fs');
const http = require('http');
const https = require('https');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

const { initDatabase } = require('./src/config/database');

const paymentRoutes = require('./src/routes/paymentRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const indexRoutes = require('./src/routes');

const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const corsMiddleware = require('./src/middleware/cors');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ============================================
// Security & Middlewares
// ============================================

app.use(helmet());
app.use(corsMiddleware);
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// ============================================
// Health Check
// ============================================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// Swagger
// ============================================

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// Routes
// ============================================

app.use('/api', indexRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/webhook', webhookRoutes);

// ============================================
// Error Handling
// ============================================

app.use(notFound);
app.use(errorHandler);

// ============================================
// Start Server (HTTP / HTTPS)
// ============================================

const PORT = process.env.PORT || 3000;
let server;

initDatabase()
  .then(() => {
    if (isProd) {
      // HTTPS in production
      const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY_PATH),
        cert: fs.readFileSync(process.env.SSL_CERT_PATH),
      };

      server = https.createServer(sslOptions, app).listen(PORT, () => {
        console.log('===========================================');
        console.log(`🔐 HTTPS Server running on port ${PORT}`);
        console.log(`📍 API Base URL: https://localhost:${PORT}`);
        console.log(`📘 Swagger Docs: https://localhost:${PORT}/api/docs`);
        console.log('===========================================');
      });
    } else {
      // HTTP in development
      server = http.createServer(app).listen(PORT, () => {
        console.log('===========================================');
        console.log(`🚀 HTTP Server running on port ${PORT}`);
        console.log(`📍 API Base URL: http://localhost:${PORT}`);
        console.log(`📘 Swagger Docs: http://localhost:${PORT}/api/docs`);
        console.log('===========================================');
      });
    }
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

// ============================================
// Graceful Shutdown
// ============================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  }
});

module.exports = app;
