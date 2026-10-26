/* Purpose: display components - <eh-avatar>, <eh-avatar-group>, <eh-kpi-card>, <eh-progress>, <eh-ring>, <eh-sparkline>, <eh-timeline>, badge/status helpers. */
import { h, icon } from '../core/dom.js';
import { initials, avatarColor, num, inr, pct } from '../core/utils/format.js';
import { countUp } from '../core/motion-engine.js';

/** Attendance statuses: fixed semantic tokens (color + icon + text, never color alone). */
export const STATUS = {
  present: { label: 'Present', icon: 'check' }, absent: { label: 'Absent', icon: 'x' }, halfday: { label: 'Half day', icon: 'minus' },
  late: { label: 'Late', icon: 'clock' }, leave: { label: 'On leave', icon: 'plane' }, holiday: { label: 'Holiday', icon: 'party-popper' },
  weekoff: { label: 'Week off', icon: 'moon' }, wfh: { label: 'WFH', icon: 'house' }, onduty: { label: 'On duty', icon: 'briefcase' },
};

/** Status pill with icon + text. */
export function statusBadge(key, label) {
  const s = STATUS[key] || { label: key, icon: 'circle' };
  return h('span', { class: 'badge', 'data-status': key }, icon(s.icon, { size: 12 }), label || s.label);
}

/** Generic badge. tone: primary|success|warning|danger|info|accent|neutral */
export function badge(text, tone = 'neutral', { solid = false, ic } = {}) {
  return h('span', { class: `badge${tone !== 'neutral' ? ` badge--${tone}` : ''}${solid ? ' badge--solid' : ''}` }, ic ? icon(ic, { size: 12 }) : null, text);
}

/** Avatar element (image or initials on a deterministic color). */
export function avatar(name, { src, size = '', viewName } = {}) {
  const a = h('span', { class: `avatar${size ? ` avatar--${size}` : ''}`, style: { '--_bg': avatarColor(name) }, role: 'img', 'aria-label': name }, src ? h('img', { src, alt: '', loading: 'lazy', width: 96, height: 96 }) : initials(name));
  if (viewName) a.style.viewTransitionName = viewName;
  return a;
}

class EhAvatar extends HTMLElement {
  static observedAttributes = ['name', 'src', 'size'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() { this.replaceChildren(avatar(this.getAttribute('name') || '?', { src: this.getAttribute('src'), size: this.getAttribute('size') || '' })); }
}
customElements.define('eh-avatar', EhAvatar);

class EhAvatarGroup extends HTMLElement {
  /** Set `.people = [{name, src}]`; `max` attribute limits visible avatars. */
  set people(v) { this._p = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const p = this._p || []; const max = +this.getAttribute('max') || 4;
    this.classList.add('avatar-group'); this.setAttribute('role', 'group'); this.setAttribute('aria-label', `${p.length} people`);
    this.replaceChildren(...p.slice(0, max).map((x) => avatar(x.name, { src: x.src, size: this.getAttribute('size') || 'sm' })), p.length > max ? h('span', { class: 'avatar avatar--sm avatar--more' }, `+${p.length - max}`) : null);
  }
}
customElements.define('eh-avatar-group', EhAvatarGroup);

const TONES = { primary: '--color-primary', success: '--color-success', warning: '--color-warning', danger: '--color-danger', info: '--color-info', accent: '--color-accent', secondary: '--color-secondary' };
const toneVar = (t) => `var(${TONES[t] || TONES.primary})`;

class EhSparkline extends HTMLElement {
  static observedAttributes = ['data'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  set data(v) { this.setAttribute('data', v.join(',')); }
  render() {
    const d = (this.getAttribute('data') || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
    if (d.length < 2) { this.replaceChildren(); return; }
    const min = Math.min(...d), max = Math.max(...d), rng = max - min || 1;
    const pts = d.map((v, i) => [(i / (d.length - 1)) * 100, 30 - ((v - min) / rng) * 26]);
    const path = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
    const ns = 'http://www.w3.org/2000/svg'; const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 32'); svg.setAttribute('preserveAspectRatio', 'none'); svg.setAttribute('aria-hidden', 'true');
    const area = document.createElementNS(ns, 'path'); area.setAttribute('d', `${path}L100,32L0,32Z`); area.setAttribute('class', 'spark__area');
    const line = document.createElementNS(ns, 'path'); line.setAttribute('d', path); line.setAttribute('class', 'spark__line'); line.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(area, line); this.replaceChildren(svg);
  }
}
customElements.define('eh-sparkline', EhSparkline);

class EhKpiCard extends HTMLElement {
  /** Attributes: label, value, format (number|inr|pct|text), delta (number), icon, tone, hint, spark (comma list), delay (ms). */
  connectedCallback() {
    if (this.rendered) return; this.rendered = true;
    const tone = this.getAttribute('tone') || 'primary'; const raw = this.getAttribute('value'); const fmt = this.getAttribute('format') || 'number';
    const format = { number: (n) => num(Math.round(n)), inr: (n) => inr(n, { compact: n >= 1e5 }), pct: (n) => pct(n, 1), text: (n) => n }[fmt];
    const val = h('div', { class: 'kpi__value' }, fmt === 'text' ? raw : format(0));
    const delta = this.getAttribute('delta');
    const dn = delta !== null ? +delta : null;
    const card = h('div', { class: 'card kpi', style: { '--_tone': toneVar(tone) } },
      h('div', { class: 'kpi__top' }, h('span', null, this.getAttribute('label')), this.hasAttribute('icon') ? h('span', { class: 'kpi__icon' }, icon(this.getAttribute('icon'), { size: 18 })) : null),
      val,
      h('div', { class: 'kpi__foot' },
        h('span', null, dn !== null ? h('span', { class: `delta ${dn >= 0 ? 'delta--up' : 'delta--down'}` }, icon(dn >= 0 ? 'trending-up' : 'trending-down', { size: 14 }), `${Math.abs(dn)}%`) : null, this.getAttribute('hint') ? ` ${this.getAttribute('hint')}` : ''),
        this.hasAttribute('spark') ? h('eh-sparkline', { data: this.getAttribute('spark') }) : null));
    this.style.setProperty('--kpi-delay', `${this.getAttribute('delay') || 0}ms`); this.setAttribute('data-appear', '');
    this.replaceChildren(card);
    if (fmt !== 'text') {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); countUp(val, +raw, { format }); } }, { threshold: 0.3 });
      io.observe(this);
    }
  }
}
customElements.define('eh-kpi-card', EhKpiCard);

