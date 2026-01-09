// src/routes/webhookRoutes.js
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Razorpay webhook endpoint
router.post('/', webhookController.handleWebhook);

module.exports = router;