const { getDb } = require('../db');

function findAll() {
  return getDb().prepare('SELECT * FROM MEMBERSHIP_PLAN ORDER BY price ASC').all();
}

function findById(id) {
  return getDb().prepare('SELECT * FROM MEMBERSHIP_PLAN WHERE id = ?').get(id);
}

function create({ name, duration_days, price }) {
  const result = getDb()
    .prepare('INSERT INTO MEMBERSHIP_PLAN (name, duration_days, price) VALUES (?, ?, ?)')
    .run(name, duration_days, price);
  return findById(result.lastInsertRowid);
}

function update(id, { name, duration_days, price }) {
  getDb()
    .prepare('UPDATE MEMBERSHIP_PLAN SET name = ?, duration_days = ?, price = ? WHERE id = ?')
    .run(name, duration_days, price, id);
  return findById(id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM MEMBERSHIP_PLAN WHERE id = ?').run(id);
}

module.exports = { findAll, findById, create, update, remove };
