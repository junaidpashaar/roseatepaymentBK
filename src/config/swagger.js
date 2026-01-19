const swaggerJSDoc = require('swagger-jsdoc');

const isProd = process.env.NODE_ENV === 'production';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Gateway API',
      version: '1.0.0',
      description: 'API documentation for Reservation & Payment services',
    },
    servers: [
      {
        url: isProd
          ? 'https://payments.roseatehotels.com/bk'
          : 'http://localhost:3000',
        description: isProd ? 'Production server' : 'Local server',
      },
    ],
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
  ],
};

module.exports = swaggerJSDoc(options);
