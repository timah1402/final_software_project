const AttendanceModel = require('../models/attendance.model');
const BookingModel = require('../models/booking.model');
const SessionModel = require('../models/session.model');
const AuditLogModel = require('../models/auditLog.model');

function markAttendance({ booking_id, status }, staffId) {
  const booking = BookingModel.findById(booking_id);
  if (!booking) throw { status: 404, message: 'Booking not found' };

  if (booking.status === 'cancelled') {
    throw { status: 400, message: 'Cannot mark attendance for a cancelled booking' };
  }

  // Business Rule 8: attendance only for past sessions
  if (new Date(booking.date_time) > new Date()) {
    throw { status: 400, message: 'Cannot mark attendance for a session that has not yet occurred' };
  }

  if (AttendanceModel.findByBookingId(booking_id)) {
    throw { status: 409, message: 'Attendance has already been marked for this booking' };
  }

  const attendance = AttendanceModel.create({ booking_id, status });
  AuditLogModel.create({ staff_id: staffId, action: 'attendance_marked', target_table: 'ATTENDANCE_RECORD', target_id: attendance.id });
  return attendance;
}

function getAttendanceForSession(sessionId) {
  if (!SessionModel.findById(sessionId)) {
    throw { status: 404, message: 'Session not found' };
  }
  return AttendanceModel.findBySessionId(sessionId);
}

module.exports = { markAttendance, getAttendanceForSession };
