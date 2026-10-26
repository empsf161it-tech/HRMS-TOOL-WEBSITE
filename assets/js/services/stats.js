/* Purpose: named aggregate queries (headcount, upcoming events, attendance snapshot, attrition trend) used by dashboards. Called only through api.query(). */
import { db } from './mock-db.js';
import { createRng } from './seed/rng.js';
import { clone } from '../core/utils/object.js';
import { appStore } from '../core/store.js';

const ymd = (d) => d.toISOString().slice(0, 10);
const today = () => new Date();

async function scoped() {
  let rows = await db.load('employees');
  if (appStore.companyId !== 'all') rows = rows.filter((e) => e.companyId === appStore.companyId);
  if (appStore.branchId !== 'all') rows = rows.filter((e) => e.branchId === appStore.branchId);
  return rows;
}
const countBy = (rows, key) => Object.entries(Object.groupBy(rows, (r) => r[key])).map(([k, v]) => ({ key: k, count: v.length }));

function nextOccurrence(isoDate, from) {
  const d = new Date(isoDate); const n = new Date(Date.UTC(from.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  if (n < new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))) n.setUTCFullYear(n.getUTCFullYear() + 1);
  return n;
}

const handlers = {
  async headcount() {
    const rows = await scoped(); const now = today(); const month = now.toISOString().slice(0, 7);
    const [depts, branches] = await Promise.all([db.load('departments'), db.load('branches')]);
    return {
      total: rows.length, active: rows.filter((e) => e.status === 'Active').length,
      probation: rows.filter((e) => e.status === 'Probation').length, notice: rows.filter((e) => e.status === 'Notice').length,
      joinersMonth: rows.filter((e) => e.doj.startsWith(month)).length,
      byDepartment: countBy(rows, 'departmentId').map((x) => ({ label: depts.find((d) => d.id === x.key)?.name, value: x.count })).sort((a, b) => b.value - a.value),
      byBranch: countBy(rows, 'branchId').map((x) => ({ label: branches.find((b) => b.id === x.key)?.city, value: x.count })),
      byType: countBy(rows, 'employmentType').map((x) => ({ label: x.key, value: x.count })),
    };
  },
  async events({ days = 30 } = {}) {
    const rows = await scoped(); const now = today(); const end = new Date(now.getTime() + days * 86400000);
    const out = [];
    for (const e of rows) {
      const b = nextOccurrence(e.dob, now); if (b <= end) out.push({ type: 'birthday', date: ymd(b), employee: { id: e.id, name: e.name, designation: e.designation } });
      const a = nextOccurrence(e.doj, now); const yrs = a.getUTCFullYear() - new Date(e.doj).getUTCFullYear();
      if (a <= end && yrs > 0) out.push({ type: 'anniversary', date: ymd(a), years: yrs, employee: { id: e.id, name: e.name, designation: e.designation } });
      const pe = new Date(new Date(e.doj).getTime() + 180 * 86400000);
      if (e.status === 'Probation' && pe >= now && pe <= end) out.push({ type: 'probation', date: ymd(pe), employee: { id: e.id, name: e.name, designation: e.designation } });
    }
    return out.sort((x, y) => x.date.localeCompare(y.date));
  },
  /** Attendance snapshot derived deterministically from employee ids (real punches arrive with the Attendance module). */
  async attendanceToday() {
    const rows = await scoped(); const rng = createRng(rows.length * 31 + new Date().getUTCDate());
    const c = { present: 0, absent: 0, late: 0, leave: 0, wfh: 0 };
    rows.forEach(() => { c[rng.weighted([['present', 72], ['late', 9], ['absent', 5], ['leave', 8], ['wfh', 6]])]++; });
    return { ...c, total: rows.length, simulated: true };
  },
  async attritionTrend() {
    const rng = createRng(9); const base = (await scoped()).length; const m = [];
    for (let i = 11; i >= 0; i--) { const d = new Date(today()); d.setMonth(d.getMonth() - i); m.push({ label: d.toLocaleString('en-IN', { month: 'short' }), value: +(0.8 + rng.next() * 1.6).toFixed(1), joiners: Math.round(base * (0.01 + rng.next() * 0.02)) }); }
    return m;
  },
  async managerTeam({ managerId }) {
    const rows = (await db.load('employees')).filter((e) => e.managerId === managerId);
    const rng = createRng(managerId.length * 7 + new Date().getUTCDate());
    return rows.map((e) => ({ ...clone(e), today: rng.weighted([['Present', 72], ['Late', 10], ['Absent', 6], ['Leave', 8], ['WFH', 4]]) }));
  },
};

/** Run a named query. */
export async function statsQuery(name, params) {
  if (!handlers[name]) throw new Error(`Unknown query: ${name}`);
  return handlers[name](params);
}
