/* Purpose: <eh-multi-select> (searchable, chips) and <eh-combobox> (single, optional async source). ARIA combobox/listbox pattern with arrow-key support. */
import { h, icon, uid } from '../core/dom.js';
import { debounce } from '../core/utils/debounce.js';

class EhChoice extends HTMLElement {
  /** Set `.options = [{value,label,hint?}]`; optional `.source = async (query) => options` for remote search. `.value` is string[] (multi) or string. */
  connectedCallback() {
    if (this.box) return;
    this.multiple = this.localName === 'eh-multi-select';
    this._opts ||= [...this.querySelectorAll('option')].map((o) => ({ value: o.value, label: o.textContent.trim() }));
    this.sel ||= new Map(); this.active = -1; this.listId = uid('lb');
    const label = this.getAttribute('label') || '';
    this.input = h('input', { type: 'text', role: 'combobox', 'aria-expanded': 'false', 'aria-controls': this.listId, 'aria-autocomplete': 'list', placeholder: this.getAttribute('placeholder') || 'Search…', autocomplete: 'off', 'aria-label': label || 'Search' });
    this.chips = h('span', { class: 'cluster', style: { '--gap': '4px' } });
    this.box = h('div', { class: 'msel__box' }, this.chips, this.input, icon('chevrons-up-down', { size: 16, cls: 'text-muted' }));
    this.list = h('div', { class: 'msel__list', role: 'listbox', id: this.listId, hidden: true, 'aria-multiselectable': this.multiple ? 'true' : null, 'aria-label': label });
    this.hidden = h('span', { hidden: true });
    this.append(h('div', { class: 'msel field' }, label ? h('div', { class: 'text-sm fw-500' }, label) : null, this.box, this.list, this.hidden));
    const pre = this.getAttribute('value'); if (pre) pre.split(',').forEach((v) => { const o = this._opts.find((x) => x.value === v); if (o) this.sel.set(v, o); });
    this.box.addEventListener('click', () => { this.input.focus(); this.openList(); });
    this.input.addEventListener('focus', () => this.openList());
    this.input.addEventListener('input', debounce(() => this.filter(), this.source ? 250 : 0));
    this.input.addEventListener('keydown', (e) => this.keys(e));
    document.addEventListener('pointerdown', (e) => { if (!this.contains(e.target)) this.closeList(); });
    this.renderChips(); this.filter();
  }
  set options(v) { this._opts = v; if (this.box) this.filter(); }
  get options() { return this._opts || []; }
  get value() { return this.multiple ? [...this.sel.keys()] : ([...this.sel.keys()][0] ?? ''); }
  set value(v) { this.sel ||= new Map(); this.sel.clear(); [].concat(v || []).forEach((x) => { const o = this.options.find((y) => y.value === x); if (o) this.sel.set(x, o); }); if (this.box) { this.renderChips(); this.filter(); } }
  async filter() {
    const q = this.input.value.trim().toLowerCase();
    let opts = this.options;
    if (this.source) { try { opts = this._remote = await this.source(q); } catch { opts = []; } } else if (q) opts = opts.filter((o) => o.label.toLowerCase().includes(q));
    this.shown = opts; this.active = opts.length ? 0 : -1;
    this.list.replaceChildren(...(opts.length ? opts.map((o, i) => h('div', { class: 'msel__opt', role: 'option', id: `${this.listId}-${i}`, 'aria-selected': String(this.sel.has(o.value)), 'data-active': i === this.active ? '' : null, onPointerdown: (e) => { e.preventDefault(); this.pick(o); } },
      this.multiple ? h('input', { type: 'checkbox', tabindex: -1, checked: this.sel.has(o.value), 'aria-hidden': 'true' }) : null, h('span', { class: 'grow' }, o.label), o.hint ? h('small', { class: 'text-muted' }, o.hint) : null, !this.multiple && this.sel.has(o.value) ? icon('check', { size: 16 }) : null)) : [h('div', { class: 'msel__empty' }, 'No matches')]));
  }
  openList() { this.list.hidden = false; this.input.setAttribute('aria-expanded', 'true'); }
  closeList() { this.list.hidden = true; this.input.setAttribute('aria-expanded', 'false'); if (!this.multiple) this.input.value = ''; }
  pick(o) {
    if (this.multiple) { this.sel.has(o.value) ? this.sel.delete(o.value) : this.sel.set(o.value, o); this.input.value = ''; this.input.focus(); }
    else { this.sel.clear(); this.sel.set(o.value, o); this.closeList(); }
    this.renderChips(); this.filter(); this.emit();
  }
  emit() { this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { value: this.value } })); }
  renderChips() {
    const name = this.getAttribute('name');
    this.hidden.replaceChildren(...(name ? [...this.sel.keys()].map((v) => h('input', { type: 'hidden', name, value: v })) : []));
    if (this.multiple) this.chips.replaceChildren(...[...this.sel.values()].map((o) => h('span', { class: 'tag' }, o.label, h('button', { type: 'button', 'aria-label': `Remove ${o.label}`, onClick: (e) => { e.stopPropagation(); this.sel.delete(o.value); this.renderChips(); this.filter(); this.emit(); } }, icon('x', { size: 12 })))));
    else { const o = [...this.sel.values()][0]; this.chips.replaceChildren(o ? h('span', { class: 'fw-500' }, o.label) : ''); this.input.placeholder = o ? '' : (this.getAttribute('placeholder') || 'Search…'); }
  }
  keys(e) {
    const n = this.shown?.length || 0;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); this.openList(); this.active = (this.active + (e.key === 'ArrowDown' ? 1 : -1) + n) % (n || 1); this.list.querySelectorAll('.msel__opt').forEach((el, i) => { i === this.active ? el.setAttribute('data-active', '') : el.removeAttribute('data-active'); if (i === this.active) { el.scrollIntoView({ block: 'nearest' }); this.input.setAttribute('aria-activedescendant', el.id); } }); }
    else if (e.key === 'Enter') { e.preventDefault(); if (this.shown?.[this.active]) this.pick(this.shown[this.active]); }
    else if (e.key === 'Escape') this.closeList();
    else if (e.key === 'Backspace' && !this.input.value && this.multiple && this.sel.size) { this.sel.delete([...this.sel.keys()].at(-1)); this.renderChips(); this.filter(); this.emit(); }
  }
}
customElements.define('eh-multi-select', class extends EhChoice {});
customElements.define('eh-combobox', class extends EhChoice {});
