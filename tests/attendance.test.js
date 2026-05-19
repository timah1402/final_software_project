const {
  setupTestDb,
  createStaff,
  createPlan,
  createMember,
  createActiveMembership,
  createFutureSession,
  createPastSession,
} = require('./helpers/db');
const BookingModel = require('../src/models/booking.model');
const AttendanceService = require('../src/services/attendance.service');

setupTestDb();

let staff, plan, member;

beforeEach(async () => {
  staff  = await createStaff();
  plan   = createPlan();
  member = createMember();
  createActiveMembership(member.id, plan.id);
});

// Business Rule 8: attendance only for past sessions
describe('Rule 8 – attendance only for past sessions', () => {
  test('throws 400 when session is in the future', () => {
    const futureSession = createFutureSession(staff.id);
    const booking = BookingModel.create({ member_id: member.id, session_id: futureSession.id });
    expect(() =>
      AttendanceService.markAttendance({ booking_id: booking.id, status: 'present' }, staff.id)
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('marks attendance as present for a past session', () => {
    const pastSession = createPastSession(staff.id);
    const booking = BookingModel.create({ member_id: member.id, session_id: pastSession.id });
    const attendance = AttendanceService.markAttendance({ booking_id: booking.id, status: 'present' }, staff.id);
    expect(attendance.status).toBe('present');
  });

  test('marks attendance as absent for a past session', () => {
    const pastSession = createPastSession(staff.id);
    const booking = BookingModel.create({ member_id: member.id, session_id: pastSession.id });
    const attendance = AttendanceService.markAttendance({ booking_id: booking.id, status: 'absent' }, staff.id);
    expect(attendance.status).toBe('absent');
  });

  test('throws 409 when attendance already recorded', () => {
    const pastSession = createPastSession(staff.id);
    const booking = BookingModel.create({ member_id: member.id, session_id: pastSession.id });
    AttendanceService.markAttendance({ booking_id: booking.id, status: 'present' }, staff.id);
    expect(() =>
      AttendanceService.markAttendance({ booking_id: booking.id, status: 'absent' }, staff.id)
    ).toThrow(expect.objectContaining({ status: 409 }));
  });

  test('throws 400 when booking is cancelled', () => {
    const pastSession = createPastSession(staff.id);
    const booking = BookingModel.create({ member_id: member.id, session_id: pastSession.id });
    BookingModel.updateStatus(booking.id, 'cancelled');
    expect(() =>
      AttendanceService.markAttendance({ booking_id: booking.id, status: 'present' }, staff.id)
    ).toThrow(expect.objectContaining({ status: 400 }));
  });
});
