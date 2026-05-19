initLayout('dashboard');

async function loadDashboard() {
  const [membership, sessions] = await Promise.all([
    api.reports.memberships(),
    api.reports.sessions(),
  ]);

  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Dashboard</h1>
        <p>Overview of gym operations</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Memberships</div>
        <div class="stat-value blue">${membership.total || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Active</div>
        <div class="stat-value green">${membership.active || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Expired</div>
        <div class="stat-value red">${membership.expired || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Sessions</div>
        <div class="stat-value blue">${sessions.length}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Session Utilization</span>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Session</th>
              <th>Trainer</th>
              <th>Date & Time</th>
              <th>Capacity</th>
              <th>Booked</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.length ? sessions.map(s => {
              const pct = s.utilization_percent;
              const cls = pct >= 90 ? 'high' : pct >= 60 ? 'med' : '';
              return `<tr>
                <td><strong>${s.title}</strong></td>
                <td>${s.trainer || '—'}</td>
                <td>${fmtDT(s.date_time)}</td>
                <td>${s.capacity}</td>
                <td>${s.confirmed_bookings}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar">
                      <div class="progress-fill ${cls}" style="width:${pct}%"></div>
                    </div>
                    <span class="text-muted">${pct}%</span>
                  </div>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="6" class="empty-state">No sessions found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

loadDashboard();
