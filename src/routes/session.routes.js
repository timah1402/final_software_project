const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const SessionService = require('../services/session.service');
const AttendanceService = require('../services/attendance.service');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleError } = require('../utils/errors');

const validateSession = [
  body('title').notEmpty().withMessage('Title is required'),
  body('date_time').isISO8601().withMessage('date_time must be a valid ISO 8601 datetime'),
  body('capacity').isInt({ min: 1 }).withMessage('capacity must be a positive integer'),
];

router.use(authMiddleware);

router.get('/', (req, res) => {
  try { res.json(SessionService.getAllSessions()); }
  catch (err) { handleError(res, err); }
});

router.get('/:id', (req, res) => {
  try { res.json(SessionService.getSessionById(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

router.post('/', requireRole('staff', 'admin'), validateSession, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.status(201).json(SessionService.createSession(req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

router.put('/:id', requireRole('staff', 'admin'), validateSession, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.json(SessionService.updateSession(+req.params.id, req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

router.delete('/:id', requireRole('staff', 'admin'), (req, res) => {
  try { res.json(SessionService.deleteSession(+req.params.id, req.staff.id)); }
  catch (err) { handleError(res, err); }
});

// GET /api/sessions/:id/attendance
router.get('/:id/attendance', requireRole('staff', 'admin'), (req, res) => {
  try { res.json(AttendanceService.getAttendanceForSession(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

// GET /api/sessions/:id/bookings
router.get('/:id/bookings', requireRole('staff', 'admin'), (req, res) => {
  const BookingModel = require('../models/booking.model');
  try { res.json(BookingModel.findBySessionId(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

module.exports = router;
