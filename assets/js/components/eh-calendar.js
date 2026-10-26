/* Purpose: <eh-calendar> (month/week/day + legend), <eh-roster-grid> (employees x dates) and <eh-heatmap>. Status colours come from the fixed attendance tokens. */
import { h, icon } from '../core/dom.js';
import { toISODate, addDays } from '../core/utils/date.js';
import { STATUS } from './display.js';
import './eh-nav.js';

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const colorOf = (s, tone) => (s ? `var(--st-${s})` : `var(--color-${tone || 'primary'})`);

/** Legend element for attendance statuses (icon-free swatch + text). */
export function statusLegend(keys = Object.keys(STATUS)) {
  return h('div', { class: 'legend', role: 'list', 'aria-label': 'Status legend' }, ...keys.map((k) => h('span', { role: 'listitem', style: { '--_c': `var(--st-${k})` } }, h('i'), STATUS[k].label)));
}

class EhCalendar extends HTMLElement {
  /** `.events=[{date,title,status?,tone?}]`; attributes view (month|week|day), week-start (0|1). Fires eh-day {date}. */
  set events(v) { this._e = v; if (this.isConnected && this.cur) this.render(); }
  connectedCallback() { if (this.cur) return; this.cur = new Date(); this.view = this.getAttribute('view') || 'month'; this.render(); }
  shift(d) { const c = new Date(this.cur); if (this.view === 'month') c.setMonth(c.getMonth() + d); else c.setDate(c.getDate() + d * (this.view === 'week' ? 7 : 1)); this.cur = c; this.render(); }
  render() {
    const ws = +(this.getAttribute('week-start') ?? 1); const ev = Object.groupBy(this._e || [], (e) => e.date); const todayIso = toISODate(new Date());
    const title = this.view === 'month' ? this.cur.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : this.view === 'week' ? `Week of ${toISODate(addDays(this.cur, -((this.cur.getDay() - ws + 7) % 7)))}` : this.cur.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const seg = h('eh-segmented', { label: 'Calendar view', value: this.view }); seg.options = [{ value: 'month', label: 'Month' }, { value: 'week', label: 'Week' }, { value: 'day', label: 'Day' }];
    seg.addEventListener('eh-change', (e) => { this.view = e.detail.value; this.render(); });
    const nav = h('div', { class: 'cluster', style: { '--gap': '2px' } }, h('button', { type: 'button', class: 'btn btn--outline btn--sm btn--icon', 'aria-label': 'Previous', onClick: () => this.shift(-1) }, icon('chevron-left', { size: 16 })), h('button', { type: 'button', class: 'btn btn--outline btn--sm', onClick: () => { this.cur = new Date(); this.render(); } }, 'Today'), h('button', { type: 'button', class: 'btn btn--outline btn--sm btn--icon', 'aria-label': 'Next', onClick: () => this.shift(1) }, icon('chevron-right', { size: 16 })));
    const evEl = (e) => h('div', { class: 'cal__ev', style: { '--_c': colorOf(e.status, e.tone) }, title: e.title }, e.title);
    const dayCell = (d, muted) => { const iso = toISODate(d); const list = ev[iso] || []; return h('button', { type: 'button', class: `cal__day${muted ? ' is-muted' : ''}${iso === todayIso ? ' is-today' : ''}`, 'data-has-ev': list.length ? '' : null, 'aria-label': `${d.toDateString()}${list.length ? `, ${list.length} events` : ''}`, onClick: () => this.dispatchEvent(new CustomEvent('eh-day', { bubbles: true, detail: { date: iso } })) }, h('span', { class: 'cal__num' }, d.getDate()), ...list.slice(0, 3).map(evEl), list.length > 3 ? h('span', { class: 'text-xs text-muted' }, `+${list.length - 3} more`) : null); };
    let body;
    if (this.view === 'month') {
      const first = new Date(this.cur.getFullYear(), this.cur.getMonth(), 1); const start = addDays(first, -((first.getDay() - ws + 7) % 7)); const cells = [];
      for (let i = 0; i < 42; i++) { const d = addDays(start, i); if (i >= 35 && d.getMonth() !== this.cur.getMonth()) break; cells.push(dayCell(d, d.getMonth() !== this.cur.getMonth())); }
      body = h('div', { class: 'cal__grid', role: 'group', 'aria-label': title }, ...Array.from({ length: 7 }, (_, i) => h('div', { class: 'cal__dow' }, DOW[(i + ws) % 7])), ...cells);
    } else {
      const days = this.view === 'week' ? Array.from({ length: 7 }, (_, i) => addDays(this.cur, i - ((this.cur.getDay() - ws + 7) % 7))) : [this.cur];
      body = h('div', { class: 'cal__list' }, ...days.map((d) => { const list = ev[toISODate(d)] || []; return h('div', { class: 'cal__list-row' }, h('div', null, h('div', { class: 'fw-700' }, d.getDate()), h('div', { class: 'text-xs text-muted' }, DOW[d.getDay()])), h('div', { class: 'stack', style: { '--gap': '4px' } }, ...(list.length ? list.map(evEl) : [h('span', { class: 'text-sm text-muted' }, 'Nothing scheduled')]))); }));
    }
    this.replaceChildren(h('div', { class: 'cal' }, h('div', { class: 'cal__head' }, h('h3', { 'aria-live': 'polite' }, title), h('div', { class: 'cluster' }, nav, seg)), body, this.hasAttribute('legend') ? statusLegend() : null));
  }
}
customElements.define('eh-calendar', EhCalendar);

