// src/services/reservationService.js
const axios = require('axios');
const hotelApiConfig = require('../config/hotelApi');
const authService = require('./authService');

class ReservationService {
  /**
   * Get reservation details
   */
  async getReservation(hotelId, reservationId) {
    try {
      const token = await authService.getAccessToken();
      const url = `${hotelApiConfig.baseUrl}/rsv/v1/hotels/${hotelId}/reservations/${reservationId}?fetchInstructions=Reservation`;

      const headers = {
        'Content-Type': 'application/json',
        'x-hotelid': hotelId,
        'x-app-key': hotelApiConfig.appKey,
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(url, { headers });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get reservation error:', error.response?.data || error.message);
      
      // Handle 401 - token might be expired
      if (error.response?.status === 401) {
        authService.clearToken();
        throw new Error('Authentication failed, please try again');
      }

      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.title || 
        'Failed to fetch reservation details'
      );
    }
  }

  /**
   * Get deposit folio information
   */
  async getDepositFolio(hotelId, reservationId) {
    try {
      const token = await authService.getAccessToken();
      const url = `${hotelApiConfig.baseUrl}/csh/v1/hotels/${hotelId}/depositFolio?id=${reservationId}&fetchInstructions=ProjectedRevenue`;

      const headers = {
        'Content-Type': 'application/json',
        'x-hotelid': hotelId,
        'x-app-key': hotelApiConfig.appKey,
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(url, { headers });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get deposit folio error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        authService.clearToken();
        throw new Error('Authentication failed, please try again');
      }

      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.title || 
        'Failed to fetch deposit folio'
      );
    }
  }

  /**
   * Get checkout folio information
   */
  async getCheckoutFolio(hotelId, reservationId) {
    try {
      const token = await authService.getAccessToken();
      const url = `${hotelApiConfig.baseUrl}/csh/v1/hotels/${hotelId}/reservations/${reservationId}/folios?folioWindowNo=1&limit=50&fetchInstructions=Postings&fetchInstructions=Totalbalance&fetchInstructions=Transactioncodes&fetchInstructions=Windowbalances`;

      const headers = {
        'Content-Type': 'application/json',
        'x-hotelid': hotelId,
        'x-app-key': hotelApiConfig.appKey,
        'Authorization': `Bearer ${token}`
      };

      const response = await axios.get(url, { headers });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Get deposit folio error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        authService.clearToken();
        throw new Error('Authentication failed, please try again');
      }

      throw new Error(
        error.response?.data?.detail || 
        error.response?.data?.title || 
        'Failed to fetch deposit folio'
      );
    }
  }

  /**
   * Get complete reservation data (reservation + deposit folio)
   */
  async getCompleteReservationData(hotelId, reservationId) {
    try {
      // Fetch both in parallel
      const [reservationResult, depositFolioResult] = await Promise.all([
        this.getReservation(hotelId, reservationId),
        this.getDepositFolio(hotelId, reservationId)
      ]);

      return {
        success: true,
        data: {
          reservation: reservationResult.data,
          depositFolio: depositFolioResult.data
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Post deposit payment
   */
  async postDepositPayment({
    hotelId = '1',
    reservationId = '1',
    amount = '1',
    paymentMethod = 'CA',
    folioWindowNo = '1',
    depositPolicyId = '1'
  }) {
    try {
      const token = await authService.getAccessToken();
      const url = `${hotelApiConfig.baseUrl}/csh/v1/hotels/${hotelId}/reservations/${reservationId}/depositPayments`;

      const headers = {
        'Content-Type': 'application/json',
        'x-hotelid': hotelId,
        'x-app-key': hotelApiConfig.appKey,
        'Authorization': `Bearer ${token}`
      };

      const payload = {
        criteria: {
          reservationId: { type: 'Reservation', id: reservationId },
          guaranteeCode: 'GDP',
          depositPolicyId: { type: 'PolicyScheduleId', id: depositPolicyId },
          updateReservationPaymentMethod: false,
          hotelId,
          paymentMethod: { paymentMethod, folioView: folioWindowNo },
          postingReference: 'TransactionId',
          postingAmount: { amount, currencyCode: 'INR' },
          comments: 'PaymentGateway Reference#',
          applyCCSurcharge: false,
          overrideInsufficientCC: false,
          overrideARCreditLimit: false,
          cashierId: '1',
          folioWindowNo
        }
      };

      const response = await axios.post(url, payload, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Post deposit payment error:', error.response?.data || error.message);
      if (error.response?.status === 401) authService.clearToken();
      throw new Error(error.response?.data?.detail || error.response?.data?.title || 'Failed to post deposit payment');
    }
  }

  /**
   * Post regular payment
   */
  async postPayment({
    hotelId = '1',
    reservationId = '1',
    amount = '1',
    paymentMethod = 'CA',
    folioWindowNo = '1'
  }) {
    try {
      const url = `${hotelApiConfig.baseUrl}/csh/v1/hotels/${hotelId}/reservations/${reservationId}/payments`;
      const token = await authService.getAccessToken();
      const headers = {
        'Content-Type': 'application/json',
        'x-hotelid': hotelId,
        'x-app-key': hotelApiConfig.appKey,
        'Authorization': `Bearer ${token}`
      };

      const payload = {
        criteria: {
          overrideInsufficientCC: false,
          applyCCSurcharge: false,
          vATOffset: false,
          reservationId: { id: reservationId, idContext: 'OPERA', type: 'Reservation' },
          paymentMethod: { paymentMethod },
          postingReference: 'PaymentGateway Reference#',
          postingAmount: { amount, currencyCode: 'INR' },
          cashierId: 1,
          hotelId,
          folioWindowNo,
          overrideARCreditLimit: false
        }
      };

      const response = await axios.post(url, payload, { headers });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Post payment error:', error.response?.data || error.message);
      if (error.response?.status === 401) authService.clearToken();
      throw new Error(error.response?.data?.detail || error.response?.data?.title || 'Failed to post payment');
    }
  }

  /**
   * Validate reservation status
   */
  async validateReservation(hotelId, reservationId) {
    try {
      const result = await this.getReservation(hotelId, reservationId);
      
      if (!result.data?.reservations?.reservation?.[0]) {
        return {
          valid: false,
          message: 'Reservation not found'
        };
      }

      const reservation = result.data.reservations.reservation[0];
      const status = reservation.reservationStatus;

      if (status === 'Cancel' || status === 'Cancelled') {
        return {
          valid: false,
          message: 'This reservation has been cancelled'
        };
      }

      return {
        valid: true,
        status: status,
        reservation: reservation
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReservationService();