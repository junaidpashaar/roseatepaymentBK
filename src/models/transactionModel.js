// src/models/transactionModel.js
const { pool } = require('../config/database');

class TransactionModel {
  // Create new transaction record
  static async create(data) {
    const {
      payment_link_id,
      payment_id,
      order_id,
      signature,
      amount,
      currency,
      status,
      method,
      email,
      contact,
      error_code,
      error_description,
      webhook_payload
    } = data;

    const query = `
      INSERT INTO transaction_history 
      (payment_link_id, payment_id, order_id, signature, amount, currency, status, method, email, contact, error_code, error_description, webhook_payload) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(query, [
      payment_link_id || null,
      payment_id || null,
      order_id || null,
      signature || null,
      amount,
      currency,
      status,
      method || null,
      email || null,
      contact || null,
      error_code || null,
      error_description || null,
      webhook_payload ? JSON.stringify(webhook_payload) : null
    ]);

    return result;
  }

  // Find transaction by payment ID
  static async findByPaymentId(payment_id) {
    const query = 'SELECT * FROM transaction_history WHERE payment_id = ?';
    const [rows] = await pool.query(query, [payment_id]);
    return rows[0];
  }

  // Find transactions by payment link ID
  static async findByPaymentLinkId(payment_link_id) {
    const query = 'SELECT * FROM transaction_history WHERE payment_link_id = ? ORDER BY created_at DESC';
    const [rows] = await pool.query(query, [payment_link_id]);
    return rows;
  }

  // Get all transactions with pagination
  static async findAll(limit = 100, offset = 0) {
    const query = 'SELECT * FROM transaction_history ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const [rows] = await pool.query(query, [limit, offset]);
    return rows;
  }

  // Get transactions by status
  static async findByStatus(status) {
    const query = 'SELECT * FROM transaction_history WHERE status = ? ORDER BY created_at DESC';
    const [rows] = await pool.query(query, [status]);
    return rows;
  }

  // Get successful transactions
  static async getSuccessfulTransactions(limit = 50) {
    const query = `
      SELECT * FROM transaction_history 
      WHERE status = 'success' 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [limit]);
    return rows;
  }

  // Get failed transactions
  static async getFailedTransactions(limit = 50) {
    const query = `
      SELECT * FROM transaction_history 
      WHERE status = 'failed' 
      ORDER BY created_at DESC 
      LIMIT ?
    `;
    const [rows] = await pool.query(query, [limit]);
    return rows;
  }

  // Get transaction statistics
  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_transactions,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END) as total_amount
      FROM transaction_history
    `;
    const [rows] = await pool.query(query);
    return rows[0];
  }
}

module.exports = TransactionModel;