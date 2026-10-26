/* Purpose: picker controls - <eh-date-range>, <eh-slider>, <eh-color>, <eh-toggle>, plus checkbox()/radio() helpers. Native date/range/color inputs underneath. */
import { h, uid } from '../core/dom.js';
import { toISODate, addDays, startOfMonth } from '../core/utils/date.js';

/** Labelled checkbox element. */
export function checkbox(label, { name, checked, value, onChange } = {}) {
  return h('label', { class: 'check' }, h('input', { type: 'checkbox', name, value, checked: !!checked, onChange }), h('span', null, label));
}
/** Labelled radio element. */
export function radio(label, { name, checked, value, onChange } = {}) {
  return h('label', { class: 'check' }, h('input', { type: 'radio', name, value, checked: !!checked, onChange }), h('span', null, label));
}

class EhToggle extends HTMLElement {
  /** Attributes: label, name, checked, disabled. Fires eh-change. */
  connectedCallback() {
    if (this.input) return;
    const label = this.getAttribute('label') || this.textContent.trim();
    this.input = h('input', { type: 'checkbox', role: 'switch', name: this.getAttribute('name'), checked: this.hasAttribute('checked'), disabled: this.hasAttribute('disabled') });
    this.input.addEventListener('change', () => this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { checked: this.input.checked } })));
    this.replaceChildren(h('label', { class: 'toggle' }, this.input, h('span', { class: 'toggle__track', 'aria-hidden': 'true' }), h('span', null, label)));
  }
  get checked() { return this.input.checked; }
  set checked(v) { this.input.checked = !!v; }
}
customElements.define('eh-toggle', EhToggle);

class EhSlider extends HTMLElement {
  /** Attributes: label, min, max, step, value, format (inr|pct|plain), name. */
  connectedCallback() {
    if (this.range) return;
    const id = uid('sl'); const fmt = { inr: (v) => `₹${(+v).toLocaleString('en-IN')}`, pct: (v) => `${v}%`, plain: (v) => v }[this.getAttribute('format') || 'plain'];
    this.range = h('input', { type: 'range', id, name: this.getAttribute('name'), min: this.getAttribute('min') || 0, max: this.getAttribute('max') || 100, step: this.getAttribute('step') || 1, value: this.getAttribute('value') || 50 });
    const out = h('output', { for: id }, fmt(this.range.value));
    this.range.addEventListener('input', () => { out.textContent = fmt(this.range.value); this.dispatchEvent(new CustomEvent('eh-input', { bubbles: true, detail: { value: +this.range.value } })); });
    this.replaceChildren(h('div', { class: 'slider' }, h('label', { for: id, class: 'text-sm fw-500' }, this.getAttribute('label') || ''), h('div', { class: 'slider__row' }, this.range, out)));
  }
  get value() { return +this.range.value; }
  set value(v) { this.range.value = v; this.range.dispatchEvent(new Event('input')); }
}
customElements.define('eh-slider', EhSlider);

class EhColor extends HTMLElement {
  /** Attributes: label, value (hex), name. Native color input synced with a hex text field. */
  connectedCallback() {
    if (this.color) return;
    const id = uid('col'); const v = this.getAttribute('value') || '#5414B8';
    this.color = h('input', { type: 'color', value: v, 'aria-label': `${this.getAttribute('label') || 'Color'} picker` });
    this.text = h('input', { type: 'text', class: 'input mono', value: v.toUpperCase(), maxlength: 7, id, name: this.getAttribute('name'), pattern: '#[0-9A-Fa-f]{6}', 'aria-label': `${this.getAttribute('label') || 'Color'} hex value`, style: { maxInlineSize: '110px' } });
    this.color.addEventListener('input', () => { this.text.value = this.color.value.toUpperCase(); this.emit(); });
    this.text.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(this.text.value)) { this.color.value = this.text.value; this.emit(); } });
    this.replaceChildren(h('div', { class: 'stack', style: { '--gap': '4px' } }, h('label', { for: id, class: 'text-sm fw-500' }, this.getAttribute('label') || ''), h('div', { class: 'color-field field' }, this.color, this.text)));
  }
  emit() { this.dispatchEvent(new CustomEvent('eh-input', { bubbles: true, detail: { value: this.value } })); }
  get value() { return this.color.value; }
  set value(v) { this.color.value = v; this.text.value = v.toUpperCase(); }
}
customElements.define('eh-color', EhColor);

class EhDateRange extends HTMLElement {
  /** Attributes: label, from, to. Presets: today, last 7 days, this month, last month. Fires eh-change {from,to}. */
  connectedCallback() {
    if (this.from) return;
    const mk = (n, lab) => h('div', { class: 'field field--float' }, h('div', { class: 'field__control' }, h('input', { type: 'date', name: n, value: this.getAttribute(n) || '' }), h('label', { class: 'field__label' }, lab)));
    const f = mk('from', 'From'), t = mk('to', 'To'); this.from = f.querySelector('input'); this.to = t.querySelector('input');
    const set = (a, b) => { this.from.value = toISODate(a); this.to.value = toISODate(b); this.emit(); };
    const now = new Date(); const m0 = startOfMonth(now);
    const presets = [['Today', () => set(now, now)], ['Last 7 days', () => set(addDays(now, -6), now)], ['This month', () => set(m0, now)], ['Last month', () => set(new Date(m0.getFullYear(), m0.getMonth() - 1, 1), addDays(m0, -1))]];
    [this.from, this.to].forEach((i) => i.addEventListener('change', () => { this.to.min = this.from.value; this.emit(); }));
    this.replaceChildren(h('div', { class: 'stack', style: { '--gap': 'var(--space-2)' } }, h('div', { class: 'grid grid--2' }, f, t), h('div', { class: 'cluster', role: 'group', 'aria-label': 'Quick ranges' }, ...presets.map(([l, fn]) => h('button', { type: 'button', class: 'btn btn--ghost btn--sm', onClick: fn }, l)))));
  }
  emit() { this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { from: this.from.value, to: this.to.value } })); }
  get value() { return { from: this.from.value, to: this.to.value }; }
}
customElements.define('eh-date-range', EhDateRange);
