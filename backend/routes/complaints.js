const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all complaints
router.get('/', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT c.*, u.name as customer_name, o.order_number
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN orders o ON c.order_id = o.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Customer can only see their complaints
    if (req.user.role === 'customer') {
      sql += ` AND c.user_id = $${paramCount++}`;
      params.push(req.user.id);
    }

    // Status filter
    if (req.query.status) {
      sql += ` AND c.status = $${paramCount++}`;
      params.push(req.query.status);
    }

    sql += ` ORDER BY c.created_at DESC`;

    const result = await query(sql, params);
    res.json({ complaints: result.rows });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get complaint by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT c.*, u.name as customer_name, u.email as customer_email, o.order_number
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN orders o ON c.order_id = o.id
      WHERE c.id = $1
    `;
    const params = [req.params.id];

    if (req.user.role === 'customer') {
      sql += ` AND c.user_id = $2`;
      params.push(req.user.id);
    }

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create complaint (Customer only)
router.post('/', authenticate, [
  body('subject').notEmpty().trim().withMessage('Subject is required'),
  body('description').notEmpty().trim().withMessage('Description is required'),
  body('order_id').optional({ nullable: true, checkFalsy: true }).isInt().withMessage('Order ID must be a valid number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { subject, description, order_id } = req.body;
    const user_id = req.user.id;

    // Verify order belongs to user if provided
    if (order_id) {
      const orderCheck = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [order_id, user_id]);
      if (orderCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }
    }

    const complaintNumber = `COMP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const result = await query(
      `INSERT INTO complaints (complaint_number, user_id, order_id, subject, description, status, created_at)
       VALUES ($1, $2, $3, $4, $5, 'open', NOW())
       RETURNING *`,
      [complaintNumber, user_id, order_id || null, subject, description]
    );

    res.status(201).json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update complaint status (Admin only)
router.put('/:id/status', authenticate, [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed']).withMessage('Invalid status'),
  body('response').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, response } = req.body;

    const updates = ['status = $1'];
    const values = [status];
    let paramCount = 2;

    if (response) {
      updates.push(`response = $${paramCount++}`);
      values.push(response);
    }

    values.push(req.params.id);

    const result = await query(
      `UPDATE complaints SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.json({ complaint: result.rows[0] });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

