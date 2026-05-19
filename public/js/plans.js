initLayout('plans');

let allPlans = [];

async function loadPlans() {
  allPlans = await api.plans.list();
  renderPlans();
}

function renderPlans() {
  const admin = isAdmin();
  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Membership Plans</h1>
        <p>${allPlans.length} plans available</p>
      </div>
      ${admin ? '<button class="btn btn-primary" onclick="openCreatePlan()">+ Add Plan</button>' : ''}
    </div>
    ${!admin ? '<div class="alert alert-error" style="margin-bottom:20px">Only admins can manage plans.</div>' : ''}
    <div class="section">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Plan Name</th><th>Duration</th><th>Price</th>${admin ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${allPlans.length ? allPlans.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.duration_days} days</td>
                <td>$${Number(p.price).toFixed(2)}</td>
                ${admin ? `<td>
                  <div class="flex gap-2">
                    <button class="btn btn-ghost btn-sm" onclick="openEditPlan(${p.id})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePlan(${p.id}, '${p.name.replace(/'/g, "\\'")}')">Delete</button>
                  </div>
                </td>` : ''}
              </tr>
            `).join('') : `<tr><td colspan="${admin ? 4 : 3}" class="empty-state">No plans yet</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openCreatePlan() {
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>New Plan</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Plan Name</label>
        <input class="form-control" id="p-name" placeholder="Monthly">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration (days)</label>
          <input class="form-control" id="p-days" type="number" min="1" placeholder="30">
        </div>
        <div class="form-group">
          <label>Price ($)</label>
          <input class="form-control" id="p-price" type="number" min="0" step="0.01" placeholder="25.00">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitCreatePlan()">Create Plan</button>
      </div>
    </div>
  `);
}

async function submitCreatePlan() {
  const res = await api.plans.create({
    name:          document.getElementById('p-name').value.trim(),
    duration_days: parseInt(document.getElementById('p-days').value),
    price:         parseFloat(document.getElementById('p-price').value),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Plan created'); loadPlans();
}

function openEditPlan(id) {
  const p = allPlans.find(x => x.id === id);
  showModal(`
    <div class="modal">
      <div class="modal-header">
        <h2>Edit Plan</h2>
        <button class="close-btn" onclick="closeModal()">×</button>
      </div>
      <div id="modal-err"></div>
      <div class="form-group">
        <label>Plan Name</label>
        <input class="form-control" id="p-name" value="${p.name}">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Duration (days)</label>
          <input class="form-control" id="p-days" type="number" min="1" value="${p.duration_days}">
        </div>
        <div class="form-group">
          <label>Price ($)</label>
          <input class="form-control" id="p-price" type="number" min="0" step="0.01" value="${Number(p.price).toFixed(2)}">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="submitEditPlan(${id})">Save Changes</button>
      </div>
    </div>
  `);
}

async function submitEditPlan(id) {
  const res = await api.plans.update(id, {
    name:          document.getElementById('p-name').value.trim(),
    duration_days: parseInt(document.getElementById('p-days').value),
    price:         parseFloat(document.getElementById('p-price').value),
  });
  if (res.error) {
    document.getElementById('modal-err').innerHTML = `<div class="alert alert-error">${res.message}</div>`;
    return;
  }
  closeModal(); toast('Plan updated'); loadPlans();
}

async function deletePlan(id, name) {
  if (!confirm(`Delete plan "${name}"?`)) return;
  const res = await api.plans.remove(id);
  if (res.error) { toast(res.message, 'error'); return; }
  toast('Plan deleted'); loadPlans();
}

loadPlans();
