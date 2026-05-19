const express = require('express');
const router = express.Router();
const MembershipService = require('../services/membership.service');
const authMiddleware = require('../middleware/auth.middleware');
const { handleError } = require('../utils/errors');

router.use(authMiddleware);

// PUT /api/memberships/:id/renew
router.put('/:id/renew', (req, res) => {
  try { res.json(MembershipService.renewMembership(+req.params.id, req.staff.id)); }
  catch (err) { handleError(res, err); }
});

module.exports = router;
