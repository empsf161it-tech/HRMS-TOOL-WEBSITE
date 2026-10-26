/* Purpose: storage adapter - IndexedDB for large collections/blobs/config, localStorage for small prefs. Schema versioning + migrations + seeding. */
import { generateSeed } from './seed/index.js';

const DB_NAME = 'ellowring-hrms';
const DB_VER = 1;
const STORES = ['collections', 'config', 'media', 'audit'];
/** Bump when stored shapes change and add a migration below. */
export const SCHEMA_VERSION = 2;
/** Migrations keyed by target version; each upgrades stored data in place. */
const MIGRATIONS = {
  1: async () => { /* initial schema, nothing to migrate */ },
  2: async () => { await db.reset(); },
};

/* ---------- localStorage (small data) ---------- */
export const ls = {
  get(key, fallback) { try { const v = localStorage.getItem(`eh.${key}`); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(`eh.${key}`, JSON.stringify(value)); } catch { /* quota */ } },
  remove(key) { try { localStorage.removeItem(`eh.${key}`); } catch { /* ignore */ } },
};

/* ---------- IndexedDB (large data) with in-memory fallback ---------- */
let dbPromise; const memory = Object.fromEntries(STORES.map((s) => [s, new Map()]));
function open() {
  if (!('indexedDB' in globalThis)) return Promise.resolve(null);
  dbPromise ??= new Promise((resolve) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = () => { for (const s of STORES) if (!r.result.objectStoreNames.contains(s)) r.result.createObjectStore(s); };
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => resolve(null);
    r.onblocked = () => resolve(null);
  });
  return dbPromise;
}
async function run(store, mode, fn) {
  const db = await open();
  if (!db) { const res = fn(null, memory[store]); return res?.result; }
  return new Promise((resolve, reject) => {
    const t = db.transaction(store, mode); const req = fn(t.objectStore(store));
    t.oncomplete = () => resolve(req?.result); t.onerror = () => reject(t.error); t.onabort = () => reject(t.error);
  });
}

/** Key-value access to an IndexedDB object store. */
export const kv = {
  get: (store, key) => run(store, 'readonly', (s, m) => (m ? { result: m.get(key) } : s.get(key))),
  set: (store, key, value) => run(store, 'readwrite', (s, m) => (m ? (m.set(key, value), { result: true }) : s.put(value, key))),
  del: (store, key) => run(store, 'readwrite', (s, m) => (m ? (m.delete(key), { result: true }) : s.delete(key))),
  keys: (store) => run(store, 'readonly', (s, m) => (m ? { result: [...m.keys()] } : s.getAllKeys())),
  all: (store) => run(store, 'readonly', (s, m) => (m ? { result: [...m.values()] } : s.getAll())),
  clear: (store) => run(store, 'readwrite', (s, m) => (m ? (m.clear(), { result: true }) : s.clear())),
};

/* ---------- collections: cached arrays persisted to IndexedDB ---------- */
const cache = new Map(); const timers = new Map();

/** Collection access used only by api.js. */
export const db = {
  /** Open storage, run migrations, seed on first run. */
  async init() {
    await open();
    const v = ls.get('schema', 0);
    if (!v) await this.seed();
    else for (let i = v + 1; i <= SCHEMA_VERSION; i++) await MIGRATIONS[i]?.();
    ls.set('schema', SCHEMA_VERSION);
  },
  /** Generate deterministic seed data and store it. */
  async seed() {
    const data = generateSeed();
    cache.clear();
    for (const [name, rows] of Object.entries(data)) {
      cache.set(name, rows);
      await kv.set('collections', name, rows);
    }
  },
  /** Load (and cache) a collection as a live array. */
  async load(name) {
    if (!cache.has(name)) cache.set(name, (await kv.get('collections', name)) ?? []);
    return cache.get(name);
  },
  /** Replace a collection and persist. */
  async replace(name, rows) { cache.set(name, rows); await kv.set('collections', name, rows); },
  /** Persist a (mutated) collection soon. */
  save(name) {
    clearTimeout(timers.get(name));
    timers.set(name, setTimeout(() => kv.set('collections', name, cache.get(name)), 150));
  },
  /** Wipe data and restore the identical seed set. */
  async reset() {
    for (const s of ['collections', 'audit']) await kv.clear(s);
    ['session'].forEach((k) => ls.remove(k));
    await this.seed(); ls.set('schema', SCHEMA_VERSION);
  },
};
