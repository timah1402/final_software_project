initLayout('sessions');

let allSessions = [];
let allMembers  = [];

async function loadSessions() {
  [allSessions, allMembers] = await Promise.all([api.sessions.list(), api.members.list()]);
  renderSessions();
}

function renderSessions() {
  const now = new Date();
  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Sessions</h1>
        <p>${allSessions.length} sessions total</p>
      </div>
      <button class="btn btn-primary" onclick="openCreateSession()">+ New Session</button>
    </div>
    <div class="section">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title</th><th>Date & Time</th><th>Trainer</th><th>Capacity</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allSessions.length ? allSessions.map(s => {
              const past = new Date(s.date_time) < now;
              return `<tr>
                <td><strong>${s.title}</strong></td>
                <td>${fmtDT(s.date_time)}</td>
                <td>${s.trainer || '—'}</td>
                <td>${s.capacity}</td>
                <td>${past
                  ? '<span class="badge badge-gray">Past</span>'
                  : '<span class="badge badge-green">Upcoming</span>'}</td>
                <td>
                  <div class="flex gap-2">
                    ${!past ? `<button class="btn btn-ghost btn-sm" onclick="openBookSession(${s.id})">Book</button>` : ''}
                    ${past  ? `<button class="btn btn-ghost btn-sm" onclick="viewAttendance(${s.id})">Attendance</button>` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="openEditSession(${s.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSession(${s.id}, '${s.title.replace(/'/g, "\\'")}')">Delete</button>
                  </div>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" class="empty-state">No sessions yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openCreateSession() {
  const minDT = new Date(Date.now() + 60000).toISOString().slice(0, 16);
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>New Session</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Title</label>
        <input class="form-control" id="s-title" placeholder="Morning Yoga">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Date & Time</label>
          <input class="form-control" id="s-dt" type="datetime-local" min="${minDT}">
        </div>
        <div class="form-group">
          <label>Capacity</label>
          <input class="form-control" id="s-capacity" type="number" min="1" placeholder="10">
        </div>
      </div>
      <div class="form-group">
        <label>Trainer (optional)</label>
        <input class="form-control" id="s-trainer" placeholder="Jane Doe">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitCreateSession()">Create Session</button>
      </div>
    </div>
  `);
}

async function submitCreateSession() {
  const dt = document.getElementById('s-dt').value;
  const res = await api.sessions.create({
    title:     document.getElementById('s-title').value.trim(),
    date_time: dt ? new Date(dt).toISOString() : '',
    capacity:  parseInt(document.getElementById('s-capacity').value),
    trainer:   document.getElementById('s-trainer').value.trim(),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Session created'); loadSessions();
}

function openEditSession(id) {
  const s = allSessions.find(x => x.id === id);
  const dtLocal = s.date_time ? new Date(s.date_time).toISOString().slice(0, 16) : '';
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Session</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Title</label>
        <input class="form-control" id="s-title" value="${s.title}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Date & Time</label>
          <input class="form-control" id="s-dt" type="datetime-local" value="${dtLocal}">
        </div>
        <div class="form-group">
          <label>Capacity</label>
          <input class="form-control" id="s-capacity" type="number" min="1" value="${s.capacity}">
        </div>
      </div>
      <div class="form-group">
        <label>Trainer</label>
        <input class="form-control" id="s-trainer" value="${s.trainer || ''}">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitEditSession(${id})">Save Changes</button>
      </div>
    </div>
  `);
}

async function submitEditSession(id) {
  const dt = document.getElementById('s-dt').value;
  const res = await api.sessions.update(id, {
    title:     document.getElementById('s-title').value.trim(),
    date_time: dt ? new Date(dt).toISOString() : '',
    capacity:  parseInt(document.getElementById('s-capacity').value),
    trainer:   document.getElementById('s-trainer').value.trim(),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Session updated'); loadSessions();
}

async function deleteSession(id, title) {
  if (!confirm(`Delete session "${title}"?`)) return;
  const res = await api.sessions.remove(id);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Session deleted'); loadSessions();
}

function openBookSession(sessionId) {
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Book a Member</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Select Member</label>
        <select class="form-control" id="book-member">
          <option value="">— choose member —</option>
          ${allMembers.map(m => `<option value="${m.id}">${m.name} (${m.email})</option>`).join('')}
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitBook(${sessionId})">Confirm Booking</button>
      </div>
    </div>
  `);
}

async function submitBook(sessionId) {
  const memberId = parseInt(document.getElementById('book-member').value);
  if (!memberId) {
    document.getElementById('modal-err').innerHTML = '<div class="alert alert-error">Please select a member</div>';
    return;
  }
  const res = await api.bookings.create(memberId, sessionId);
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Booking created'); loadSessions();
}

async function viewAttendance(sessionId) {
  const s = allSessions.find(x => x.id === sessionId);
  const bookings = await fetch(`http://localhost:3000/api/sessions/${sessionId}/bookings`, {
    headers: { Authorization: 'Bearer ' + localStorage.getItem('gym_token') }
  }).then(r => r.json());

  showModal(`
    <div class="modal modal-lg">
      <div class="modal-header">
        <h2>Attendance — ${s.title}</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-muted" style="margin-bottom:16px">${fmtDT(s.date_time)}</p>
      ${bookings.length ? `
        <table class="inner-table">
          <thead>
            <tr><th>Member</th><th>Email</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody id="att-tbody">
            ${bookings.map(b => `
              <tr id="att-row-${b.id}">
                <td>${b.member_name}</td>
                <td>${b.member_email}</td>
                <td>
                  ${b.attendance_status
                    ? `<span class="badge ${b.attendance_status === 'present' ? 'badge-green' : 'badge-red'}">${b.attendance_status}</span>`
                    : '<span class="badge badge-gray">Not marked</span>'}
                </td>
                <td>
                  ${!b.attendance_status ? `
                    <div class="flex gap-2">
                      <button class="btn btn-success btn-sm" onclick="markAtt(${b.id}, 'present', ${sessionId})">Present</button>
                      <button class="btn btn-danger btn-sm"  onclick="markAtt(${b.id}, 'absent',  ${sessionId})">Absent</button>
                    </div>
                  ` : '—'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<div class="empty-state">No confirmed bookings for this session</div>'}
    </div>
  `);
}

async function markAtt(bookingId, status, sessionId) {
  const res = await api.attendance.mark(bookingId, status);
  if (res.error) { toast(res.message, 'error'); return; }
  toast(`Marked as ${status}`);
  viewAttendance(sessionId);
}

loadSessions();
