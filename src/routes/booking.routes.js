const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const BookingService = require('../services/booking.service');
const authMiddleware = require('../middleware/auth.middleware');
const { handleError } = require('../utils/errors');

router.use(authMiddleware);

router.post('/', [
  body('member_id').isInt({ min: 1 }).withMessage('Valid member_id is required'),
  body('session_id').isInt({ min: 1 }).withMessage('Valid session_id is required'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.status(201).json(BookingService.createBooking(req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

router.put('/:id/cancel', (req, res) => {
  try { res.json(BookingService.cancelBooking(+req.params.id, req.staff.id)); }
  catch (err) { handleError(res, err); }
});

module.exports = router;
