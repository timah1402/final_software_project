initLayout('reports');

async function loadReports() {
  const [membership, sessions] = await Promise.all([
    api.reports.memberships(),
    api.reports.sessions(),
  ]);

  document.getElementById('main').innerHTML = `
    <div class="page-header">
      <div class="page-header-text">
        <h1>Reports</h1>
        <p>Membership status and session utilization</p>
      </div>
    </div>

    <div class="section" style="margin-bottom:24px">
      <div class="section-header">
        <span class="section-title">Membership Report</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px">
        <div class="stat-card">
          <div class="stat-label">Active Memberships</div>
          <div class="stat-value green">${membership.active || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Expired Memberships</div>
          <div class="stat-value red">${membership.expired || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Memberships</div>
          <div class="stat-value blue">${membership.total || 0}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <span class="section-title">Session Utilization Report</span>
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
              <th>Available</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            ${sessions.length ? sessions.map(s => {
              const pct = s.utilization_percent;
              const cls = pct >= 90 ? 'high' : pct >= 60 ? 'med' : '';
              const badgeCls = pct >= 90 ? 'badge-red' : pct >= 60 ? 'badge-yellow' : 'badge-green';
              return `<tr>
                <td><strong>${s.title}</strong></td>
                <td>${s.trainer || '—'}</td>
                <td>${fmtDT(s.date_time)}</td>
                <td>${s.capacity}</td>
                <td>${s.confirmed_bookings}</td>
                <td>${s.available_spots}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="progress-bar">
                      <div class="progress-fill ${cls}" style="width:${pct}%"></div>
                    </div>
                    <span class="badge ${badgeCls}">${pct}%</span>
                  </div>
                </td>
              </tr>`;
            }).join('') : '<tr><td colspan="7" class="empty-state">No sessions found</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

loadReports();
