const SessionModel = require('../models/session.model');
const AuditLogModel = require('../models/auditLog.model');

function getAllSessions() {
  return SessionModel.findAll();
}

function getSessionById(id) {
  const session = SessionModel.findById(id);
  if (!session) throw { status: 404, message: 'Session not found' };
  return session;
}

function createSession({ title, date_time, capacity, trainer }, staffId) {
  if (new Date(date_time) <= new Date()) {
    throw { status: 400, message: 'Session date_time must be in the future' };
  }
  const session = SessionModel.create({ title, date_time, capacity, trainer, created_by: staffId });
  AuditLogModel.create({ staff_id: staffId, action: 'session_created', target_table: 'SESSION', target_id: session.id });
  return session;
}

function updateSession(id, { title, date_time, capacity, trainer }, staffId) {
  getSessionById(id);
  const session = SessionModel.update(id, { title, date_time, capacity, trainer });
  AuditLogModel.create({ staff_id: staffId, action: 'session_updated', target_table: 'SESSION', target_id: id });
  return session;
}

function deleteSession(id, staffId) {
  getSessionById(id);
  SessionModel.remove(id);
  AuditLogModel.create({ staff_id: staffId, action: 'session_deleted', target_table: 'SESSION', target_id: id });
  return { message: 'Session deleted successfully' };
}

module.exports = { getAllSessions, getSessionById, createSession, updateSession, deleteSession };
