// src/services/webhookService.js
const PaymentLinkModel = require('../models/paymentLinkModel');
const TransactionModel = require('../models/transactionModel');
const { verifyWebhookSignature } = require('../utils/verifySignature');

class WebhookService {
  // Process webhook events
  async processWebhook(payload, signature) {
    // Verify webhook signature
    const isValid = verifyWebhookSignature(payload, signature);
    
    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    const event = payload.event;
    console.log(`Processing webhook event: ${event}`);

    switch (event) {
      case 'payment_link.paid':
        return await this.handlePaymentLinkPaid(payload);
      
      case 'payment.captured':
        return await this.handlePaymentCaptured(payload);
      
      case 'payment.failed':
        return await this.handlePaymentFailed(payload);
      
      case 'payment_link.cancelled':
        return await this.handlePaymentLinkCancelled(payload);
      
      case 'payment_link.expired':
        return await this.handlePaymentLinkExpired(payload);
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
        return { message: 'Event received but not processed' };
    }
  }

  // Handle payment link paid event
  async handlePaymentLinkPaid(payload) {
    const paymentLinkEntity = payload.payload.payment_link.entity;
    const paymentEntity = payload.payload.payment.entity;

    const paymentLinkId = paymentLinkEntity.id;

    // Update payment link status
    await PaymentLinkModel.updateStatus(paymentLinkId, 'paid');

    // Store transaction history
    await TransactionModel.create({
      payment_link_id: paymentLinkId,
      payment_id: paymentEntity.id,
      order_id: paymentEntity.order_id,
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: 'success',
      method: paymentEntity.method,
      email: paymentEntity.email,
      contact: paymentEntity.contact,
      webhook_payload: payload
    });

    console.log(`✓ Payment successful for link: ${paymentLinkId}`);
    
    return { 
      message: 'Payment link paid successfully', 
      payment_link_id: paymentLinkId 
    };
  }

  // Handle payment captured event
  async handlePaymentCaptured(payload) {
    const paymentEntity = payload.payload.payment.entity;

    await TransactionModel.create({
      payment_id: paymentEntity.id,
      order_id: paymentEntity.order_id,
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: 'captured',
      method: paymentEntity.method,
      email: paymentEntity.email,
      contact: paymentEntity.contact,
      webhook_payload: payload
    });

    console.log(`✓ Payment captured: ${paymentEntity.id}`);
    
    return { 
      message: 'Payment captured successfully', 
      payment_id: paymentEntity.id 
    };
  }

  // Handle payment failed event
  async handlePaymentFailed(payload) {
    const paymentEntity = payload.payload.payment.entity;

    await TransactionModel.create({
      payment_id: paymentEntity.id,
      order_id: paymentEntity.order_id,
      amount: paymentEntity.amount / 100,
      currency: paymentEntity.currency,
      status: 'failed',
      method: paymentEntity.method,
      email: paymentEntity.email,
      contact: paymentEntity.contact,
      error_code: paymentEntity.error_code,
      error_description: paymentEntity.error_description,
      webhook_payload: payload
    });

    console.log(`✗ Payment failed: ${paymentEntity.id}`);
    
    return { 
      message: 'Payment failure recorded', 
      payment_id: paymentEntity.id 
    };
  }

  // Handle payment link cancelled event
  async handlePaymentLinkCancelled(payload) {
    const paymentLinkEntity = payload.payload.payment_link.entity;
    const paymentLinkId = paymentLinkEntity.id;

    await PaymentLinkModel.updateStatus(paymentLinkId, 'cancelled');

    console.log(`⊗ Payment link cancelled: ${paymentLinkId}`);
    
    return { 
      message: 'Payment link cancelled', 
      payment_link_id: paymentLinkId 
    };
  }

  // Handle payment link expired event
  async handlePaymentLinkExpired(payload) {
    const paymentLinkEntity = payload.payload.payment_link.entity;
    const paymentLinkId = paymentLinkEntity.id;

    await PaymentLinkModel.updateStatus(paymentLinkId, 'expired');

    console.log(`⌛ Payment link expired: ${paymentLinkId}`);
    
    return { 
      message: 'Payment link expired', 
      payment_link_id: paymentLinkId 
    };
  }
}

module.exports = new WebhookService();