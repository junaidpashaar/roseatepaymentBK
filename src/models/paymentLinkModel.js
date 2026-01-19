// src/models/paymentLinkModel.js
const { pool } = require('../config/database');

class PaymentLinkModel {
  // Create new payment link record
  static async create(data) {
    const { payment_link_id, customer_name, customer_email, customer_phone, amount, currency, description, short_url,hotelId,reservationId } = data;
    
    const query = `
      INSERT INTO payment_links 
      (payment_link_id, customer_name, customer_email, customer_phone, amount, currency, description, short_url,hotelId, reservationId, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,?,?, 'created')
    `;
    
    const [result] = await pool.query(query, [
      payment_link_id,
      customer_name,
      customer_email || null,
      customer_phone || null,
      amount,
      currency,
      description || null,
      short_url,
      hotelId,
      reservationId
    ]);
    
    return result;
  }

  // Find payment link by ID
  static async findById(payment_link_id) {
    const query = 'SELECT * FROM payment_links WHERE payment_link_id = ?';
    const [rows] = await pool.query(query, [payment_link_id]);
    return rows[0];
  }

  // Update payment link status
  static async updateStatus(payment_link_id, status) {
    const query = 'UPDATE payment_links SET status = ?, updated_at = NOW() WHERE payment_link_id = ?';
    const [result] = await pool.query(query, [status, payment_link_id]);
    return result;
  }

  // Get all payment links with pagination
  static async findAll(limit = 50, offset = 0) {
    const query = 'SELECT * FROM payment_links ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }

  // Get payment links by status
  static async findByStatus(status) {
    const query = 'SELECT * FROM payment_links WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await pool.query(query, [status]);
    return rows;
  }

  // Get payment links by customer email
  static async findByEmail(email) {
    const query = 'SELECT * FROM payment_links WHERE customer_email = ? ORDER BY created_at DESC';
    const [rows] = await pool.query(query, [email]);
    return rows;
  }

  // Delete payment link
  static async delete(payment_link_id) {
    const query = 'DELETE FROM payment_links WHERE payment_link_id = ?';
    const [result] = await pool.query(query, [payment_link_id]);
    return result;
  }
}

module.exports = PaymentLinkModel;