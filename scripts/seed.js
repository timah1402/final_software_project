require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcrypt');
const { getDb } = require('../src/db');
const { createTables } = require('./schema');

async function seed() {
  const db = getDb();
  createTables(db);

  // Membership plans
  db.prepare(`INSERT OR IGNORE INTO MEMBERSHIP_PLAN (name, duration_days, price) VALUES (?, ?, ?)`)
    .run('Monthly', 10000, 15000);
  db.prepare(`INSERT OR IGNORE INTO MEMBERSHIP_PLAN (name, duration_days, price) VALUES (?, ?, ?)`)
    .run('Annual', 100000, 150000);

  // Staff users
  const adminHash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  db.prepare(`INSERT OR IGNORE INTO STAFF_USER (name, email, password_hash, role) VALUES (?, ?, ?, ?)`)
    .run('Admin', 'admin@gym.com', adminHash, 'admin');
  db.prepare(`INSERT OR IGNORE INTO STAFF_USER (name, email, password_hash, role) VALUES (?, ?, ?, ?)`)
    .run('Staff', 'staff@gym.com', staffHash, 'staff');

  const admin = db.prepare(`SELECT id FROM STAFF_USER WHERE email = ?`).get('admin@gym.com');

  // Members
  db.prepare(`INSERT OR IGNORE INTO MEMBER (name, email, phone) VALUES (?, ?, ?)`)
    .run('Alice Johnson', 'alice@example.com', '555-0001');
  db.prepare(`INSERT OR IGNORE INTO MEMBER (name, email, phone) VALUES (?, ?, ?)`)
    .run('Bob Smith', 'bob@example.com', '555-0002');
  db.prepare(`INSERT OR IGNORE INTO MEMBER (name, email, phone) VALUES (?, ?, ?)`)
    .run('Carol White', 'carol@example.com', '555-0003');

  // Active memberships (monthly plan)
  const plan = db.prepare(`SELECT id FROM MEMBERSHIP_PLAN WHERE name = 'Monthly'`).get();
  const today = new Date();
  const startDate = today.toISOString().split('T')[0];
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  const endDate = end.toISOString().split('T')[0];

  for (const email of ['alice@example.com', 'bob@example.com', 'carol@example.com']) {
    const member = db.prepare(`SELECT id FROM MEMBER WHERE email = ?`).get(email);
    db.prepare(`INSERT OR IGNORE INTO MEMBERSHIP (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`)
      .run(member.id, plan.id, startDate, endDate, 'active');
  }

  // Past sessions (for attendance testing)
  const p1 = new Date(today); p1.setDate(p1.getDate() - 7);
  const p2 = new Date(today); p2.setDate(p2.getDate() - 2);

  const ps1 = db.prepare(`INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run('Pilates (Past)', p1.toISOString(), 10, 'Jane Doe', admin.id);
  const ps2 = db.prepare(`INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run('Boxing (Past)', p2.toISOString(), 8, 'John Smith', admin.id);

  // Upcoming sessions
  const d1 = new Date(today); d1.setDate(d1.getDate() + 1);
  const d2 = new Date(today); d2.setDate(d2.getDate() + 7);
  const d3 = new Date(today); d3.setDate(d3.getDate() + 30);

  const s1 = db.prepare(`INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run('Morning Yoga', d1.toISOString(), 10, 'Jane Doe', admin.id);
  const s2 = db.prepare(`INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run('HIIT Cardio', d2.toISOString(), 5, 'John Smith', admin.id);
  db.prepare(`INSERT INTO SESSION (title, date_time, capacity, trainer, created_by) VALUES (?, ?, ?, ?, ?)`)
    .run('Strength Training', d3.toISOString(), 15, 'Mike Johnson', admin.id);

  // Bookings for past sessions (all 3 members attended Pilates, 2 attended Boxing)
  const alice = db.prepare(`SELECT id FROM MEMBER WHERE email = ?`).get('alice@example.com');
  const bob   = db.prepare(`SELECT id FROM MEMBER WHERE email = ?`).get('bob@example.com');
  const carol = db.prepare(`SELECT id FROM MEMBER WHERE email = ?`).get('carol@example.com');

  const pb1 = db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(alice.id, ps1.lastInsertRowid, 'confirmed');
  const pb2 = db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(bob.id, ps1.lastInsertRowid, 'confirmed');
  const pb3 = db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(carol.id, ps1.lastInsertRowid, 'confirmed');
  const pb4 = db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(alice.id, ps2.lastInsertRowid, 'confirmed');
  const pb5 = db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(bob.id, ps2.lastInsertRowid, 'confirmed');

  // Attendance records for past sessions
  db.prepare(`INSERT OR IGNORE INTO ATTENDANCE_RECORD (booking_id, status) VALUES (?, ?)`)
    .run(pb1.lastInsertRowid, 'present');
  db.prepare(`INSERT OR IGNORE INTO ATTENDANCE_RECORD (booking_id, status) VALUES (?, ?)`)
    .run(pb2.lastInsertRowid, 'present');
  db.prepare(`INSERT OR IGNORE INTO ATTENDANCE_RECORD (booking_id, status) VALUES (?, ?)`)
    .run(pb3.lastInsertRowid, 'absent');
  db.prepare(`INSERT OR IGNORE INTO ATTENDANCE_RECORD (booking_id, status) VALUES (?, ?)`)
    .run(pb4.lastInsertRowid, 'present');
  // pb5 (Bob, Boxing) left unmarked so you can test marking attendance live

  // Sample bookings for upcoming sessions
  db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(alice.id, s1.lastInsertRowid, 'confirmed');
  db.prepare(`INSERT OR IGNORE INTO BOOKING (member_id, session_id, status) VALUES (?, ?, ?)`)
    .run(bob.id, s1.lastInsertRowid, 'confirmed');

  console.log('Database seeded successfully!');
  console.log('  Admin login: admin@gym.com / admin123');
  console.log('  Staff login: staff@gym.com / staff123');
}

seed().catch(err => { console.error(err); process.exit(1); });
