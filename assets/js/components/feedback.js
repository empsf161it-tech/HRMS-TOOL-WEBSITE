/* Purpose: feedback components - <eh-alert>, <eh-empty-state>, <eh-error-state>, <eh-skeleton>, <eh-stepper>. */
import { h, icon } from '../core/dom.js';
import { illustration } from './illustrations.js';
import { button } from './eh-button.js';

const ALERT_ICON = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x' };

/** Inline alert element. */
export function alert(message, { tone = 'info', title, actions } = {}) {
  return h('div', { class: `alert alert--${tone}`, role: tone === 'danger' ? 'alert' : 'status' }, icon(ALERT_ICON[tone], { size: 18 }),
    h('div', null, title ? h('div', { class: 'alert__title' }, title) : null, h('div', { class: 'alert__body' }, message)), actions ? h('div', { class: 'alert__actions' }, actions) : null);
}

class EhAlert extends HTMLElement {
  connectedCallback() { if (this.done) return; this.done = true; this.replaceWith(alert(this.textContent.trim(), { tone: this.getAttribute('tone') || 'info', title: this.getAttribute('title') })); }
}
customElements.define('eh-alert', EhAlert);

/** Empty state element with a looping illustration and optional action. */
export function emptyState({ title = 'Nothing here yet', text = '', art = 'empty', action } = {}) {
  return h('div', { class: 'state', role: 'status' }, illustration(art), h('h3', { class: 'state__title' }, title), text ? h('p', { class: 'state__text' }, text) : null, action || null);
}

/** Error state with retry. */
export function errorState({ title = 'Something went wrong', text = 'Please try again.', onRetry } = {}) {
  return h('div', { class: 'state state--error', role: 'alert' }, illustration('error'), h('h3', { class: 'state__title' }, title), h('p', { class: 'state__text' }, text), onRetry ? button('Retry', { variant: 'primary', icon: 'refresh-cw', onClick: onRetry }) : null);
}

class EhEmptyState extends HTMLElement {
  connectedCallback() {
    if (this.done) return; this.done = true;
    const action = this.querySelector('[slot="action"]');
    this.replaceChildren(emptyState({ title: this.getAttribute('title') || undefined, text: this.getAttribute('text') || '', art: this.getAttribute('art') || 'empty', action }));
  }
}
customElements.define('eh-empty-state', EhEmptyState);

class EhErrorState extends HTMLElement {
  /** Set `.onRetry` to enable the Retry button. */
  connectedCallback() { this.render(); }
  render() { this.replaceChildren(errorState({ title: this.getAttribute('title') || undefined, text: this.getAttribute('text') || undefined, onRetry: this.onRetry || (this.hasAttribute('retry') ? () => this.dispatchEvent(new CustomEvent('retry', { bubbles: true })) : null) })); }
}
customElements.define('eh-error-state', EhErrorState);

const sk = (cls, style) => h('div', { class: `skeleton ${cls || ''}`, style });

class EhSkeleton extends HTMLElement {
  /** variant: text | card | table | chart | page | kpi | list; lines/rows attributes. */
  connectedCallback() {
    this.setAttribute('role', 'status'); this.setAttribute('aria-busy', 'true'); this.setAttribute('aria-label', 'Loading');
    const v = this.getAttribute('variant') || 'text'; const n = +(this.getAttribute('lines') || this.getAttribute('rows') || 3);
    const make = {
      text: () => Array.from({ length: n }, (_, i) => sk('skeleton--text', { inlineSize: `${i === n - 1 ? 60 : 100}%` })),
      kpi: () => [h('div', { class: 'card p-4 skeleton-stack' }, sk('skeleton--text', { inlineSize: '50%' }), sk('', { blockSize: '34px', inlineSize: '70%' }), sk('skeleton--text', { inlineSize: '40%' }))],
      card: () => [h('div', { class: 'card p-4 skeleton-stack' }, sk('', { blockSize: '120px' }), sk('skeleton--text', { inlineSize: '70%' }), sk('skeleton--text'))],
      chart: () => [sk('', { blockSize: '260px', borderRadius: 'var(--radius-md)' })],
      list: () => Array.from({ length: n }, () => h('div', { class: 'cluster' }, sk('skeleton--circle', { inlineSize: '36px', blockSize: '36px' }), h('div', { class: 'grow skeleton-stack', style: { '--gap': '6px' } }, sk('skeleton--text', { inlineSize: '40%' }), sk('skeleton--text', { inlineSize: '70%' })))),
      table: () => [h('div', { class: 'card p-4 skeleton-stack' }, sk('', { blockSize: '36px' }), ...Array.from({ length: n || 6 }, () => sk('', { blockSize: '28px' })))],
      page: () => [sk('', { blockSize: '36px', inlineSize: 'min(320px,60%)' }), h('div', { class: 'grid grid--kpi', style: { marginBlock: 'var(--space-6)' } }, ...Array.from({ length: 4 }, () => h('eh-skeleton', { variant: 'kpi' }))), h('div', { class: 'grid grid--main-side' }, h('eh-skeleton', { variant: 'table', rows: 6 }), h('eh-skeleton', { variant: 'card' }))],
    }[v] || (() => []);
    this.replaceChildren(h('div', { class: 'skeleton-stack' }, ...make()));
  }
}
customElements.define('eh-skeleton', EhSkeleton);

class EhStepper extends HTMLElement {
  /** Set `.steps = ['Details', ...]` and `current` attribute (0-based). */
  static observedAttributes = ['current'];
  set steps(v) { this._s = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const cur = +this.getAttribute('current') || 0;
    this.replaceChildren(h('ol', { class: 'stepper', 'aria-label': 'Progress' }, ...(this._s || []).map((s, i) => h('li', { class: 'stepper__step', 'data-state': i < cur ? 'done' : i === cur ? 'current' : 'todo', 'aria-current': i === cur ? 'step' : null },
      h('span', { class: 'stepper__dot' }, i < cur ? icon('check', { size: 14 }) : String(i + 1)), h('span', { class: 'stepper__label' }, s)))));
  }
}
customElements.define('eh-stepper', EhStepper);
