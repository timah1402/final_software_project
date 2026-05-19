const { getDb } = require('../db');

function findBySessionId(sessionId) {
  return getDb().prepare(`
    SELECT ar.*, b.member_id, m.name AS member_name, m.email AS member_email
    FROM ATTENDANCE_RECORD ar
    JOIN BOOKING b ON ar.booking_id = b.id
    JOIN MEMBER m ON b.member_id = m.id
    WHERE b.session_id = ?
    ORDER BY ar.marked_at DESC
  `).all(sessionId);
}

function findByBookingId(bookingId) {
  return getDb()
    .prepare('SELECT * FROM ATTENDANCE_RECORD WHERE booking_id = ?')
    .get(bookingId);
}

function create({ booking_id, status }) {
  const result = getDb()
    .prepare('INSERT INTO ATTENDANCE_RECORD (booking_id, status) VALUES (?, ?)')
    .run(booking_id, status);
  return getDb()
    .prepare('SELECT * FROM ATTENDANCE_RECORD WHERE id = ?')
    .get(result.lastInsertRowid);
}

module.exports = { findBySessionId, findByBookingId, create };
