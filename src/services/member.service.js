const MemberModel = require('../models/member.model');
const AuditLogModel = require('../models/auditLog.model');

function getAllMembers() {
  return MemberModel.findAll();
}

function getMemberById(id) {
  const member = MemberModel.findById(id);
  if (!member) throw { status: 404, message: 'Member not found' };
  return member;
}

function createMember({ name, email, phone }, staffId) {
  if (MemberModel.findByEmail(email)) {
    throw { status: 409, message: 'A member with this email already exists' };
  }
  const member = MemberModel.create({ name, email, phone });
  AuditLogModel.create({ staff_id: staffId, action: 'member_created', target_table: 'MEMBER', target_id: member.id });
  return member;
}

function updateMember(id, { name, email, phone }, staffId) {
  getMemberById(id);
  const existing = MemberModel.findByEmail(email);
  if (existing && existing.id !== id) {
    throw { status: 409, message: 'A member with this email already exists' };
  }
  const member = MemberModel.update(id, { name, email, phone });
  AuditLogModel.create({ staff_id: staffId, action: 'member_updated', target_table: 'MEMBER', target_id: id });
  return member;
}

function deleteMember(id, staffId) {
  getMemberById(id);
  MemberModel.remove(id);
  AuditLogModel.create({ staff_id: staffId, action: 'member_deleted', target_table: 'MEMBER', target_id: id });
  return { message: 'Member deleted successfully' };
}

module.exports = { getAllMembers, getMemberById, createMember, updateMember, deleteMember };
