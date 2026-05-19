initLayout('members');

let allMembers = [];
let allPlans   = [];

async function loadMembers() {
  [allMembers, allPlans] = await Promise.all([api.members.list(), api.plans.list()]);
  renderMembers();
}

function renderMembers() {
  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Members</h1>
        <p>${allMembers.length} registered members</p>
      </div>
      <button class="btn btn-primary" onclick="openCreateMember()">+ Add Member</button>
    </div>
    <div class="section">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Registered</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${allMembers.length ? allMembers.map(m => `
              <tr>
                <td><strong>${m.name}</strong></td>
                <td>${m.email}</td>
                <td>${m.phone || '—'}</td>
                <td>${fmt(m.registered_at)}</td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="viewMember(${m.id})">View</button>
                    <button class="btn btn-ghost btn-sm" onclick="openEditMember(${m.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id}, '${m.name.replace(/'/g, "\\'")}')">Delete</button>
                  </div>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="5" class="empty-state">No members yet</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openCreateMember() {
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Add Member</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" id="m-name" placeholder="Alice Johnson">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input class="form-control" id="m-phone" placeholder="555-0001">
        </div>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" id="m-email" type="email" placeholder="alice@example.com">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitCreateMember()">Create Member</button>
      </div>
    </div>
  `);
}

async function submitCreateMember() {
  const res = await api.members.create({
    name:  document.getElementById('m-name').value.trim(),
    email: document.getElementById('m-email').value.trim(),
    phone: document.getElementById('m-phone').value.trim(),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Member created'); loadMembers();
}

function openEditMember(id) {
  const m = allMembers.find(x => x.id === id);
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Member</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" id="m-name" value="${m.name}">
        </div>
        <div class="form-group">
          <label>Phone</label>
          <input class="form-control" id="m-phone" value="${m.phone || ''}">
        </div>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" id="m-email" type="email" value="${m.email}">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitEditMember(${id})">Save Changes</button>
      </div>
    </div>
  `);
}

async function submitEditMember(id) {
  const res = await api.members.update(id, {
    name:  document.getElementById('m-name').value.trim(),
    email: document.getElementById('m-email').value.trim(),
    phone: document.getElementById('m-phone').value.trim(),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Member updated'); loadMembers();
}

async function deleteMember(id, name) {
  if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
  const res = await api.members.remove(id);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Member deleted'); loadMembers();
}

async function viewMember(id) {
  const m = allMembers.find(x => x.id === id);
  const [memberships, bookings] = await Promise.all([
    api.members.memberships(id),
    api.members.bookings(id),
  ]);

  showModal(`
    <div class="modal modal-lg">
      <div class="modal-header">
        <h2>${m.name}</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <p class="text-muted">${m.email}${m.phone ? ' · ' + m.phone : ''}</p>

      <div style="margin-top:20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
          <strong>Memberships</strong>
          <button class="btn btn-ghost btn-sm" onclick="openAssignPlan(${id})">+ Assign Plan</button>
        </div>
        ${memberships.length ? `
          <table class="inner-table">
            <thead><tr><th>Plan</th><th>Start</th><th>End</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${memberships.map(ms => `
                <tr>
                  <td>${ms.plan_name}</td>
                  <td>${fmt(ms.start_date)}</td>
                  <td>${fmt(ms.end_date)}</td>
                  <td><span class="badge ${ms.status === 'active' ? 'badge-green' : 'badge-red'}">${ms.status}</span></td>
                  <td><button class="btn btn-ghost btn-sm" onclick="renewMembership(${ms.id}, ${id})">Renew</button></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="text-muted" style="padding:10px 0">No memberships yet</p>'}
      </div>

      <div style="margin-top:24px">
        <strong style="display:block;margin-bottom:10px">Bookings</strong>
        ${bookings.length ? `
          <table class="inner-table">
            <thead><tr><th>Session</th><th>Booked At</th><th>Status</th><th></th></tr></thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>${b.session_title}</td>
                  <td>${fmtDT(b.booked_at)}</td>
                  <td><span class="badge ${b.status === 'confirmed' ? 'badge-green' : 'badge-gray'}">${b.status}</span></td>
                  <td>${b.status === 'confirmed'
                    ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking(${b.id}, ${id})">Cancel</button>`
                    : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p class="text-muted" style="padding:10px 0">No bookings yet</p>'}
      </div>
    </div>
  `);
}

async function renewMembership(membershipId, memberId) {
  const res = await api.memberships.renew(membershipId);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Membership renewed');
  viewMember(memberId);
}

async function cancelBooking(bookingId, memberId) {
  const res = await api.bookings.cancel(bookingId);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Booking cancelled');
  viewMember(memberId);
}

function openAssignPlan(memberId) {
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Assign Membership Plan</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Select Plan</label>
        <select class="form-control" id="plan-select">
          ${allPlans.map(p => `<option value="${p.id}">${p.name} — ${p.duration_days} days · ${Number(p.price).toFixed(2)} CFA</option>`).join('')}
        </select>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitAssignPlan(${memberId})">Assign Plan</button>
      </div>
    </div>
  `);
}

async function submitAssignPlan(memberId) {
  const plan_id = parseInt(document.getElementById('plan-select').value);
  const res = await api.members.assignPlan(memberId, plan_id);
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  toast('Plan assigned');
  viewMember(memberId);
}

loadMembers();
