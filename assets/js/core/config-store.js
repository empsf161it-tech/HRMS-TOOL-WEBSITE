/* Purpose: site config store - defaults + saved config, draft/published copies, versions, undo/redo, live sync (BroadcastChannel + postMessage). */
import { kv } from '../services/mock-db.js';
import { deepMerge, clone, getPath, setPath, diffPaths, isObj } from './utils/object.js';

const DEFAULTS_URL = new URL('../../../data/default-site-config.json', import.meta.url);
const channel = 'BroadcastChannel' in globalThis ? new BroadcastChannel('eh-config') : null;
const listeners = new Set();
let defaults, draft, published, mode = 'published', versions = [], activity = [];
const undoStack = []; const redoStack = []; const MAX_UNDO = 50;
let saveTimer;

const emit = (meta = {}) => listeners.forEach((fn) => fn(active(), meta));
const active = () => (mode === 'draft' ? draft : published);

function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    await kv.set('config', 'draft', draft);
    await kv.set('config', 'published', published);
    await kv.set('config', 'versions', versions);
    await kv.set('config', 'activity', activity);
  }, 200);
}

/**
 * Load defaults and merge saved configs. mode "draft" makes this tab render the draft (Control Center preview).
 * @param {{mode?: 'draft'|'published'}} [opts]
 */
export async function init({ mode: m } = {}) {
  const q = new URLSearchParams(location.search);
  mode = m || (q.get('preview') === 'draft' ? 'draft' : 'published');
  defaults = await (await fetch(DEFAULTS_URL)).json();
  const [sp, sd, sv, sa] = await Promise.all(['published', 'draft', 'versions', 'activity'].map((k) => kv.get('config', k)));
  published = deepMerge(clone(defaults), sp || {});
  draft = deepMerge(clone(defaults), sd || sp || {});
  if (published.theme?.preset === 'indigo' || published.theme?.light?.primary === '#4F46E5') {
    published.theme = clone(defaults.theme);
    draft.theme = clone(defaults.theme);
  }
  versions = sv || []; activity = sa || [];
  channel?.addEventListener('message', ({ data }) => {
    if (data.type === 'draft') { draft = data.config; if (mode === 'draft') emit({ remote: true }); }
    if (data.type === 'published') { published = data.config; if (mode === 'published') emit({ remote: true }); }
  });
  addEventListener('message', ({ data, origin }) => {
    if (origin !== location.origin || data?.source !== 'eh-admin') return;
    if (data.type === 'draft') { draft = data.config; if (mode === 'draft') emit({ remote: true }); }
  });
  return active();
}

export const configStore = {
  init,
  /** Active config (published for visitors, draft for previews). */
  get config() { return active(); },
  get mode() { return mode; },
  getDraft: () => draft,
  getPublished: () => published,
  getDefaults: () => defaults,
  /** Read a value from the draft (admin) or active config. */
  get(path, fallback, source) { return getPath(source === 'draft' ? draft : source === 'published' ? published : active(), path, fallback); },
  /** Set a draft value, push undo, broadcast to preview and other tabs. */
  set(path, value, { author = 'Site Admin', silent = false } = {}) {
    const before = getPath(draft, path);
    if (JSON.stringify(before) === JSON.stringify(value)) return;
    undoStack.push(clone(draft)); if (undoStack.length > MAX_UNDO) undoStack.shift(); redoStack.length = 0;
    setPath(draft, path, value);
    activity.unshift({ at: new Date().toISOString(), author, path, before, after: value }); activity.length = Math.min(activity.length, 500);
    persist(); channel?.postMessage({ type: 'draft', config: draft });
    if (!silent) emit({ path, value });
  },
  /** Reset one path (or everything when no path) to the shipped default. */
  reset(path) {
    if (!path) { undoStack.push(clone(draft)); draft = clone(defaults); persist(); channel?.postMessage({ type: 'draft', config: draft }); emit({ reset: true }); return; }
    this.set(path, clone(getPath(defaults, path)));
  },
  undo() { if (!undoStack.length) return false; redoStack.push(clone(draft)); draft = undoStack.pop(); persist(); channel?.postMessage({ type: 'draft', config: draft }); emit({ undo: true }); return true; },
  redo() { if (!redoStack.length) return false; undoStack.push(clone(draft)); draft = redoStack.pop(); persist(); channel?.postMessage({ type: 'draft', config: draft }); emit({ redo: true }); return true; },
  /** Changed leaf paths between draft and published. */
  unpublished: () => diffPaths(published, draft),
  /** Copy draft → published and store a version snapshot. */
  publish({ author = 'Site Admin', note = '' } = {}) {
    published = clone(draft);
    versions.unshift({ id: crypto.randomUUID(), at: new Date().toISOString(), author, note, config: clone(published) });
    versions.length = Math.min(versions.length, 30);
    persist(); channel?.postMessage({ type: 'published', config: published }); emit({ published: true });
    return versions[0];
  },
  versions: () => versions,
  activity: () => activity,
  /** Restore a version into the draft (publish separately). */
  restore(id) { const v = versions.find((x) => x.id === id); if (!v) return false; undoStack.push(clone(draft)); draft = clone(v.config); persist(); channel?.postMessage({ type: 'draft', config: draft }); emit({ restored: id }); return true; },
  exportJSON: () => JSON.stringify(draft, null, 2),
  /** Import a config object after a light schema check. */
  importJSON(text) {
    const obj = JSON.parse(text);
    if (!isObj(obj) || !isObj(obj.theme) || !isObj(obj.typography) || !isObj(obj.brand)) throw new Error('Invalid config: expected brand, theme and typography sections');
    undoStack.push(clone(draft)); draft = deepMerge(clone(defaults), obj); persist(); channel?.postMessage({ type: 'draft', config: draft }); emit({ imported: true });
  },
  /** Subscribe to config changes; returns an unsubscribe function. */
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};
