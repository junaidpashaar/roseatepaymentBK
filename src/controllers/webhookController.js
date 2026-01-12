// src/controllers/webhookController.js
const webhookService = require('../services/webhookService');

class WebhookController {

  /**
   * @swagger
   * /api/webhook/razorpay:
   *   post:
   *     summary: Razorpay webhook handler
   *     tags: [Webhook]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook processed
   */
  async handleWebhook(req, res, next) {
    try {
      console.log("reqBody",JSON.stringify(req.body));
      const signature = req.headers['x-razorpay-signature'];
      const payload = req.body;

      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing webhook signature'
        });
      }

      const result = await webhookService.processWebhook(payload, signature);

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Webhook processing error:', error.message);

      // Always return 200 to Razorpay
      res.status(200).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new WebhookController();
