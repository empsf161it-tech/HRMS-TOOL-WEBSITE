/* Purpose: date helpers. Display format DD-MM-YYYY in Asia/Kolkata by default; ISO date strings (YYYY-MM-DD) are the storage format. */
import { getLocaleOptions } from './format.js';

const pad = (n) => String(n).padStart(2, '0');

/** Parts {y,m,d,h,mi,s} of a date in the configured timezone. */
export function parts(date = new Date()) {
  const f = new Intl.DateTimeFormat('en-GB', { timeZone: getLocaleOptions().timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const o = Object.fromEntries(f.formatToParts(new Date(date)).map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute, s: +o.second };
}

/** DD-MM-YYYY */
export function fmtDate(date) { if (!date) return '—'; const p = parts(parseISO(date)); return `${pad(p.d)}-${pad(p.m)}-${p.y}`; }
/** HH:MM (24h) */
export function fmtTime(date) { if (!date) return '—'; const p = parts(new Date(date)); return `${pad(p.h)}:${pad(p.mi)}`; }
/** DD-MM-YYYY HH:MM */
export const fmtDateTime = (date) => (date ? `${fmtDate(date)} ${fmtTime(date)}` : '—');
/** "22 Oct 2026" */
export function fmtLong(date) { return new Intl.DateTimeFormat(getLocaleOptions().locale, { timeZone: getLocaleOptions().timezone, day: '2-digit', month: 'short', year: 'numeric' }).format(parseISO(date)); }

/** Parse ISO date/datetime; date-only strings are treated as local midnight. */
export function parseISO(v) { if (v instanceof Date) return v; if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) return new Date(`${v}T00:00:00`); return new Date(v); }
/** YYYY-MM-DD in the configured timezone. */
export function toISODate(date = new Date()) { const p = parts(date); return `${p.y}-${pad(p.m)}-${pad(p.d)}`; }
/** Add n days to a date, returning a new Date. */
export function addDays(date, n) { const d = new Date(parseISO(date)); d.setDate(d.getDate() + n); return d; }
/** Whole days between two dates (b - a). */
export const diffDays = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
export const startOfMonth = (d) => { const x = parseISO(d); return new Date(x.getFullYear(), x.getMonth(), 1); };
export const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
/** Minutes since midnight → "HH:MM". */
export const minToHM = (min) => `${pad(Math.floor(min / 60) % 24)}:${pad(min % 60)}`;
/** Minutes → "7h 30m". */
export const durationLabel = (min) => `${Math.floor(min / 60)}h ${pad(min % 60)}m`;
/** Convert DD-MM-YYYY text to ISO; returns '' when invalid. */
export function fromDisplay(text) { const m = /^(\d{2})-(\d{2})-(\d{4})$/.exec(text || ''); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; }
