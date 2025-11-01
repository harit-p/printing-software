const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all products (Customer & Admin)
router.get('/', async (req, res) => {
  try {
    const { category_id, search, min_price, max_price } = req.query;
    
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (category_id) {
      sql += ` AND p.category_id = $${paramCount++}`;
      params.push(category_id);
    }

    if (search) {
      sql += ` AND (p.name ILIKE $${paramCount++} OR p.description ILIKE $${paramCount++})`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    if (min_price) {
      sql += ` AND p.price >= $${paramCount++}`;
      params.push(min_price);
    }

    if (max_price) {
      sql += ` AND p.price <= $${paramCount++}`;
      params.push(max_price);
    }

    sql += ` AND p.is_active = true ORDER BY p.created_at DESC`;

    const result = await query(sql, params);
    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product (Admin only)
router.post('/', authenticate, authorizeAdmin, [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('description').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      category_id,
      description,
      price,
      image_url,
      specifications,
      is_active
    } = req.body;

    const result = await query(
      `INSERT INTO products (name, category_id, description, price, image_url, specifications, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        name,
        category_id,
        description || null,
        price,
        image_url || null,
        JSON.stringify(specifications || {}),
        is_active !== false
      ]
    );

    res.status(201).json({ product: result.rows[0] });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update product (Admin only)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const {
      name,
      category_id,
      description,
      price,
      image_url,
      specifications,
      is_active
    } = req.body;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (category_id) {
      updates.push(`category_id = $${paramCount++}`);
      values.push(category_id);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (price !== undefined) {
      updates.push(`price = $${paramCount++}`);
      values.push(price);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (specifications !== undefined) {
      updates.push(`specifications = $${paramCount++}`);
      values.push(JSON.stringify(specifications));
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE products SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Check if product is in any orders
    const ordersCheck = await query(
      'SELECT COUNT(*) FROM order_items WHERE product_id = $1',
      [req.params.id]
    );

    if (parseInt(ordersCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete product with existing orders' });
    }

    await query('DELETE FROM products WHERE id = $1', [req.params.id]);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

