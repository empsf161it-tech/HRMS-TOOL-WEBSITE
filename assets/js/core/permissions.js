/* Purpose: permission model module.resource.action with scopes (all, company, branch, department, team, self); can() helper and role definitions. */
import { appStore } from './store.js';

/** Scope strength: higher number = wider access. */
export const SCOPE_RANK = { self: 1, team: 2, department: 3, branch: 4, company: 5, all: 6 };

const HR_MODULES = ['core-hr', 'recruitment', 'onboarding', 'attendance', 'devices', 'geo-attendance', 'audit', 'shifts', 'breaks', 'working-hours', 'timesheets', 'leave', 'performance', 'training', 'assets', 'expenses', 'helpdesk', 'documents', 'compliance', 'hospitality', 'manufacturing', 'retail', 'it', 'education', 'construction', 'healthcare', 'logistics', 'analytics', 'ai'];
const mods = (list, scope) => list.map((m) => [`${m}.*.*`, scope]);

/** Role catalogue; grants are [pattern, scope]. Patterns support * wildcards per segment. */
export const ROLES = {
  super_admin: { label: 'Admin', icon: 'shield-check', desc: 'Everything across all companies, security, configuration and the Control Center', grants: [['*.*.*', 'all']] },
  hr_admin: { label: 'HR Admin', icon: 'users', desc: 'All HR modules for assigned companies and branches', grants: [...mods(HR_MODULES, 'company'), ['payroll.*.view', 'company'], ['payroll.module.view', 'company'], ['ess.*.*', 'self']] },
  branch_hr: { label: 'Branch HR', icon: 'building-2', desc: 'HR modules limited to their own branch', grants: [...mods(HR_MODULES.filter((m) => m !== 'analytics'), 'branch'), ['ess.*.*', 'self']] },
  payroll_admin: { label: 'Payroll Admin', icon: 'wallet', desc: 'Payroll, compliance, reimbursements, loans and full & final', grants: [...mods(['payroll', 'compliance', 'expenses', 'analytics'], 'company'), ['leave.module.view', 'company'], ['leave.*.view', 'company'], ['core-hr.*.view', 'company'], ['core-hr.module.view', 'company'], ['ess.*.*', 'self']] },
  recruiter: { label: 'Recruiter', icon: 'user-search', desc: 'Recruitment and onboarding', grants: [...mods(['recruitment', 'onboarding'], 'company'), ['documents.module.view', 'company'], ['documents.*.view', 'company'], ['ess.*.*', 'self']] },
  manager: { label: 'Manager', icon: 'user-cog', desc: 'Team attendance, leave, timesheets, performance and approvals', grants: [['mss.*.*', 'team'], ['ess.*.*', 'self'], ['attendance.team.*', 'team'], ['leave.request.approve', 'team'], ['timesheets.entry.approve', 'team'], ['performance.review.*', 'team'], ['shifts.request.approve', 'team'], ['expenses.claim.approve', 'team'], ['recruitment.requisition.create', 'team']] },
  employee: { label: 'Employee', icon: 'user', desc: 'Employee self-service, own data only', grants: [['ess.*.*', 'self'], ['leave.request.create', 'self'], ['leave.request.view', 'self'], ['attendance.punch.create', 'self'], ['payroll.payslip.view', 'self'], ['helpdesk.ticket.create', 'self']] },
  site_admin: { label: 'Site Admin', icon: 'palette', desc: 'Website Control Center only', grants: [['cms.*.*', 'all']] },
};

const matches = (pattern, perm) => {
  const p = pattern.split('.'); const q = perm.split('.');
  return p.every((seg, i) => seg === '*' || seg === q[i]);
};

/** Widest scope the current role has for a permission, or null. */
export function scopeFor(perm, role = appStore.role) {
  const grants = ROLES[role]?.grants || [];
  let best = null;
  for (const [pat, scope] of grants) if (matches(pat, perm) && (!best || SCOPE_RANK[scope] > SCOPE_RANK[best])) best = scope;
  return best;
}

/**
 * Check a permission such as 'leave.request.approve'. Optionally require at least a minimum scope.
 * @param {string} perm
 * @param {{minScope?: keyof typeof SCOPE_RANK, role?: string}} [opts]
 */
export function can(perm, { minScope, role } = {}) {
  const s = scopeFor(perm, role);
  if (!s) return false;
  return !minScope || SCOPE_RANK[s] >= SCOPE_RANK[minScope];
}

/** Is a module visible in the sidebar for the current role? */
export const canModule = (id, role) => can(`${id}.module.view`, { role });

/** Modules limited to a role's rows: filter rows by the role scope using the signed-in user. */
export function scopeFilter(rows, perm, user, employees) {
  const s = scopeFor(perm, user?.role);
  if (!s || s === 'all') return s ? rows : [];
  const me = employees.find((e) => e.id === user.employeeId);
  const field = (r) => r.employeeId ?? r.id;
  switch (s) {
    case 'company': return rows.filter((r) => !r.companyId || r.companyId === user.companyId);
    case 'branch': return rows.filter((r) => !r.branchId || r.branchId === user.branchId);
    case 'department': return rows.filter((r) => !r.departmentId || r.departmentId === me?.departmentId);
    case 'team': return rows.filter((r) => r.managerId === user.employeeId || field(r) === user.employeeId);
    case 'self': return rows.filter((r) => field(r) === user.employeeId);
    default: return rows;
  }
}
