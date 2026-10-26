/* Purpose: Timesheet Management view matching client UI design Image 3. */
import { h, icon } from '../../../core/dom.js';
import { router } from '../../../core/router.js';
import { toastSuccess as toast, openModal } from '../../../components/ui.js';

function animateCounter(el, target, prefix = '', suffix = '') {
  const isFloat = String(target).includes('.');
  const num = parseFloat(String(target).replace(/,/g, '')) || 0;
  const dur = 750;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const cur = num * ease;
    const formatted = isFloat ? cur.toFixed(1) : new Intl.NumberFormat('en-IN').format(Math.round(cur));
    el.textContent = `${prefix}${formatted}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export default async function timesheetsView() {
  const root = h('div', { class: 'dash-animate-fade', style: 'display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px;' });

  // 1. Header with Breadcrumb, Title, Subtitle, Date Range Picker & Add Timesheet button
  let selectedDateRange = 'Sep 1, 2026 – Sep 30, 2026';
  const rangeBtn = h('button', {
    class: 'period-chip',
    type: 'button',
    onClick: (e) => toggleRangeMenu(e)
  },
    icon('calendar', { size: 14 }),
    h('span', { class: 'period-chip__label' }, selectedDateRange),
    icon('chevron-down', { size: 14 })
  );

  function toggleRangeMenu(e) {
    e.stopPropagation();
    const existing = document.getElementById('timesheet-range-popover');
    if (existing) {
      existing.remove();
      return;
    }
    const ranges = [
      'Sep 1, 2026 – Sep 30, 2026',
      'Aug 1, 2026 – Aug 31, 2026',
      'Jul 1, 2026 – Jul 31, 2026',
      'Last 7 Days',
      'Current Week'
    ];
    const pop = h('div', {
      id: 'timesheet-range-popover',
      class: 'dash-animate-scale',
      style: `position: absolute; right: 0; top: calc(100% + 6px); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); z-index: 50; min-width: 210px; padding: 4px; display: flex; flex-direction: column; gap: 2px;`
    }, ...ranges.map((r) => h('button', {
      type: 'button',
      style: `padding: 7px 12px; text-align: left; background: ${r === selectedDateRange ? 'var(--surface-2)' : 'transparent'}; border: none; border-radius: 6px; font-size: 12px; font-weight: ${r === selectedDateRange ? '700' : '500'}; color: var(--text); cursor: pointer; transition: background 0.15s;`,
      onClick: () => {
        selectedDateRange = r;
        rangeBtn.querySelector('.period-chip__label').textContent = r;
        pop.remove();
        toast(`Date range updated to ${r}`);
      }
    }, r)));

    rangeBtn.parentElement.style.position = 'relative';
    rangeBtn.parentElement.append(pop);

    const closeHandler = (ev) => {
      if (!rangeBtn.parentElement.contains(ev.target)) {
        pop.remove();
        document.removeEventListener('click', closeHandler);
        window.removeEventListener('scroll', closeHandler);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
      window.addEventListener('scroll', closeHandler, { passive: true, once: true });
    }, 10);
  }

  const addTimesheetBtn = h('button', {
    class: 'btn',
    type: 'button',
    style: 'background: #0B132B; color: #FFFFFF; font-weight: 700; border-radius: 8px; padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(11,19,43,0.25); cursor: pointer;',
    onClick: () => openAddTimesheetModal()
  },
    icon('plus', { size: 16 }),
    h('span', null, 'Add Timesheet'),
    icon('chevron-down', { size: 14 })
  );

  function openAddTimesheetModal() {
    openModal({
      title: 'Submit New Employee Timesheet',
      size: 'md',
      body: h('div', { class: 'stack gap-3' },
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Employee'),
          h('select', { class: 'input' },
            h('option', null, 'Arun Kumar (EMP0012) - TCS'),
            h('option', null, 'Priya Sharma (EMP0034) - Infosys'),
            h('option', null, 'Vikram S (EMP0045) - Wipro')
          )
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Timesheet Week / Period'),
          h('input', { class: 'input', value: 'Sep 1 – Sep 7, 2026' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Logged Billable Hours'),
          h('input', { type: 'number', class: 'input', value: '40' })
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => toast('Timesheet submitted for review!') }, 'Submit Timesheet')
        )
      )
    });
  }

  const header = h('div', { class: 'dash-header' },
    h('div', { class: 'dash-header__left' },
      h('div', { style: 'font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;' },
        h('span', null, 'Staffing / Timesheets')
      ),
      h('h1', { class: 'dash-header__title' }, 'Timesheet Management'),
      h('p', { class: 'dash-header__sub' }, 'Track, approve and manage employee timesheets across all client deployments.')
    ),
    h('div', { class: 'dash-header__right', style: 'display: flex; align-items: center; gap: 10px;' },
      h('div', { style: 'position: relative;' }, rangeBtn),
      addTimesheetBtn
    )
  );

  // 2. 6 KPI Cards matching Image 3
  const kpisData = [
    { title: 'Total Timesheets', target: 1248, prefix: '', suffix: '', trend: '↑ 12%', trendDir: 'up', sub: 'vs last month', iconBg: '#EFF6FF', iconColor: '#1E60FF', iconName: 'file-text' },
    { title: 'Approved', target: 1026, prefix: '', suffix: '', trend: '↑ 18%', trendDir: 'up', sub: 'vs last month', iconBg: '#ECFDF5', iconColor: '#10B981', iconName: 'check-circle' },
    { title: 'Pending Approval', target: 156, prefix: '', suffix: '', trend: '↓ 6%', trendDir: 'down', sub: 'vs last month', iconBg: '#FEF3C7', iconColor: '#D97706', iconName: 'clock' },
    { title: 'Rejected', target: 66, prefix: '', suffix: '', trend: '↓ 4%', trendDir: 'down', sub: 'vs last month', iconBg: '#FEE2E2', iconColor: '#EF4444', iconName: 'x-circle' },
    { title: 'Total Hours', target: 18420, prefix: '', suffix: '', trend: '↑ 14%', trendDir: 'up', sub: 'vs last month', iconBg: '#F5F3FF', iconColor: '#7C3AED', iconName: 'clock' },
    { title: 'Billable Amount', target: 48.5, prefix: '₹', suffix: 'L', trend: '↑ 20%', trendDir: 'up', sub: 'vs last month', iconBg: '#ECFDF5', iconColor: '#059669', iconName: 'indian-rupee' },
  ];

  const kpisContainer = h('div', { class: 'kpi-grid' });
  kpisData.forEach((k) => {
    const valEl = h('div', { class: 'kpi-card__val' }, `${k.prefix}0${k.suffix}`);
    const card = h('div', { class: 'kpi-card' },
      h('div', { class: 'kpi-card__top' },
        h('div', { class: 'kpi-card__icon-box', style: `background: ${k.iconBg}; color: ${k.iconColor};` },
          icon(k.iconName, { size: 18 })
        )
      ),
      valEl,
      h('div', { class: 'kpi-card__title' }, k.title),
      h('div', { class: 'kpi-card__meta' },
        k.trend ? h('span', { class: `kpi-card__trend kpi-card__trend--${k.trendDir}` }, k.trend) : null,
        h('span', { class: 'kpi-card__trend-sub' }, k.sub)
      )
    );
    kpisContainer.append(card);
    animateCounter(valEl, k.target, k.prefix, k.suffix);
  });

  // 3. Subtabs Bar (Employee Timesheets, Client-wise View, Project-wise View, Calendar View, Reports)
  const tabNames = ['Employee Timesheets', 'Client-wise View', 'Project-wise View', 'Calendar View', 'Reports'];
  let activeTab = 'Employee Timesheets';
  const subtabsBar = h('div', { class: 'dash-subtabs' },
    ...tabNames.map((tab) => h('button', {
      class: `dash-subtab${tab === activeTab ? ' active' : ''}`,
      type: 'button',
      onClick: (e) => {
        activeTab = tab;
        subtabsBar.querySelectorAll('.dash-subtab').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        toast(`Switched view to ${tab}`);
      }
    }, tab))
  );

  // 4. Main Split: Left Table & Toolbar (75%) vs Right Side Panel (25%)
  const mainSplit = h('div', { style: 'display: grid; grid-template-columns: 3.1fr 1fr; gap: 16px; align-items: start;' });

  // Filter Toolbar matching Image 3
  let filterClient = 'all';
  let filterProject = 'all';
  let filterStatus = 'all';
  let searchQuery = '';

  const clientSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterClient = e.target.value; renderTableRows(); }
  },
    h('option', { value: 'all' }, 'All Clients'),
    h('option', { value: 'TCS' }, 'TCS'),
    h('option', { value: 'Infosys' }, 'Infosys'),
    h('option', { value: 'Wipro' }, 'Wipro'),
    h('option', { value: 'HCL' }, 'HCL'),
    h('option', { value: 'Accenture' }, 'Accenture')
  );

  const projectSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterProject = e.target.value; renderTableRows(); }
  },
    h('option', { value: 'all' }, 'All Projects'),
    h('option', { value: 'Application Development' }, 'Application Development'),
    h('option', { value: 'QA & Testing' }, 'QA & Testing'),
    h('option', { value: 'Infrastructure' }, 'Infrastructure'),
    h('option', { value: 'Cloud Operations' }, 'Cloud Operations')
  );

  const typeSelect = h('select', { class: 'table-toolbar__select' },
    h('option', { value: 'all' }, 'All Types'),
    h('option', { value: 'Contract' }, 'Contract'),
    h('option', { value: 'Full-time' }, 'Full-time')
  );

  const statusSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterStatus = e.target.value; renderTableRows(); }
  },
    h('option', { value: 'all' }, 'All Status'),
    h('option', { value: 'Approved' }, 'Approved'),
    h('option', { value: 'Pending' }, 'Pending'),
    h('option', { value: 'Rejected' }, 'Rejected')
  );

  const searchInput = h('input', {
    type: 'search',
    class: 'table-toolbar__search-input',
    placeholder: 'Search employees...',
    onInput: (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTableRows();
    }
  });

  const toolbar = h('div', { class: 'table-toolbar' },
    h('div', { class: 'table-toolbar__filters' },
      clientSelect,
      projectSelect,
      typeSelect,
      statusSelect,
      h('div', { class: 'table-toolbar__search-wrap' },
        icon('search', { size: 14, cls: 'table-toolbar__search-icon' }),
        searchInput
      )
    ),
    h('div', { class: 'table-toolbar__actions' },
      h('button', {
        class: 'table-toolbar__btn',
        type: 'button',
        onClick: () => toast('Filters drawer opened')
      },
        icon('sliders-horizontal', { size: 14 }),
        h('span', null, 'Filters')
      ),
      h('button', {
        class: 'table-toolbar__btn',
        type: 'button',
        onClick: () => toast('Exporting timesheet CSV...')
      },
        icon('download', { size: 14 }),
        h('span', null, 'Export')
      )
    )
  );

  // 10 Rows of Timesheet Data matching Image 3
  const timesheetRowsData = [
    { num: 1, name: 'Arun Kumar', id: 'EMP0012', client: 'TCS', clientClass: 'company-pill--tcs', project: 'Application Development', period: 'Sep 1 – Sep 7, 2026', hours: '42h', status: 'Approved', statusClass: 'dash-status-pill--approved' },
    { num: 2, name: 'Priya Sharma', id: 'EMP0034', client: 'Infosys', clientClass: 'company-pill--infosys', project: 'QA & Testing', period: 'Sep 1 – Sep 7, 2026', hours: '40h', status: 'Pending', statusClass: 'dash-status-pill--pending' },
    { num: 3, name: 'Vikram S', id: 'EMP0045', client: 'Wipro', clientClass: 'company-pill--wipro', project: 'Infrastructure', period: 'Sep 1 – Sep 7, 2026', hours: '38h', status: 'Approved', statusClass: 'dash-status-pill--approved' },
    { num: 4, name: 'Sneha R', id: 'EMP0067', client: 'HCL', clientClass: 'company-pill--hcl', project: 'Product Support', period: 'Sep 1 – Sep 7, 2026', hours: '40h', status: 'Pending', statusClass: 'dash-status-pill--pending' },
    { num: 5, name: 'Karthik M', id: 'EMP0078', client: 'Accenture', clientClass: 'company-pill--accenture', project: 'Cloud Operations', period: 'Sep 1 – Sep 7, 2026', hours: '44h', status: 'Approved', statusClass: 'dash-status-pill--approved' },
    { num: 6, name: 'Divya K', id: 'EMP0089', client: 'Tech Mahindra', clientClass: 'company-pill--techmahindra', project: 'Service Desk', period: 'Sep 1 – Sep 7, 2026', hours: '36h', status: 'Pending', statusClass: 'dash-status-pill--pending' },
    { num: 7, name: 'Ramesh P', id: 'EMP0091', client: 'Cognizant', clientClass: 'company-pill--cognizant', project: 'Network Support', period: 'Sep 1 – Sep 7, 2026', hours: '40h', status: 'Approved', statusClass: 'dash-status-pill--approved' },
    { num: 8, name: 'Anjali S', id: 'EMP0104', client: 'L&T', clientClass: 'company-pill--lt', project: 'Data Analytics', period: 'Sep 1 – Sep 7, 2026', hours: '42h', status: 'Rejected', statusClass: 'dash-status-pill--rejected' },
    { num: 9, name: 'Sachin V', id: 'EMP0112', client: 'IBM', clientClass: 'company-pill--ibm', project: 'Cloud Migration', period: 'Sep 1 – Sep 7, 2026', hours: '40h', status: 'Approved', statusClass: 'dash-status-pill--approved' },
    { num: 10, name: 'Meera N', id: 'EMP0120', client: 'Capgemini', clientClass: 'company-pill--capgemini', project: 'Business Analysis', period: 'Sep 1 – Sep 7, 2026', hours: '38h', status: 'Pending', statusClass: 'dash-status-pill--pending' },
  ];

  const tableBody = h('tbody');
  const selectAllCheckbox = h('input', {
    type: 'checkbox',
    onChange: (e) => {
      const isChecked = e.target.checked;
      tableBody.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = isChecked);
    }
  });

  function renderTableRows() {
    tableBody.replaceChildren();
    const filtered = timesheetRowsData.filter((r) => {
      if (filterClient !== 'all' && r.client !== filterClient) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (searchQuery && !r.name.toLowerCase().includes(searchQuery) && !r.client.toLowerCase().includes(searchQuery) && !r.project.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (filtered.length === 0) {
      tableBody.append(h('tr', null,
        h('td', { colspan: 8, style: 'text-align: center; padding: 32px; color: var(--text-muted);' }, 'No timesheets match current filter criteria.')
      ));
      return;
    }

    filtered.forEach((r) => {
      const row = h('tr', null,
        h('td', { style: 'width: 36px;' },
          h('input', { type: 'checkbox' })
        ),
        h('td', { style: 'color: var(--text-muted); width: 28px;' }, String(r.num)),
        h('td', null,
          h('div', { class: 'table-emp-cell' },
            h('div', { class: 'table-emp-avatar-fallback' }, r.name[0]),
            h('div', { class: 'table-emp-meta' },
              h('span', { class: 'table-emp-name' }, r.name),
              h('span', { class: 'table-emp-id' }, r.id)
            )
          )
        ),
        h('td', null,
          h('div', { class: 'company-cell' },
            h('span', { class: `company-pill ${r.clientClass}` }, r.client),
            h('span', null, r.client)
          )
        ),
        h('td', null, r.project),
        h('td', null, r.period),
        h('td', { style: 'font-weight: 700;' }, r.hours),
        h('td', null,
          h('span', { class: `dash-status-pill ${r.statusClass}` }, r.status)
        ),
        h('td', null,
          h('button', {
            class: 'dash-action-btn',
            type: 'button',
            onClick: () => toast(`Actions for ${r.name}'s timesheet`)
          }, '⋮')
        )
      );
      tableBody.append(row);
    });
  }

  renderTableRows();

  const tableWrap = h('div', { class: 'dash-table-wrap' },
    h('div', { style: 'overflow-x: auto;' },
      h('table', { class: 'dash-table' },
        h('thead', null,
          h('tr', null,
            h('th', { style: 'width: 36px;' }, selectAllCheckbox),
            h('th', { style: 'width: 28px;' }, '#'),
            h('th', null, 'Employee'),
            h('th', null, 'Client Company'),
            h('th', null, 'Project / Department'),
            h('th', null, 'Week / Period'),
            h('th', null, 'Total Hours'),
            h('th', null, 'Status'),
            h('th', null, 'Actions')
          )
        ),
        tableBody
      )
    ),
    h('div', { class: 'table-foot' },
      h('span', null, 'Showing 1 to 10 of 1,248 entries'),
      h('div', { class: 'pagination-btns' },
        h('button', { class: 'page-num-btn' }, '‹'),
        h('button', { class: 'page-num-btn active' }, '1'),
        h('button', { class: 'page-num-btn' }, '2'),
        h('button', { class: 'page-num-btn' }, '3'),
        h('button', { class: 'page-num-btn' }, '4'),
        h('button', { class: 'page-num-btn' }, '5'),
        h('span', { style: 'padding: 0 4px; color: var(--text-muted);' }, '…'),
        h('button', { class: 'page-num-btn' }, '125'),
        h('button', { class: 'page-num-btn' }, '›')
      )
    )
  );

  const leftCol = h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' },
    toolbar,
    tableWrap
  );

  // 5. Right Side Panel: 4 Cards
  const rightCol = h('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });

  // 5.1 Pending Approvals Panel
  const pendingApprovalsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 12px;' },
      h('h2', { class: 'panel-card__title' }, 'Pending Approvals'),
      h('span', { class: 'panel-card__link', onClick: () => toast('View all pending timesheets') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
      [
        { count: 156, text: 'Timesheets pending', icon: 'file-text', bg: '#FEE2E2', color: '#EF4444' },
        { count: 12, text: 'Client approvals pending', icon: 'file-check', bg: '#FEF3C7', color: '#D97706' },
        { count: 8, text: 'Manager approvals pending', icon: 'user', bg: '#EFF6FF', color: '#1E60FF' },
        { count: 4, text: 'Overtime approvals', icon: 'clock', bg: '#CCFBF1', color: '#0D9488' }
      ].map((it) => h('div', {
        style: 'display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border);'
      },
        h('div', { style: `width: 28px; height: 28px; border-radius: 6px; background: ${it.bg}; color: ${it.color}; display: grid; place-items: center; flex-shrink: 0;` },
          icon(it.icon, { size: 14 })
        ),
        h('div', { style: 'display: flex; align-items: baseline; gap: 6px;' },
          h('span', { style: 'font-weight: 800; font-size: 13px; color: var(--text);' }, String(it.count)),
          h('span', { style: 'font-size: 12px; color: var(--text-muted);' }, it.text)
        )
      ))
    )
  );

  // 5.2 Timesheet Submission Gauge (82%)
  const subCirc = 2 * Math.PI * 45;
  const subDash = 0.82 * subCirc;
  const submissionGaugeCard = h('div', { class: 'circular-gauge-card' },
    h('div', { class: 'circular-gauge-head' },
      h('h2', { class: 'circular-gauge-title' }, 'Timesheet Submission')
    ),
    h('div', { class: 'circular-gauge-wrap' },
      (() => {
        const div = document.createElement('div');
        div.style.cssText = 'width: 110px; height: 110px; flex-shrink: 0; position: relative;';
        div.innerHTML = `
          <svg viewBox="0 0 110 110" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" stroke-width="12" />
            <circle cx="55" cy="55" r="45" fill="none" stroke="#1E60FF" stroke-width="12"
              stroke-dasharray="${subDash} ${subCirc - subDash}" stroke-linecap="round" />
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--text);">82%</span>
          </div>
        `;
        return div;
      })(),
      h('div', { class: 'circular-gauge-meta' },
        h('div', { style: 'font-size: 11px; color: var(--text-muted); margin-bottom: 4px;' },
          'Submission Rate',
          h('div', { style: 'font-weight: 700; color: var(--text); font-size: 12.5px;' }, '1,248 / 1,520')
        ),
        h('div', { class: 'circular-gauge-legend-item' },
          h('span', { class: 'circular-gauge-legend-dot', style: 'background: #1E60FF;' }),
          h('span', null, 'Submitted 1,248')
        ),
        h('div', { class: 'circular-gauge-legend-item' },
          h('span', { class: 'circular-gauge-legend-dot', style: 'background: #CBD5E1;' }),
          h('span', null, 'Not Submitted 272')
        )
      )
    )
  );

  // 5.3 Quick Actions (Bulk Approve, Bulk Reject, Send Reminder, Generate Report)
  const quickActionsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 12px;' },
      h('h2', { class: 'panel-card__title' }, 'Quick Actions')
    ),
    h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 8px;' },
      [
        { label: 'Bulk Approve', icon: 'check-square', action: () => toast('Selected timesheets approved!') },
        { label: 'Bulk Reject', icon: 'x-square', action: () => toast('Bulk reject prompt opened') },
        { label: 'Send Reminder', icon: 'bell', action: () => toast('Submission reminders sent to 272 pending staff!') },
        { label: 'Generate Report', icon: 'file-bar-chart', action: () => toast('Generated Timesheet Audit PDF') },
      ].map((it) => h('button', {
        class: 'btn btn--ghost',
        style: 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; padding: 12px 6px; border: 1px solid var(--border); border-radius: 8px; font-size: 11.5px; font-weight: 600; color: #1E60FF; background: var(--surface); transition: all 0.15s ease;',
        onClick: it.action
      },
        icon(it.icon, { size: 18 }),
        h('span', { style: 'text-align: center; color: var(--text);' }, it.label)
      ))
    )
  );

  // 5.4 Clock Promo Banner Card
  const clockPromoCard = h('div', { class: 'promo-banner-card promo-banner-card--sky', style: 'flex-direction: column; align-items: flex-start;' },
    h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
      h('span', { style: 'font-size: 30px;' }, '⏱️'),
      h('div', null,
        h('h3', { class: 'promo-banner-card__title', style: 'font-size: 13.5px;' }, 'Track People. Power Progress.'),
        h('p', { class: 'promo-banner-card__text', style: 'font-size: 11px;' }, 'Accurate timesheets. Transparent billing. Stronger client relationships.')
      )
    )
  );

  rightCol.append(pendingApprovalsCard, submissionGaugeCard, quickActionsCard, clockPromoCard);

  mainSplit.append(leftCol, rightCol);

  // 6. Footer
  const footerRow = h('div', { style: 'display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 12px 4px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px;' },
    h('span', { style: 'font-size: 12px; color: var(--text-muted);' }, '© 2026 Ellowring. All rights reserved.'),
    h('span', { class: 'dash-tagline', style: 'margin: 0;' }, 'One Ecosystem. Zero Gaps. Total Business Automation.')
  );

  root.append(
    header,
    kpisContainer,
    subtabsBar,
    mainSplit,
    footerRow
  );

  return root;
}
