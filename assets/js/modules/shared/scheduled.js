/* Purpose: Interactive module view for all modules matching the client Dashboard UI design with 6 glowing KPI cards, animated counters, subtabs, filter toolbar, rich data table, and right-hand bento summary panel. */
import { h, icon } from '../../core/dom.js';
import { router } from '../../core/router.js';
import { api } from '../../services/api.js';
import { toastSuccess, openModal } from '../../components/ui.js';
import { buildRecruitmentSubtab, buildLeaveSubtab, buildGenericSubtab } from './subtab-views.js';

function animateCounter(el, targetStr, duration = 800) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = targetStr;
    return;
  }
  const match = String(targetStr).match(/^([^0-9.]*)([0-9.]+)(.*)$/);
  if (!match) {
    el.textContent = targetStr;
    return;
  }
  const prefix = match[1] || '';
  const targetNum = parseFloat(match[2]);
  const suffix = match[3] || '';
  const isFloat = match[2].includes('.');
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = targetNum * ease;
    el.textContent = `${prefix}${isFloat ? current.toFixed(1) : Math.round(current).toLocaleString('en-IN')}${suffix}`;
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = targetStr;
  }
  requestAnimationFrame(update);
}

export default async function scheduledView(ctx) {
  const mod = ctx.module || { id: 'module', label: 'Module', summary: 'Enterprise workforce management module.' };

  // Load employee directory data from API / IndexedDB
  let employees = [];
  try {
    const res = await api.list('employees', { pageSize: 20, signal: ctx.signal });
    employees = res.data || [];
  } catch (err) {
    console.warn('Could not load employees:', err);
  }

  // Fallback demo employee list if DB is empty
  if (!employees.length) {
    employees = [
      { name: 'Arun Kumar', code: 'EMP0012', department: 'Development', designation: 'Senior Software Engineer', status: 'Active', type: 'Deployed', client: 'TCS' },
      { name: 'Priya Sharma', code: 'EMP0034', department: 'QA & Testing', designation: 'Quality Analyst Lead', status: 'Active', type: 'Deployed', client: 'Infosys' },
      { name: 'Vikram S', code: 'EMP0045', department: 'Infrastructure', designation: 'DevOps Specialist', status: 'Active', type: 'Deployed', client: 'HCL' },
      { name: 'Sneha R', code: 'EMP0067', department: 'Product', designation: 'Product Manager', status: 'Active', type: 'Internal', client: 'Internal' },
      { name: 'Karthik M', code: 'EMP0078', department: 'Operations', designation: 'Cloud Operations Eng.', status: 'Pending', type: 'Deployed', client: 'Accenture' },
      { name: 'Divya K', code: 'EMP0089', department: 'Service Desk', designation: 'Technical Support Lead', status: 'Active', type: 'Deployed', client: 'Tech Mahindra' },
      { name: 'Ramesh P', code: 'EMP0091', department: 'Human Resources', designation: 'HR Generalist', status: 'Active', type: 'Internal', client: 'Internal' },
      { name: 'Anjali S', code: 'EMP0104', department: 'Support', designation: 'Customer Support Lead', status: 'Active', type: 'Deployed', client: 'Wipro' },
      { name: 'Sachin V', code: 'EMP0112', department: 'Cloud Infra', designation: 'Database Architect', status: 'Active', type: 'Deployed', client: 'IBM' },
      { name: 'Meera N', code: 'EMP0120', department: 'Finance', designation: 'Financial Analyst', status: 'Active', type: 'Internal', client: 'Internal' },
    ];
  }

  // Module configuration profiles matching Dashboard standards
  const profiles = {
    attendance: {
      actionLabel: 'Clock In / Out',
      actionIcon: 'clock',
      subtabs: ['Live Board', 'Daily Register', 'Monthly Muster', 'Regularization', 'Shift Roster', 'Reports'],
      kpis: [
        { label: 'Present Today', val: '94.2%', target: '94.2%', trend: '↑ 2.4%', trendDir: 'up', sub: 'vs yesterday', icon: 'user-check', glow: '#10B981', box: 'mint' },
        { label: 'On Leave', val: '14', target: '14', trend: '↓ 3', trendDir: 'up', sub: 'approved leaves', icon: 'calendar-off', glow: '#6366F1', box: 'purple' },
        { label: 'Late Check-in', val: '6', target: '6', trend: '↓ 2', trendDir: 'up', sub: 'within grace', icon: 'clock', glow: '#F59E0B', box: 'teal' },
        { label: 'WFH / Remote', val: '28', target: '28', trend: '↑ 4', trendDir: 'up', sub: 'geo-verified', icon: 'laptop', glow: '#0EA5E9', box: 'sky' },
        { label: 'Overtime Hours', val: '142', target: '142', suffix: ' hrs', trend: '↑ 18 hrs', trendDir: 'up', sub: 'this week', icon: 'hourglass', glow: '#8B5CF6', box: 'purple' },
        { label: 'Muster Accuracy', val: '99.8%', target: '99.8%', trend: '↑ 0.3%', trendDir: 'up', sub: 'biometric sync', icon: 'shield-check', glow: '#10B981', box: 'blue' },
      ],
      donutTitle: 'Attendance Breakdown',
      donutStats: [
        { label: 'Present On-site', count: 378, color: '#10B981' },
        { label: 'WFH / Remote', count: 28, color: '#0EA5E9' },
        { label: 'Approved Leave', count: 14, color: '#6366F1' },
        { label: 'Late / Grace', count: 6, color: '#F59E0B' },
        { label: 'Unexcused', count: 2, color: '#DC2626' },
      ],
      quickActions: [
        { label: 'Quick Check-in / Punch', icon: 'fingerprint', action: 'Punch registered with GPS.' },
        { label: 'Request Attendance Regularization', icon: 'calendar-clock', action: 'Regularization request opened.' },
        { label: 'Download Monthly Muster (XLSX)', icon: 'download', action: 'Exporting muster roll…' },
        { label: 'Sync Biometric & GPS Devices', icon: 'refresh-cw', action: '14 devices synced successfully.' },
      ]
    },
    'core-hr': {
      actionLabel: 'Add Employee',
      actionIcon: 'user-plus',
      subtabs: ['Employee Directory', 'Org Hierarchy', 'Lifecycle Actions', 'Letter Templates', 'Custom Fields', 'Reports'],
      kpis: [
        { label: 'Total Employees', val: '428', target: '428', trend: '↑ 12', trendDir: 'up', sub: 'headcount', icon: 'users', glow: '#2563EB', box: 'blue' },
        { label: 'Active Internal', val: '312', target: '312', trend: '↑ 8', trendDir: 'up', sub: 'permanent staff', icon: 'building', glow: '#0284C7', box: 'sky' },
        { label: 'Deployed Staff', val: '116', target: '116', trend: '↑ 4', trendDir: 'up', sub: 'across clients', icon: 'briefcase', glow: '#7C3AED', box: 'purple' },
        { label: 'New Joinees', val: '18', target: '18', trend: '↑ 6', trendDir: 'up', sub: 'this month', icon: 'user-plus', glow: '#10B981', box: 'mint' },
        { label: 'Attrition Rate', val: '2.1%', target: '2.1%', trend: '↓ 0.4%', trendDir: 'up', sub: 'annualized', icon: 'trending-down', glow: '#F59E0B', box: 'teal' },
        { label: 'KYC Verification', val: '98.6%', target: '98.6%', trend: '↑ 1.2%', trendDir: 'up', sub: 'Aadhaar / PAN', icon: 'shield-check', glow: '#2563EB', box: 'cyan' },
      ],
      donutTitle: 'Workforce Department Split',
      donutStats: [
        { label: 'Engineering & Tech', count: 184, color: '#2563EB' },
        { label: 'Operations & Ops', count: 112, color: '#0EA5E9' },
        { label: 'Client Deployed', count: 78, color: '#7C3AED' },
        { label: 'Finance & HR', count: 36, color: '#10B981' },
        { label: 'Sales & Support', count: 18, color: '#F59E0B' },
      ],
      quickActions: [
        { label: '1-Click New Employee Onboarding', icon: 'user-plus', action: 'Employee onboarding wizard opened.' },
        { label: 'Generate Experience / Relieving Letter', icon: 'file-text', action: 'Document merge editor ready.' },
        { label: 'Bulk Import Employees (CSV/Excel)', icon: 'upload', action: 'Ready for bulk CSV drop.' },
        { label: 'Export Department Hierarchy Tree', icon: 'git-merge', action: 'Org chart generated.' },
      ]
    },
    leave: {
      actionLabel: 'Apply for Leave',
      actionIcon: 'calendar-plus',
      subtabs: ['Leave Applications', 'Leave Balances', 'Leave Types Master', 'Team Calendar', 'Holidays List', 'Reports'],
      kpis: [
        { label: 'Active Requests', val: '12', target: '12', trend: '↑ 3', trendDir: 'up', sub: 'awaiting review', icon: 'calendar-days', glow: '#6366F1', box: 'purple' },
        { label: 'Approved (Sep)', val: '46', target: '46', trend: '↑ 11', trendDir: 'up', sub: 'processed', icon: 'check-circle-2', glow: '#10B981', box: 'mint' },
        { label: 'Pending SLA (<24h)', val: '2', target: '2', trend: '↓ 4', trendDir: 'up', sub: 'in queue', icon: 'clock', glow: '#F59E0B', box: 'teal' },
        { label: 'Avg Leave Balance', val: '16.4', target: '16.4', suffix: ' d', trend: 'Normal', trendDir: 'up', sub: 'per employee', icon: 'layers', glow: '#0EA5E9', box: 'sky' },
        { label: 'Leave Utilization', val: '68.2%', target: '68.2%', trend: '↑ 4.1%', trendDir: 'up', sub: 'annual quota', icon: 'pie-chart', glow: '#8B5CF6', box: 'blue' },
        { label: 'Statutory Health', val: '100%', target: '100%', trend: 'Compliant', trendDir: 'up', sub: 'Maternity/Earned', icon: 'shield-check', glow: '#10B981', box: 'mint' },
      ],
      donutTitle: 'Leave Distribution by Type',
      donutStats: [
        { label: 'Earned / Privilege (PL)', count: 24, color: '#2563EB' },
        { label: 'Casual Leave (CL)', count: 14, color: '#0EA5E9' },
        { label: 'Sick / Medical (SL)', count: 8, color: '#10B981' },
        { label: 'Comp-Off / On Duty', count: 4, color: '#7C3AED' },
        { label: 'Unpaid / LOP', count: 2, color: '#DC2626' },
      ],
      quickActions: [
        { label: 'Submit Leave Application', icon: 'calendar-plus', action: 'Leave application opened.' },
        { label: 'View Holiday Calendar 2026', icon: 'calendar', action: 'Showing 14 official national holidays.' },
        { label: 'Credit Annual Leave Quota', icon: 'plus-circle', action: 'Leave accrual rules verified.' },
        { label: 'Download Monthly Leave Ledger', icon: 'download', action: 'Exporting leave register…' },
      ]
    },
    recruitment: {
      actionLabel: 'Create Job Requisition',
      actionIcon: 'briefcase',
      subtabs: ['Job Openings', 'Candidate Pipeline', 'Interview Schedule', 'Offers & Joinings', 'Talent Pool', 'Reports'],
      kpis: [
        { label: 'Open Positions', val: '24', target: '24', trend: '↑ 5', trendDir: 'up', sub: 'active requisitions', icon: 'briefcase', glow: '#2563EB', box: 'blue' },
        { label: 'Candidates in Pool', val: '186', target: '186', trend: '↑ 28', trendDir: 'up', sub: 'in pipeline', icon: 'users', glow: '#7C3AED', box: 'purple' },
        { label: 'Interviews This Week', val: '14', target: '14', trend: 'Confirmed', trendDir: 'up', sub: 'scheduled', icon: 'calendar', glow: '#0EA5E9', box: 'sky' },
        { label: 'Offers Extended', val: '8', target: '8', trend: '↑ 2', trendDir: 'up', sub: 'pending response', icon: 'mail-check', glow: '#10B981', box: 'mint' },
        { label: 'Avg Time to Hire', val: '22', target: '22', suffix: ' d', trend: '↓ 4 d', trendDir: 'up', sub: 'vs industry 34d', icon: 'timer', glow: '#F59E0B', box: 'teal' },
        { label: 'Acceptance Rate', val: '92.4%', target: '92.4%', trend: '↑ 3.2%', trendDir: 'up', sub: 'high conversion', icon: 'award', glow: '#10B981', box: 'blue' },
      ],
      donutTitle: 'Pipeline Stage Split',
      donutStats: [
        { label: 'Sourced / Screened', count: 94, color: '#2563EB' },
        { label: 'Technical Rounds', count: 48, color: '#0EA5E9' },
        { label: 'Final Manager Round', count: 26, color: '#7C3AED' },
        { label: 'Offer Stage', count: 12, color: '#10B981' },
        { label: 'Hired / Joining', count: 6, color: '#F59E0B' },
      ],
      quickActions: [
        { label: 'Post New Requisition', icon: 'briefcase', action: 'Job posting builder opened.' },
        { label: 'Schedule Candidate Interview', icon: 'calendar', action: 'Calendar coordinator ready.' },
        { label: 'AI Resume Screening Run', icon: 'sparkles', action: 'AI parsed 42 top matching resumes.' },
        { label: 'Generate Formal Offer Letter', icon: 'award', action: 'CTC calculator and offer template loaded.' },
      ]
    },
    performance: {
      actionLabel: 'Create Goal / OKR',
      actionIcon: 'target',
      subtabs: ['Goals & OKRs', 'Appraisal Cycles', 'Continuous Feedback', '9-Box Matrix', 'PIP Tracker', 'Reports'],
      kpis: [
        { label: 'Active Cycles', val: '4', target: '4', trend: 'Active', trendDir: 'up', sub: 'Q3 appraisal', icon: 'target', glow: '#2563EB', box: 'blue' },
        { label: 'Goal Completion', val: '86.4%', target: '86.4%', trend: '↑ 5.2%', trendDir: 'up', sub: 'company OKRs', icon: 'check-square', glow: '#10B981', box: 'mint' },
        { label: 'Self-Reviews Done', val: '92%', target: '92%', trend: '↑ 8%', trendDir: 'up', sub: '394/428 done', icon: 'user-check', glow: '#7C3AED', box: 'purple' },
        { label: 'Manager Reviews', val: '78%', target: '78%', trend: '↑ 14%', trendDir: 'up', sub: 'in progress', icon: 'users', glow: '#0EA5E9', box: 'sky' },
        { label: 'Top Performers', val: '58', target: '58', trend: 'Band A', trendDir: 'up', sub: 'eligible bonus', icon: 'star', glow: '#F59E0B', box: 'teal' },
        { label: 'PIPs / Coaching', val: '4', target: '4', trend: '↓ 2', trendDir: 'up', sub: 'monitored', icon: 'life-buoy', glow: '#8B5CF6', box: 'cyan' },
      ],
      donutTitle: 'Performance Band Rating',
      donutStats: [
        { label: 'Band A (Outstanding)', count: 58, color: '#10B981' },
        { label: 'Band B (Exceeds Target)', count: 184, color: '#2563EB' },
        { label: 'Band C (Meets Target)', count: 146, color: '#0EA5E9' },
        { label: 'Band D (Needs Coaching)', count: 36, color: '#F59E0B' },
        { label: 'Band E (Under Review)', count: 4, color: '#DC2626' },
      ],
      quickActions: [
        { label: 'Define New Team OKR', icon: 'target', action: 'Goal setting template opened.' },
        { label: 'Launch 360 Peer Review', icon: 'users', action: '360 survey distributed to 14 peers.' },
        { label: 'Calibrate 9-Box Grid', icon: 'grid', action: 'Talent matrix calibration loaded.' },
        { label: 'Export Promotion Recommendations', icon: 'award', action: 'Merit list generated.' },
      ]
    }
  };

  // Resolve current module profile or generic fallback
  const prof = profiles[mod.id] || {
    actionLabel: `Add ${mod.label} Record`,
    actionIcon: 'plus-circle',
    subtabs: ['Overview & Register', 'Active Records', 'Workflows & Approvals', 'Configuration', 'Audit Logs', 'Reports'],
    kpis: [
      { label: `${mod.label} Records`, val: String(employees.length * 4), target: String(employees.length * 4), trend: '↑ 12%', trendDir: 'up', sub: 'active items', icon: 'layers', glow: '#2563EB', box: 'blue' },
      { label: 'Active Personnel', val: String(employees.length), target: String(employees.length), trend: '100%', trendDir: 'up', sub: 'synced headcount', icon: 'users', glow: '#0284C7', box: 'sky' },
      { label: 'Pending Workflows', val: '4', target: '4', trend: '↓ 2', trendDir: 'up', sub: 'awaiting action', icon: 'clock', glow: '#F59E0B', box: 'teal' },
      { label: 'Resolved (Month)', val: '48', target: '48', trend: '↑ 14', trendDir: 'up', sub: 'completed', icon: 'check-circle-2', glow: '#10B981', box: 'mint' },
      { label: 'SLA Adherence', val: '99.4%', target: '99.4%', trend: '↑ 0.6%', trendDir: 'up', sub: 'operational target', icon: 'award', glow: '#7C3AED', box: 'purple' },
      { label: 'Compliance Health', val: '100%', target: '100%', trend: 'Audit Ready', trendDir: 'up', sub: 'zero violations', icon: 'shield-check', glow: '#10B981', box: 'blue' },
    ],
    donutTitle: `${mod.label} Status Distribution`,
    donutStats: [
      { label: 'Approved & Active', count: 48, color: '#10B981' },
      { label: 'Under Review', count: 14, color: '#2563EB' },
      { label: 'Pending Info', count: 6, color: '#F59E0B' },
      { label: 'Closed / Archived', count: 24, color: '#64748B' },
    ],
    quickActions: [
      { label: `New ${mod.label} Entry`, icon: 'plus-circle', action: `${mod.label} creation form opened.` },
      { label: `Export ${mod.label} Summary`, icon: 'download', action: `Generating ${mod.label} PDF export…` },
      { label: `Audit Trail & History`, icon: 'file-clock', action: `Loading audit history…` },
      { label: `Configure Module Rules`, icon: 'settings', action: `Rules configuration loaded.` },
    ]
  };

  // Main Page Root Container
  const root = h('div', { class: 'dash-animate-fade', style: 'display: flex; flex-direction: column; gap: 20px; padding-bottom: 32px;' });

  // 1. Header with Breadcrumbs, Live Status, Period Selector & Primary Action
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
    const existing = document.getElementById('dash-period-popover');
    if (existing) {
      existing.remove();
      return;
    }
    const periods = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Q3 2026', 'FY 2026-27'];
    const pop = h('div', {
      id: 'dash-period-popover',
      class: 'dash-animate-scale',
      style: 'position: absolute; right: 0; top: calc(100% + 6px); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.18); z-index: 70; min-width: 140px; padding: 4px; display: flex; flex-direction: column; gap: 2px;'
    }, ...periods.map((p) => h('button', {
      type: 'button',
      style: `padding: 7px 12px; text-align: left; background: ${p === selectedPeriod ? 'var(--surface-2)' : 'transparent'}; border: none; border-radius: 6px; font-size: 12.5px; font-weight: ${p === selectedPeriod ? '700' : '500'}; color: var(--text); cursor: pointer; transition: background 0.15s;`,
      onClick: () => {
        selectedPeriod = p;
        periodBtn.querySelector('.period-chip__label').textContent = p;
        pop.remove();
        toastSuccess(`Period set to ${p}`);
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

  function showActionModal(actionName) {
    const nameInput = h('input', { class: 'input', placeholder: 'e.g. Arun Kumar', required: true });
    const deptInput = h('select', { class: 'select' },
      h('option', { value: 'Development' }, 'Development'),
      h('option', { value: 'QA & Testing' }, 'QA & Testing'),
      h('option', { value: 'Operations' }, 'Operations'),
      h('option', { value: 'Human Resources' }, 'Human Resources'),
      h('option', { value: 'Finance' }, 'Finance'));
    const roleInput = h('input', { class: 'input', placeholder: 'e.g. Senior Specialist' });
    const noteInput = h('textarea', { class: 'textarea', rows: 2, placeholder: 'Optional justification or notes…' });

    const form = h('form', { class: 'stack gap-3', style: 'padding-block:0.5rem' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Subject / Employee Name'), nameInput),
      h('div', { class: 'grid grid--2' },
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Department'), deptInput),
        h('div', { class: 'field' }, h('label', { class: 'label' }, 'Designation / Role'), roleInput)),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Notes / Remarks'), noteInput));

    const modal = openModal({
      title: `${actionName} · ${mod.label}`,
      size: 'md',
      body: form,
      footer: [
        h('button', { class: 'btn btn--ghost', type: 'button', onClick: () => modal.close() }, 'Cancel'),
        h('button', {
          class: 'btn btn--primary',
          type: 'button',
          style: 'background: #1E60FF; color: #fff; font-weight: 700; border-radius: 8px; padding: 8px 18px;',
          onClick: async () => {
            const val = nameInput.value.trim();
            if (!val) {
              nameInput.focus();
              return;
            }
            modal.close();
            toastSuccess(`${actionName} record submitted successfully!`);
          }
        }, 'Save & Submit')
      ]
    });
  }

  const primaryBtn = h('button', {
    class: 'btn',
    type: 'button',
    style: 'background: #0B132B; color: #FFFFFF; font-weight: 700; border-radius: 8px; padding: 8px 18px; font-size: 13px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(11,19,43,0.25); cursor: pointer; transition: transform 0.15s;',
    onClick: () => showActionModal(prof.actionLabel)
  },
    icon(prof.actionIcon, { size: 15 }),
    h('span', null, prof.actionLabel)
  );

  const header = h('div', { class: 'dash-header' },
    h('div', { class: 'dash-header__left' },
      h('div', { class: 'cluster gap-2', style: 'font-size: 12px; color: var(--text-muted); margin-bottom: 2px;' },
        h('span', { style: 'cursor: pointer;', onClick: () => router.navigate('/home') }, 'Dashboard'),
        h('span', null, '›'),
        h('span', { style: 'color: var(--text); font-weight: 600;' }, mod.label)
      ),
      h('div', { class: 'cluster gap-3', style: 'align-items: center;' },
        h('h1', { class: 'dash-header__title' }, mod.label),
        h('div', { class: 'dash-header__live-indicator' },
          h('span', { class: 'dash-header__live-dot' }),
          h('span', null, 'LIVE SYNC')
        )
      ),
      h('p', { class: 'dash-header__subtitle' }, mod.summary)
    ),
    h('div', { class: 'dash-header__right cluster gap-3', style: 'align-items: center;' },
      periodBtn,
      primaryBtn
    )
  );
  root.append(header);

  // 2. Six Glowing KPI Metric Cards
  const kpiGrid = h('div', { class: 'kpi-grid' });
  prof.kpis.forEach((k) => {
    const valEl = h('div', { class: 'kpi-card__val' }, k.val);
    const card = h('div', {
      class: 'kpi-card',
      style: `--card-glow: ${k.glow};`,
      onClick: () => toastSuccess(`Viewing filtered records for: ${k.label}`)
    },
      h('div', { class: 'kpi-card__top' },
        h('span', { class: 'kpi-card__label' }, k.label),
        h('div', { class: `kpi-card__icon-box kpi-card__icon-box--${k.box}` },
          icon(k.icon, { size: 18 })
        )
      ),
      valEl,
      h('div', { class: 'kpi-card__meta' },
        h('span', { class: `kpi-card__trend kpi-card__trend--${k.trendDir}` }, k.trend),
        h('span', { class: 'kpi-card__trend-sub' }, k.sub)
      )
    );
    kpiGrid.append(card);
    animateCounter(valEl, k.target);
  });
  root.append(kpiGrid);

  // 4. Middle Layout (Left: 75% Filterable Table | Right: 25% Bento Summary)
  function buildDefaultTableView() {
    const middleGrid = h('div', { class: 'dash-middle-grid subtab-view' });

    // Filters State
    let filterDept = 'all';
    let filterStatus = 'all';
    let filterType = 'all';
    let searchQuery = '';

    const tableBody = h('tbody');

    function renderTableRows() {
      tableBody.replaceChildren();
      const filtered = employees.filter((emp) => {
        if (filterDept !== 'all' && emp.department !== filterDept) return false;
        if (filterStatus !== 'all' && emp.status !== filterStatus) return false;
        if (filterType !== 'all' && emp.type !== filterType) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchName = emp.name?.toLowerCase().includes(q);
          const matchDept = emp.department?.toLowerCase().includes(q);
          const matchCode = emp.code?.toLowerCase().includes(q);
          const matchRole = emp.designation?.toLowerCase().includes(q);
          if (!matchName && !matchDept && !matchCode && !matchRole) return false;
        }
        return true;
      });

      if (!filtered.length) {
        tableBody.append(h('tr', null,
          h('td', { colspan: 7, style: 'text-align: center; padding: 36px; color: var(--text-muted);' },
            h('div', { class: 'stack gap-2', style: 'align-items: center;' },
              icon('search-x', { size: 28, style: 'opacity: 0.5;' }),
              h('span', null, `No records match current filter in ${mod.label}.`)
            )
          )
        ));
        return;
      }

      filtered.forEach((emp, idx) => {
        const isReady = (emp.status || 'Active').toLowerCase() === 'active';
        const statusPillClass = isReady ? 'dash-status-pill--ready' : 'dash-status-pill--hold';
        const row = h('tr', null,
          h('td', { style: 'width: 36px;' }, h('input', { type: 'checkbox' })),
          h('td', { style: 'width: 28px; color: var(--text-muted); font-size: 12px;' }, String(idx + 1)),
          h('td', null,
            h('div', { class: 'table-emp-cell' },
              h('div', { class: 'table-emp-avatar-fallback' }, (emp.name || 'E')[0]),
              h('div', { class: 'table-emp-meta' },
                h('span', { class: 'table-emp-name' }, emp.name),
                h('span', { class: 'table-emp-id' }, emp.code || `EMP00${idx + 10}`)
              )
            )
          ),
          h('td', null, emp.department || 'Operations'),
          h('td', null, emp.designation || 'Specialist'),
          h('td', null,
            h('span', { class: `dash-status-pill ${statusPillClass}` }, emp.status || 'Active')
          ),
          h('td', { style: 'text-align: right;' },
            h('button', {
              class: 'dash-action-btn',
              type: 'button',
              onClick: () => toastSuccess(`Viewing profile for ${emp.name}`)
            }, '⋮')
          )
        );
        tableBody.append(row);
      });
    }

    // Filter Toolbar Selects
    const deptSelect = h('select', {
      class: 'table-toolbar__select',
      onChange: (e) => { filterDept = e.target.value; renderTableRows(); }
    },
      h('option', { value: 'all' }, 'All Departments'),
      h('option', { value: 'Development' }, 'Development'),
      h('option', { value: 'QA & Testing' }, 'QA & Testing'),
      h('option', { value: 'Operations' }, 'Operations'),
      h('option', { value: 'Product' }, 'Product'),
      h('option', { value: 'Human Resources' }, 'Human Resources'),
      h('option', { value: 'Finance' }, 'Finance')
    );

    const statusSelect = h('select', {
      class: 'table-toolbar__select',
      onChange: (e) => { filterStatus = e.target.value; renderTableRows(); }
    },
      h('option', { value: 'all' }, 'All Status'),
      h('option', { value: 'Active' }, 'Active'),
      h('option', { value: 'Pending' }, 'Pending Review'),
      h('option', { value: 'On Leave' }, 'On Leave')
    );

    const typeSelect = h('select', {
      class: 'table-toolbar__select',
      onChange: (e) => { filterType = e.target.value; renderTableRows(); }
    },
      h('option', { value: 'all' }, 'All Types'),
      h('option', { value: 'Deployed' }, 'Deployed Staff'),
      h('option', { value: 'Internal' }, 'Internal Staff')
    );

    const searchInput = h('input', {
      type: 'search',
      class: 'table-toolbar__search-input',
      placeholder: `Search ${mod.label} records…`,
      onInput: (e) => {
        searchQuery = e.target.value.trim();
        renderTableRows();
      }
    });

    const toolbar = h('div', { class: 'table-toolbar' },
      h('div', { class: 'table-toolbar__filters' },
        deptSelect,
        statusSelect,
        typeSelect,
        h('div', { class: 'table-toolbar__search-wrap' },
          icon('search', { size: 14, cls: 'table-toolbar__search-icon' }),
          searchInput
        )
      ),
      h('div', { class: 'table-toolbar__actions' },
        h('button', {
          class: 'table-toolbar__btn',
          type: 'button',
          onClick: () => toastSuccess(`Exporting ${mod.label} register to CSV…`)
        },
          icon('download', { size: 13 }),
          h('span', null, 'Export CSV')
        )
      )
    );

    const selectAllCheckbox = h('input', {
      type: 'checkbox',
      onChange: (e) => {
        const isChecked = e.target.checked;
        tableBody.querySelectorAll('input[type="checkbox"]').forEach((cb) => cb.checked = isChecked);
      }
    });

    renderTableRows();

    const tableWrap = h('div', { class: 'dash-table-wrap' },
      h('div', { style: 'overflow-x: auto;' },
        h('table', { class: 'dash-table' },
          h('thead', null,
            h('tr', null,
              h('th', { style: 'width: 36px;' }, selectAllCheckbox),
              h('th', { style: 'width: 28px;' }, '#'),
              h('th', null, 'Employee / Personnel'),
              h('th', null, 'Department'),
              h('th', null, 'Designation'),
              h('th', null, 'Status'),
              h('th', { style: 'text-align: right;' }, 'Action')
            )
          ),
          tableBody
        )
      ),
      h('div', { class: 'table-foot' },
        h('span', null, `Showing 1 to ${Math.min(employees.length, 10)} of 428 records`),
        h('div', { class: 'pagination-btns' },
          h('button', { class: 'page-num-btn' }, '‹'),
          h('button', { class: 'page-num-btn active' }, '1'),
          h('button', { class: 'page-num-btn' }, '2'),
          h('button', { class: 'page-num-btn' }, '3'),
          h('span', { style: 'padding: 0 4px; color: var(--text-muted);' }, '…'),
          h('button', { class: 'page-num-btn' }, '›')
        ),
        h('div', { class: 'cluster gap-2', style: 'font-size: 12px; color: var(--text-muted);' },
          h('span', null, 'Per page'),
          h('select', { class: 'table-toolbar__select', style: 'height: 28px; padding: 0 20px 0 8px;' },
            h('option', null, '10')
          )
        )
      )
    );

    const leftColumn = h('div', { style: 'display: flex; flex-direction: column; gap: 14px;' },
      toolbar,
      tableWrap
    );
    middleGrid.append(leftColumn);

    // Right Column: Module Bento Summary & Quick Actions
    const rightColumn = h('div', { style: 'display: flex; flex-direction: column; gap: 14px;' });

    // 1. Donut / Stats Summary Card
    const totalStats = prof.donutStats.reduce((sum, s) => sum + s.count, 0) || 100;
    const summaryCard = h('div', { class: 'kpi-card', style: 'cursor: default;' },
      h('div', { class: 'cluster', style: 'justify-content: space-between; align-items: center; margin-bottom: 12px;' },
        h('h3', { style: 'font-size: 14px; font-weight: 700; margin: 0; color: var(--text);' }, prof.donutTitle),
        icon('pie-chart', { size: 16, style: 'color: var(--color-primary);' })
      ),
      h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
        ...prof.donutStats.map((item) => {
          const pct = Math.round((item.count / totalStats) * 100);
          return h('div', { style: 'display: flex; flex-direction: column; gap: 3px;' },
            h('div', { class: 'donut-legend__item' },
              h('span', { class: 'cluster gap-2', style: 'align-items: center;' },
                h('span', { class: 'donut-legend__dot', style: `background: ${item.color};` }),
                h('span', { style: 'font-weight: 500;' }, item.label)
              ),
              h('span', { style: 'font-weight: 700;' }, `${item.count} (${pct}%)`)
            ),
            h('div', { style: 'height: 5px; width: 100%; background: var(--surface-2); border-radius: 99px; overflow: hidden;' },
              h('div', { style: `height: 100%; width: ${pct}%; background: ${item.color}; border-radius: 99px; transition: width 0.6s ease;` })
            )
          );
        })
      )
    );
    rightColumn.append(summaryCard);

    // 2. Quick Action Shortcuts Card
    const quickActionsCard = h('div', { class: 'kpi-card', style: 'cursor: default;' },
      h('div', { class: 'cluster', style: 'justify-content: space-between; align-items: center; margin-bottom: 12px;' },
        h('h3', { style: 'font-size: 14px; font-weight: 700; margin: 0; color: var(--text);' }, 'Quick Actions'),
        icon('zap', { size: 16, style: 'color: #F59E0B;' })
      ),
      h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
        ...prof.quickActions.map((qa) => h('button', {
          class: 'quick-action-btn',
          type: 'button',
          onClick: () => toastSuccess(qa.action)
        },
          h('span', { class: 'cluster gap-2', style: 'align-items: center;' },
            icon(qa.icon, { size: 14, style: 'color: var(--color-primary);' }),
            h('span', null, qa.label)
          ),
          icon('chevron-right', { size: 13, style: 'color: var(--text-muted);' })
        ))
      )
    );
    rightColumn.append(quickActionsCard);

    // 3. Enterprise Integration Status Banner
    const statusBanner = h('div', {
      class: 'kpi-card',
      style: 'cursor: pointer; background: linear-gradient(135deg, rgba(30,96,255,0.06), rgba(99,102,241,0.06)); border-color: rgba(30,96,255,0.2);',
      onClick: () => toastSuccess('Biometric devices, GPS geofencing & IndexedDB mock services are all fully operational!')
    },
      h('div', { class: 'cluster gap-2', style: 'align-items: center; margin-bottom: 6px;' },
        icon('shield-check', { size: 16, style: 'color: #10B981;' }),
        h('span', { style: 'font-size: 13px; font-weight: 700; color: var(--text);' }, 'Enterprise Sync Active')
      ),
      h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4;' },
        'Connected to IndexedDB real-time data layer with continuous audit history and zero latency.'
      )
    );
    rightColumn.append(statusBanner);

    middleGrid.append(rightColumn);
    return middleGrid;
  }

  // 4. Subtab Dynamic Views Container & Switching Mechanism
  const subtabContainer = h('div', { class: 'subtab-view-container', style: 'width: 100%; min-height: 420px;' });

  function renderSubtabContent(tabName) {
    if (mod.id === 'recruitment') {
      return buildRecruitmentSubtab(tabName, employees, switchSubtab);
    }
    if (mod.id === 'leave') {
      return buildLeaveSubtab(tabName, employees, switchSubtab);
    }
    if (tabName === prof.subtabs[0]) {
      return buildDefaultTableView();
    }
    return buildGenericSubtab(tabName, mod, employees, switchSubtab);
  }

  function switchSubtab(tabName) {
    activeSubtab = tabName;
    subtabsBar.querySelectorAll('.dash-subtab').forEach((b) => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });
    const view = renderSubtabContent(tabName);
    subtabContainer.replaceChildren(view);
  }

  // Initial subtab determination
  let activeSubtab = prof.subtabs[0];
  if (ctx.params?.sub) {
    const subClean = ctx.params.sub.toLowerCase().replace(/[-_]/g, ' ');
    const match = prof.subtabs.find((s) => s.toLowerCase().includes(subClean) || subClean.includes(s.toLowerCase()));
    if (match) activeSubtab = match;
  }

  // Responsive Subtabs Navigation Bar
  const subtabsBar = h('div', { class: 'dash-subtabs' },
    ...prof.subtabs.map((tab) => h('button', {
      class: `dash-subtab${tab === activeSubtab ? ' active' : ''}`,
      dataset: { tab },
      type: 'button',
      onClick: () => {
        switchSubtab(tab);
        toastSuccess(`Switched to: ${tab}`);
      }
    }, tab))
  );

  root.append(subtabsBar);
  subtabContainer.replaceChildren(renderSubtabContent(activeSubtab));
  root.append(subtabContainer);

  return root;
}
