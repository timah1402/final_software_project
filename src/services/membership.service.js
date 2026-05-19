const MembershipModel = require('../models/membership.model');
const MembershipPlanModel = require('../models/membershipPlan.model');
const MemberModel = require('../models/member.model');
const AuditLogModel = require('../models/auditLog.model');

// Business Rule 5: auto-expire if end_date has passed
function syncExpiry(membership) {
  if (!membership) return null;
  const today = new Date().toISOString().split('T')[0];
  if (membership.status === 'active' && membership.end_date < today) {
    MembershipModel.updateStatus(membership.id, 'expired');
    return null;
  }
  return membership;
}

function getMembershipsForMember(memberId) {
  if (!MemberModel.findById(memberId)) {
    throw { status: 404, message: 'Member not found' };
  }
  return MembershipModel.findByMemberId(memberId).map(syncExpiry);
}

function assignMembership({ member_id, plan_id }, staffId) {
  if (!MemberModel.findById(member_id)) {
    throw { status: 404, message: 'Member not found' };
  }
  const plan = MembershipPlanModel.findById(plan_id);
  if (!plan) throw { status: 404, message: 'Membership plan not found' };

  const today = new Date();
  const start_date = today.toISOString().split('T')[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + plan.duration_days);
  const end_date = endDate.toISOString().split('T')[0];

  const membership = MembershipModel.create({ member_id, plan_id, start_date, end_date });
  AuditLogModel.create({ staff_id: staffId, action: 'membership_assigned', target_table: 'MEMBERSHIP', target_id: membership.id });
  return membership;
}

// Business Rule 7: renewal calculates from today, not original start_date
function renewMembership(membershipId, staffId) {
  const membership = MembershipModel.findById(membershipId);
  if (!membership) throw { status: 404, message: 'Membership not found' };

  const today = new Date();
  const start_date = today.toISOString().split('T')[0];
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + membership.duration_days);
  const end_date = endDate.toISOString().split('T')[0];

  const updated = MembershipModel.updateDates(membershipId, { start_date, end_date, status: 'active' });
  AuditLogModel.create({ staff_id: staffId, action: 'membership_renewed', target_table: 'MEMBERSHIP', target_id: membershipId });
  return updated;
}

function getActiveMembership(memberId) {
  return syncExpiry(MembershipModel.findActiveMembership(memberId));
}

module.exports = { getMembershipsForMember, assignMembership, renewMembership, getActiveMembership };
