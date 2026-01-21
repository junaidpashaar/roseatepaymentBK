// src/services/paymentService.js
const razorpay = require('../config/razorpay');
const PaymentLinkModel = require('../models/paymentLinkModel');
const TransactionModel = require('../models/transactionModel');

class PaymentService {
  // Create payment link
  async createPaymentLink(data) {
    const { name, email, phone, amount, currency = 'INR', description, guestName } = data;

    // Validate required fields
    if (!name || !amount) {
      throw new Error('Name and amount are required');
    }

    if (amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Create payment link via Razorpay API
    const paymentLinkData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: currency?.toUpperCase(),
      description: description || `Reservation #${data?.reservationId} - ${guestName}`,
      customer: {
        name: name,
        email: email || undefined,
        contact: phone || undefined
      },
      notify: {
        sms: phone ? true : false,
        email: email ? true : false
      },
      reminder_enable: true,
      callback_url: 'https://payments.roseatehotels.com/payment-success',
      callback_method: 'get',
        notes: {
          hotelId:data?.name,
          reservationId:data?.reservationId,
          info: data?.info || '',
          source: data?.type
        }
    };
    const paymentLink = await razorpay.paymentLink.create(paymentLinkData);
    // Store in database
    await PaymentLinkModel.create({
      payment_link_id: paymentLink.id,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      amount: amount,
      currency: currency.toUpperCase(),
      description: description,
      short_url: paymentLink.short_url,
      hotelId: data?.name,
      reservationId: data?.reservationId,
    });

    return {
      payment_link_id: paymentLink.id,
      short_url: paymentLink.short_url,
      amount: amount,
      currency: currency.toUpperCase(),
      customer_name: name
    };
  }

  // Get payment link details
  async getPaymentLinkById(payment_link_id) {
    const paymentLink = await PaymentLinkModel.findById(payment_link_id);
    
    if (!paymentLink) {
      throw new Error('Payment link not found');
    }

    return paymentLink;
  }

  // Get all payment links
  async getAllPaymentLinks(limit = 50, offset = 0) {
    return await PaymentLinkModel.findAll(limit, offset);
  }

  // Get payment links by status
  async getPaymentLinksByStatus(status) {
    return await PaymentLinkModel.findByStatus(status);
  }

  // Get transactions for a payment link
  async getTransactionsByPaymentLink(payment_link_id) {
    return await TransactionModel.findByPaymentLinkId(payment_link_id);
  }

  // Get all transactions
  async getAllTransactions(limit = 100, offset = 0) {
    return await TransactionModel.findAll(limit, offset);
  }

  // Get transaction statistics
  async getTransactionStats() {
    return await TransactionModel.getStats();
  }

  // Cancel payment link
  async cancelPaymentLink(payment_link_id) {
    // Cancel on Razorpay
    await razorpay.paymentLink.cancel(payment_link_id);
    
    // Update status in database
    await PaymentLinkModel.updateStatus(payment_link_id, 'cancelled');
    
    return { message: 'Payment link cancelled successfully' };
  }
}

module.exports = new PaymentService();