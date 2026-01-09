// src/routes/index.js
const express = require('express');
const router = express.Router();

const reservationController = require('../controllers/reservationController');
const paymentController = require('../controllers/paymentController');

// ============================================
// RESERVATION ROUTES
// ============================================

// Get reservation details
router.get(
  '/reservation/:hotelId/:reservationId',
  reservationController.getReservation
);

// Get deposit folio
router.get(
  '/reservation/:hotelId/:reservationId/deposit-folio',
  reservationController.getDepositFolio
);

// Get Checkout Folio
router.get(
  '/reservation/:hotelId/:reservationId/checkout-folio',
  reservationController.getCheckoutFolio
);

// Get complete reservation data (reservation + deposit folio)
router.get(
  '/reservation/:hotelId/:reservationId/complete',
  reservationController.getCompleteReservationData
);

// Validate reservation
router.get(
  '/reservation/:hotelId/:reservationId/validate',
  reservationController.validateReservation
);

// Post deposit payment
router.post(
  '/reservation/:hotelId/:reservationId/deposit-payment',
  reservationController.postDepositPayment
);

// Post regular payment
router.post(
  '/reservation/:hotelId/:reservationId/payment',
  reservationController.postPayment
);


// ============================================
// PAYMENT ROUTES
// ============================================

// Generate deposit payment link
router.post(
  '/payment/deposit/generate',
  paymentController.generateDepositPaymentLink
);

// Generate adhoc payment link
router.post(
  '/payment/adhoc/generate',
  paymentController.generateAdhocPaymentLink
);

// Generate folio payment link
router.post(
  '/payment/folio/generate',
  paymentController.generateFolioPaymentLink
);

// Payment success callback
router.get(
  '/payment/success',
  paymentController.paymentSuccessPage
);

module.exports = router;