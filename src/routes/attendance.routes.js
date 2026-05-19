const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AttendanceService = require('../services/attendance.service');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleError } = require('../utils/errors');

router.use(authMiddleware, requireRole('staff', 'admin'));

router.post('/', [
  body('booking_id').isInt({ min: 1 }).withMessage('Valid booking_id is required'),
  body('status').isIn(['present', 'absent']).withMessage('status must be "present" or "absent"'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.status(201).json(AttendanceService.markAttendance(req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

module.exports = router;
