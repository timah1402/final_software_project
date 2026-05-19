const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const StaffUserModel = require('../models/staffUser.model');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleError } = require('../utils/errors');

router.use(authMiddleware, requireRole('admin'));

router.get('/', (req, res) => {
  try { res.json(StaffUserModel.findAll()); }
  catch (err) { handleError(res, err); }
});

router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['staff', 'admin']).withMessage('Role must be staff or admin'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    const existing = StaffUserModel.findByEmail(req.body.email);
    if (existing) return res.status(409).json({ error: true, message: 'Email already in use' });
    const password_hash = await bcrypt.hash(req.body.password, 10);
    const staff = StaffUserModel.create({ ...req.body, password_hash });
    res.status(201).json(staff);
  } catch (err) { handleError(res, err); }
});

router.delete('/:id', (req, res) => {
  try {
    const id = +req.params.id;
    if (id === req.staff.id) return res.status(400).json({ error: true, message: 'Cannot delete your own account' });
    if (!StaffUserModel.findById(id)) return res.status(404).json({ error: true, message: 'Staff not found' });
    StaffUserModel.remove(id);
    res.json({ message: 'Staff account deleted' });
  } catch (err) { handleError(res, err); }
});

module.exports = router;
