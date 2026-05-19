const BookingModel = require('../models/booking.model');
const SessionModel = require('../models/session.model');
const MemberModel = require('../models/member.model');
const MembershipService = require('./membership.service');
const AuditLogModel = require('../models/auditLog.model');

function getBookingsForMember(memberId) {
  if (!MemberModel.findById(memberId)) {
    throw { status: 404, message: 'Member not found' };
  }
  return BookingModel.findByMemberId(memberId);
}

function createBooking({ member_id, session_id }, staffId) {
  // Validate member exists
  if (!MemberModel.findById(member_id)) {
    throw { status: 404, message: 'Member not found' };
  }

  // Business Rule 1: active membership required
  const activeMembership = MembershipService.getActiveMembership(member_id);
  if (!activeMembership) {
    throw { status: 403, message: 'Member does not have an active membership' };
  }

  // Validate session exists
  const session = SessionModel.findById(session_id);
  if (!session) throw { status: 404, message: 'Session not found' };

  // Business Rule 4: cannot book past sessions
  if (new Date(session.date_time) <= new Date()) {
    throw { status: 400, message: 'Cannot book a session that has already passed' };
  }

  // Business Rule 2: no duplicate bookings
  if (BookingModel.findByMemberAndSession(member_id, session_id)) {
    throw { status: 409, message: 'Member has already booked this session' };
  }

  // Business Rule 3: capacity check
  const confirmedCount = SessionModel.countConfirmedBookings(session_id);
  if (confirmedCount >= session.capacity) {
    throw { status: 409, message: 'Session is fully booked. No available spots remaining' };
  }

  const booking = BookingModel.create({ member_id, session_id });
  AuditLogModel.create({ staff_id: staffId, action: 'booking_created', target_table: 'BOOKING', target_id: booking.id });
  return booking;
}

function cancelBooking(bookingId, staffId) {
  const booking = BookingModel.findById(bookingId);
  if (!booking) throw { status: 404, message: 'Booking not found' };
  if (booking.status === 'cancelled') {
    throw { status: 400, message: 'Booking is already cancelled' };
  }
  const updated = BookingModel.updateStatus(bookingId, 'cancelled');
  AuditLogModel.create({ staff_id: staffId, action: 'booking_cancelled', target_table: 'BOOKING', target_id: bookingId });
  return updated;
}

module.exports = { getBookingsForMember, createBooking, cancelBooking };
