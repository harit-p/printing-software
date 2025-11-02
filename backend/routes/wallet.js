const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { authenticate, authorizeCustomer } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', authenticate, authorizeCustomer, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM wallets WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const newWallet = await query(
        'INSERT INTO wallets (user_id, balance, created_at) VALUES ($1, 0, NOW()) RETURNING *',
        [req.user.id]
      );
      return res.json({ wallet: newWallet.rows[0] });
    }

    res.json({ wallet: result.rows[0] });
  } catch (error) {
    console.error('Get wallet error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/add-money', authenticate, authorizeCustomer, [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1'),
  body('payment_method').notEmpty().withMessage('Payment method is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, payment_method } = req.body;
    const user_id = req.user.id;

    let walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [user_id]);
    if (walletResult.rows.length === 0) {
      await query(
        'INSERT INTO wallets (user_id, balance, created_at) VALUES ($1, 0, NOW())',
        [user_id]
      );
      walletResult = await query('SELECT * FROM wallets WHERE user_id = $1', [user_id]);
    }

    await query(
      'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2',
      [amount, user_id]
    );

    const transactionResult = await query(
      `INSERT INTO transactions (user_id, type, amount, description, payment_method, created_at)
       VALUES ($1, 'credit', $2, $3, $4, NOW())
       RETURNING *`,
      [user_id, amount, `Wallet top-up via ${payment_method}`, payment_method]
    );

    const upiId = `printing-software@pay`;
    const transactionId = `TXN${Date.now()}`;

    res.json({
      message: 'Money added to wallet',
      transaction: transactionResult.rows[0],
      upi_payment: {
        upi_id: upiId,
        amount: amount,
        transaction_id: transactionId,
        status: payment_method === 'upi' ? 'pending' : 'completed',
      },
    });
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/transactions', authenticate, authorizeCustomer, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM transactions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

