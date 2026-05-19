const { getDb } = require('../db');

function findByMemberId(memberId) {
  return getDb().prepare(`
    SELECT m.*, p.name AS plan_name, p.duration_days, p.price
    FROM MEMBERSHIP m
    JOIN MEMBERSHIP_PLAN p ON m.plan_id = p.id
    WHERE m.member_id = ?
    ORDER BY m.start_date DESC
  `).all(memberId);
}

function findById(id) {
  return getDb().prepare(`
    SELECT m.*, p.name AS plan_name, p.duration_days, p.price
    FROM MEMBERSHIP m
    JOIN MEMBERSHIP_PLAN p ON m.plan_id = p.id
    WHERE m.id = ?
  `).get(id);
}

function findActiveMembership(memberId) {
  return getDb().prepare(`
    SELECT m.*, p.name AS plan_name, p.duration_days, p.price
    FROM MEMBERSHIP m
    JOIN MEMBERSHIP_PLAN p ON m.plan_id = p.id
    WHERE m.member_id = ? AND m.status = 'active'
    ORDER BY m.end_date DESC
    LIMIT 1
  `).get(memberId);
}

function create({ member_id, plan_id, start_date, end_date }) {
  const result = getDb()
    .prepare('INSERT INTO MEMBERSHIP (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)')
    .run(member_id, plan_id, start_date, end_date, 'active');
  return findById(result.lastInsertRowid);
}

function updateStatus(id, status) {
  getDb().prepare('UPDATE MEMBERSHIP SET status = ? WHERE id = ?').run(status, id);
  return findById(id);
}

function updateDates(id, { start_date, end_date, status }) {
  getDb()
    .prepare('UPDATE MEMBERSHIP SET start_date = ?, end_date = ?, status = ? WHERE id = ?')
    .run(start_date, end_date, status, id);
  return findById(id);
}

function countByStatus() {
  return getDb()
    .prepare('SELECT status, COUNT(*) AS count FROM MEMBERSHIP GROUP BY status')
    .all();
}

module.exports = {
  findByMemberId,
  findById,
  findActiveMembership,
  create,
  updateStatus,
  updateDates,
  countByStatus,
};
