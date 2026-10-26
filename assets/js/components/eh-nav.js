/* Purpose: navigation components - <eh-tabs> (line/pill/vertical, arrow keys), <eh-segmented>, <eh-pagination>, <eh-breadcrumbs>. */
import { h, icon, uid } from '../core/dom.js';

class EhTabs extends HTMLElement {
  /** Children: <section data-tab="Label" [data-icon]>. Attributes: variant (line|pill|vertical). Lazy panels render when first shown. */
  connectedCallback() {
    if (this.tabs) return;
    const panels = [...this.querySelectorAll(':scope > section[data-tab]')]; const id = uid('tabs'); const v = this.getAttribute('variant') || 'line';
    this.tabs = panels.map((p, i) => h('button', { role: 'tab', type: 'button', id: `${id}-t${i}`, 'aria-controls': `${id}-p${i}`, 'aria-selected': 'false', tabindex: -1, class: 'tab', onClick: () => this.select(i) }, p.dataset.icon ? icon(p.dataset.icon, { size: 16 }) : null, p.dataset.tab));
    this.list = h('div', { role: 'tablist', class: `tabs tabs--${v}`, 'aria-orientation': v === 'vertical' ? 'vertical' : 'horizontal' }, ...this.tabs, h('span', { class: 'tabs__ink', 'aria-hidden': 'true' }));
    panels.forEach((p, i) => { p.setAttribute('role', 'tabpanel'); p.id = `${id}-p${i}`; p.setAttribute('aria-labelledby', `${id}-t${i}`); p.tabIndex = 0; p.hidden = true; });
    this.panels = panels; this.classList.add('tabs-wrap', `tabs-wrap--${v}`);
    this.prepend(this.list);
    this.list.addEventListener('keydown', (e) => {
      const vert = v === 'vertical'; const n = this.tabs.length; const i = this.tabs.indexOf(document.activeElement);
      const d = { [vert ? 'ArrowDown' : 'ArrowRight']: 1, [vert ? 'ArrowUp' : 'ArrowLeft']: -1 }[e.key];
      if (d) { e.preventDefault(); const j = (i + d + n) % n; this.select(j); this.tabs[j].focus(); }
      if (e.key === 'Home') { this.select(0); this.tabs[0].focus(); } if (e.key === 'End') { this.select(n - 1); this.tabs[n - 1].focus(); }
    });
    new ResizeObserver(() => this.ink()).observe(this.list);
    this.select(Math.max(0, panels.findIndex((p) => p.hasAttribute('data-active'))), false);
  }
  select(i, emit = true) {
    this.current = i;
    this.tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    this.panels.forEach((p, k) => { p.hidden = k !== i; });
    this.ink(); if (emit) this.dispatchEvent(new CustomEvent('eh-tab', { detail: { index: i } }));
  }
  ink() {
    const t = this.tabs?.[this.current]; const ink = this.list?.querySelector('.tabs__ink'); if (!t || !ink) return;
    const vert = this.list.classList.contains('tabs--vertical');
    ink.style.setProperty('--x', `${t.offsetLeft}px`); ink.style.setProperty('--y', `${t.offsetTop}px`); ink.style.setProperty('--w', `${t.offsetWidth}px`); ink.style.setProperty('--h', `${t.offsetHeight}px`);
    ink.dataset.vert = vert;
  }
}
customElements.define('eh-tabs', EhTabs);

