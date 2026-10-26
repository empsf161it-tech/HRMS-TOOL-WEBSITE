/* Purpose: style guide and component library view - renders all design system components, variants, sizes and interactive states in light and dark mode. */
import { h, icon } from '../../../core/dom.js';
import { button, withLoading, setLoading } from '../../../components/eh-button.js';
import { badge, statusBadge, avatar } from '../../../components/display.js';
import { alert, emptyState, errorState } from '../../../components/feedback.js';
import { toast, toastSuccess, toastError, openModal, openDrawer, confirmDialog } from '../../../components/ui.js';
import { dataTable } from '../../../components/eh-data-table.js';
import { chart } from '../../../components/eh-chart.js';
import { api } from '../../../services/api.js';

export default async function componentsView() {
  const container = h('div', { class: 'stack gap-8', style: { paddingBlockEnd: 'var(--space-16)' } });

  // Quick jump sticky TOC
  const toc = h('div', { class: 'sg-toc' },
    h('a', { href: '#sec-buttons' }, 'Buttons'),
    h('a', { href: '#sec-badges' }, 'Badges & Avatars'),
    h('a', { href: '#sec-kpis' }, 'KPIs & Progress'),
    h('a', { href: '#sec-feedback' }, 'Feedback & Overlays'),
    h('a', { href: '#sec-forms' }, 'Forms & Inputs'),
    h('a', { href: '#sec-nav' }, 'Navigation'),
    h('a', { href: '#sec-table' }, 'Data Table'),
    h('a', { href: '#sec-charts' }, 'Charts'),
    h('a', { href: '#sec-structure' }, 'Structure & Diff'));
  container.append(toc);

  // 1. BUTTONS
  const btnSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-buttons' },
    h('h2', { class: 'card__title' }, '1. Buttons & Triggers'),
    h('div', { class: 'sg-demo' },
      button('Primary Button', { variant: 'primary', icon: 'sparkles' }),
      button('Secondary Button', { variant: 'secondary' }),
      button('Outline Button', { variant: 'outline' }),
      button('Ghost Button', { variant: 'ghost' }),
      button('Danger Button', { variant: 'danger', icon: 'trash-2' }),
      button('', { variant: 'secondary', icon: 'settings', title: 'Icon only button' })),
    h('div', { class: 'split' },
      h('div', { class: 'cluster' },
        button('Small', { variant: 'secondary', size: 'sm' }),
        button('Medium', { variant: 'secondary', size: 'md' }),
        button('Large', { variant: 'secondary', size: 'lg' })),
      h('div', { class: 'cluster' },
        button('Click for Loading Spinner', {
          variant: 'primary',
          onClick: (e) => withLoading(e.currentTarget, () => new Promise((res) => setTimeout(res, 1800))),
        }),
        h('eh-split-button', {
          label: 'Export Data',
          variant: 'primary',
          items: [
            { label: 'Export as Excel (XLSX)', icon: 'file-spreadsheet', onClick: () => toastSuccess('Exporting XLSX...') },
            { label: 'Export as CSV', icon: 'file-text', onClick: () => toastSuccess('Exporting CSV...') },
            { label: 'Export as PDF', icon: 'file', onClick: () => toastSuccess('Exporting PDF...') },
          ],
        }),
        h('div', { class: 'cluster' },
          h('span', { class: 'text-sm font-mono' }, 'ELR-1002'),
          h('eh-copy', { value: 'ELR-1002', label: 'Employee ID' })))));
  container.append(btnSection);

  // 2. BADGES & AVATARS
  const badgeSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-badges' },
    h('h2', { class: 'card__title' }, '2. Badges, Attendance Statuses & Avatars'),
    h('div', { class: 'stack gap-3' },
      h('h3', { class: 'text-sm fw-600 text-muted uppercase tracking-wider' }, 'Semantic Tones'),
      h('div', { class: 'cluster' },
        badge('Primary', 'primary'),
        badge('Success', 'success'),
        badge('Warning', 'warning'),
        badge('Danger', 'danger'),
        badge('Info', 'info'),
        badge('Accent', 'accent'),
        badge('Neutral', 'neutral'),
        badge('Solid Success', 'success', { solid: true }),
        badge('Solid Danger', 'danger', { solid: true }))),
    h('div', { class: 'stack gap-3' },
      h('h3', { class: 'text-sm fw-600 text-muted uppercase tracking-wider' }, 'Attendance Status Indicators (Color + Icon + Text)'),
      h('div', { class: 'cluster' },
        statusBadge('present'),
        statusBadge('absent'),
        statusBadge('halfday'),
        statusBadge('late'),
        statusBadge('leave'),
        statusBadge('holiday'),
        statusBadge('weekoff'),
        statusBadge('wfh'),
        statusBadge('onduty'))),
    h('div', { class: 'stack gap-3' },
      h('h3', { class: 'text-sm fw-600 text-muted uppercase tracking-wider' }, 'Avatars & Groups (Deterministic colors from initials)'),
      h('div', { class: 'split' },
        h('div', { class: 'cluster' },
          avatar('Priya Krishnan', { size: 'sm' }),
          avatar('Arvind Raman', { size: 'md' }),
          avatar('Deepa Nair', { size: 'lg' }),
          avatar('Suresh Kumar', { size: 'xl' })),
        h('eh-avatar-group', {
          max: '4',
          size: 'md',
          people: [
            { name: 'Karthik Nair' }, { name: 'Ananya Sharma' }, { name: 'Rahul Reddy' },
            { name: 'Divya Iyer' }, { name: 'Ganesh Pillai' }, { name: 'Sneha Patel' },
          ],
        }))));
  container.append(badgeSection);

  // 3. KPIS & PROGRESS
  const kpiSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-kpis' },
    h('h2', { class: 'card__title' }, '3. KPI Metric Cards, Animated Rings & Progress Bars'),
    h('div', { class: 'grid grid--kpi' },
      h('eh-kpi-card', {
        label: 'Active Headcount',
        value: '240',
        format: 'number',
        delta: '8.4',
        hint: 'vs last quarter',
        icon: 'users',
        tone: 'primary',
        spark: '180,195,210,225,235,240',
      }),
      h('eh-kpi-card', {
        label: 'Monthly Payroll Run',
        value: '14200000',
        format: 'inr',
        delta: '-1.2',
        hint: 'within budget',
        icon: 'wallet',
        tone: 'success',
        spark: '140,145,142,143,141,142',
      }),
      h('eh-kpi-card', {
        label: 'On-Time Attendance',
        value: '94.2',
        format: 'pct',
        delta: '2.1',
        hint: 'daily muster',
        icon: 'clock',
        tone: 'info',
      }),
      h('eh-kpi-card', {
        label: 'Pending Approvals',
        value: '12',
        format: 'number',
        delta: '-5.0',
        hint: 'action required',
        icon: 'clipboard-list',
        tone: 'warning',
      })),
    h('div', { class: 'split mt-4' },
      h('div', { class: 'cluster gap-6' },
        h('eh-ring', { value: '84', label: '84%', size: '80', tone: 'primary' }),
        h('eh-ring', { value: '62', label: '62%', size: '80', tone: 'success' }),
        h('eh-ring', { value: '28', label: '28%', size: '80', tone: 'warning' })),
      h('div', { class: 'grow stack gap-3', style: { maxInlineSize: '400px' } },
        h('eh-progress', { value: '75', tone: 'primary', label: 'Employee Onboarding Progress' }),
        h('eh-progress', { value: '45', tone: 'success', large: true, label: 'Shift Fulfillment' }),
        h('eh-progress', { value: '90', tone: 'danger', label: 'Leave Quota Consumption' }))));
  container.append(kpiSection);

  // 4. FEEDBACK & OVERLAYS
  const feedbackSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-feedback' },
    h('h2', { class: 'card__title' }, '4. Feedback, Alerts, Dialogs & Interactive Toasts'),
    h('div', { class: 'stack gap-3' },
      alert('PF electronic challan return (ECR) for September is due in 3 days.', { tone: 'info', title: 'Compliance Reminder' }),
      alert('Payroll variance report generated with zero discrepancies.', { tone: 'success', title: 'Payroll Ready' }),
      alert('Biometric Terminal Gate 2 has not synced punches in 45 minutes.', { tone: 'warning', title: 'Device Warning' }),
      alert('Failed to connect to Aadhaar verification service. Please retry.', { tone: 'danger', title: 'Service Error' })),
    h('div', { class: 'cluster mt-4' },
      button('Open Modal Dialog', {
        variant: 'primary',
        icon: 'external-link',
        onClick: () => openModal({
          title: 'Employee Transfer Request',
          size: 'md',
          body: h('div', { class: 'stack gap-3' },
            h('p', { class: 'text-sm text-muted' }, 'Initiate an inter-branch transfer for an employee across branches or legal entities.'),
            h('div', { class: 'field' },
              h('label', { class: 'label' }, 'Target Branch'),
              h('select', { class: 'input' },
                h('option', null, 'Bengaluru Medical Campus'),
                h('option', null, 'Pune Manufacturing Plant'),
                h('option', null, 'Kochi Harbour Hotel')))),
          footer: [
            button('Cancel', { variant: 'ghost', onClick: (e) => e.target.closest('dialog').close() }),
            button('Submit Transfer', { variant: 'primary', onClick: (e) => { e.target.closest('dialog').close(); toastSuccess('Transfer requested.'); } }),
          ],
        }),
      }),
      button('Open Side Drawer', {
        variant: 'secondary',
        icon: 'panel-right',
        onClick: () => openDrawer({
          title: 'Punch Audit Detail',
          size: 'md',
          body: h('div', { class: 'stack gap-4' },
            h('div', { class: 'alert alert--info' }, 'Raw biometric server log timestamp matched with GPS geofence coordinate.'),
            h('div', { class: 'field' }, h('label', { class: 'label' }, 'Device Timestamp'), h('input', { class: 'input', readonly: true, value: '2026-10-22 09:02:14 IST' })),
            h('div', { class: 'field' }, h('label', { class: 'label' }, 'Terminal IP'), h('input', { class: 'input', readonly: true, value: '192.168.10.45' }))),
          footer: [
            button('Close', { variant: 'secondary', onClick: (e) => e.target.closest('dialog').close() }),
          ],
        }),
      }),
      button('Open Confirm Dialog', {
        variant: 'outline',
        icon: 'alert-triangle',
        onClick: async () => {
          const res = await confirmDialog({
            title: 'Delete Shift Pattern?',
            message: 'Are you sure you want to delete Night Shift Roster B? This action cannot be undone.',
            confirmLabel: 'Delete Roster',
            danger: true,
          });
          if (res) toastSuccess('Roster deleted.');
        },
      }),
      button('Trigger Success Toast', { variant: 'ghost', onClick: () => toastSuccess('Candidate offer letter generated.') }),
      button('Trigger Error Toast', { variant: 'ghost', onClick: () => toastError('Bank IFSC code validation failed.') })));
  container.append(feedbackSection);

  // 5. FORMS & INPUTS
  const formSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-forms' },
    h('h2', { class: 'card__title' }, '5. Forms, Pickers & Advanced Inputs'),
    h('div', { class: 'grid grid--3 gap-4' },
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Full Name'), h('input', { class: 'input', placeholder: 'Karthik Krishnan' })),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Email Address'), h('input', { class: 'input', type: 'email', placeholder: 'name@ellowring.in' })),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Phone (+91 India)'), h('input', { class: 'input', type: 'tel', placeholder: '+91 98400 12345' })),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Annual CTC (₹ INR)'), h('input', { class: 'input', type: 'number', placeholder: '1200000' })),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Joining Date'), h('input', { class: 'input', type: 'date', value: '2026-10-22' })),
      h('div', { class: 'field' }, h('label', { class: 'label' }, 'Department'),
        h('select', { class: 'input' }, h('option', null, 'Engineering'), h('option', null, 'Human Resources'), h('option', null, 'Finance')))),
    h('div', { class: 'split mt-2' },
      h('div', { class: 'cluster' },
        h('label', { class: 'cluster', style: { cursor: 'pointer' } }, h('input', { type: 'checkbox', checked: true }), h('span', { class: 'text-sm' }, 'PF Eligible')),
        h('label', { class: 'cluster', style: { cursor: 'pointer' } }, h('input', { type: 'checkbox' }), h('span', { class: 'text-sm' }, 'ESI Covered')),
        h('label', { class: 'cluster', style: { cursor: 'pointer' } }, h('input', { type: 'radio', name: 'demo-r', checked: true }), h('span', { class: 'text-sm' }, 'Full Time')),
        h('label', { class: 'cluster', style: { cursor: 'pointer' } }, h('input', { type: 'radio', name: 'demo-r' }), h('span', { class: 'text-sm' }, 'Contractor'))),
      h('div', { class: 'cluster' },
        h('eh-toggle', { label: 'Enable Geofencing Punch' }),
        h('eh-toggle', { checked: true, label: 'Auto-approve OT' }))),
    h('div', { class: 'grid grid--2 gap-6 mt-4' },
      h('div', { class: 'field' },
        h('label', { class: 'label' }, 'OTP Verification Input (6 Digits)'),
        h('eh-otp', { length: '6' })),
      h('div', { class: 'field' },
        h('label', { class: 'label' }, 'Employee Digital Signature Pad'),
        h('eh-signature-pad', null))));
  container.append(formSection);

  // 6. NAVIGATION
  const navSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-nav' },
    h('h2', { class: 'card__title' }, '6. Navigation Primitives (Tabs, Segmented & Breadcrumbs)'),
    h('div', { class: 'split' },
      h('eh-breadcrumbs', {
        items: [
          { label: 'Ellowring HRMS', href: '#/home' },
          { label: 'Developer', href: '#/dev' },
          { label: 'Component Library' },
        ],
      }),
      h('eh-segmented', {
        label: 'View Mode',
        options: [
          { value: 'grid', label: 'Grid', icon: 'layout-grid' },
          { value: 'table', label: 'Table', icon: 'table' },
          { value: 'kanban', label: 'Board', icon: 'columns-3' },
        ],
      })),
    h('eh-tabs', { variant: 'line' },
      h('section', { 'data-tab': 'Personal Info', 'data-icon': 'user' },
        h('div', { class: 'p-4 text-sm text-muted' }, 'Employee personal identity, family dependents and emergency contacts.')),
      h('section', { 'data-tab': 'Bank & Statutory', 'data-icon': 'landmark' },
        h('div', { class: 'p-4 text-sm text-muted' }, 'PAN, Aadhaar, Bank Account, PF UAN and ESI Insurance numbers.')),
      h('section', { 'data-tab': 'Salary Structure', 'data-icon': 'wallet' },
        h('div', { class: 'p-4 text-sm text-muted' }, 'Basic salary, HRA, Special Allowance, PF deduction and Net Pay breakdown.')),
      h('section', { 'data-tab': 'Documents', 'data-icon': 'folder' },
        h('div', { class: 'p-4 text-sm text-muted' }, 'Signed appointment letter, identity proofs and educational certificates.'))));
  container.append(navSection);

  // 7. DATA TABLE
  const tableSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-table' },
    h('h2', { class: 'card__title' }, '7. Full Data Table (Sorting, Filtering, Column Manager & Export)'),
    dataTable({
      columns: [
        { key: 'code', label: 'Code', sortable: true, width: '110px' },
        {
          key: 'name',
          label: 'Employee',
          sortable: true,
          render: (val, row) => h('div', { class: 'cluster' }, avatar(val, { size: 'sm' }), h('div', null, h('div', { class: 'fw-600' }, val), h('small', { class: 'text-muted' }, row.designation))),
        },
        { key: 'location', label: 'Branch', sortable: true },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (val) => badge(val, val === 'Active' ? 'success' : val === 'Probation' ? 'warning' : 'neutral'),
        },
        {
          key: 'ctc',
          label: 'Annual CTC',
          sortable: true,
          align: 'end',
          render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`,
        },
      ],
      loader: (q) => api.list('employees', { ...q, scope: false }),
      options: {
        title: 'Employees Directory',
        searchable: true,
        exportable: true,
        manageColumns: true,
        pageSize: 5,
      },
    }));
  container.append(tableSection);

  // 8. CHARTS
  const chartSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-charts' },
    h('h2', { class: 'card__title' }, '8. Chart.js Visualisations with Accessible Table Toggle'),
    h('div', { class: 'grid grid--2 gap-6' },
      h('div', { class: 'card p-4 stack gap-2' },
        h('h3', { class: 'card__title' }, 'Monthly Payroll Trend (Area Chart)'),
        chart({
          type: 'area',
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
          datasets: [{ label: 'Gross Payroll (Lakhs ₹)', data: [132, 136, 138, 140, 141, 142], color: '--color-primary' }],
        }, 220)),
      h('div', { class: 'card p-4 stack gap-2' },
        h('h3', { class: 'card__title' }, 'Hiring Recruitment Funnel'),
        chart({
          type: 'funnel',
          title: 'Candidate Pipeline',
          stages: [
            { label: 'Applied', value: 420 },
            { label: 'Screened', value: 180 },
            { label: 'Interviewed', value: 65 },
            { label: 'Offered', value: 18 },
            { label: 'Joined', value: 14 },
          ],
        }))));
  container.append(chartSection);

  // 9. STRUCTURE & DIFF
  const structSection = h('section', { class: 'card p-6 stack gap-4 sg-section', id: 'sec-structure' },
    h('h2', { class: 'card__title' }, '9. Structural Elements & Audit Diff'),
    h('eh-diff', {
      before: JSON.stringify({ name: 'Karthik Krishnan', designation: 'Software Engineer', ctc: 850000, branch: 'Chennai HQ' }, null, 2),
      after: JSON.stringify({ name: 'Karthik Krishnan', designation: 'Senior Software Engineer', ctc: 1250000, branch: 'Chennai HQ' }, null, 2),
    }));
  container.append(structSection);

  return container;
}
