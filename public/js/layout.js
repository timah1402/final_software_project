function initLayout(activePage) {
  guard();
  const staff = JSON.parse(localStorage.getItem('gym_staff') || '{}');

  const nav = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard.html' },
    { id: 'members',   label: 'Members',   href: '/members.html'   },
    { id: 'sessions',  label: 'Sessions',  href: '/sessions.html'  },
    { id: 'plans',     label: 'Plans',     href: '/plans.html'     },
    { id: 'reports',   label: 'Reports',   href: '/reports.html'   },
    { id: 'staff',     label: 'Staff',     href: '/staff.html', adminOnly: true },
  ];

  document.getElementById('app').innerHTML = `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-logo">Gym<span>Pro</span></div>
        <nav class="sidebar-nav">
          ${nav.filter(n => !n.adminOnly || staff.role === 'admin').map(n => `
            <a href="${n.href}" class="nav-item ${activePage === n.id ? 'active' : ''}">
              ${n.label}
            </a>
          `).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="staff-name">${staff.name || ''}</div>
          <div class="staff-role">${staff.role || ''}</div>
          <button class="logout-btn" onclick="logout()">Sign Out</button>
        </div>
      </aside>
      <main class="main" id="main"></main>
    </div>
  `;
}

function logout() {
  localStorage.clear();
  window.location.href = '/';
}

function getStaff() {
  return JSON.parse(localStorage.getItem('gym_staff') || '{}');
}

function isAdmin() {
  return getStaff().role === 'admin';
}

function showModal(html) {
  closeModal();
  const div = document.createElement('div');
  div.className = 'overlay';
  div.id = 'modal-overlay';
  div.innerHTML = html;
  div.addEventListener('click', e => { if (e.target === div) closeModal(); });
  document.body.appendChild(div);
}

function closeModal() {
  const el = document.getElementById('modal-overlay');
  if (el) el.remove();
}

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function fmt(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDT(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}
