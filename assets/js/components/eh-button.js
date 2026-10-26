/* Purpose: <eh-button>, <eh-split-button>, <eh-copy> custom elements and the button() helper. Wraps a real <button>/<a> so forms and a11y work natively. */
import { h, icon } from '../core/dom.js';
import { createMenu } from './menu.js';

/** Build a styled button element (no custom element needed). */
export function button(label, { variant = 'secondary', size = 'md', icon: ic, iconEnd, onClick, type = 'button', block, title, ...attrs } = {}) {
  const b = h('button', { type, class: `btn btn--${variant}${size !== 'md' ? ` btn--${size}` : ''}${block ? ' btn--block' : ''}${label ? '' : ' btn--icon'}`, 'aria-label': label ? null : title, 'data-tooltip': !label ? title : null, onClick, ...attrs },
    h('span', { class: 'btn__label' }, ic ? icon(ic, { size: size === 'sm' ? 14 : 16 }) : null, label ? h('span', null, label) : null, iconEnd ? icon(iconEnd, { size: 16 }) : null),
    h('span', { class: 'btn__spinner', 'aria-hidden': 'true' }, h('span', { class: 'spinner' })));
  return b;
}

/** Toggle a button's loading state without changing its width. */
export function setLoading(btn, on) { btn.toggleAttribute('aria-busy', on); btn.setAttribute('aria-busy', String(!!on)); btn.disabled = !!on; }

/** Run an async handler with the loading state on a button. */
export async function withLoading(btn, fn) { setLoading(btn, true); try { return await fn(); } finally { setLoading(btn, false); } }

class EhButton extends HTMLElement {
  static observedAttributes = ['loading', 'disabled', 'variant', 'size', 'label'];
  connectedCallback() {
    if (this.inner) return;
    const kids = [...this.childNodes]; const variant = this.getAttribute('variant') || 'secondary'; const size = this.getAttribute('size') || 'md';
    const href = this.getAttribute('href');
    const lab = h('span', { class: 'btn__label' }, this.hasAttribute('icon') ? icon(this.getAttribute('icon'), { size: 16 }) : null, h('span', null, ...kids), this.hasAttribute('icon-end') ? icon(this.getAttribute('icon-end'), { size: 16 }) : null);
    this.inner = h(href ? 'a' : 'button', { class: `btn btn--${variant}${size !== 'md' ? ` btn--${size}` : ''}${this.hasAttribute('icon-only') ? ' btn--icon' : ''}${this.hasAttribute('fab') ? ' fab' : ''}${this.hasAttribute('block') ? ' btn--block' : ''}`, href, type: href ? null : (this.getAttribute('type') || 'button'), 'aria-label': this.getAttribute('aria-label') }, lab, h('span', { class: 'btn__spinner', 'aria-hidden': 'true' }, h('span', { class: 'spinner' })));
    this.replaceChildren(this.inner); this.sync();
  }
  attributeChangedCallback() { if (this.inner) this.sync(); }
  sync() {
    const loading = this.hasAttribute('loading'); const dis = this.hasAttribute('disabled');
    this.inner.setAttribute('aria-busy', String(loading));
    if (this.inner.tagName === 'BUTTON') this.inner.disabled = loading || dis; else this.inner.setAttribute('aria-disabled', String(loading || dis));
  }
  focus() { this.inner?.focus(); }
}
customElements.define('eh-button', EhButton);

class EhSplitButton extends HTMLElement {
  /** Set `.items` ([{label, onClick, icon}]) and `.onMain` before or after connecting. */
  connectedCallback() {
    if (this.main) return;
    const label = this.getAttribute('label') || 'Action'; const variant = this.getAttribute('variant') || 'primary';
    this.main = button(label, { variant, onClick: (e) => this.onMain?.(e) });
    this.more = button('', { variant, title: 'More options', iconEnd: 'chevron-down', 'aria-label': 'More options' }); this.more.classList.add('btn--icon');
    this.classList.add('split-btn'); this.replaceChildren(this.main, this.more);
    this.menu = createMenu(this.more, this._items || [], { placement: 'bottom-end', label });
  }
  set items(v) { this._items = v; this.menu?.update(v); }
}
customElements.define('eh-split-button', EhSplitButton);

class EhCopy extends HTMLElement {
  connectedCallback() {
    if (this.btn) return;
    const ic = icon('copy', { size: 14 });
    this.btn = h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': `Copy ${this.getAttribute('label') || 'value'}`, 'data-tooltip': 'Copy' }, ic);
    this.btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(this.getAttribute('value') || this.textContent); } catch { /* clipboard blocked */ }
      ic.setAttribute('name', 'check'); this.dispatchEvent(new CustomEvent('copied', { bubbles: true }));
      setTimeout(() => ic.setAttribute('name', 'copy'), 1500);
    });
    this.append(this.btn);
  }
}
customElements.define('eh-copy', EhCopy);
