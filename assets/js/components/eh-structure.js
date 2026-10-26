/* Purpose: structure components - <eh-tree>, <eh-org-chart> (zoom/pan/collapse), <eh-kanban> (SortableJS), <eh-diff> (before/after). */
import { h, icon } from '../core/dom.js';
import { loadLib } from '../core/loader.js';
import { avatar } from './display.js';
import { button } from './eh-button.js';

class EhTree extends HTMLElement {
  /** Set `.data = [{id,label,icon?,children?}]`. Fires eh-select {node}. Keyboard: arrows, Enter, Left/Right to collapse/expand. */
  set data(v) { this._d = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const node = (n, lvl) => {
      const has = n.children?.length;
      const li = h('li', { role: 'treeitem', 'aria-expanded': has ? 'true' : null, 'aria-level': lvl, 'aria-selected': 'false' },
        h('div', { class: 'tree__row', tabindex: -1, onClick: () => { if (has) li.setAttribute('aria-expanded', li.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'); this.select(li, n); } },
          has ? icon('chevron-right', { size: 14, cls: 'tree__tw' }) : h('span', { style: { inlineSize: '14px' } }), n.icon ? icon(n.icon, { size: 16 }) : null, h('span', { class: 'grow truncate' }, n.label), n.badge ? h('span', { class: 'badge' }, n.badge) : null),
        has ? h('ul', { role: 'group' }, ...n.children.map((c) => node(c, lvl + 1))) : null);
      return li;
    };
    this.ul = h('ul', { class: 'tree', role: 'tree', 'aria-label': this.getAttribute('label') || 'Tree' }, ...(this._d || []).map((n) => node(n, 1)));
    this.ul.querySelector('.tree__row')?.setAttribute('tabindex', '0');
    this.ul.addEventListener('keydown', (e) => {
      const rows = [...this.ul.querySelectorAll('.tree__row')].filter((r) => !r.closest('[aria-expanded="false"] > ul')); const i = rows.indexOf(document.activeElement); if (i < 0) return;
      const li = rows[i].parentElement;
      const go = (j) => { e.preventDefault(); rows.forEach((r) => r.setAttribute('tabindex', '-1')); rows[j]?.setAttribute('tabindex', '0'); rows[j]?.focus(); };
      if (e.key === 'ArrowDown') go(Math.min(rows.length - 1, i + 1)); else if (e.key === 'ArrowUp') go(Math.max(0, i - 1));
      else if (e.key === 'ArrowRight' && li.getAttribute('aria-expanded') === 'false') { e.preventDefault(); li.setAttribute('aria-expanded', 'true'); }
      else if (e.key === 'ArrowLeft' && li.getAttribute('aria-expanded') === 'true') { e.preventDefault(); li.setAttribute('aria-expanded', 'false'); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); rows[i].click(); }
    });
    this.replaceChildren(this.ul);
  }
  select(li, n) { this.ul.querySelectorAll('[aria-selected="true"]').forEach((x) => x.setAttribute('aria-selected', 'false')); li.setAttribute('aria-selected', 'true'); this.dispatchEvent(new CustomEvent('eh-select', { bubbles: true, detail: { node: n } })); }
}
customElements.define('eh-tree', EhTree);

class EhOrgChart extends HTMLElement {
  /** Set `.data = {id,name,title,avatar?,children?}` (single root). Drag to pan, ctrl+wheel or buttons to zoom, click chevron to collapse. Fires eh-select {node}. */
  set data(v) { this._d = v; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    if (!this._d) return;
    this.z = 1; this.pan = { x: 0, y: 0 };
    const node = (n) => {
      const kids = n.children?.length; const li = h('li');
      const box = h('div', { class: 'org__node' }, avatar(n.name, { size: 'sm', src: n.avatar }), h('div', { class: 'org__meta' }, h('strong', { class: 'text-sm' }, n.name), h('small', null, n.title)),
        kids ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm org__count', 'aria-expanded': 'true', 'aria-label': `Toggle ${n.children.length} reports of ${n.name}`, onPointerdown: (e) => e.stopPropagation(), onClick: (e) => { const ul = li.querySelector(':scope > ul'); const open = ul.hidden; ul.hidden = !open; e.currentTarget.setAttribute('aria-expanded', String(open)); e.currentTarget.firstChild.textContent = open ? n.children.length : `+${n.children.length}`; } }, h('span', null, n.children.length)) : null);
      box.addEventListener('click', (e) => { if (!e.target.closest('button') && !this.moved) this.dispatchEvent(new CustomEvent('eh-select', { bubbles: true, detail: { node: n } })); });
      li.append(box); if (kids) li.append(h('ul', null, ...n.children.map(node))); return li;
    };
    this.stage = h('div', { class: 'org__stage' }, h('ul', null, node(this._d)));
    const apply = () => { this.stage.style.transform = `translate(calc(-50% + ${this.pan.x}px), ${this.pan.y}px) scale(${this.z})`; };
    this.apply = apply; apply();
    const zoom = (d) => { this.z = Math.min(1.6, Math.max(0.4, +(this.z + d).toFixed(2))); apply(); };
    const tools = h('div', { class: 'org__tools' }, button('', { variant: 'outline', size: 'sm', icon: 'zoom-in', title: 'Zoom in', onClick: () => zoom(0.1) }), button('', { variant: 'outline', size: 'sm', icon: 'zoom-out', title: 'Zoom out', onClick: () => zoom(-0.1) }), button('', { variant: 'outline', size: 'sm', icon: 'maximize', title: 'Reset view', onClick: () => { this.z = 1; this.pan = { x: 0, y: 0 }; apply(); } }));
    const wrap = h('div', { class: 'org', role: 'group', 'aria-label': 'Organisation chart. Drag to pan.' }, tools, this.stage);
    let d = null; this.moved = false;
    wrap.addEventListener('pointerdown', (e) => { if (e.target.closest('.org__tools')) return; d = { x: e.clientX, y: e.clientY, p: { ...this.pan } }; this.moved = false; });
    wrap.addEventListener('pointermove', (e) => { if (!d) return; const dx = e.clientX - d.x, dy = e.clientY - d.y; if (Math.abs(dx) + Math.abs(dy) > 4) this.moved = true; this.pan = { x: d.p.x + dx, y: d.p.y + dy }; apply(); });
    addEventListener('pointerup', () => { d = null; setTimeout(() => { this.moved = false; }, 0); });
    wrap.addEventListener('wheel', (e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 0.08 : -0.08); } }, { passive: false });
    this.replaceChildren(wrap);
  }
}
customElements.define('eh-org-chart', EhOrgChart);

class EhKanban extends HTMLElement {
  /** `.columns=[{id,title,tone?}]`, `.cards=[{id,col,title,meta?,tags?[],avatar?}]`, optional `.renderCard(card)`. Fires eh-move {id,from,to}. Keyboard users get a "Move to" select on every card. */
  set columns(v) { this._cols = v; this.render(); } set cards(v) { this._cards = v; this.render(); }
  connectedCallback() { this.render(); }
  async render() {
    if (!this.isConnected || !this._cols || !this._cards) return;
    const cardEl = (c) => this.renderCard ? this.renderCard(c) : h('div', { class: 'kcard', 'data-id': c.id },
      h('div', { class: 'fw-600 text-sm' }, c.title), c.meta ? h('div', { class: 'text-xs text-muted' }, c.meta) : null,
      h('div', { class: 'split' }, h('div', { class: 'cluster', style: { '--gap': '4px' } }, ...(c.tags || []).map((t) => h('span', { class: 'tag' }, t))), c.avatar ? avatar(c.avatar, { size: 'sm' }) : null),
      h('select', { class: 'input hide-print', style: { minBlockSize: '30px', padding: '2px 6px', fontSize: 'var(--text-xs)' }, 'aria-label': `Move ${c.title} to column`, onChange: (e) => this.move(c.id, e.target.value) }, h('option', { value: '' }, 'Move to…'), ...this._cols.filter((x) => x.id !== c.col).map((x) => h('option', { value: x.id }, x.title))));
    this.lists = [];
    const cols = this._cols.map((col) => {
      const cards = h('div', { class: 'kanban__cards', 'data-col': col.id, role: 'list', 'aria-label': col.title }, ...this._cards.filter((c) => c.col === col.id).map((c) => { const el = cardEl(c); el.setAttribute('role', 'listitem'); el.dataset.id = c.id; return el; }));
      this.lists.push(cards);
      return h('section', { class: 'kanban__col', 'aria-label': col.title }, h('div', { class: 'kanban__head' }, h('span', null, col.title), h('span', { class: 'badge' }, String(this._cards.filter((c) => c.col === col.id).length))), cards);
    });
    this.replaceChildren(h('div', { class: 'kanban' }, ...cols));
    try {
      const Sortable = await loadLib('sortable');
      this.lists.forEach((el) => new Sortable(el, { group: 'kb', animation: 160, ghostClass: 'sortable-ghost', chosenClass: 'sortable-chosen', dragClass: 'sortable-drag', filter: 'select', preventOnFilter: false,
        onStart: () => this.querySelectorAll('.kanban__col').forEach((c) => c.classList.add('is-target-ok')),
        onEnd: (e) => { this.querySelectorAll('.kanban__col').forEach((c) => c.classList.remove('is-target')); const to = e.to.dataset.col, from = e.from.dataset.col; if (to !== from) { const c = this._cards.find((x) => x.id === e.item.dataset.id); c.col = to; this.dispatchEvent(new CustomEvent('eh-move', { bubbles: true, detail: { id: c.id, from, to } })); this.render(); } },
        onMove: (e) => { this.querySelectorAll('.kanban__col').forEach((c) => c.classList.remove('is-target')); e.to.closest('.kanban__col')?.classList.add('is-target'); } }));
    } catch { /* offline: select-based move still works */ }
  }
  move(id, to) { if (!to) return; const c = this._cards.find((x) => x.id === id); const from = c.col; c.col = to; this.dispatchEvent(new CustomEvent('eh-move', { bubbles: true, detail: { id, from, to } })); this.render(); }
}
customElements.define('eh-kanban', EhKanban);

class EhDiff extends HTMLElement {
  /** Set `.before` and `.after` objects; changed keys are highlighted, unchanged ones listed muted. Attribute: show-all. */
  set value({ before, after }) { this._b = before || {}; this._a = after || {}; if (this.isConnected) this.render(); }
  connectedCallback() { this.render(); }
  render() {
    const b = this._b || {}, a = this._a || {}; const keys = [...new Set([...Object.keys(b), ...Object.keys(a)])];
    const ch = keys.filter((k) => JSON.stringify(b[k]) !== JSON.stringify(a[k])); const list = this.hasAttribute('show-all') ? keys : ch;
    const fmt = (v) => (v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));
    this.replaceChildren(h('div', { class: 'diff', role: 'table', 'aria-label': 'Before and after comparison' }, h('div', { class: 'diff__h', role: 'columnheader' }, 'Before'), h('div', { class: 'diff__h', role: 'columnheader' }, 'After'),
      ...(list.length ? list.flatMap((k) => { const changed = ch.includes(k); return [h('div', { class: `diff__c${changed ? ' diff__c--del' : ''}`, role: 'cell' }, h('small', null, k), fmt(b[k])), h('div', { class: `diff__c${changed ? ' diff__c--add' : ''}`, role: 'cell' }, h('small', null, k), fmt(a[k]))]; }) : [h('div', { class: 'diff__c', style: { gridColumn: '1 / -1' } }, 'No differences')])));
  }
}
customElements.define('eh-diff', EhDiff);
