// src/controllers/reservationController.js
const reservationService = require('../services/reservationService');

class ReservationController {

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}:
   *   get:
   *     summary: Get reservation details
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: reservationId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Reservation details
   */
  async getReservation(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }
      const result = await reservationService.getReservation(hotelId, reservationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/deposit-folio:
   *   get:
   *     summary: Get deposit folio details
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *       - in: path
   *         name: reservationId
   *         required: true
   *     responses:
   *       200:
   *         description: Deposit folio data
   */
  async getDepositFolio(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }
      const result = await reservationService.getDepositFolio(hotelId, reservationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

    /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/checkout-folio:
   *   get:
   *     summary: Get deposit folio details
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *       - in: path
   *         name: reservationId
   *         required: true
   *     responses:
   *       200:
   *         description: Checkout folio data
   */
  async getCheckoutFolio(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }
      const result = await reservationService.getCheckoutFolio(hotelId, reservationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
  

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/complete:
   *   get:
   *     summary: Get complete reservation data
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *       - in: path
   *         name: reservationId
   *         required: true
   *     responses:
   *       200:
   *         description: Reservation + Deposit folio
   */
  async getCompleteReservationData(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }
      const result = await reservationService.getCompleteReservationData(hotelId, reservationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/deposit-payment:
   *   post:
   *     summary: Post deposit payment for a reservation
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: reservationId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: string
   *                 default: "1"
   *               paymentMethod:
   *                 type: string
   *                 default: "CA"
   *               folioWindowNo:
   *                 type: string
   *                 default: "1"
   *               depositPolicyId:
   *                 type: string
   *                 default: "1"
   *     responses:
   *       200:
   *         description: Deposit payment response
   */
  async postDepositPayment(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      const { amount = '1', paymentMethod = 'CA', folioWindowNo = '1', depositPolicyId = '1' } = req.body;

      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }

      const result = await reservationService.postDepositPayment({
        hotelId,
        reservationId,
        amount,
        paymentMethod,
        folioWindowNo,
        depositPolicyId
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/payment:
   *   post:
   *     summary: Post regular payment for a reservation
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: reservationId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: string
   *                 default: "1"
   *               paymentMethod:
   *                 type: string
   *                 default: "CA"
   *               folioWindowNo:
   *                 type: string
   *                 default: "1"
   *     responses:
   *       200:
   *         description: Payment response
   */
  async postPayment(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      const { amount = '1', paymentMethod = 'CA', folioWindowNo = '1' } = req.body;

      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }

      const result = await reservationService.postPayment({
        hotelId,
        reservationId,
        amount,
        paymentMethod,
        folioWindowNo
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/reservation/{hotelId}/{reservationId}/validate:
   *   get:
   *     summary: Validate reservation status
   *     tags: [Reservation]
   *     parameters:
   *       - in: path
   *         name: hotelId
   *         required: true
   *       - in: path
   *         name: reservationId
   *         required: true
   *     responses:
   *       200:
   *         description: Validation result
   */
  async validateReservation(req, res, next) {
    try {
      const { hotelId, reservationId } = req.params;
      if (!hotelId || !reservationId) {
        return res.status(400).json({ success: false, message: 'hotelId and reservationId are required' });
      }
      const result = await reservationService.validateReservation(hotelId, reservationId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}


module.exports = new ReservationController();
