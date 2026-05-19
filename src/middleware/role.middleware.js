function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.staff) {
      return res.status(401).json({ error: true, message: 'Not authenticated' });
    }
    if (!roles.includes(req.staff.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
}

module.exports = { requireRole };
