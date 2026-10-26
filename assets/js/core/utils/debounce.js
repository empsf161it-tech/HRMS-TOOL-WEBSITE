/* Purpose: debounce / throttle / sleep helpers. */

/** Debounce fn by `ms` (default 250 ms, the search-input standard). */
export function debounce(fn, ms = 250) {
  let t;
  const d = (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  d.cancel = () => clearTimeout(t);
  return d;
}

/** Throttle fn to at most once per `ms`. */
export function throttle(fn, ms = 100) {
  let last = 0, t;
  return (...a) => {
    const now = Date.now();
    if (now - last >= ms) { last = now; fn(...a); } else { clearTimeout(t); t = setTimeout(() => { last = Date.now(); fn(...a); }, ms - (now - last)); }
  };
}

/** Promise-based delay. */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/** Random integer in [a,b]. */
export const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
