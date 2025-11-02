const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeCustomer } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', authenticate, authorizeCustomer, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, p.name as product_name, p.price, p.image_url, p.specifications
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    let total = 0;
    result.rows.forEach(item => {
      total += parseFloat(item.price) * item.quantity;
    });

    res.json({
      items: result.rows,
      total: total.toFixed(2),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorizeCustomer, [
  body('product_id').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { product_id, quantity, specifications } = req.body;
    const user_id = req.user.id;

    const productCheck = await query('SELECT * FROM products WHERE id = $1 AND is_active = true', [product_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const existingItem = await query(
      'SELECT * FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [user_id, product_id]
    );

    if (existingItem.rows.length > 0) {
      const result = await query(
        `UPDATE cart_items 
         SET quantity = quantity + $1, specifications = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [quantity, JSON.stringify(specifications || {}), existingItem.rows[0].id]
      );
      return res.json({ item: result.rows[0] });
    }

    const result = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity, specifications, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [user_id, product_id, quantity, JSON.stringify(specifications || {})]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, authorizeCustomer, async (req, res) => {
  try {
    const { quantity, specifications } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (quantity !== undefined) {
      updates.push(`quantity = $${paramCount++}`);
      values.push(quantity);
    }
    if (specifications !== undefined) {
      updates.push(`specifications = $${paramCount++}`);
      values.push(JSON.stringify(specifications));
    }

    values.push(req.params.id, req.user.id);

    const result = await query(
      `UPDATE cart_items SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ item: result.rows[0] });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorizeCustomer, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/', authenticate, authorizeCustomer, async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

