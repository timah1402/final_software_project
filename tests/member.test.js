const { setupTestDb, createStaff } = require('./helpers/db');
const MemberService = require('../src/services/member.service');

setupTestDb();

let staff;

beforeEach(async () => {
  staff = await createStaff();
});

describe('member CRUD', () => {
  test('creates a member', () => {
    const m = MemberService.createMember({ name: 'Fatou', email: 'fatou@test.com' }, staff.id);
    expect(m.name).toBe('Fatou');
    expect(m.email).toBe('fatou@test.com');
  });

  test('throws 409 on duplicate email', () => {
    MemberService.createMember({ name: 'Fatou', email: 'fatou@test.com' }, staff.id);
    expect(() =>
      MemberService.createMember({ name: 'Fatou2', email: 'fatou@test.com' }, staff.id)
    ).toThrow(expect.objectContaining({ status: 409 }));
  });

  test('throws 404 when getting non-existent member', () => {
    expect(() => MemberService.getMemberById(9999))
      .toThrow(expect.objectContaining({ status: 404 }));
  });

  test('updates a member', () => {
    const m = MemberService.createMember({ name: 'Fatou', email: 'fatou@test.com' }, staff.id);
    const updated = MemberService.updateMember(m.id, { name: 'Fatou Diallo', email: 'fatou@test.com' }, staff.id);
    expect(updated.name).toBe('Fatou Diallo');
  });

  test('deletes a member', () => {
    const m = MemberService.createMember({ name: 'Fatou', email: 'fatou@test.com' }, staff.id);
    MemberService.deleteMember(m.id, staff.id);
    expect(() => MemberService.getMemberById(m.id))
      .toThrow(expect.objectContaining({ status: 404 }));
  });

  test('lists all members', () => {
    MemberService.createMember({ name: 'Fatou', email: 'fatou@test.com' }, staff.id);
    MemberService.createMember({ name: 'Moussa', email: 'moussa@test.com' }, staff.id);
    const members = MemberService.getAllMembers();
    expect(members).toHaveLength(2);
  });
});
