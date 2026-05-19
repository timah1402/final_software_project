const {
  setupTestDb,
  createStaff,
  createPlan,
  createMember,
  createActiveMembership,
  createExpiredMembership,
} = require('./helpers/db');
const MembershipService = require('../src/services/membership.service');
const MembershipModel = require('../src/models/membership.model');

setupTestDb();

let staff, plan, member;

beforeEach(async () => {
  staff  = await createStaff();
  plan   = createPlan();
  member = createMember();
});

// Business Rule 5: auto-expire memberships
describe('Rule 5 – auto-expire memberships', () => {
  test('returns null for member with no membership', () => {
    expect(MembershipService.getActiveMembership(member.id)).toBeNull();
  });

  test('auto-updates status to expired when end_date has passed', () => {
    const m = createExpiredMembership(member.id, plan.id);
    // Row was inserted as 'active' with a past end_date
    expect(m.status).toBe('active');

    // Service must detect and flip it
    const active = MembershipService.getActiveMembership(member.id);
    expect(active).toBeNull();

    // Verify DB was updated
    const refreshed = MembershipModel.findById(m.id);
    expect(refreshed.status).toBe('expired');
  });

  test('returns active membership when end_date is in the future', () => {
    createActiveMembership(member.id, plan.id);
    const m = MembershipService.getActiveMembership(member.id);
    expect(m).not.toBeNull();
    expect(m.status).toBe('active');
  });
});

// Business Rule 7: renewal from today, not original start_date
describe('Rule 7 – renewal calculated from today', () => {
  test('new end_date = today + plan duration_days', () => {
    const m = createActiveMembership(member.id, plan.id);
    const before = new Date();
    const renewed = MembershipService.renewMembership(m.id, staff.id);

    const expectedEnd = new Date(before);
    expectedEnd.setDate(expectedEnd.getDate() + plan.duration_days);

    expect(renewed.status).toBe('active');
    // Allow 1-day tolerance for midnight boundary
    const diff = Math.abs(new Date(renewed.end_date) - expectedEnd);
    expect(diff).toBeLessThan(86400000);
  });

  test('renewing an expired membership reactivates it', () => {
    const m = createExpiredMembership(member.id, plan.id);
    const renewed = MembershipService.renewMembership(m.id, staff.id);
    expect(renewed.status).toBe('active');
    expect(renewed.end_date > new Date().toISOString().split('T')[0]).toBe(true);
  });
});

// Assign membership
describe('assign membership', () => {
  test('creates a new active membership for a member', () => {
    const m = MembershipService.assignMembership({ member_id: member.id, plan_id: plan.id }, staff.id);
    expect(m.status).toBe('active');
    expect(m.member_id).toBe(member.id);
  });

  test('throws 404 for non-existent plan', () => {
    expect(() =>
      MembershipService.assignMembership({ member_id: member.id, plan_id: 9999 }, staff.id)
    ).toThrow(expect.objectContaining({ status: 404 }));
  });

  test('throws 404 for non-existent member', () => {
    expect(() =>
      MembershipService.assignMembership({ member_id: 9999, plan_id: plan.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 404 }));
  });
});
