// src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { validatePaymentLink } = require('../middleware/validateRequest');

// Create payment link
router.post('/create', validatePaymentLink, paymentController.createPaymentLink);

// Get all payment links
router.get('/links', paymentController.getAllPaymentLinks);

// Get payment link by ID
router.get('/links/:id', paymentController.getPaymentLink);

// Get payment links by status
router.get('/links/status/:status', paymentController.getPaymentLinksByStatus);

// Cancel payment link
router.post('/links/:id/cancel', paymentController.cancelPaymentLink);

// Get transactions for a payment link
router.get('/links/:id/transactions', paymentController.getTransactionsByPaymentLink);

// Get all transactions
router.get('/transactions', paymentController.getAllTransactions);

// Get transaction statistics
router.get('/transactions/stats', paymentController.getTransactionStats);

// Payment success callback
router.get('/success', paymentController.paymentSuccessPage);

module.exports = router;