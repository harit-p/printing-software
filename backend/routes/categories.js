const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, slug, parent_id, level, image_url, is_active, created_at
       FROM categories
       ORDER BY level, parent_id, name
      `
    );

    const buildHierarchy = (items, parentId = null, level = 0) => {
      return items
        .filter(item => item.parent_id === parentId)
        .map(item => ({
          ...item,
          children: buildHierarchy(items, item.id, level + 1),
        }));
    };

    const categories = buildHierarchy(result.rows);

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM categories WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, authorizeAdmin, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('parent_id').optional().isInt(),
  body('level').isInt({ min: 1, max: 4 }).withMessage('Level must be between 1 and 4'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, parent_id, level, image_url, is_active } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    if (parent_id) {
      const parentCheck = await query('SELECT * FROM categories WHERE id = $1', [parent_id]);
      if (parentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Parent category not found' });
      }
    }

    const result = await query(
      `INSERT INTO categories (name, slug, parent_id, level, image_url, is_active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [name, slug, parent_id || null, level, image_url || null, is_active !== false]
    );

    res.status(201).json({ category: result.rows[0] });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, parent_id, level, image_url, is_active } = req.body;
    const slug = name ? name.toLowerCase().replace(/\s+/g, '-') : undefined;

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
      updates.push(`slug = $${paramCount++}`);
      values.push(slug);
    }
    if (parent_id !== undefined) {
      updates.push(`parent_id = $${paramCount++}`);
      values.push(parent_id);
    }
    if (level !== undefined) {
      updates.push(`level = $${paramCount++}`);
      values.push(level);
    }
    if (image_url !== undefined) {
      updates.push(`image_url = $${paramCount++}`);
      values.push(image_url);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }

    values.push(req.params.id);
    const result = await query(
      `UPDATE categories SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const childrenCheck = await query(
      'SELECT COUNT(*) FROM categories WHERE parent_id = $1',
      [req.params.id]
    );

    if (parseInt(childrenCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with subcategories' });
    }

    const productsCheck = await query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [req.params.id]
    );

    if (parseInt(productsCheck.rows[0].count) > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products' });
    }

    await query('DELETE FROM categories WHERE id = $1', [req.params.id]);

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

