const metricsContainer = document.getElementById('metrics');
const funnelContainer = document.getElementById('funnel');
const leadsTableBody = document.querySelector('#leadsTable tbody');
const exportBtn = document.getElementById('exportBtn');

const fetchJson = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const renderMetricCard = (label, value, subLabel) => {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `<h3>${label}</h3><p class="metric">${value}</p><p class="micro">${subLabel}</p>`;
  metricsContainer.appendChild(card);
};

const renderFunnelCard = (label, value, percent) => {
  const card = document.createElement('div');
  card.className = 'admin-card';
  card.innerHTML = `
    <h3>${label}</h3>
    <p class="metric">${value}</p>
    <div style="background:#e2e8f0;border-radius:8px;height:8px;overflow:hidden;">
      <div style="width:${percent}%;height:8px;background:#1a73e8;"></div>
    </div>
    <p class="micro">${percent}% conversion</p>
  `;
  funnelContainer.appendChild(card);
};

const loadDashboard = async () => {
  const analytics = await fetchJson('/api/admin/analytics');
  const leads = await fetchJson('/api/admin/leads');
  const funnel = await fetchJson('/api/admin/funnel');

  metricsContainer.innerHTML = '';
  renderMetricCard('Total Leads', analytics.totals.totalLeads, 'All time');
  renderMetricCard('Hot Leads', analytics.totals.hotLeads, 'High intent');
  renderMetricCard('Warm Leads', analytics.totals.warmLeads, 'Follow up soon');
  renderMetricCard('Cold Leads', analytics.totals.coldLeads, 'Nurture');
  renderMetricCard('Tracked Events', analytics.totalEvents, 'Behavioral signals');

  const startCount = funnel.formStarts || 1;
  const stepRate = Math.round((funnel.stepCompletions / startCount) * 100);
  const submitRate = Math.round((funnel.submissions / startCount) * 100);
  funnelContainer.innerHTML = '';
  renderFunnelCard('Form Starts', funnel.formStarts, 100);
  renderFunnelCard('Step Completions', funnel.stepCompletions, stepRate);
  renderFunnelCard('Submissions', funnel.submissions, submitRate);

  leadsTableBody.innerHTML = '';
  leads.forEach((lead) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${lead.firstName || ''} ${lead.lastName || ''}</td>
      <td>${lead.email || ''}</td>
      <td>${lead.company || ''}</td>
      <td>${lead.score || 0}</td>
      <td>${lead.temperature || 'cold'}</td>
      <td>${new Date(lead.createdAt).toLocaleDateString()}</td>
    `;
    leadsTableBody.appendChild(row);
  });
};

exportBtn.addEventListener('click', () => {
  window.location.href = '/api/admin/export';
});

loadDashboard();
