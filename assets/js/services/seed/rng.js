/* Purpose: seeded pseudo-random generator so the demo dataset is identical after every "Reset demo data". */

/** mulberry32 PRNG factory. */
export function createRng(seed = 20261022) {
  let a = seed >>> 0;
  const next = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p) => next() < p,
    /** Weighted pick from [[value, weight], ...]. */
    weighted(pairs) { const total = pairs.reduce((s, [, w]) => s + w, 0); let r = next() * total; for (const [v, w] of pairs) { if ((r -= w) <= 0) return v; } return pairs.at(-1)[0]; },
    shuffle(arr) { const x = [...arr]; for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; },
  };
}
