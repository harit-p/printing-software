const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin, authorizeCustomer } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (req.user.role === 'customer') {
      sql += ` AND o.user_id = $${paramCount++}`;
      params.push(req.user.id);
    }

    if (req.user.role === 'admin' && req.query.status) {
      sql += ` AND o.status = $${paramCount++}`;
      params.push(req.query.status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const result = await query(sql, params);

    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const items = await query(
          `SELECT oi.*, p.name as product_name, p.image_url
           FROM order_items oi
           JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return { ...order, items: items.rows };
      })
    );

    res.json({ orders: ordersWithItems });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    let sql = `
      SELECT o.*, u.name as customer_name, u.email as customer_email, u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `;
    const params = [req.params.id];

    if (req.user.role === 'customer') {
      sql += ` AND o.user_id = $2`;
      params.push(req.user.id);
    }

    const orderResult = await query(sql, params);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await query(
      `SELECT oi.*, p.name as product_name, p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [order.id]
    );

    order.items = itemsResult.rows;

    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorizeCustomer, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, payment_method, notes, address } = req.body;
    const user_id = req.user.id;

    let cartItems = [];
    if (items && items.length > 0) {
      cartItems = items;
    } else {
      const cartResult = await query(
        'SELECT * FROM cart_items WHERE user_id = $1',
        [user_id]
      );
      cartItems = cartResult.rows;
    }

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      const productResult = await query('SELECT * FROM products WHERE id = $1', [cartItem.product_id]);
      if (productResult.rows.length === 0) {
        continue;
      }
      const product = productResult.rows[0];
      const itemTotal = parseFloat(product.price) * cartItem.quantity;
      total += itemTotal;

      orderItems.push({
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        price: product.price,
        total: itemTotal,
        specifications: cartItem.specifications,
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const orderResult = await query(
      `INSERT INTO orders (order_number, user_id, total_amount, status, payment_status, payment_method, notes, shipping_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [
        orderNumber,
        user_id,
        total.toFixed(2),
        'pending',
        payment_method === 'wallet' ? 'paid' : 'pending',
        payment_method,
        notes || null,
        address || null,
      ]
    );

    const order = orderResult.rows[0];

    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, total, specifications, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          order.id,
          item.product_id,
          item.quantity,
          item.price,
          item.total,
          typeof item.specifications === 'string' ? item.specifications : JSON.stringify(item.specifications || {}),
        ]
      );
    }

    if (payment_method === 'wallet') {
      const walletResult = await query('SELECT balance FROM wallets WHERE user_id = $1', [user_id]);
      if (walletResult.rows.length > 0) {
        const currentBalance = parseFloat(walletResult.rows[0].balance);
        if (currentBalance >= total) {
          await query(
            'UPDATE wallets SET balance = balance - $1 WHERE user_id = $2',
            [total, user_id]
          );

          await query(
            `INSERT INTO transactions (user_id, order_id, type, amount, description, created_at)
             VALUES ($1, $2, 'debit', $3, $4, NOW())`,
            [user_id, order.id, total, `Payment for order ${orderNumber}`]
          );
        } else {
          await query('UPDATE orders SET payment_status = $1 WHERE id = $2', ['failed', order.id]);
          return res.status(400).json({ error: 'Insufficient wallet balance' });
        }
      }
    }

    await query('DELETE FROM cart_items WHERE user_id = $1', [user_id]);

    res.status(201).json({ order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id/status', authenticate, authorizeAdmin, [
  body('status').isIn(['pending', 'confirmed', 'in_production', 'completed', 'cancelled']).withMessage('Invalid status'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    const result = await query(
      `UPDATE orders SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

