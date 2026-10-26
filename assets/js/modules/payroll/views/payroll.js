/* Purpose: Process Payroll view matching client UI design Image 4. */
import { h, icon } from '../../../core/dom.js';
import { router } from '../../../core/router.js';
import { toastSuccess as toast, openModal } from '../../../components/ui.js';

function formatInr(val) {
  return new Intl.NumberFormat('en-IN').format(val);
}

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

export default async function payrollView() {
  const root = h('div', { class: 'dash-animate-fade', style: 'display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px;' });

  // 1. Header with Breadcrumb, Title, Subtitle, Period Selector & Process Payroll Button
  let selectedPeriod = 'Sep 2026';
  const periodBtn = h('button', {
    class: 'period-chip',
    type: 'button',
    onClick: (e) => togglePeriodMenu(e)
  },
    icon('calendar', { size: 14 }),
    h('span', { class: 'period-chip__label' }, selectedPeriod),
    icon('chevron-down', { size: 14 })
  );

  function togglePeriodMenu(e) {
    e.stopPropagation();
    const existing = document.getElementById('payroll-period-popover');
    if (existing) {
      existing.remove();
      return;
    }
    const periods = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026'];
    const pop = h('div', {
      id: 'payroll-period-popover',
      class: 'dash-animate-scale',
      style: `position: absolute; right: 0; top: calc(100% + 6px); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); z-index: 50; min-width: 140px; padding: 4px; display: flex; flex-direction: column; gap: 2px;`
    }, ...periods.map((p) => h('button', {
      type: 'button',
      style: `padding: 7px 12px; text-align: left; background: ${p === selectedPeriod ? 'var(--surface-2)' : 'transparent'}; border: none; border-radius: 6px; font-size: 12.5px; font-weight: ${p === selectedPeriod ? '700' : '500'}; color: var(--text); cursor: pointer; transition: background 0.15s;`,
      onClick: () => {
        selectedPeriod = p;
        periodBtn.querySelector('.period-chip__label').textContent = p;
        pop.remove();
        toast(`Viewing payroll for ${p}`);
      }
    }, p)));

    periodBtn.parentElement.style.position = 'relative';
    periodBtn.parentElement.append(pop);

    const closeHandler = (ev) => {
      if (!periodBtn.parentElement.contains(ev.target)) {
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

  const runPayrollBtn = h('button', {
    class: 'btn',
    type: 'button',
    style: 'background: #0B132B; color: #FFFFFF; font-weight: 700; border-radius: 8px; padding: 8px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(11,19,43,0.25); cursor: pointer;',
    onClick: () => triggerRunPayrollWizard()
  },
    icon('play', { size: 14 }),
    h('span', null, 'Process Payroll')
  );

  function triggerRunPayrollWizard() {
    openModal({
      title: 'Run Payroll Calculation · September 2026',
      size: 'md',
      body: h('div', { class: 'stack gap-3' },
        h('p', { class: 'text-sm text-muted' }, 'Calculating salary computation for 428 employees (312 internal, 116 client-deployed).'),
        h('div', { class: 'grid gap-2' },
          h('div', { class: 'split p-3', style: 'background: var(--surface-2); border-radius: 8px;' },
            h('span', { class: 'text-sm fw-600' }, 'Total Gross Payable:'),
            h('span', { class: 'text-sm fw-700' }, '₹1,24,00,000')
          ),
          h('div', { class: 'split p-3', style: 'background: var(--surface-2); border-radius: 8px;' },
            h('span', { class: 'text-sm fw-600' }, 'Statutory Deductions (PF/ESI/PT/TDS):'),
            h('span', { class: 'text-sm fw-700 text-danger' }, '₹18,40,000')
          ),
          h('div', { class: 'split p-3', style: 'background: var(--surface-2); border-radius: 8px;' },
            h('span', { class: 'text-sm fw-600' }, 'Net Salary Transfer Amount:'),
            h('span', { class: 'text-sm fw-700 text-success' }, '₹98,60,000')
          )
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => toast('Payroll computation verified and locked!') }, 'Execute Payroll Run')
        )
      )
    });
  }

  const header = h('div', { class: 'dash-header' },
    h('div', { class: 'dash-header__left' },
      h('div', { style: 'font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;' },
        h('span', null, 'Payroll'),
        icon('chevron-right', { size: 12 }),
        h('span', { style: 'color: var(--text); font-weight: 600;' }, 'Process Payroll')
      ),
      h('h1', { class: 'dash-header__title' }, 'Process Payroll'),
      h('p', { class: 'dash-header__sub' }, 'Calculate, review and process salaries for your employees and deployed staff across all clients.')
    ),
    h('div', { class: 'dash-header__right', style: 'display: flex; align-items: center; gap: 10px;' },
      h('div', { style: 'position: relative;' }, periodBtn),
      runPayrollBtn
    )
  );

  // 2. 5 KPI Cards matching Image 4
  const kpisData = [
    { title: 'Total Employees', target: 428, prefix: '', suffix: '', trend: '', sub: '312 Internal | 116 Deployed', iconBg: '#EFF6FF', iconColor: '#1E60FF', iconName: 'users' },
    { title: 'Total Payroll (Gross)', target: 1.24, prefix: '₹', suffix: ' Cr', trend: '↑ 12%', trendDir: 'up', sub: 'vs last month', iconBg: '#ECFDF5', iconColor: '#10B981', iconName: 'indian-rupee' },
    { title: 'Net Payable', target: 98.6, prefix: '₹', suffix: ' L', trend: '↑ 10%', trendDir: 'up', sub: 'vs last month', iconBg: '#EFF6FF', iconColor: '#2563EB', iconName: 'user' },
    { title: 'Statutory Deductions', target: 18.4, prefix: '₹', suffix: ' L', trend: '↑ 8%', trendDir: 'up', sub: 'vs last month', iconBg: '#FEF3C7', iconColor: '#D97706', iconName: 'file-text' },
    { title: 'Ellowring Margin', target: 7.8, prefix: '₹', suffix: ' L', trend: '↑ 15%', trendDir: 'up', sub: 'vs last month', iconBg: '#F5F3FF', iconColor: '#7C3AED', iconName: 'pie-chart' },
  ];

  const kpisContainer = h('div', { class: 'kpi-grid kpi-grid--5' });
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

  // 3. Subtabs Bar
  const tabNames = ['Employee Payroll', 'Client-wise Payroll', 'Salary Components', 'Statutory Deductions', 'Bank Transfer', 'Reports'];
  let activeTab = 'Employee Payroll';
  const subtabsBar = h('div', { class: 'dash-subtabs' },
    ...tabNames.map((tab) => h('button', {
      class: `dash-subtab${tab === activeTab ? ' active' : ''}`,
      type: 'button',
      onClick: (e) => {
        activeTab = tab;
        subtabsBar.querySelectorAll('.dash-subtab').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        toast(`Viewing ${tab}`);
      }
    }, tab))
  );

  // 4. Main Split: Left Table & Toolbar (75%) vs Right Side Summary & Actions (25%)
  const mainSplit = h('div', { style: 'display: grid; grid-template-columns: 3.1fr 1fr; gap: 16px; align-items: start;' });

  // Toolbar Filters
  let filterClient = 'all';
  let filterType = 'all';
  let filterDept = 'all';
  let filterStatus = 'all';
  let searchQuery = '';

  const clientSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterClient = e.target.value; renderPayrollRows(); }
  },
    h('option', { value: 'all' }, 'All Clients'),
    h('option', { value: 'TCS' }, 'TCS'),
    h('option', { value: 'Infosys' }, 'Infosys'),
    h('option', { value: 'HCL' }, 'HCL'),
    h('option', { value: 'Accenture' }, 'Accenture'),
    h('option', { value: 'Internal' }, 'Internal Staff')
  );

  const typeSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterType = e.target.value; renderPayrollRows(); }
  },
    h('option', { value: 'all' }, 'All Types'),
    h('option', { value: 'Deployed' }, 'Deployed'),
    h('option', { value: 'Internal' }, 'Internal')
  );

  const deptSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterDept = e.target.value; renderPayrollRows(); }
  },
    h('option', { value: 'all' }, 'All Departments'),
    h('option', { value: 'Development' }, 'Development'),
    h('option', { value: 'QA & Testing' }, 'QA & Testing'),
    h('option', { value: 'Infrastructure' }, 'Infrastructure'),
    h('option', { value: 'Product' }, 'Product'),
    h('option', { value: 'HR' }, 'HR'),
    h('option', { value: 'Finance' }, 'Finance')
  );

  const statusSelect = h('select', {
    class: 'table-toolbar__select',
    onChange: (e) => { filterStatus = e.target.value; renderPayrollRows(); }
  },
    h('option', { value: 'all' }, 'All Status'),
    h('option', { value: 'Ready' }, 'Ready'),
    h('option', { value: 'On Hold' }, 'On Hold')
  );

  const searchInput = h('input', {
    type: 'search',
    class: 'table-toolbar__search-input',
    placeholder: 'Search employees...',
    onInput: (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderPayrollRows();
    }
  });

  const toolbar = h('div', { class: 'table-toolbar' },
    h('div', { class: 'table-toolbar__filters' },
      clientSelect,
      typeSelect,
      deptSelect,
      statusSelect,
      h('div', { class: 'table-toolbar__search-wrap' },
        icon('search', { size: 14, cls: 'table-toolbar__search-icon' }),
        searchInput
      )
    )
  );

  // 10 Rows matching Image 4
  const payrollRowsData = [
    { num: 1, name: 'Arun Kumar', id: 'EMP0012', clientDept: 'TCS Development', type: 'Deployed', days: 30, lop: 0, gross: 58000, ded: 8200, net: 49800, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 2, name: 'Priya Sharma', id: 'EMP0034', clientDept: 'Infosys QA & Testing', type: 'Deployed', days: 30, lop: 1, gross: 52000, ded: 7800, net: 44200, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 3, name: 'Vikram S', id: 'EMP0045', clientDept: 'HCL Infrastructure', type: 'Deployed', days: 30, lop: 0, gross: 48000, ded: 7200, net: 40800, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 4, name: 'Sneha R', id: 'EMP0067', clientDept: 'Internal Product', type: 'Internal', days: 30, lop: 0, gross: 75000, ded: 11500, net: 63500, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 5, name: 'Karthik M', id: 'EMP0078', clientDept: 'Accenture Cloud Operations', type: 'Deployed', days: 30, lop: 2, gross: 65000, ded: 9800, net: 55200, status: 'On Hold', statusClass: 'dash-status-pill--hold' },
    { num: 6, name: 'Divya K', id: 'EMP0089', clientDept: 'Tech Mahindra Service Desk', type: 'Deployed', days: 30, lop: 0, gross: 42000, ded: 6300, net: 35700, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 7, name: 'Ramesh P', id: 'EMP0091', clientDept: 'Internal HR', type: 'Internal', days: 30, lop: 0, gross: 68000, ded: 10400, net: 57600, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 8, name: 'Anjali S', id: 'EMP0104', clientDept: 'Wipro Support', type: 'Deployed', days: 30, lop: 1, gross: 46000, ded: 6900, net: 39100, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 9, name: 'Sachin V', id: 'EMP0112', clientDept: 'IBM Cloud', type: 'Deployed', days: 30, lop: 0, gross: 62000, ded: 9200, net: 52800, status: 'Ready', statusClass: 'dash-status-pill--ready' },
    { num: 10, name: 'Meera N', id: 'EMP0120', clientDept: 'Internal Finance', type: 'Internal', days: 30, lop: 0, gross: 70000, ded: 10800, net: 59200, status: 'Ready', statusClass: 'dash-status-pill--ready' },
  ];

  const tableBody = h('tbody');
  const selectAllCheckbox = h('input', {
    type: 'checkbox',
    onChange: (e) => {
      const isChecked = e.target.checked;
      tableBody.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = isChecked);
    }
  });

  function renderPayrollRows() {
    tableBody.replaceChildren();
    const filtered = payrollRowsData.filter((r) => {
      if (filterType !== 'all' && r.type !== filterType) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (filterClient !== 'all' && !r.clientDept.includes(filterClient)) return false;
      if (searchQuery && !r.name.toLowerCase().includes(searchQuery) && !r.clientDept.toLowerCase().includes(searchQuery)) return false;
      return true;
    });

    if (filtered.length === 0) {
      tableBody.append(h('tr', null,
        h('td', { colspan: 11, style: 'text-align: center; padding: 32px; color: var(--text-muted);' }, 'No employee payroll records match filters.')
      ));
      return;
    }

    filtered.forEach((r) => {
      const row = h('tr', null,
        h('td', { style: 'width: 36px;' }, h('input', { type: 'checkbox' })),
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
        h('td', null, r.clientDept),
        h('td', null, r.type),
        h('td', null, String(r.days)),
        h('td', null, String(r.lop)),
        h('td', { style: 'font-weight: 600;' }, formatInr(r.gross)),
        h('td', { style: 'color: #DC2626; font-weight: 600;' }, formatInr(r.ded)),
        h('td', { style: 'color: #15803D; font-weight: 700;' }, formatInr(r.net)),
        h('td', null,
          h('span', { class: `dash-status-pill ${r.statusClass}` }, r.status)
        ),
        h('td', null,
          h('button', {
            class: 'dash-action-btn',
            type: 'button',
            onClick: () => toast(`View payslip breakdown for ${r.name}`)
          }, '⋮')
        )
      );
      tableBody.append(row);
    });
  }

  renderPayrollRows();

  const tableWrap = h('div', { class: 'dash-table-wrap' },
    h('div', { style: 'overflow-x: auto;' },
      h('table', { class: 'dash-table' },
        h('thead', null,
          h('tr', null,
            h('th', { style: 'width: 36px;' }, selectAllCheckbox),
            h('th', { style: 'width: 28px;' }, '#'),
            h('th', null, 'Employee'),
            h('th', null, 'Client / Department'),
            h('th', null, 'Employment Type'),
            h('th', null, 'Total Days'),
            h('th', null, 'LOP'),
            h('th', null, 'Gross (₹)'),
            h('th', null, 'Deductions (₹)'),
            h('th', null, 'Net Pay (₹)'),
            h('th', null, 'Status'),
            h('th', null, 'Actions')
          )
        ),
        tableBody
      )
    ),
    h('div', { class: 'table-foot' },
      h('span', null, 'Showing 1 to 10 of 428 employees'),
      h('div', { class: 'pagination-btns' },
        h('button', { class: 'page-num-btn' }, '‹'),
        h('button', { class: 'page-num-btn active' }, '1'),
        h('button', { class: 'page-num-btn' }, '2'),
        h('button', { class: 'page-num-btn' }, '3'),
        h('button', { class: 'page-num-btn' }, '4'),
        h('button', { class: 'page-num-btn' }, '5'),
        h('span', { style: 'padding: 0 4px; color: var(--text-muted);' }, '…'),
        h('button', { class: 'page-num-btn' }, '43'),
        h('button', { class: 'page-num-btn' }, '›')
      ),
      h('div', { class: 'cluster gap-2', style: 'font-size: 12px; color: var(--text-muted);' },
        h('span', null, 'Rows per page'),
        h('select', { class: 'table-toolbar__select', style: 'height: 28px; padding: 0 20px 0 8px;' },
          h('option', null, '10')
        )
      )
    )
  );

  const leftCol = h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' },
    toolbar,
    tableWrap
  );

  // 5. Right Side Panel: Summary + Quick Actions + Promo
  const rightCol = h('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });

  // 5.1 Payroll Summary - Sep 2026 Card
  const summaryCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 14px;' },
      h('h2', { class: 'panel-card__title' }, 'Payroll Summary - Sep 2026')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' },
      [
        { label: 'Total Employees', val: '428', icon: 'users', color: '#1E60FF' },
        { label: 'Gross Salary', val: '₹1,24,00,000', icon: 'indian-rupee', color: '#10B981' },
        { label: 'Total Deductions', val: '₹18,40,000', icon: 'arrow-down', color: '#EF4444' },
        { label: 'Net Payable', val: '₹98,60,000', icon: 'wallet', color: '#2563EB' },
        { label: 'Ellowring Margin', val: '₹7,80,000', icon: 'percent', color: '#D97706' },
      ].map((it) => h('div', {
        style: 'display: flex; align-items: center; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border); font-size: 12.5px;'
      },
        h('div', { class: 'cluster gap-2', style: 'color: var(--text-muted);' },
          icon(it.icon, { size: 15, style: `color: ${it.color};` }),
          h('span', null, it.label)
        ),
        h('span', { style: 'font-weight: 700; color: var(--text);' }, it.val)
      ))
    )
  );

  // 5.2 Quick Actions (Process Payroll, Generate Payslips, Download Bank File, Generate Reports, Send Salary Notifications, Mark as Paid)
  const quickActionsData = [
    { label: 'Process Payroll', icon: 'play', color: '#1E60FF', action: () => triggerRunPayrollWizard() },
    { label: 'Generate Payslips', icon: 'file-text', color: '#0284C7', action: () => toast('Bulk generating 428 PDF payslips...') },
    { label: 'Download Bank File', icon: 'download', color: '#0D9488', action: () => toast('HDFC/ICICI CMS bank transfer Excel file downloaded!') },
    { label: 'Generate Reports', icon: 'bar-chart-2', color: '#2563EB', action: () => router.navigate('/analytics') },
    { label: 'Send Salary Notifications', icon: 'send', color: '#7C3AED', action: () => toast('WhatsApp & Email payslip links queued for sending!') },
    { label: 'Mark as Paid', icon: 'check-circle-2', color: '#15803D', action: () => toast('September 2026 payroll marked as DISBURSED & PAID!') },
  ];

  const quickActionsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 12px;' },
      h('h2', { class: 'panel-card__title' }, 'Quick Actions')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
      ...quickActionsData.map((q) => h('button', {
        class: 'quick-action-btn',
        type: 'button',
        onClick: q.action
      },
        h('div', { class: 'quick-action-btn__left' },
          h('div', { class: 'quick-action-btn__icon', style: `color: ${q.color}; background: rgba(30,96,255,0.08);` },
            icon(q.icon, { size: 14 })
          ),
          h('span', { class: 'quick-action-btn__label', style: 'font-size: 12px;' }, q.label)
        ),
        icon('chevron-right', { size: 14, cls: 'quick-action-btn__arrow' })
      ))
    )
  );

  // 5.3 Promo Card
  const promoCard = h('div', { class: 'promo-banner-card promo-banner-card--blue', style: 'flex-direction: column; align-items: flex-start;' },
    h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
      h('span', { style: 'font-size: 32px;' }, '💳'),
      h('div', null,
        h('h3', { class: 'promo-banner-card__title', style: 'font-size: 13.5px;' }, 'Accurate Payroll. Happy People. Stronger Business.'),
        h('p', { class: 'promo-banner-card__text', style: 'font-size: 11px;' }, 'Zero calculation errors. Instant PF/ESI compliance.')
      )
    )
  );

  rightCol.append(summaryCard, quickActionsCard, promoCard);

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
