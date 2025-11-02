const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.company, u.address, u.created_at,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total_amount), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      WHERE u.role = 'customer'
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      sql += ` AND (u.name ILIKE $${paramCount++} OR u.email ILIKE $${paramCount++} OR u.phone ILIKE $${paramCount++})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await query(sql, params);
    res.json({ customers: result.rows });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const customerResult = await query(
      `SELECT id, name, email, phone, company, address, created_at
       FROM users
       WHERE id = $1 AND role = 'customer'`,
      [req.params.id]
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = customerResult.rows[0];

    const statsResult = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COALESCE(SUM(total_amount), 0) as total_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
       FROM orders
       WHERE user_id = $1`,
      [req.params.id]
    );

    customer.stats = statsResult.rows[0];

    const ordersResult = await query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.params.id]
    );

    customer.recent_orders = ordersResult.rows;

    res.json({ customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

