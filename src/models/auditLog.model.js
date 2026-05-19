const { getDb } = require('../db');

function create({ staff_id, action, target_table, target_id }) {
  const result = getDb()
    .prepare('INSERT INTO AUDIT_LOG (staff_id, action, target_table, target_id) VALUES (?, ?, ?, ?)')
    .run(staff_id, action, target_table, target_id);
  return result.lastInsertRowid;
}

function findAll() {
  return getDb().prepare(`
    SELECT al.*, u.name AS staff_name
    FROM AUDIT_LOG al
    JOIN STAFF_USER u ON al.staff_id = u.id
    ORDER BY al.performed_at DESC
  `).all();
}

module.exports = { create, findAll };
