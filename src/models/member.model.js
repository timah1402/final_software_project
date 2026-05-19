const { getDb } = require('../db');

function findAll() {
  return getDb().prepare('SELECT * FROM MEMBER ORDER BY registered_at DESC').all();
}

function findById(id) {
  return getDb().prepare('SELECT * FROM MEMBER WHERE id = ?').get(id);
}

function findByEmail(email) {
  return getDb().prepare('SELECT * FROM MEMBER WHERE email = ?').get(email);
}

function create({ name, email, phone }) {
  const result = getDb()
    .prepare('INSERT INTO MEMBER (name, email, phone) VALUES (?, ?, ?)')
    .run(name, email, phone || null);
  return findById(result.lastInsertRowid);
}

function update(id, { name, email, phone }) {
  getDb()
    .prepare('UPDATE MEMBER SET name = ?, email = ?, phone = ? WHERE id = ?')
    .run(name, email, phone || null, id);
  return findById(id);
}

function remove(id) {
  return getDb().prepare('DELETE FROM MEMBER WHERE id = ?').run(id);
}

module.exports = { findAll, findById, findByEmail, create, update, remove };
