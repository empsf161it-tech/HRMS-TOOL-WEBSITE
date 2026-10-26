/* Purpose: THE ONLY file that knows where data lives. Promise-based REST-like contract (list/get/create/update/remove/action) over mock-db with simulated latency and errors.
   INTEGRATION: to use a real backend, replace the internals of each method with fetch() calls - views never change. */
import { db, ls } from './mock-db.js';
import { scopeFilter } from '../core/permissions.js';
import { appStore } from '../core/store.js';
import { bus } from '../core/events.js';
import { clone } from '../core/utils/object.js';
import { statsQuery } from './stats.js';

/** Error type thrown by every api call. */
export class ApiError extends Error {
  constructor(message, status = 500) { super(message); this.name = 'ApiError'; this.status = status; }
}

const defaults = { minDelay: 200, maxDelay: 600, failRate: 0 };
/** Developer-facing toggles (latency window, failure rate) persisted in localStorage. */
export const apiSettings = {
  get: () => ({ ...defaults, ...ls.get('api.settings', {}) }),
  set: (patch) => ls.set('api.settings', { ...apiSettings.get(), ...patch }),
};

/** Per-resource config: search fields, role scope permission, whether the company/branch switcher applies. */
const RESOURCES = {
  employees: { search: ['name', 'code', 'email', 'designation', 'location'], perm: 'core-hr.employee.view', context: true, prefix: 'E' },
  notifications: { search: ['title', 'body'], prefix: 'N' },
  announcements: { search: ['title', 'body'], prefix: 'A' },
  companies: { search: ['name', 'short'], prefix: 'C' },
  branches: { search: ['name', 'city'], context: true, prefix: 'B' },
  departments: { search: ['name'], prefix: 'D' },
  designations: { search: ['name'], prefix: 'DS' },
  holidays: { search: ['name'], prefix: 'H' },
  users: { search: ['name', 'email'], prefix: 'U' },
  audit: { search: ['resource', 'action', 'userName'], prefix: 'AU' },
};
const cfgOf = (r) => RESOURCES[r] || { search: ['name', 'title'], prefix: 'X' };
const actionHandlers = new Map();

async function simulate(signal) {
  const { minDelay, maxDelay, failRate } = apiSettings.get();
  const ms = minDelay + Math.random() * Math.max(0, maxDelay - minDelay);
  await new Promise((res, rej) => {
    const t = setTimeout(res, ms);
    signal?.addEventListener('abort', () => { clearTimeout(t); rej(new DOMException('Aborted', 'AbortError')); }, { once: true });
  });
  if (failRate > 0 && Math.random() < failRate) throw new ApiError('Simulated server error. Please retry.', 500);
}

const norm = (v) => String(v ?? '').toLowerCase();
function matchFilter(value, f) {
  if (f === '' || f == null || (Array.isArray(f) && !f.length)) return true;
  if (Array.isArray(f)) return f.includes(value);
  if (typeof f === 'object') {
    if ('contains' in f) return norm(value).includes(norm(f.contains));
    if ('from' in f || 'to' in f) return (!f.from || value >= f.from) && (!f.to || value <= f.to);
    if ('gt' in f) return value > f.gt;
    if ('lt' in f) return value < f.lt;
  }
  return value === f;
}

async function audit(resource, recordId, action, before, after) {
  const rows = await db.load('audit'); const u = appStore.user;
  rows.unshift({ id: `AU${Date.now().toString(36)}${rows.length}`, at: new Date().toISOString(), userId: u?.id, userName: u?.name || 'System', resource, recordId, action, before: before ? clone(before) : null, after: after ? clone(after) : null });
  if (rows.length > 2000) rows.length = 2000;
  db.save('audit');
}

