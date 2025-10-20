const express = require('express');
const router = express.Router();
const { login } = require('../middleware/auth');

// Login endpoint
router.post('/login', (req, res) => {
  console.log('Auth route hit:', req.body);
  login(req, res);
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful' });
});

module.exports = router;
