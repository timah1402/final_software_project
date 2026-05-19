const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MembershipPlanModel = require('../models/membershipPlan.model');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleError } = require('../utils/errors');

const validatePlan = [
  body('name').notEmpty().withMessage('Plan name is required'),
  body('duration_days').isInt({ min: 1 }).withMessage('duration_days must be a positive integer'),
  body('price').isFloat({ min: 0 }).withMessage('price must be a non-negative number'),
];

router.use(authMiddleware);

router.get('/', (req, res) => {
  try { res.json(MembershipPlanModel.findAll()); }
  catch (err) { handleError(res, err); }
});

router.post('/', requireRole('admin'), validatePlan, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try { res.status(201).json(MembershipPlanModel.create(req.body)); }
  catch (err) { handleError(res, err); }
});

router.put('/:id', requireRole('admin'), validatePlan, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: true, message: errors.array()[0].msg });
  try {
    if (!MembershipPlanModel.findById(+req.params.id)) {
      return res.status(404).json({ error: true, message: 'Plan not found' });
    }
    res.json(MembershipPlanModel.update(+req.params.id, req.body));
  } catch (err) { handleError(res, err); }
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  try {
    if (!MembershipPlanModel.findById(+req.params.id)) {
      return res.status(404).json({ error: true, message: 'Plan not found' });
    }
    MembershipPlanModel.remove(+req.params.id);
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) { handleError(res, err); }
});

module.exports = router;