export const api = {
  /**
   * List rows with search, filters, sort and pagination.
   * @param {string} resource
   * @param {{search?:string, filters?:object, sort?:{key:string,dir:'asc'|'desc'}, page?:number, pageSize?:number, signal?:AbortSignal, scope?:boolean}} [q]
   * @returns {Promise<{data:object[], total:number, page:number, pageSize:number}>}
   */
  async list(resource, { search = '', filters = {}, sort, page = 1, pageSize = 10, signal, scope = true } = {}) {
    await simulate(signal);
    const cfg = cfgOf(resource); let rows = [...(await db.load(resource))];
    if (cfg.context) {
      if (appStore.companyId !== 'all') rows = rows.filter((r) => !r.companyId || r.companyId === appStore.companyId);
      if (appStore.branchId !== 'all') rows = rows.filter((r) => (resource === 'branches' ? r.id : r.branchId) === appStore.branchId);
    }
    if (scope && cfg.perm && appStore.user) rows = scopeFilter(rows, cfg.perm, appStore.user, await db.load('employees'));
    if (search) { const s = norm(search); rows = rows.filter((r) => cfg.search.some((f) => norm(r[f]).includes(s))); }
    for (const [k, f] of Object.entries(filters || {})) rows = rows.filter((r) => matchFilter(r[k], f));
    if (sort?.key) {
      const dir = sort.dir === 'desc' ? -1 : 1;
      rows = rows.toSorted((a, b) => (typeof a[sort.key] === 'number' && typeof b[sort.key] === 'number' ? a[sort.key] - b[sort.key] : String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), 'en', { numeric: true })) * dir);
    }
    const total = rows.length;
    const size = pageSize === Infinity || pageSize === 'all' ? total || 1 : pageSize;
    return { data: clone(rows.slice((page - 1) * size, page * size)), total, page, pageSize: size };
  },
  /** Fetch one record by id (rejects with 404). */
  async get(resource, id, { signal } = {}) {
    await simulate(signal);
    const row = (await db.load(resource)).find((r) => r.id === id);
    if (!row) throw new ApiError(`${resource} ${id} not found`, 404);
    return clone(row);
  },
  /** Create a record; writes an audit entry unless `{ audit: false }` (used for system-generated records). */
  async create(resource, data, { audit: doAudit = true } = {}) {
    await simulate();
    const rows = await db.load(resource);
    const row = { id: data.id || `${cfgOf(resource).prefix}${Date.now().toString(36).toUpperCase()}`, ...clone(data), createdAt: new Date().toISOString() };
    rows.unshift(row); db.save(resource);
    if (resource !== 'audit' && doAudit) await audit(resource, row.id, 'create', null, row);
    bus.emit('data-changed', { resource, id: row.id, action: 'create' });
    return clone(row);
  },
  /** Patch a record; writes before/after audit entry. */
  async update(resource, id, patch, { audit: doAudit = true } = {}) {
    await simulate();
    const rows = await db.load(resource); const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new ApiError(`${resource} ${id} not found`, 404);
    const before = clone(rows[i]); rows[i] = { ...rows[i], ...clone(patch), updatedAt: new Date().toISOString() }; db.save(resource);
    if (doAudit) await audit(resource, id, 'update', before, rows[i]);
    bus.emit('data-changed', { resource, id, action: 'update' });
    return clone(rows[i]);
  },
  /** Delete a record. */
  async remove(resource, id) {
    await simulate();
    const rows = await db.load(resource); const i = rows.findIndex((r) => r.id === id);
    if (i < 0) throw new ApiError(`${resource} ${id} not found`, 404);
    const [gone] = rows.splice(i, 1); db.save(resource);
    await audit(resource, id, 'delete', gone, null);
    bus.emit('data-changed', { resource, id, action: 'delete' });
    return true;
  },
  /** Named workflow action (approve, reject, lock, publish ...). Modules register richer handlers via registerAction. */
  async action(resource, id, name, payload = {}) {
    const handler = actionHandlers.get(`${resource}:${name}`);
    const row = await this.get(resource, id);
    const patch = handler ? await handler(row, payload) : { status: { approve: 'Approved', reject: 'Rejected', lock: 'Locked', unlock: 'Open', publish: 'Published' }[name] || row.status, lastAction: name, lastActionNote: payload.note };
    return this.update(resource, id, patch);
  },
  /** Register a custom action handler: fn(row, payload) → patch. */
  registerAction(resource, name, fn) { actionHandlers.set(`${resource}:${name}`, fn); },
  /** Named aggregate queries for dashboards and analytics. */
  async query(name, params = {}, { signal } = {}) { await simulate(signal); return statsQuery(name, params); },
  /** Restore the identical seed dataset. */
  async resetDemoData() { await db.reset(); },

  auth: {
    /** Validate credentials and open a session. */
    async login(email, password) {
      await simulate();
      const users = await db.load('users'); const u = users.find((x) => x.email.toLowerCase() === String(email).trim().toLowerCase());
      if (!u) throw new ApiError('No account found for that email.', 401);
      if (u.locked) throw new ApiError('This account is locked. Contact your administrator.', 423);
      if (u.password !== password) { u.failed = (u.failed || 0) + 1; if (u.failed >= 5) u.locked = true; db.save('users'); throw new ApiError(u.locked ? 'Too many attempts. Account locked.' : 'Incorrect password.', 401); }
      u.failed = 0; db.save('users'); return this.open(u);
    },
    /** Open a session for a user object (used by quick-login chips and role switch). */
    open(u) { const s = { userId: u.id, at: Date.now() }; ls.set('session', s); return publicUser(u); },
    /** Current session user or null. */
    async current() {
      const s = ls.get('session'); if (!s) return null;
      const u = (await db.load('users')).find((x) => x.id === s.userId); return u ? publicUser(u) : null;
    },
    /** Demo quick login by role id. */
    async quickLogin(role) { const u = (await db.load('users')).find((x) => x.role === role); return this.open(u); },
    /** Register new user account. */
    async register({ name, email, phone, department, role = 'employee', password }) {
      await simulate();
      const users = await db.load('users');
      if (users.some((x) => x.email.toLowerCase() === String(email).trim().toLowerCase())) {
        throw new ApiError('An account with this email address already exists.', 409);
      }
      const newUser = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        department: department || 'Engineering',
        role: role || 'employee',
        password: password || 'Demo@123',
        companyId: 'comp-1',
        active: true,
      };
      users.push(newUser);
      db.save('users');
      return this.open(newUser);
    },
    logout() { ls.remove('session'); },
  },
};

const publicUser = (u) => { const { password, ...rest } = u; return clone(rest); };
