const { getDb } = require('../db');

function findByEmail(email) {
  return getDb().prepare('SELECT * FROM STAFF_USER WHERE email = ?').get(email);
}

function findById(id) {
  return getDb()
    .prepare('SELECT id, name, email, role FROM STAFF_USER WHERE id = ?')
    .get(id);
}

function create({ name, email, password_hash, role }) {
  const result = getDb()
    .prepare('INSERT INTO STAFF_USER (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(name, email, password_hash, role || 'staff');
  return findById(result.lastInsertRowid);
}

function findAll() {
  return getDb().prepare('SELECT id, name, email, role FROM STAFF_USER ORDER BY id ASC').all();
}

function remove(id) {
  return getDb().prepare('DELETE FROM STAFF_USER WHERE id = ?').run(id);
}

module.exports = { findByEmail, findById, findAll, create, remove };
