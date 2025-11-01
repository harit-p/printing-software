const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Admin dashboard stats
router.get('/dashboard', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Total orders
    const ordersResult = await query(
      `SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'in_production' THEN 1 END) as in_production_orders,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COALESCE(SUM(total_amount), 0) as total_revenue
       FROM orders`
    );

    // Total customers
    const customersResult = await query(
      "SELECT COUNT(*) as total_customers FROM users WHERE role = 'customer'"
    );

    // Total products
    const productsResult = await query(
      'SELECT COUNT(*) as total_products FROM products WHERE is_active = true'
    );

    // Pending complaints
    const complaintsResult = await query(
      "SELECT COUNT(*) as pending_complaints FROM complaints WHERE status = 'open'"
    );

    // Recent orders
    const recentOrdersResult = await query(
      `SELECT o.*, u.name as customer_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Revenue chart data (last 30 days)
    const revenueChartResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders_count,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    res.json({
      stats: {
        orders: ordersResult.rows[0],
        customers: customersResult.rows[0],
        products: productsResult.rows[0],
        complaints: complaintsResult.rows[0],
      },
      recent_orders: recentOrdersResult.rows,
      revenue_chart: revenueChartResult.rows,
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

