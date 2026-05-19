require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth',        require('./routes/auth.routes'));
app.use('/api/members',     require('./routes/member.routes'));
app.use('/api/plans',       require('./routes/plan.routes'));
app.use('/api/memberships', require('./routes/membership.routes'));
app.use('/api/sessions',    require('./routes/session.routes'));
app.use('/api/bookings',    require('./routes/booking.routes'));
app.use('/api/attendance',  require('./routes/attendance.routes'));
app.use('/api/staff',       require('./routes/staff.routes'));
app.use('/api/reports',     require('./routes/report.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: true, message: 'Internal server error' });
});

module.exports = app;
