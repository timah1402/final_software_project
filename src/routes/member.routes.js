const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MemberService = require('../services/member.service');
const MembershipService = require('../services/membership.service');
const BookingService = require('../services/booking.service');
const authMiddleware = require('../middleware/auth.middleware');
const { handleError } = require('../utils/errors');

const validateMember = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
];

router.use(authMiddleware);

router.get('/', (req, res) => {
  try { res.json(MemberService.getAllMembers()); }
  catch (err) { handleError(res, err); }
});

router.get('/:id', (req, res) => {
  try { res.json(MemberService.getMemberById(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

router.post('/', validateMember, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.status(201).json(MemberService.createMember(req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

router.put('/:id', validateMember, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.json(MemberService.updateMember(+req.params.id, req.body, req.staff.id));
  } catch (err) { handleError(res, err); }
});

router.delete('/:id', (req, res) => {
  try { res.json(MemberService.deleteMember(+req.params.id, req.staff.id)); }
  catch (err) { handleError(res, err); }
});

// Nested: GET /members/:id/memberships and POST /members/:id/memberships
router.get('/:id/memberships', (req, res) => {
  try { res.json(MembershipService.getMembershipsForMember(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

router.post('/:id/memberships', [
  body('plan_id').isInt({ min: 1 }).withMessage('Valid plan_id is required'),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    res.status(201).json(
      MembershipService.assignMembership({ member_id: +req.params.id, plan_id: req.body.plan_id }, req.staff.id)
    );
  } catch (err) { handleError(res, err); }
});

// Nested: GET /members/:id/bookings
router.get('/:id/bookings', (req, res) => {
  try { res.json(BookingService.getBookingsForMember(+req.params.id)); }
  catch (err) { handleError(res, err); }
});

module.exports = router;
