const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        p.id, p.name, p.description, p.price, p.image_url, p.specifications,
        c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = true
       ORDER BY c.name, p.name`
    );

    res.json({ products: result.rows });
  } catch (error) {
    console.error('Get price list error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:productId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { price } = req.body;

    if (!price || price < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }

    const result = await query(
      `UPDATE products SET price = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [price, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product: result.rows[0] });
  } catch (error) {
    console.error('Update price error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

