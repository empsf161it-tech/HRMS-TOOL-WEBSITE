/* Purpose: <eh-chart> - Chart.js wrapper that reads theme tokens, redraws on theme change, animates once when visible and offers a "view as table" toggle. Types: line, area, bar, stacked, donut, radar, gauge, funnel. */
import { h } from '../core/dom.js';
import { loadLib } from '../core/loader.js';
import { bus } from '../core/events.js';
import { button } from './eh-button.js';
import { errorState } from './feedback.js';

const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const PALETTE = ['--color-primary', '--color-secondary', '--color-accent', '--color-success', '--color-warning', '--color-danger', '--color-info'];
const alpha = (c, a) => `color-mix(in srgb, ${c} ${a * 100}%, transparent)`;

class EhChart extends HTMLElement {
  /** Set `.config = {type, labels, datasets:[{label,data,color?}], title, format?, max?, value? (gauge), stages? (funnel)}`. Attribute height (px). */
  set config(v) { this._c = v; if (this.isConnected && this.holder) this.start(); }
  get config() { return this._c; }
  connectedCallback() {
    if (this.holder) return;
    this.view = 'chart'; this.canvasWrap = h('div', { class: 'chart__canvas', style: this.hasAttribute('height') ? { '--chart-h': `${this.getAttribute('height')}px` } : null });
    this.tableWrap = h('div', { class: 'chart__table', hidden: true });
    this.toggle = button('', { variant: 'ghost', size: 'sm', icon: 'table-2', title: 'View as table', 'aria-pressed': 'false', onClick: () => this.flip() });
    this.holder = h('div', { class: 'chart' }, h('div', { class: 'chart__bar hide-print' }, this.toggle), this.canvasWrap, this.tableWrap);
    this.replaceChildren(this.holder);
    this.off = bus.on('theme-change', () => requestAnimationFrame(() => this.draw(false)));
    this.io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { this.io.disconnect(); this.start(); } }, { rootMargin: '80px' }); this.io.observe(this);
  }
  disconnectedCallback() { this.off?.(); this.io?.disconnect(); this.chart?.destroy(); }
  flip() { const t = this.view === 'chart'; this.view = t ? 'table' : 'chart'; this.canvasWrap.hidden = t; this.tableWrap.hidden = !t; this.toggle.setAttribute('aria-pressed', String(t)); this.toggle.setAttribute('data-tooltip', t ? 'View as chart' : 'View as table'); }
  async start() {
    const c = this._c; if (!c) return;
    this.buildTable(c);
    if (c.type === 'funnel') { this.drawFunnel(c); return; }
    try { await loadLib('chart'); } catch (e) { this.canvasWrap.replaceChildren(errorState({ title: 'Chart library unavailable', text: 'Check your connection. The data is still available in table view.', onRetry: () => this.start() })); return; }
    this.draw(true);
  }
  colors(i) { return css(PALETTE[i % PALETTE.length]); }
  draw(animate) {
    const c = this._c; const Chart = window.Chart; if (!c || !Chart || c.type === 'funnel') { if (c?.type === 'funnel') this.drawFunnel(c); return; }
    this.chart?.destroy();
    const text = css('--text-muted'), grid = css('--border'), surface = css('--surface');
    Chart.defaults.font.family = css('--font-body'); Chart.defaults.color = text;
    const cv = h('canvas', { role: 'img', 'aria-label': `${c.title || 'Chart'}. ${c.labels?.length || ''} data points. Use the table toggle for exact values.` });
    this.canvasWrap.replaceChildren(cv);
    const t = c.type; const radial = ['donut', 'radar', 'gauge'].includes(t);
    const datasets = (c.datasets || []).map((d, i) => {
      const col = d.color ? css(d.color) || d.color : this.colors(i);
      if (t === 'donut' || t === 'gauge') return { ...d, backgroundColor: t === 'gauge' ? [col, grid] : (d.backgroundColor || d.data.map((_, k) => this.colors(k))), borderColor: surface, borderWidth: 2, hoverOffset: 4 };
      if (t === 'bar' || t === 'stacked') return { ...d, backgroundColor: col, borderRadius: 6, maxBarThickness: 36 };
      if (t === 'radar') return { ...d, borderColor: col, backgroundColor: alpha(col, 0.2), pointBackgroundColor: col };
      return { ...d, borderColor: col, backgroundColor: t === 'area' ? alpha(col, 0.18) : col, fill: t === 'area', tension: 0.35, pointRadius: 3, pointHoverRadius: 5, borderWidth: 2.5 };
    });
    const type = { donut: 'doughnut', gauge: 'doughnut', stacked: 'bar', area: 'line' }[t] || t;
    const fmt = c.format || ((v) => v.toLocaleString('en-IN'));
    const opts = {
      responsive: true, maintainAspectRatio: false, animation: animate ? { duration: 800, easing: 'easeOutQuart' } : false,
      plugins: { legend: { display: t === 'donut' || datasets.length > 1, position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 14 } }, tooltip: { callbacks: { label: (x) => ` ${x.dataset.label ? `${x.dataset.label}: ` : `${x.label}: `}${fmt(x.parsed.y ?? x.parsed.r ?? x.parsed)}` } } },
      ...(t === 'donut' ? { cutout: '68%' } : {}), ...(t === 'gauge' ? { cutout: '78%', rotation: -90, circumference: 180, plugins: { legend: { display: false }, tooltip: { enabled: false } } } : {}),
      ...(radial ? {} : { scales: { x: { stacked: t === 'stacked', grid: { display: false }, border: { color: grid } }, y: { stacked: t === 'stacked', beginAtZero: true, grid: { color: grid }, border: { display: false }, ticks: { callback: (v) => fmt(v) } } } }),
      ...(t === 'radar' ? { scales: { r: { grid: { color: grid }, angleLines: { color: grid }, pointLabels: { color: text }, ticks: { backdropColor: 'transparent' }, beginAtZero: true } } } : {}),
    };
    const plugins = t === 'gauge' ? [{ id: 'gaugeText', afterDraw: (ch) => { const { ctx, chartArea: a } = ch; const x = (a.left + a.right) / 2, y = a.bottom - 6; ctx.save(); ctx.textAlign = 'center'; ctx.fillStyle = css('--text'); ctx.font = `800 ${Math.max(20, (a.right - a.left) / 7)}px ${css('--font-heading')}`; ctx.fillText(fmt(c.value ?? datasets[0].data[0]), x, y - 8); ctx.font = `500 12px ${css('--font-body')}`; ctx.fillStyle = text; ctx.fillText(c.caption || '', x, y + 10); ctx.restore(); } }] : [];
    this.chart = new Chart(cv, { type, data: { labels: c.labels, datasets }, options: opts, plugins });
  }
  drawFunnel(c) {
    const stages = c.stages || []; const max = Math.max(...stages.map((s) => s.value), 1);
    this.canvasWrap.replaceChildren(h('div', { class: 'funnel', role: 'img', 'aria-label': c.title || 'Funnel' }, ...stages.map((s, i) => {
      const w = Math.max(18, (s.value / max) * 100); const conv = i ? Math.round((s.value / stages[i - 1].value) * 100) : 100;
      return h('div', { class: 'funnel__row' }, h('span', { class: 'funnel__label' }, s.label), h('div', { class: 'funnel__track' }, h('div', { class: 'funnel__bar', style: { inlineSize: `${w}%`, '--_c': `var(${PALETTE[i % PALETTE.length]})` } }, h('strong', null, s.value.toLocaleString('en-IN')))), h('span', { class: 'funnel__conv text-xs text-muted' }, i ? `${conv}%` : ''));
    })));
  }
  buildTable(c) {
    const rows = c.type === 'funnel' ? (c.stages || []).map((s) => [s.label, s.value]) : (c.labels || []).map((l, i) => [l, ...(c.datasets || []).map((d) => d.data[i])]);
    const head = c.type === 'funnel' ? ['Stage', 'Count'] : ['', ...(c.datasets || []).map((d) => d.label || 'Value')];
    this.tableWrap.replaceChildren(h('table', { class: 'table' }, h('caption', { class: 'sr-only' }, c.title || 'Chart data'), h('thead', null, h('tr', null, ...head.map((x) => h('th', { scope: 'col' }, x)))), h('tbody', null, ...rows.map((r) => h('tr', null, ...r.map((v, i) => h(i ? 'td' : 'th', { scope: i ? null : 'row', class: i ? 'is-end' : '' }, typeof v === 'number' ? v.toLocaleString('en-IN') : v)))))));
  }
}
customElements.define('eh-chart', EhChart);

/** Create a chart element from a config. */
export function chart(config, height) { const c = document.createElement('eh-chart'); if (height) c.setAttribute('height', height); c.config = config; return c; }
