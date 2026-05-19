const MembershipModel = require('../models/membership.model');
const SessionModel = require('../models/session.model');

function getMembershipReport() {
  const rows = MembershipModel.countByStatus();
  const report = { active: 0, expired: 0, total: 0 };
  rows.forEach(row => {
    report[row.status] = row.count;
    report.total += row.count;
  });
  return report;
}

function getSessionUtilizationReport() {
  return SessionModel.findAllWithUtilization().map(s => ({
    id: s.id,
    title: s.title,
    date_time: s.date_time,
    trainer: s.trainer,
    capacity: s.capacity,
    confirmed_bookings: s.confirmed_bookings,
    available_spots: s.capacity - s.confirmed_bookings,
    utilization_percent: s.capacity > 0
      ? Math.round((s.confirmed_bookings / s.capacity) * 100)
      : 0,
  }));
}

module.exports = { getMembershipReport, getSessionUtilizationReport };
