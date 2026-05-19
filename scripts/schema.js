function createTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS STAFF_USER (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role          TEXT NOT NULL DEFAULT 'staff'
                    CHECK(role IN ('staff', 'admin'))
    );

    CREATE TABLE IF NOT EXISTS MEMBER (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(100) NOT NULL UNIQUE,
      phone         VARCHAR(20),
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS MEMBERSHIP_PLAN (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          VARCHAR(100) NOT NULL,
      duration_days INTEGER NOT NULL,
      price         DECIMAL(10,2) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS MEMBERSHIP (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id   INTEGER NOT NULL REFERENCES MEMBER(id) ON DELETE CASCADE,
      plan_id     INTEGER NOT NULL REFERENCES MEMBERSHIP_PLAN(id),
      start_date  DATE NOT NULL,
      end_date    DATE NOT NULL,
      status      TEXT NOT NULL DEFAULT 'active'
                  CHECK(status IN ('active', 'expired'))
    );

    CREATE TABLE IF NOT EXISTS SESSION (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       VARCHAR(100) NOT NULL,
      date_time   DATETIME NOT NULL,
      capacity    INTEGER NOT NULL,
      trainer     VARCHAR(100),
      created_by  INTEGER NOT NULL REFERENCES STAFF_USER(id)
    );

    CREATE TABLE IF NOT EXISTS BOOKING (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id   INTEGER NOT NULL REFERENCES MEMBER(id) ON DELETE CASCADE,
      session_id  INTEGER NOT NULL REFERENCES SESSION(id) ON DELETE CASCADE,
      booked_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      status      TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK(status IN ('confirmed', 'cancelled')),
      UNIQUE(member_id, session_id)
    );

    CREATE TABLE IF NOT EXISTS ATTENDANCE_RECORD (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_id  INTEGER NOT NULL UNIQUE REFERENCES BOOKING(id) ON DELETE CASCADE,
      marked_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      status      TEXT NOT NULL CHECK(status IN ('present', 'absent'))
    );

    CREATE TABLE IF NOT EXISTS AUDIT_LOG (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      staff_id     INTEGER NOT NULL REFERENCES STAFF_USER(id),
      action       VARCHAR(100) NOT NULL,
      target_table VARCHAR(50) NOT NULL,
      target_id    INTEGER NOT NULL,
      performed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

module.exports = { createTables };
