const { getDb } = require('../db');

function findByMemberId(memberId) {
  return getDb().prepare(`
    SELECT b.*, s.title AS session_title, s.date_time, s.trainer
    FROM BOOKING b
    JOIN SESSION s ON b.session_id = s.id
    WHERE b.member_id = ?
    ORDER BY b.booked_at DESC
  `).all(memberId);
}

function findById(id) {
  return getDb().prepare(`
    SELECT b.*, s.title AS session_title, s.date_time, s.capacity, s.trainer
    FROM BOOKING b
    JOIN SESSION s ON b.session_id = s.id
    WHERE b.id = ?
  `).get(id);
}

function findByMemberAndSession(memberId, sessionId) {
  return getDb()
    .prepare('SELECT * FROM BOOKING WHERE member_id = ? AND session_id = ?')
    .get(memberId, sessionId);
}

function create({ member_id, session_id }) {
  const result = getDb()
    .prepare('INSERT INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)')
    .run(member_id, session_id, 'confirmed');
  return findById(result.lastInsertRowid);
}

function updateStatus(id, status) {
  getDb().prepare('UPDATE BOOKING SET status = ? WHERE id = ?').run(status, id);
  return findById(id);
}

function findBySessionId(sessionId) {
  return getDb().prepare(`
    SELECT b.*, m.name AS member_name, m.email AS member_email,
           ar.status AS attendance_status, ar.id AS attendance_id
    FROM BOOKING b
    JOIN MEMBER m ON b.member_id = m.id
    LEFT JOIN ATTENDANCE_RECORD ar ON ar.booking_id = b.id
    WHERE b.session_id = ? AND b.status = 'confirmed'
    ORDER BY b.booked_at ASC
  `).all(sessionId);
}

module.exports = { findByMemberId, findById, findByMemberAndSession, findBySessionId, create, updateStatus };