class EhRosterGrid extends HTMLElement {
  /** `.rows=[{id,label,sub?}]`, `.dates=[ISO]`, `.cell=(rowId,date)=>({status,text?})`. Fires eh-cell {rowId,date}. Sticky header and first column, horizontal scroll. */
  set data({ rows, dates, cell }) { Object.assign(this, { rows, dates, cell }); if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    if (!this.rows) return;
    const head = h('thead', null, h('tr', null, h('th', { class: 'x-first', scope: 'col' }, this.getAttribute('corner') || 'Employee'), ...this.dates.map((d) => { const dt = new Date(`${d}T00:00:00`); return h('th', { scope: 'col', title: dt.toDateString() }, h('div', null, dt.getDate()), h('div', { style: { fontWeight: 400 } }, DOW[dt.getDay()].slice(0, 2))); })));
    const body = h('tbody', null, ...this.rows.map((r) => h('tr', null, h('th', { class: 'x-first', scope: 'row' }, h('div', { class: 'truncate' }, r.label), r.sub ? h('div', { class: 'text-xs text-muted truncate', style: { fontWeight: 400 } }, r.sub) : null), ...this.dates.map((d) => {
      const c = this.cell(r.id, d) || {}; const s = STATUS[c.status];
      return h('td', null, h('button', { type: 'button', class: 'xcell', style: { '--_c': c.status ? `var(--st-${c.status})` : null }, 'aria-label': `${r.label}, ${d}: ${s?.label || 'No data'}`, title: s?.label, onClick: () => this.dispatchEvent(new CustomEvent('eh-cell', { bubbles: true, detail: { rowId: r.id, date: d } })) }, c.text ?? (c.status ? s.label[0] : '')));
    }))));
    this.replaceChildren(h('div', { class: 'grid-scroll', tabindex: 0, role: 'region', 'aria-label': this.getAttribute('label') || 'Roster grid' }, h('table', { class: 'xgrid' }, head, body)), this.hasAttribute('legend') ? h('div', { style: { marginBlockStart: 'var(--space-3)' } }, statusLegend()) : null);
  }
}
customElements.define('eh-roster-grid', EhRosterGrid);

class EhHeatmap extends HTMLElement {
  /** `.data = {rows:[label], cols:[label], values:[[0..100]]}`. Cells show the number; intensity follows the value. */
  set data(v) { this._d = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const d = this._d; if (!d) return;
    this.replaceChildren(h('div', { class: 'grid-scroll', tabindex: 0, role: 'region', 'aria-label': this.getAttribute('label') || 'Heatmap' }, h('table', { class: 'xgrid' },
      h('thead', null, h('tr', null, h('th', { class: 'x-first', scope: 'col' }, this.getAttribute('corner') || ''), ...d.cols.map((c) => h('th', { scope: 'col', style: { minInlineSize: '64px', padding: '0 6px' } }, c)))),
      h('tbody', null, ...d.rows.map((r, i) => h('tr', null, h('th', { class: 'x-first', scope: 'row' }, r), ...d.values[i].map((v) => h('td', null, h('div', { class: 'xcell heat', style: { '--v': v } }, v)))))))));
  }
}
customElements.define('eh-heatmap', EhHeatmap);
