const {
  setupTestDb,
  createStaff,
  createPlan,
  createMember,
  createActiveMembership,
  createExpiredMembership,
  createFutureSession,
  createPastSession,
} = require('./helpers/db');
const BookingService = require('../src/services/booking.service');

setupTestDb();

let staff, plan, member, session;

beforeEach(async () => {
  staff  = await createStaff();
  plan   = createPlan();
  member = createMember();
  session = createFutureSession(staff.id);
});

// Business Rule 1: active membership required
describe('Rule 1 – active membership required', () => {
  test('throws 403 when member has no membership', () => {
    expect(() =>
      BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 403 }));
  });

  test('throws 403 when membership is expired', () => {
    createExpiredMembership(member.id, plan.id);
    expect(() =>
      BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 403 }));
  });

  test('succeeds when membership is active', () => {
    createActiveMembership(member.id, plan.id);
    const booking = BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id);
    expect(booking.status).toBe('confirmed');
  });
});

// Business Rule 2: no duplicate bookings
describe('Rule 2 – no duplicate bookings', () => {
  test('throws 409 when booking same session twice', () => {
    createActiveMembership(member.id, plan.id);
    BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id);
    expect(() =>
      BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 409 }));
  });
});

// Business Rule 3: capacity enforcement
describe('Rule 3 – session capacity', () => {
  test('throws 409 when session is full', async () => {
    const fullSession = createFutureSession(staff.id, { capacity: 1 });

    const member2 = createMember({ name: 'Bob', email: 'bob@test.com' });
    const member3 = createMember({ name: 'Carol', email: 'carol@test.com' });
    createActiveMembership(member2.id, plan.id);
    createActiveMembership(member3.id, plan.id);

    BookingService.createBooking({ member_id: member2.id, session_id: fullSession.id }, staff.id);

    expect(() =>
      BookingService.createBooking({ member_id: member3.id, session_id: fullSession.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 409 }));
  });
});

// Business Rule 4: no booking past sessions
describe('Rule 4 – no booking past sessions', () => {
  test('throws 400 for a session that has passed', () => {
    createActiveMembership(member.id, plan.id);
    const past = createPastSession(staff.id);
    expect(() =>
      BookingService.createBooking({ member_id: member.id, session_id: past.id }, staff.id)
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});

// Cancel booking
describe('cancel booking', () => {
  test('cancels a confirmed booking', () => {
    createActiveMembership(member.id, plan.id);
    const booking = BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id);
    const cancelled = BookingService.cancelBooking(booking.id, staff.id);
    expect(cancelled.status).toBe('cancelled');
  });

  test('throws 400 when cancelling an already cancelled booking', () => {
    createActiveMembership(member.id, plan.id);
    const booking = BookingService.createBooking({ member_id: member.id, session_id: session.id }, staff.id);
    BookingService.cancelBooking(booking.id, staff.id);
    expect(() =>
      BookingService.cancelBooking(booking.id, staff.id)
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});
