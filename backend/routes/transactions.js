const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;

    let sql = `
      SELECT 
        t.*,
        u.name as user_name,
        u.email as user_email,
        o.order_number
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      sql += ` AND t.type = $${paramCount++}`;
      params.push(type);
    }

    if (start_date) {
      sql += ` AND t.created_at >= $${paramCount++}`;
      params.push(start_date);
    }

    if (end_date) {
      sql += ` AND t.created_at <= $${paramCount++}`;
      params.push(end_date);
    }

    sql += ` ORDER BY t.created_at DESC`;

    const result = await query(sql, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/order/:orderId', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT t.*, u.name as user_name, o.order_number
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN orders o ON t.order_id = o.id
      WHERE t.order_id = $1
    `;
    const params = [req.params.orderId];

    if (req.user.role === 'customer') {
      sql += ` AND t.user_id = $2`;
      params.push(req.user.id);
    }

    const result = await query(sql, params);
    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