class EhProgress extends HTMLElement {
  static observedAttributes = ['value'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const v = Math.max(0, Math.min(100, +this.getAttribute('value') || 0));
    const bar = h('div', { class: `progress${this.hasAttribute('large') ? ' progress--lg' : ''}`, role: 'progressbar', 'aria-valuenow': v, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': this.getAttribute('label') || 'Progress', style: { '--_tone': toneVar(this.getAttribute('tone')) } }, h('span'));
    this.replaceChildren(bar); requestAnimationFrame(() => bar.style.setProperty('--p', `${v}%`));
  }
}
customElements.define('eh-progress', EhProgress);

class EhRing extends HTMLElement {
  static observedAttributes = ['value', 'label'];
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const v = Math.max(0, Math.min(100, +this.getAttribute('value') || 0)); const size = +this.getAttribute('size') || 72;
    const r = 42, c = 2 * Math.PI * r; const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('aria-hidden', 'true');
    const mk = (cls) => { const e = document.createElementNS(ns, 'circle'); e.setAttribute('cx', 50); e.setAttribute('cy', 50); e.setAttribute('r', r); e.setAttribute('class', cls); return e; };
    const track = mk('ring__track'), bar = mk('ring__bar'); bar.style.strokeDasharray = c; bar.style.strokeDashoffset = c; svg.append(track, bar);
    this.style.setProperty('--sz', `${size}px`); this.style.setProperty('--_tone', toneVar(this.getAttribute('tone')));
    this.classList.add('ring'); this.setAttribute('role', 'img'); this.setAttribute('aria-label', `${this.getAttribute('label') || 'Progress'} ${Math.round(v)}%`);
    this.replaceChildren(svg, h('span', { class: 'ring__label' }, this.getAttribute('label') ?? `${Math.round(v)}%`));
    requestAnimationFrame(() => { bar.style.strokeDashoffset = c * (1 - v / 100); });
  }
}
customElements.define('eh-ring', EhRing);

class EhTimeline extends HTMLElement {
  /** Set `.items = [{title, meta, icon, tone, body}]`. */
  set items(v) { this._i = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const ol = h('ol', { class: 'timeline' }, ...(this._i || []).map((it) => h('li', { class: 'timeline__item', style: { '--_tone': toneVar(it.tone) } },
      h('span', { class: 'timeline__dot' }, icon(it.icon || 'circle', { size: 14 })), h('div', { class: 'timeline__title' }, it.title),
      it.body ? h('div', { class: 'text-sm text-muted' }, it.body) : null, it.meta ? h('div', { class: 'timeline__meta' }, it.meta) : null)));
    this.replaceChildren(ol);
  }
}
customElements.define('eh-timeline', EhTimeline);