class EhSegmented extends HTMLElement {
  /** Set `.options=[{value,label,icon?}]`; attribute value. Fires eh-change {value}. Arrow keys move selection (radiogroup). */
  set options(v) { this._o = v; if (this.isConnected) this.render(); }
  connectedCallback() { if (!this._o) this._o = [...this.querySelectorAll('option')].map((o) => ({ value: o.value, label: o.textContent })); this.render(); }
  get value() { return this._v ?? this.getAttribute('value') ?? this._o?.[0]?.value; }
  set value(v) { this._v = v; if (this.isConnected) this.render(); }
  render() {
    const val = this.value; const btns = this._o.map((o) => h('button', { type: 'button', role: 'radio', 'aria-checked': String(o.value === val), tabindex: o.value === val ? 0 : -1, 'aria-label': o.label || o.value, onClick: () => { this._v = o.value; this.render(); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { value: o.value } })); } }, o.icon ? icon(o.icon, { size: 16 }) : null, o.label || ''));
    const thumb = h('span', { class: 'segmented__thumb', 'aria-hidden': 'true' });
    const seg = h('div', { class: 'segmented', role: 'radiogroup', 'aria-label': this.getAttribute('label') || 'Options' }, thumb, ...btns);
    seg.addEventListener('keydown', (e) => { const i = btns.indexOf(document.activeElement); const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); btns[(i + d + btns.length) % btns.length].click(); this.querySelector('[aria-checked="true"]').focus(); } });
    this.replaceChildren(seg);
    requestAnimationFrame(() => { const a = btns.find((b) => b.getAttribute('aria-checked') === 'true'); if (a) { thumb.style.inlineSize = `${a.offsetWidth}px`; thumb.style.transform = `translateX(${a.offsetLeft - 3}px)`; } });
  }
}
customElements.define('eh-segmented', EhSegmented);

class EhPagination extends HTMLElement {
  /** Properties: total, page, pageSize. Fires eh-page {page} and eh-page-size {pageSize}. */
  set state(s) { Object.assign(this, s); if (this.isConnected) this.render(); }
  connectedCallback() { this.pageSizes ||= [10, 25, 50, 100]; this.render(); }
  render() {
    const total = this.total || 0, size = this.pageSize || 10, page = this.page || 1; const pages = Math.max(1, Math.ceil(total / size));
    const go = (p) => this.dispatchEvent(new CustomEvent('eh-page', { bubbles: true, detail: { page: p } }));
    const nums = []; for (let p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p); else if (nums.at(-1) !== '…') nums.push('…');
    const b = (label, p, dis, ic) => h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', disabled: dis, 'aria-label': label, onClick: () => go(p) }, icon(ic, { size: 16 }));
    const from = total ? (page - 1) * size + 1 : 0;
    this.replaceChildren(h('nav', { class: 'pagination', 'aria-label': 'Pagination' },
      h('span', { class: 'text-sm text-muted tabular' }, `${from}–${Math.min(total, page * size)} of ${total.toLocaleString('en-IN')}`),
      h('div', { class: 'cluster', style: { '--gap': '2px' } }, b('Previous page', page - 1, page <= 1, 'chevron-left'),
        ...nums.map((n) => (n === '…' ? h('span', { class: 'px-1 text-muted', 'aria-hidden': 'true' }, '…') : h('button', { type: 'button', class: `btn btn--sm btn--icon ${n === page ? 'btn--primary' : 'btn--ghost'}`, 'aria-label': `Page ${n}`, 'aria-current': n === page ? 'page' : null, onClick: () => go(n) }, String(n)))),
        b('Next page', page + 1, page >= pages, 'chevron-right')),
      this.hasAttribute('no-size') ? null : h('label', { class: 'text-sm text-muted cluster' }, 'Rows', h('select', { class: 'input', style: { inlineSize: 'auto', minBlockSize: '32px', padding: '2px 8px' }, onChange: (e) => this.dispatchEvent(new CustomEvent('eh-page-size', { bubbles: true, detail: { pageSize: +e.target.value } })) }, ...this.pageSizes.map((s) => h('option', { value: s, selected: s === size }, s))))));
  }
}
customElements.define('eh-pagination', EhPagination);

class EhBreadcrumbs extends HTMLElement {
  /** Set `.items = [{label, href?}]`. Last item is aria-current. */
  set items(v) { this._i = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const it = this._i || [];
    this.replaceChildren(h('nav', { 'aria-label': 'Breadcrumb' }, h('ol', { class: 'crumbs' }, ...it.map((c, i) => h('li', null, i < it.length - 1 && c.href ? h('a', { href: c.href }, c.label) : h('span', { 'aria-current': i === it.length - 1 ? 'page' : null }, c.label), i < it.length - 1 ? icon('chevron-right', { size: 14, cls: 'crumbs__sep' }) : null)))));
  }
}
customElements.define('eh-breadcrumbs', EhBreadcrumbs);
