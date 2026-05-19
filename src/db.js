const Database = require('better-sqlite3');
const path = require('path');

let db;

function initDb(dbPath) {
  const resolved =
    dbPath ||
    process.env.DB_PATH ||
    path.join(__dirname, '../gym.db');

  db = new Database(resolved);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

function getDb() {
  if (!db) initDb();
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { getDb, initDb, closeDb };
