/* Purpose: tiny reactive store (Proxy + events) with optional localStorage persistence of selected keys. */
import { ls } from '../services/mock-db.js';

/**
 * Create a reactive store.
 * @param {object} initial initial state
 * @param {{persist?: string[], prefix?: string}} [opts] keys to persist in localStorage
 * @returns {object} proxy with $subscribe(fn) / $on(key, fn) / $state
 */
export function createStore(initial, opts = {}) {
  const persist = new Set(opts.persist || []);
  const state = { ...initial };
  for (const k of persist) { const v = ls.get(`${opts.prefix || 'store'}.${k}`); if (v !== undefined && v !== null) state[k] = v; }
  const subs = new Set();
  const keySubs = new Map();
  let queued = false; const dirty = new Set();
  const flush = () => {
    queued = false; const keys = [...dirty]; dirty.clear();
    for (const k of keys) keySubs.get(k)?.forEach((fn) => fn(state[k], k));
    subs.forEach((fn) => fn(state, keys));
  };
  const api = {
    $subscribe(fn) { subs.add(fn); return () => subs.delete(fn); },
    $on(key, fn) { if (!keySubs.has(key)) keySubs.set(key, new Set()); keySubs.get(key).add(fn); return () => keySubs.get(key).delete(fn); },
    get $state() { return state; },
  };
  return new Proxy(api, {
    get: (t, k) => (k in t ? t[k] : state[k]),
    set: (t, k, v) => {
      if (state[k] === v) return true;
      state[k] = v; dirty.add(k);
      if (persist.has(k)) ls.set(`${opts.prefix || 'store'}.${k}`, v);
      if (!queued) { queued = true; queueMicrotask(flush); }
      return true;
    },
  });
}

/** Global application store. */
export const appStore = createStore(
  { user: null, role: null, companyId: 'all', branchId: 'all', sidebarCollapsed: false, lang: 'en', density: null, favorites: [], pinned: [], unread: 0 },
  { persist: ['companyId', 'branchId', 'sidebarCollapsed', 'lang', 'density', 'favorites', 'pinned'], prefix: 'app' },
);
