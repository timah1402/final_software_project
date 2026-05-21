const bcrypt = require('bcrypt');
const { initDb, closeDb, getDb } = require('../../src/db');
const { createTables } = require('../../scripts/schema');

function setupTestDb() {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    initDb(':memory:');
    createTables(getDb());
  });

  afterAll(() => closeDb());

  beforeEach(() => {
    const db = getDb();
    db.exec(`
      DELETE FROM AUDIT_LOG;
      DELETE FROM ATTENDANCE_RECORD;
      DELETE FROM BOOKING;
      DELETE FROM SESSION;
      DELETE FROM MEMBERSHIP;
      DELETE FROM MEMBERSHIP_PLAN;
      DELETE FROM MEMBER;
      DELETE FROM STAFF_USER;
    `);
  });
}

async function createStaff({ name = 'Staff', email = 'staff@test.com', role = 'staff' } = {}) {
  const hash = await bcrypt.hash('password123', 1);
  return require('../../src/models/staffUser.model').create({ name, email, password_hash: hash, role });
}

function createPlan({ name = 'Monthly', duration_days = 30, price = 25.00 } = {}) {
  return require('../../src/models/membershipPlan.model').create({ name, duration_days, price });
}

function createMember({ name = 'Fatou', email = 'fatou@test.com', phone = null } = {}) {
  return require('../../src/models/member.model').create({ name, email, phone });
}

function createActiveMembership(memberId, planId) {
  const today = new Date();
  const start_date = today.toISOString().split('T')[0];
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  const end_date = end.toISOString().split('T')[0];
  return require('../../src/models/membership.model').create({ member_id: memberId, plan_id: planId, start_date, end_date });
}

function createExpiredMembership(memberId, planId) {
  const past = new Date();
  past.setDate(past.getDate() - 60);
  const start_date = past.toISOString().split('T')[0];
  const end = new Date(past);
  end.setDate(end.getDate() + 30);
  const end_date = end.toISOString().split('T')[0];
  return require('../../src/models/membership.model').create({ member_id: memberId, plan_id: planId, start_date, end_date, status: 'active' });
}

function createFutureSession(staffId, { capacity = 10, daysAhead = 1 } = {}) {
  const dt = new Date();
  dt.setDate(dt.getDate() + daysAhead);
  return require('../../src/models/session.model').create({
    title: 'Test Session',
    date_time: dt.toISOString(),
    capacity,
    trainer: 'Trainer',
    created_by: staffId,
  });
}

function createPastSession(staffId) {
  const dt = new Date();
  dt.setDate(dt.getDate() - 1);
  return require('../../src/models/session.model').create({
    title: 'Past Session',
    date_time: dt.toISOString(),
    capacity: 10,
    trainer: 'Trainer',
    created_by: staffId,
  });
}

module.exports = {
  setupTestDb,
  createStaff,
  createPlan,
  createMember,
  createActiveMembership,
  createExpiredMembership,
  createFutureSession,
  createPastSession,
};
