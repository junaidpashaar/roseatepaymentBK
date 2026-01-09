// src/middleware/validateRequest.js

// Validate payment link creation request
const validatePaymentLink = (req, res, next) => {
  const { name, amount, currency } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Valid customer name is required');
  }

  if (!amount || isNaN(amount) || amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (currency && !['INR', 'USD', 'EUR', 'GBP'].includes(currency.toUpperCase())) {
    errors.push('Invalid currency. Supported: INR, USD, EUR, GBP');
  }

  if (req.body.email && !isValidEmail(req.body.email)) {
    errors.push('Invalid email format');
  }

  if (req.body.phone && !isValidPhone(req.body.phone)) {
    errors.push('Invalid phone format');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

// Email validation helper
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation helper (basic validation)
function isValidPhone(phone) {
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

module.exports = { validatePaymentLink };