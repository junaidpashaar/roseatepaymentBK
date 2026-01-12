// src/controllers/paymentController.js
const paymentService = require('../services/paymentService');

class PaymentController {

  
  /**
   * @swagger
   * /api/payment/generateDepositPaymentLink:
   *   post:
   *     summary: Create a generateDepositPaymentLink
   *     tags: [Payment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - amount
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               amount:
   *                 type: number
   *               currency:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment link created successfully
   */
  async generateDepositPaymentLink(req, res, next) {
    try {
      let body = { name:req?.body?.hotelId, reservationId:req?.body?.reservationId, type:req?.body?.type, amount:req?.body?.amount, description:req?.body?.policyIds,info:JSON.stringify(req.body) };
      const result = await paymentService.createPaymentLink(body);
      res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

    /**
   * @swagger
   * /api/payment/generateAdhocPaymentLink:
   *   post:
   *     summary: Create a generateAdhocPaymentLink
   *     tags: [Payment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - amount
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               amount:
   *                 type: number
   *               currency:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment link created successfully
   */
  async generateAdhocPaymentLink(req, res, next) {
    try {
      let body = { name:req?.body?.hotelId, reservationId:req?.body?.reservationId, type:req?.body?.type, amount:req?.body?.amount, description:req?.body?.policyIds,info:JSON.stringify(req.body) };
      const result = await paymentService.createPaymentLink(body);
      res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }


    /**
   * @swagger
   * /api/payment/generateFolioPaymentLink:
   *   post:
   *     summary: Create a generateFolioPaymentLink
   *     tags: [Payment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - amount
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               amount:
   *                 type: number
   *               currency:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment link created successfully
   */
  async generateFolioPaymentLink(req, res, next) {
    try {
      let body = { name:req?.body?.hotelId, reservationId:req?.body?.reservationId, type:req?.body?.type, amount:req?.body?.amount, description:req?.body?.policyIds,info:JSON.stringify(req.body) };
      const result = await paymentService.createPaymentLink(body);
      res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/create:
   *   post:
   *     summary: Create a payment link
   *     tags: [Payment]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - amount
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               phone:
   *                 type: string
   *               amount:
   *                 type: number
   *               currency:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Payment link created successfully
   */
  async createPaymentLink(req, res, next) {
    try {
      const result = await paymentService.createPaymentLink(req.body);
      res.status(201).json({
        success: true,
        message: 'Payment link created successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/links/{id}:
   *   get:
   *     summary: Get payment link by ID
   *     tags: [Payment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment link details
   */
  async getPaymentLink(req, res, next) {
    try {
      const { id } = req.params;
      const paymentLink = await paymentService.getPaymentLinkById(id);
      res.json({ success: true, data: paymentLink });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/links:
   *   get:
   *     summary: Get all payment links
   *     tags: [Payment]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: List of payment links
   */
  async getAllPaymentLinks(req, res, next) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const paymentLinks = await paymentService.getAllPaymentLinks(
        parseInt(limit),
        parseInt(offset)
      );
      res.json({ success: true, count: paymentLinks.length, data: paymentLinks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/links/status/{status}:
   *   get:
   *     summary: Get payment links by status
   *     tags: [Payment]
   *     parameters:
   *       - in: path
   *         name: status
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Filtered payment links
   */
  async getPaymentLinksByStatus(req, res, next) {
    try {
      const { status } = req.params;
      const paymentLinks = await paymentService.getPaymentLinksByStatus(status);
      res.json({ success: true, count: paymentLinks.length, data: paymentLinks });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/links/{id}/transactions:
   *   get:
   *     summary: Get transactions by payment link
   *     tags: [Payment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Transactions list
   */
  async getTransactionsByPaymentLink(req, res, next) {
    try {
      const { id } = req.params;
      const transactions = await paymentService.getTransactionsByPaymentLink(id);
      res.json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/transactions:
   *   get:
   *     summary: Get all transactions
   *     tags: [Payment]
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: number
   *       - in: query
   *         name: offset
   *         schema:
   *           type: number
   *     responses:
   *       200:
   *         description: Transactions list
   */
  async getAllTransactions(req, res, next) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      const transactions = await paymentService.getAllTransactions(
        parseInt(limit),
        parseInt(offset)
      );
      res.json({ success: true, count: transactions.length, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/transactions/stats:
   *   get:
   *     summary: Get transaction statistics
   *     tags: [Payment]
   *     responses:
   *       200:
   *         description: Transaction statistics
   */
  async getTransactionStats(req, res, next) {
    try {
      const stats = await paymentService.getTransactionStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/links/{id}/cancel:
   *   post:
   *     summary: Cancel payment link
   *     tags: [Payment]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment link cancelled
   */
  async cancelPaymentLink(req, res, next) {
    try {
      const { id } = req.params;
      const result = await paymentService.cancelPaymentLink(id);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/payment/success:
   *   get:
   *     summary: Payment success callback page
   *     tags: [Payment]
   *     parameters:
   *       - in: query
   *         name: razorpay_payment_id
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Payment success HTML page
   */
  paymentSuccessPage(req, res) {
    const { razorpay_payment_id } = req.query;
    res.send(`<html>Payment Success: ${razorpay_payment_id || ''}</html>`);
  }
}

module.exports = new PaymentController();
