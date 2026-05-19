const express = require('express');
const router = express.Router();
const ReportService = require('../services/report.service');
const authMiddleware = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/role.middleware');
const { handleError } = require('../utils/errors');

router.use(authMiddleware, requireRole('staff', 'admin'));

router.get('/memberships', (req, res) => {
  try { res.json(ReportService.getMembershipReport()); }
  catch (err) { handleError(res, err); }
});

router.get('/sessions', (req, res) => {
  try { res.json(ReportService.getSessionUtilizationReport()); }
  catch (err) { handleError(res, err); }
});

module.exports = router;
