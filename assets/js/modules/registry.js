/* Purpose: module registry - the single list of all 30 HRMS modules (plus industry packs) used by the sidebar, router, command palette and Control Center.
   Each entry lazy-loads its routes.js. Modules without routes.js resolve to the "scheduled" screen until their build phase. */

/** Sidebar groups in display order (labels are i18n keys). */
export const GROUPS = [
  ['overview', 'group.overview'], ['people', 'group.people'], ['time', 'group.time'], ['pay', 'group.pay'], ['self', 'group.self'],
  ['talent', 'group.talent'], ['ops', 'group.ops'], ['industry', 'group.industry'], ['platform', 'group.platform'], ['developer', 'group.developer'],
];

const M = (no, id, label, icon, group, phase, summary, highlights = [], extra = {}) => ({ no, id, label, icon, group, phase, summary, highlights, ...extra });

export const MODULES = [
  M(0, 'home', 'Dashboard', 'layout-dashboard', 'overview', 1, 'Role-based dashboards with live KPIs, approvals and quick actions.', [], { routes: () => import('./home/routes.js'), always: true }),
  M(1, 'core-hr', 'Employees', 'users', 'people', 3, 'Employee master, profile, org hierarchy, lifecycle actions and custom fields.', ['Employee directory (table, cards, org chart)', 'Profile with 16 tabs', 'Add/edit wizard', 'Masters and lifecycle letters']),
  M(2, 'recruitment', 'Recruitment (ATS)', 'user-search', 'people', 3, 'Requisitions, job postings, candidate pipeline, interviews and offers.', ['Kanban pipeline', 'Interview scheduler', 'Offer builder', 'AI resume screening']),
  M(3, 'onboarding', 'Onboarding', 'user-plus', 'people', 3, 'Digital joining, document collection, e-sign, ID cards and checklists.', ['Joining form wizard', 'Face registration', 'ID card designer', 'Progress tracker']),
  M(21, 'documents', 'Contracts & Documents', 'file-text', 'people', 3, 'Repository, letter templates, bulk generation, expiry alerts and e-sign.', ['Folders per employee', 'Letter templates with merge fields', 'Verification queue']),
  M(4, 'attendance', 'Attendance', 'clock', 'time', 4, 'Live board, daily register, monthly muster, regularization and locks.', ['Live attendance board', 'Monthly muster grid', 'Regularization approvals']),
  M(5, 'devices', '05. Face Recognition Hardware Integration', 'scan-face', 'time', 4, 'Face recognition attendance terminals, biometric devices, RFID integration, face registration, punch sync and webhooks.', ['Face Recognition Terminal', 'Biometric & Fingerprint Integration', 'Employee Face Registration', 'Real-Time Punch Sync']),
  M(6, 'geo-attendance', 'Staffing / Deployments', 'users-round', 'ops', 1, 'Manage client companies, deployed employees, timesheets, payroll and billing.', ['Deployment trend', 'Client-wise donut', 'Billing vs payroll', 'Recent deployments'], { routes: () => import('./staffing/routes.js'), always: true }),
  M(7, 'audit', 'Timestamp Audit', 'file-clock', 'time', 4, 'Server, device and GPS timestamps with full change history.', ['Punch detail drawer', 'Before/after diff', 'Admin action log']),
  M(8, 'shifts', 'Shift Management', 'calendar-clock', 'time', 4, 'Shift master, roster planner, swaps, allowances and cross-midnight logic.', ['Roster drag-and-drop', 'Swap requests', 'Allowance setup']),
  M(9, 'breaks', 'Break Management', 'coffee', 'time', 4, 'Break policies, live break board, violations and analytics.', ['Policy builder', 'Break timer ring', 'Violations list']),
  M(10, 'working-hours', 'Working Hours', 'timer', 'time', 4, 'Gross, net, overtime and short-hour calculations per employee.', ['Daily breakdown', 'Weekly/monthly summary', 'Rule settings']),
  M(11, 'timesheets', 'Timesheets', 'clock', 'time', 1, 'Track, approve and manage employee timesheets across all client deployments.', ['Weekly grid', 'Approval queue', 'Submission rate gauge', 'Billable amount'], { routes: () => import('./timesheets/routes.js'), always: true }),
  M(12, 'leave', 'Leave', 'calendar-days', 'pay', 5, 'Leave types, apply, multi-level approval, balances and calendars.', ['Leave type setup', 'Apply with live balance', 'Team calendar']),
  M(13, 'payroll', 'Payroll', 'wallet', 'pay', 1, 'Calculate, review and process salaries for your employees and deployed staff across all clients.', ['Structure builder', 'Payroll calculations', 'Statutory deductions', 'Payroll summary'], { routes: () => import('./payroll/routes.js'), always: true }),
  M(22, 'compliance', 'Invoicing & Billing', 'receipt', 'pay', 5, 'Client invoicing, GST support, payment tracking, compliance registers and statutory audit.', ['Compliance calendar', 'Statutory registers', 'Minimum wage table']),
  M(14, 'ess', 'Client Portal', 'monitor', 'self', 6, 'Profile, attendance, leave, payslips, claims, certificates and resignation.', ['Mobile-first pages', 'Document requests', 'Resignation flow']),
  M(15, 'mss', 'Manager Self Service', 'users-round', 'self', 6, 'Team dashboard and a unified approvals inbox with SLA timers.', ['Approvals inbox', 'Bulk approve with comments', 'Team reports']),
  M(16, 'performance', 'Performance', 'target', 'talent', 6, 'Goals, OKRs, review cycles, 360 feedback, 9-box and PIPs.', ['Cascading goals', 'Review forms', '9-box calibration']),
  M(17, 'training', 'Training & Development', 'graduation-cap', 'talent', 6, 'Training calendar, skill matrix, certifications and feedback.', ['Skill matrix heatmap', 'Certification expiry', 'Trainer directory']),
  M(18, 'assets', 'Assets & Equipment', 'laptop', 'ops', 6, 'Inventory, allocation, returns, maintenance and QR labels.', ['Allocate and return flows', 'Maintenance log', 'Asset history']),
  M(19, 'expenses', 'Expenses & Reimbursements', 'receipt', 'ops', 6, 'Claims with receipts and OCR auto-fill, limits and reimbursement batches.', ['Multi-line claims', 'Policy limits', 'Reimbursement batch']),
  M(20, 'helpdesk', 'Helpdesk & Support', 'life-buoy', 'ops', 6, 'Tickets with SLA timers, knowledge base and satisfaction ratings.', ['Agent Kanban', 'SLA countdown', 'Anonymous grievance']),
  M(23, 'hospitality', 'Hotel / Hospitality', 'concierge-bell', 'industry', 7, 'Department boards, duty roster, tips and service charge distribution.', ['Front office to banquet boards', 'Tips pool and split', 'Staff meals'], { industry: true }),
  M(24, 'manufacturing', 'Manufacturing', 'factory', 'industry', 7, 'Plant workforce, machine-wise grid, piece rate, PPE and safety incidents.', ['Machine × shift grid', 'Piece-rate entry', 'PPE expiry'], { industry: true }),
  M(25, 'retail', 'Retail', 'store', 'industry', 7, 'Store-wise staff, sales targets, incentives and weekly-off rotation.', ['Target vs achieved', 'Store transfers', 'Holiday staffing'], { industry: true }),
  M(26, 'it', 'Clients & Projects', 'briefcase', 'industry', 1, 'Client details, project staffing, key contacts, contract renewals and revenue margins.', ['Client overview', 'Deployment trend', 'Key contacts', 'Active openings'], { routes: () => import('./clients/routes.js'), always: true }),
  M(27, 'education', 'College / University', 'school', 'industry', 7, 'Faculty timetable, workload, research, FDP and accreditation reports.', ['Weekly timetable grid', 'Workload', 'Publications'], { industry: true }),
  M(28, 'construction', 'Construction', 'hard-hat', 'industry', 7, 'Project workforce, site attendance, muster roll and accommodation.', ['Printable muster roll', 'Contractor management', 'Labour rates'], { industry: true }),
  M(29, 'healthcare', 'Hospital / Healthcare', 'stethoscope', 'industry', 7, 'Doctors, nurses, ward allocation, credentials and licence expiry.', ['Ward × shift board', 'Credential management', 'On-call duty'], { industry: true }),
  M(29.5, 'logistics', 'Logistics', 'truck', 'industry', 7, 'Drivers, vehicle and route allocation, trips, incentives and licence expiry.', ['Trip assignment', 'Vehicle documents', 'Accident reports'], { industry: true }),
  M(30.1, 'configuration', 'Settings', 'settings', 'platform', 8, 'Industry setup, rule builder, custom fields, forms and dashboards.', ['Rule builder (IF → THEN)', 'Form builder', 'Industry setup wizard']),
  M(30.2, 'workflows', 'Workflows', 'workflow', 'platform', 8, 'Visual node editor for approvals, escalation and delegation.', ['Node editor', 'Test-run simulator', 'Escalation rules']),
  M(30.3, 'ai', 'AI HR', 'sparkles', 'platform', 8, 'Resume screening, attrition insights, anomaly detection and HR chatbot.', ['Attrition risk list', 'Payroll anomalies', 'Natural-language assistant']),
  M(30.4, 'analytics', 'Reports & Analytics', 'activity', 'platform', 8, 'HR dashboards, custom report builder, scheduling and exports.', ['Report builder', 'Excel/PDF export', 'Branch and industry reports']),
  M(30.5, 'security', 'Security', 'lock', 'platform', 8, 'RBAC matrix, audit logs, login history, IP rules, 2FA and API keys.', ['Role × permission matrix', 'Login history', 'API key management']),
  M(30.6, 'multi-company', 'Organization', 'building-2', 'platform', 8, 'Companies, branches, business units and consolidated group reports.', ['Tenant switch', 'Branch payroll', 'Group reports']),
  M(99, 'dev', 'Component Library', 'blocks', 'developer', 1, 'Every reusable component, variant and state in light and dark.', [], { routes: () => import('./dev/routes.js'), always: true, children: [{ path: 'components', label: 'Components' }, { path: 'playground', label: 'Theme playground' }] }),
];

/** Pseudo-modules handled by the router (not in the sidebar). */
export const SYSTEM = {
  login: { id: 'login', label: 'Sign in', routes: () => import('./auth/routes.js'), public: true },
  auth: { id: 'auth', label: 'Sign in', routes: () => import('./auth/routes.js'), public: true },
  staffing: { id: 'staffing', label: 'Staffing & Deployments', routes: () => import('./staffing/routes.js'), always: true },
  clients: { id: 'clients', label: 'Clients & Projects', routes: () => import('./clients/routes.js'), always: true },
};

/** Find a module (or system module) by its first route segment. */
export const findModule = (id) => MODULES.find((m) => m.id === id) || SYSTEM[id] || null;
