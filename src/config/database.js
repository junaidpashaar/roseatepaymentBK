// src/config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'razorpay_payments',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
const initDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Payment Links Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_link_id VARCHAR(255) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255),
        customer_phone VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        description TEXT,
        short_url TEXT,
        status VARCHAR(50) DEFAULT 'created',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_payment_link_id (payment_link_id),
        INDEX idx_status (status)
      )
    `);

    // Transaction History Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS transaction_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_link_id VARCHAR(255),
        payment_id VARCHAR(255),
        order_id VARCHAR(255),
        signature VARCHAR(500),
        amount DECIMAL(10, 2),
        currency VARCHAR(10),
        status VARCHAR(50),
        method VARCHAR(50),
        email VARCHAR(255),
        contact VARCHAR(20),
        error_code VARCHAR(100),
        error_description TEXT,
        webhook_payload JSON,
        deposit_api_calls TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_payment_link_id (payment_link_id),
        INDEX idx_payment_id (payment_id),
        INDEX idx_status (status),
        FOREIGN KEY (payment_link_id) REFERENCES payment_links(payment_link_id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('✓ Database tables initialized successfully');
  } catch (error) {
    console.error('✗ Database initialization error:', error.message);
    throw error;
  }
};

module.exports = { pool, initDatabase };