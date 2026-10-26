/* Purpose: locale-aware number, currency, size and name formatting (India defaults, configurable). */
const opts = { locale: 'en-IN', currency: 'INR', timezone: 'Asia/Kolkata' };

/** Apply locale settings from config/settings. */
export function setLocaleOptions(o = {}) { Object.assign(opts, o); }
/** @returns {{locale:string,currency:string,timezone:string}} current locale options */
export const getLocaleOptions = () => ({ ...opts });

/** Format a number with Indian digit grouping (1,00,000). */
export const num = (n, o = {}) => new Intl.NumberFormat(opts.locale, o).format(n ?? 0);

/** Format money, e.g. inr(100000) → ₹1,00,000. */
export function inr(n, { compact = false, decimals = 0 } = {}) {
  return new Intl.NumberFormat(opts.locale, {
    style: 'currency', currency: opts.currency, maximumFractionDigits: decimals, minimumFractionDigits: decimals,
    ...(compact ? { notation: 'compact', maximumFractionDigits: 1 } : {}),
  }).format(n ?? 0);
}

/** Percentage from a 0–100 value. */
export const pct = (n, d = 0) => `${(n ?? 0).toFixed(d)}%`;

/** Human file size. */
export function fileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const u = ['KB', 'MB', 'GB']; let i = -1; let v = bytes;
  do { v /= 1024; i++; } while (v >= 1024 && i < u.length - 1);
  return `${v.toFixed(v < 10 ? 1 : 0)} ${u[i]}`;
}

/** Initials from a name ("Priya Raman" → "PR"). */
export const initials = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

/** Deterministic avatar hue (0–359) from a string. */
export function hueOf(str = '') { let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }

/** Avatar background color from a string (oklch, readable with white text). */
export const avatarColor = (str) => `oklch(55% 0.14 ${hueOf(str)})`;

/** Relative time ("2 hours ago"). */
export function relTime(date, now = Date.now()) {
  const t = new Date(date).getTime(); const diff = (t - now) / 1000;
  const rtf = new Intl.RelativeTimeFormat(opts.locale, { numeric: 'auto' });
  const steps = [['year', 31536000], ['month', 2592000], ['day', 86400], ['hour', 3600], ['minute', 60]];
  for (const [unit, s] of steps) if (Math.abs(diff) >= s) return rtf.format(Math.round(diff / s), unit);
  return rtf.format(Math.round(diff), 'second');
}

/** Escape a string for HTML text. */
export const escapeHTML = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Title-case a snake/kebab/camel identifier. */
export const titleCase = (s = '') => s.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
