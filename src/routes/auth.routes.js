const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const StaffUserModel = require('../models/staffUser.model');

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: true, message: errors.array()[0].msg });
  }
  try {
    const { email, password } = req.body;
    const staff = StaffUserModel.findByEmail(email);
    if (!staff || !(await bcrypt.compare(password, staff.password_hash))) {
      return res.status(401).json({ error: true, message: 'Invalid email or password' });
    }
    const token = jwt.sign(
      { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: true, message: 'Login failed' });
  }
});

module.exports = router;
