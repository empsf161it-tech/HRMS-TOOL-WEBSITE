/* Purpose: mock auth session - login, quick-login, role switching and logout. Updates the global app store; permissions.js reads the role. */
import { api } from '../services/api.js';
import { appStore } from './store.js';
import { bus } from './events.js';
import { ROLES } from './permissions.js';

/** Restore a session on page load. @returns {Promise<object|null>} */
export async function restoreSession() {
  let u = await api.auth.current();
  if (!u && !sessionStorage.getItem('eh.logged_out')) {
    try {
      u = await api.auth.quickLogin('super_admin');
    } catch {
      // ignore
    }
  }
  if (u) { appStore.user = u; appStore.role = u.role; }
  return u;
}

/** Sign in with email + password. Throws ApiError on failure. */
export async function login(email, password) {
  const u = await api.auth.login(email, password);
  setUser(u); return u;
}

/** Demo quick login by role id. */
export async function quickLogin(role) { const u = await api.auth.quickLogin(role); setUser(u); return u; }

/** Switch to another demo role instantly (menus, buttons and data re-filter). */
export async function switchRole(role) {
  if (!ROLES[role]) throw new Error(`Unknown role ${role}`);
  const u = await api.auth.quickLogin(role);
  setUser(u); bus.emit('role-change', { role }); return u;
}

/** End the session. */
export function logout() {
  sessionStorage.setItem('eh.logged_out', '1');
  api.auth.logout();
  appStore.user = null;
  appStore.role = null;
  bus.emit('logout');
}

function setUser(u) {
  sessionStorage.removeItem('eh.logged_out');
  appStore.user = u; appStore.role = u.role;
  if (appStore.companyId !== 'all' && u.role !== 'super_admin') appStore.companyId = u.companyId;
  bus.emit('login', { user: u });
}
