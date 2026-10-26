/* Purpose: object helpers (deep merge, dot-path get/set, clone, flatten, diff) used by the config store and audit trail. */

/** @returns {boolean} true for plain objects */
export const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Deep clone using structuredClone with a JSON fallback. */
export const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/** Deep-merge `src` into `dst` (arrays are replaced). Mutates and returns dst. */
export function deepMerge(dst, src) {
  if (!isObj(src)) return dst;
  for (const [k, v] of Object.entries(src)) {
    if (isObj(v) && isObj(dst[k])) deepMerge(dst[k], v);
    else dst[k] = clone(v);
  }
  return dst;
}

/** Read a value by dot path ("home.hero.title"). */
export function getPath(obj, path, fallback) {
  const parts = Array.isArray(path) ? path : String(path).split('.');
  let cur = obj;
  for (const p of parts) { if (cur == null) return fallback; cur = cur[p]; }
  return cur === undefined ? fallback : cur;
}

/** Write a value by dot path, creating objects as needed. Returns obj. */
export function setPath(obj, path, value) {
  const parts = String(path).split('.');
  let cur = obj;
  parts.slice(0, -1).forEach((p) => { if (!isObj(cur[p])) cur[p] = {}; cur = cur[p]; });
  cur[parts.at(-1)] = value;
  return obj;
}

/** Flatten nested object to {"a.b.c": value}. */
export function flatten(obj, prefix = '', out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) flatten(v, key, out); else out[key] = v;
  }
  return out;
}

/** List changed leaf paths between two objects: [{path, before, after}]. */
export function diffPaths(a, b) {
  const fa = flatten(a), fb = flatten(b), out = [];
  for (const k of new Set([...Object.keys(fa), ...Object.keys(fb)])) {
    if (JSON.stringify(fa[k]) !== JSON.stringify(fb[k])) out.push({ path: k, before: fa[k], after: fb[k] });
  }
  return out;
}
