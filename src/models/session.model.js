const { getDb } = require('../db');

function findAll() {
  return getDb().prepare(`
    SELECT s.*, u.name AS created_by_name
    FROM SESSION s
    JOIN STAFF_USER u ON s.created_by = u.id
    ORDER BY s.date_time DESC
  `).all();
}

function findById(id) {
  return getDb().prepare(`
    SELECT s.*, u.name AS created_by_name
    FROM SESSION s
    JOIN STAFF_USER u ON s.created_by = u.id
    WHERE s.id = ?
  `).get(id);
}

function create({ title, date_time, capacity, trainer, created_by }) {
  const result = getDb()
    .prepare('INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)')
    .run(title, date_time, capacity, trainer || null, created_by);
  return findById(result.lastInsertRowid);
}

function update(id, { title, date_time, capacity, trainer }) {
  getDb()
    .prepare('UPDATE SESSION SET title = ?, date_time = ?, capacity = ?, trainer = ? WHERE id = ?')
    .run(title, date_time, capacity, trainer || null, id);
  return findById(id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM SESSION WHERE id = ?').run(id);
}

function countConfirmedBookings(sessionId) {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS count FROM BOOKING WHERE session_id = ? AND status = 'confirmed'`)
    .get(sessionId);
  return row.count;
}

function findAllWithUtilization() {
  return getDb().prepare(`
    SELECT s.*, u.name AS created_by_name,
           COUNT(CASE WHEN b.status = 'confirmed' THEN 1 END) AS confirmed_bookings
    FROM SESSION s
    JOIN STAFF_USER u ON s.created_by = u.id
    LEFT JOIN BOOKING b ON b.session_id = s.id
    GROUP BY s.id
    ORDER BY s.date_time ASC
  `).all();
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
  countConfirmedBookings,
  findAllWithUtilization,
};
