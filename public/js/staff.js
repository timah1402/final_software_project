initLayout('staff');

let allStaff = [];

async function loadStaff() {
  allStaff = await api.staff.list();
  renderStaff();
}

function renderStaff() {
  const currentId = getStaff().id;
  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Staff Accounts</h1>
        <p>${allStaff.length} staff members</p>
      </div>
      <button class="btn btn-primary" onclick="openCreateStaff()">+ Add Staff</button>
    </div>
    <div class="section">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${allStaff.length ? allStaff.map(s => `
              <tr>
                <td><strong>${s.name}</strong>${s.id === currentId ? ' <span class="badge badge-blue">You</span>' : ''}</td>
                <td>${s.email}</td>
                <td><span class="badge ${s.role === 'admin' ? 'badge-yellow' : 'badge-gray'}">${s.role}</span></td>
                <td>
                  ${s.id !== currentId ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteStaff(${s.id}, '${s.name.replace(/'/g, "\\'")}')">Delete</button>
                  ` : '—'}
                </td>
              </tr>
            `).join('') : '<tr><td colspan="4" class="empty-state">No staff found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openCreateStaff() {
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Add Staff Account</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-row">
        <div class="form-group">
          <label>Full Name</label>
          <input class="form-control" id="s-name" placeholder="Jane Doe">
        </div>
        <div class="form-group">
          <label>Role</label>
          <select class="form-control" id="s-role">
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Email</label>
        <input class="form-control" id="s-email" type="email" placeholder="jane@gym.com">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input class="form-control" id="s-password" type="password" placeholder="Min. 6 characters">
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitCreateStaff()">Create Account</button>
      </div>
    </div>
  `);
}

async function submitCreateStaff() {
  const res = await api.staff.create({
    name:     document.getElementById('s-name').value.trim(),
    email:    document.getElementById('s-email').value.trim(),
    password: document.getElementById('s-password').value,
    role:     document.getElementById('s-role').value,
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Staff account created'); loadStaff();
}

async function deleteStaff(id, name) {
  if (!confirm(`Delete staff account "${name}"?`)) return;
  const res = await api.staff.remove(id);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Staff account deleted'); loadStaff();
}

loadStaff();
