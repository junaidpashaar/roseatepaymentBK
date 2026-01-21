// src/services/webhookService.js
const PaymentLinkModel = require('../models/paymentLinkModel');
const TransactionModel = require('../models/transactionModel');
const { verifyWebhookSignature } = require('../utils/verifySignature');
const reservationService = require('./reservationService');

class WebhookService {
  // Process webhook events
  async processWebhook(payload) {
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
      payment_id: paymentEntity?.id,
      order_id: paymentEntity?.order_id,
      amount: paymentEntity?.amount / 100,
      currency: paymentEntity?.currency,
      status: 'success',
      method: paymentEntity?.method,
      email: paymentEntity?.email,
      contact: paymentEntity?.contact,
      webhook_payload: payload
    });

    console.log(`✓ Payment successful for link: ${paymentLinkId}`);
    
    return { 
      message: 'Payment link paid successfully', 
      payment_link_id: paymentLinkId 
    };
  }

  // Handle payment captured event
// Handle payment captured event
async handlePaymentCaptured(payload) {
  console.log("payload2list",JSON.stringify(payload));
  const paymentEntity = payload.payload.payment.entity;

  // Create transaction record
  const transaction = await TransactionModel.create({
    payment_id: paymentEntity?.id,
    order_id: paymentEntity?.order_id,
    amount: paymentEntity?.amount / 100,
    currency: paymentEntity?.currency,
    status: 'captured',
    method: paymentEntity?.method,
    email: paymentEntity?.email,
    contact: paymentEntity?.contact,
    webhook_payload: payload,
    deposit_api_calls: null // Will be updated after API calls
  }); 

  console.log(`✓ Payment captured: ${paymentEntity?.id}`);

  // Extract and parse info from notes
  try {
    const notes = paymentEntity?.notes || [];
    if (notes && notes.info) {
      const info = JSON.parse(notes.info); 
      const { hotelId, reservationId, amount, type, policyIds,folioIds, description } = info;
      // Array to store all API call results
      const apiCallResults = [];

      // Determine which API to call based on type
      if (type === 'deposit' && policyIds) {
        // CASE 1: Deposit payment with policy IDs
        const policyIdArray = policyIds.split(',').map(id => id.trim());
        for (const depositPolicyId of policyIdArray) {
          try {
            console.log(`Calling deposit API for policyId: ${depositPolicyId}`);
            const apiCallData = {
              hotelId,
              reservationId,
              amount: amount.toString(),
              depositPolicyId,
              type: 'deposit',
              timestamp: new Date().toISOString()
            };
            // Call deposit payment API with policy ID
            const result = await reservationService.postDepositPayment({
              hotelId,
              reservationId,
              amount: amount.toString(),
              paymentMethod: 'RZ',
              folioWindowNo: '1',
              depositPolicyId,
              comments:paymentEntity?.id
            });

            apiCallResults.push({
              type: 'deposit',
              policyId: depositPolicyId,
              request: apiCallData,
              response: result,
              status: 'success',
              timestamp: new Date().toISOString()
            });

            console.log(`✓ Deposit payment posted successfully for policyId: ${depositPolicyId}`);
          } catch (error) {
            console.error(`✗ Failed to post deposit for policyId: ${depositPolicyId}`, error?.message);
            
            apiCallResults.push({
              type: 'deposit',
              policyId: depositPolicyId,
              request: {
                hotelId,
                reservationId,
                amount: amount?.toString(),
                depositPolicyId
              },
              response: null,
              error: error.message,
              status: 'failed',
              timestamp: new Date().toISOString()
            });
          }
        }
      } else if (description === 'Adhoc payment') {
        // CASE 2: Adhoc payment (deposit without policy ID)
        try {
          console.log('Calling deposit API for Adhoc payment (no policy ID)');
          
          const apiCallData = {
            hotelId,
            reservationId,
            amount: amount.toString(),
            type: 'adhoc',
            description: 'Adhoc payment',
            timestamp: new Date().toISOString()
          };

          // Call deposit payment API without policy ID (will use default '1')
          const result = await reservationService.postDepositPaymentAdhoc({
            hotelId,
            reservationId,
            amount: amount?.toString(),
            paymentMethod: 'RZ',
            folioWindowNo: '1',
            comments:paymentEntity?.id
          });

          apiCallResults.push({
            type: 'adhoc',
            request: apiCallData,
            response: result,
            status: 'success',
            timestamp: new Date().toISOString()
          });

          console.log('✓ Adhoc deposit payment posted successfully');
        } catch (error) {
          console.error('✗ Failed to post adhoc deposit payment:', error.message);
          
          apiCallResults.push({
            type: 'adhoc',
            request: {
              hotelId,
              reservationId,
              amount: amount.toString(),
              description: 'Adhoc payment'
            },
            response: null,
            error: error.message,
            status: 'failed',
            timestamp: new Date().toISOString()
          });
        }
      } else if (folioIds) {
        // CASE 3: Folio payment (different API endpoint) 
        const folioIdArray = folioIds.split(',').filter(id => id.trim());
        
        console.log(`Processing ${folioIdArray.length} folio(s)`);
        
        for (const folioId of folioIdArray) {
          try {
            console.log(`Calling folio payment API for folioWindowNo: ${folioId}`);
            
            const apiCallData = {
              hotelId,
              reservationId,
              amount: amount.toString(),
              type: 'folios',
              folioWindowNo: folioId.trim(),
              timestamp: new Date().toISOString()
            };

            // Call folio payment API for each folio
            const result = await reservationService.postPayment({
              hotelId,
              reservationId,
              amount: amount?.toString(),
              paymentMethod: 'RZ',
              folioWindowNo: folioId.trim(),
              comments:paymentEntity?.id
            });

            apiCallResults.push({
              type: 'folios',
              folioWindowNo: folioId.trim(),
              request: apiCallData,
              response: result,
              status: 'success',
              timestamp: new Date().toISOString()
            });

            console.log(`✓ Folio payment posted successfully for folioWindowNo: ${folioId}`);
          } catch (error) {
            console.error(`✗ Failed to post folio payment for folioWindowNo: ${folioId}`, error.message);
            
            apiCallResults.push({
              type: 'folios',
              folioWindowNo: folioId.trim(),
              request: {
                hotelId,
                reservationId,
                amount: amount.toString(),
                folioWindowNo: folioId.trim()
              },
              response: null,
              error: error.message,
              status: 'failed',
              timestamp: new Date().toISOString()
            });
          }
        }
      } else {
        // Unknown type
        console.warn(`Unknown payment type: ${type || 'undefined'}`);
        apiCallResults.push({
          type: type || 'unknown',
          error: 'Unknown payment type or missing required fields',
          timestamp: new Date().toISOString()
        });
      }
      // Update transaction with API call results
      await TransactionModel.findByPaymentId(
        {payment_id:paymentEntity.id},
        {
          deposit_api_calls: JSON.stringify(apiCallResults),
          updatedAt: new Date()
        }
      );

      console.log(`✓ Updated transaction with ${apiCallResults.length} API call(s)`);
    }
  } catch (parseError) {
    console.error('Error parsing notes info or calling API:', parseError.message);
    
    // Update transaction with error
    await TransactionModel.findByIdAndUpdate(
      {payment_id:paymentEntity.id},
      {
        deposit_api_calls: JSON.stringify({
          error: 'Failed to parse notes or call API',
          details: parseError.message,
          timestamp: new Date().toISOString()
        }),
        updatedAt: new Date()
      }
    );
  }

  return { 
    message: 'Payment captured successfully', 
    payment_id: paymentEntity.id 
  };
}

  // Handle payment failed event
  async handlePaymentFailed(payload) {
    const paymentEntity = payload.payload.payment.entity;

    await TransactionModel.create({
      payment_id: paymentEntity?.id,
      order_id: paymentEntity?.order_id,
      amount: paymentEntity?.amount / 100,
      currency: paymentEntity?.currency,
      status: 'failed',
      method: paymentEntity?.method,
      email: paymentEntity?.email,
      contact: paymentEntity?.contact,
      error_code: paymentEntity?.error_code,
      error_description: paymentEntity?.error_description,
      webhook_payload: payload
    });

    console.log(`✗ Payment failed: ${paymentEntity?.id}`);
    
    return { 
      message: 'Payment failure recorded', 
      payment_id: paymentEntity.id 
    };
  }

  // Handle payment link cancelled event
  async handlePaymentLinkCancelled(payload) {
    const paymentLinkEntity = payload?.payload?.payment_link?.entity;
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
    const paymentLinkEntity = payload?.payload?.payment_link?.entity;
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