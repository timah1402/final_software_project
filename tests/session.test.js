const { setupTestDb, createStaff } = require('./helpers/db');
const SessionService = require('../src/services/session.service');

setupTestDb();

let staff;

beforeEach(async () => {
  staff = await createStaff();
});

describe('session creation', () => {
  test('creates a session with a future date', () => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 1);
    const session = SessionService.createSession(
      { title: 'Yoga', date_time: dt.toISOString(), capacity: 10, trainer: 'Jane' },
      staff.id
    );
    expect(session.title).toBe('Yoga');
    expect(session.capacity).toBe(10);
  });

  test('throws 400 for a past date_time', () => {
    const dt = new Date();
    dt.setDate(dt.getDate() - 1);
    expect(() =>
      SessionService.createSession(
        { title: 'Old Session', date_time: dt.toISOString(), capacity: 5 },
        staff.id
      )
    ).toThrow(expect.objectContaining({ status: 400 }));
  });

  test('throws 404 when getting a non-existent session', () => {
    expect(() => SessionService.getSessionById(9999))
      .toThrow(expect.objectContaining({ status: 404 }));
  });

  test('updates a session', () => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 2);
    const session = SessionService.createSession(
      { title: 'Yoga', date_time: dt.toISOString(), capacity: 10 },
      staff.id
    );
    const updated = SessionService.updateSession(
      session.id,
      { title: 'Power Yoga', date_time: dt.toISOString(), capacity: 15 },
      staff.id
    );
    expect(updated.title).toBe('Power Yoga');
    expect(updated.capacity).toBe(15);
  });

  test('deletes a session', () => {
    const dt = new Date();
    dt.setDate(dt.getDate() + 2);
    const session = SessionService.createSession(
      { title: 'Yoga', date_time: dt.toISOString(), capacity: 10 },
      staff.id
    );
    SessionService.deleteSession(session.id, staff.id);
    expect(() => SessionService.getSessionById(session.id))
      .toThrow(expect.objectContaining({ status: 404 }));
  });
});
