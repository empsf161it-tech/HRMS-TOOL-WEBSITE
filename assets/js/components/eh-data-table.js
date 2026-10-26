/* Purpose: <eh-data-table> - search, column filters, sort, pagination, column manager, sticky header/first column, selection + bulk actions, inline edit, expandable rows, saved views, export, print; stacked cards under 768px. */
import { h, icon } from '../core/dom.js';
import { debounce } from '../core/utils/debounce.js';
import { button } from './eh-button.js';
import { emptyState, errorState } from './feedback.js';
import { columnManager, savedViews, exportMenu } from './table-tools.js';
import { toast, toastError } from './ui.js';
import './eh-nav.js';

class EhDataTable extends HTMLElement {
  /**
   * Configure with properties: `.columns`, `.loader`, `.options`.
   * columns: [{key,label,sortable,filter:'text'|'select',options,render(row)→Node|string,value(row),align,editable,hidden,sticky,noExport}]
   * loader: async ({search,filters,sort,page,pageSize,signal}) → {data,total}
   * options: {selectable, expandable(row)→Node, bulkActions:[{label,icon,variant,onClick(rows)}], rowActions:[{label,icon,onClick(row)}], onRowClick(row), onEdit(row,key,value), pageSize, viewKey, exportName, emptyTitle, emptyText, stickyFirst}
   */
  connectedCallback() {
    if (this.root) return;
    this.opts ||= {}; this.columns ||= [];
    this.q = { search: '', filters: {}, sort: null, page: 1, pageSize: this.opts.pageSize || 10 };
    this.selected = new Map(); this.expanded = new Set(); this.hiddenCols = new Set(this.columns.filter((c) => c.hidden).map((c) => c.key)); this.order = this.columns.map((c) => c.key);
    this.rows = []; this.total = 0; this.build(); this.reload();
  }
  configure({ columns, loader, options }) { this.columns = columns; this.loader = loader; this.opts = options || {}; if (this.root) { this.order = columns.map((c) => c.key); this.draw(); this.reload(); } else { this.opts.pageSize ||= 10; } }
  visibleColumns() { return this.order.map((k) => this.columns.find((c) => c.key === k)).filter((c) => c && !this.hiddenCols.has(c.key)); }
  build() {
    const search = h('input', { type: 'search', class: 'input', placeholder: 'Search…', 'aria-label': 'Search table', value: '', onInput: debounce((e) => { this.q.search = e.target.value; this.q.page = 1; this.reload(); }, 250) });
    const mkBtn = (label, ic, cls = '') => { const b = button(label, { variant: 'outline', size: 'sm', icon: ic }); if (cls) b.classList.add(cls); return b; };
    const views = mkBtn('Views', 'bookmark', 'hide-mobile'), cols = mkBtn('Columns', 'columns-3', 'hide-mobile'), exp = mkBtn('Export', 'download'), prt = button('', { variant: 'outline', size: 'sm', icon: 'printer', title: 'Print', onClick: () => window.print() });
    const filterBtn = mkBtn('Filters', 'list-filter'); filterBtn.setAttribute('aria-pressed', 'false');
    filterBtn.addEventListener('click', () => { const on = this.root.classList.toggle('dt--filters'); filterBtn.setAttribute('aria-pressed', String(on)); });
    this.bar = h('div', { class: 'dt__bar hide-print' }, h('div', { class: 'dt__search' }, icon('search', { size: 16 }), search), this.columns.some((c) => c.filter) ? filterBtn : null, h('span', { class: 'grow' }), views, cols, exp, prt);
    columnManager(this, cols); savedViews(this, views); exportMenu(this, exp);
    this.bulk = h('div', { class: 'dt__bulk hide-print', role: 'region', 'aria-label': 'Bulk actions', hidden: true });
    this.table = h('table', { class: `table${this.opts.stickyFirst ? ' table--sticky-first' : ''}${this.opts.selectable ? ' table--selectable' : ''}` });
    this.wrap = h('div', { class: 'table-wrap', tabindex: 0, role: 'region', 'aria-label': this.opts.label || 'Data table' }, this.table);
    this.pager = h('eh-pagination', { class: 'hide-print' });
    this.pager.addEventListener('eh-page', (e) => { this.q.page = e.detail.page; this.reload(); });
    this.pager.addEventListener('eh-page-size', (e) => { this.q.pageSize = e.detail.pageSize; this.q.page = 1; this.reload(); });
    this.live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
    this.root = h('div', { class: 'dt card' }, this.bar, this.bulk, this.wrap, h('div', { class: 'dt__foot' }, this.pager), this.live);
    this.replaceChildren(this.root);
  }
  viewState() { return { search: this.q.search, filters: this.q.filters, sort: this.q.sort, hidden: [...this.hiddenCols], order: this.order }; }
  applyView(s) { this.q = { ...this.q, search: s.search || '', filters: s.filters || {}, sort: s.sort || null, page: 1 }; this.hiddenCols = new Set(s.hidden || []); this.order = s.order || this.order; this.bar.querySelector('input[type=search]').value = this.q.search; this.draw(); this.reload(); toast({ type: 'info', message: 'View applied' }); }
  async fetchAll() { return this.loader({ ...this.q, page: 1, pageSize: Infinity }); }
  /** Re-run the loader with the current query. */
  async reload() {
    this.ctl?.abort(); this.ctl = new AbortController(); const signal = this.ctl.signal;
    this.loading = true; this.error = null; this.draw();
    try {
      const res = await this.loader({ ...this.q, signal }); if (signal.aborted) return;
      this.rows = res.data; this.total = res.total; this.loading = false; this.live.textContent = `${res.total} results`;
    } catch (e) { if (e.name === 'AbortError') return; this.loading = false; this.error = e; }
    this.draw();
  }
  draw() {
    const cols = this.visibleColumns(); const o = this.opts;
    const th = (c) => {
      const sorted = this.q.sort?.key === c.key ? this.q.sort.dir : null;
      return h('th', { scope: 'col', 'aria-sort': sorted ? (sorted === 'asc' ? 'ascending' : 'descending') : (c.sortable ? 'none' : null), class: c.align === 'end' ? 'is-end' : '' },
        c.sortable ? h('button', { type: 'button', class: 'th-sort', onClick: () => { this.q.sort = sorted === 'asc' ? { key: c.key, dir: 'desc' } : sorted === 'desc' ? null : { key: c.key, dir: 'asc' }; this.q.page = 1; this.reload(); } }, c.label, h('span', { class: `th-sort__arrow ${sorted ? `is-${sorted}` : ''}`, 'aria-hidden': 'true' }, icon('arrow-up', { size: 14 }))) : c.label);
    };
    const filterRow = h('tr', { class: 'dt__filters hide-print' }, o.selectable ? h('th') : null, o.expandable ? h('th') : null, ...cols.map((c) => h('th', null, c.filter === 'select'
      ? h('select', { class: 'input', 'aria-label': `Filter ${c.label}`, onChange: (e) => { this.setFilter(c.key, e.target.value); } }, h('option', { value: '' }, 'All'), ...(c.options || []).map((x) => h('option', { value: x.value ?? x, selected: this.q.filters[c.key] === (x.value ?? x) }, x.label ?? x)))
      : c.filter === 'text' ? h('input', { class: 'input', type: 'search', placeholder: 'Filter…', 'aria-label': `Filter ${c.label}`, value: this.q.filters[c.key]?.contains || '', onInput: debounce((e) => this.setFilter(c.key, e.target.value ? { contains: e.target.value } : ''), 250) }) : null)), o.rowActions ? h('th') : null);
    const allOn = this.rows.length && this.rows.every((r) => this.selected.has(r.id)); const some = this.rows.some((r) => this.selected.has(r.id));
    const head = h('thead', null, h('tr', null,
      o.selectable ? h('th', { class: 'col-check', scope: 'col' }, h('input', { type: 'checkbox', 'aria-label': 'Select all rows on this page', '.checked': !!allOn, '.indeterminate': !allOn && some, onChange: (e) => { this.rows.forEach((r) => (e.target.checked ? this.selected.set(r.id, r) : this.selected.delete(r.id))); this.draw(); } })) : null,
      o.expandable ? h('th', { class: 'col-expand' }, h('span', { class: 'sr-only' }, 'Expand')) : null, ...cols.map(th), o.rowActions ? h('th', { class: 'col-actions' }, h('span', { class: 'sr-only' }, 'Actions')) : null), this.columns.some((c) => c.filter) ? filterRow : null);
    let body;
    if (this.loading) body = h('tbody', null, ...Array.from({ length: Math.min(this.q.pageSize, 8) }, () => h('tr', { class: 'dt__skel' }, h('td', { colSpan: cols.length + 3 }, h('div', { class: 'skeleton', style: { blockSize: '20px' } })))));
    else if (this.error) body = h('tbody', null, h('tr', null, h('td', { colSpan: cols.length + 3 }, errorState({ title: 'Could not load data', text: this.error.message, onRetry: () => this.reload() }))));
    else if (!this.rows.length) body = h('tbody', null, h('tr', null, h('td', { colSpan: cols.length + 3 }, emptyState({ title: o.emptyTitle || 'No records found', text: o.emptyText || (this.q.search || Object.keys(this.q.filters).length ? 'Try changing your search or filters.' : 'Records will appear here once added.') }))));
    else body = h('tbody', null, ...this.rows.flatMap((r) => this.row(r, cols)));
    this.table.replaceChildren(head, body);
    this.pager.state = { total: this.total, page: this.q.page, pageSize: this.q.pageSize };
    this.drawBulk();
  }
  setFilter(key, val) { if (val === '' || val == null) delete this.q.filters[key]; else this.q.filters[key] = val; this.q.page = 1; this.reload(); }
  row(r, cols) {
    const o = this.opts; const open = this.expanded.has(r.id);
    const tr = h('tr', { class: `${this.selected.has(r.id) ? 'is-selected' : ''}${o.onRowClick ? ' is-clickable' : ''}`, 'aria-selected': o.selectable ? String(this.selected.has(r.id)) : null, onClick: (e) => { if (o.onRowClick && !e.target.closest('button,a,input,select,textarea,.is-editing')) o.onRowClick(r, e); } },
      o.selectable ? h('td', { class: 'col-check' }, h('input', { type: 'checkbox', 'aria-label': `Select row ${r.name || r.id}`, checked: this.selected.has(r.id), onChange: (e) => { e.target.checked ? this.selected.set(r.id, r) : this.selected.delete(r.id); this.draw(); } })) : null,
      o.expandable ? h('td', { class: 'col-expand' }, h('button', { type: 'button', class: `btn btn--ghost btn--sm btn--icon exp ${open ? 'is-open' : ''}`, 'aria-expanded': String(open), 'aria-label': 'Toggle details', onClick: () => { open ? this.expanded.delete(r.id) : this.expanded.add(r.id); this.draw(); } }, icon('chevron-right', { size: 16 }))) : null,
      ...cols.map((c) => {
        const td = h('td', { 'data-label': c.label, class: c.align === 'end' ? 'is-end' : '' });
        const v = c.render ? c.render(r) : (r[c.key] ?? '—'); td.append(v instanceof Node ? v : document.createTextNode(String(v)));
        if (c.editable && o.onEdit) td.addEventListener('dblclick', () => this.edit(td, r, c));
        if (c.editable && o.onEdit) td.title = 'Double-click to edit';
        return td;
      }),
      o.rowActions ? h('td', { class: 'col-actions' }, h('div', { class: 'cluster', style: { '--gap': '0', justifyContent: 'flex-end' } }, ...o.rowActions.map((a) => h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': `${a.label}: ${r.name || r.id}`, 'data-tooltip': a.label, onClick: () => a.onClick(r) }, icon(a.icon, { size: 16 }))))) : null);
    const out = [tr];
    if (o.expandable && open) out.push(h('tr', { class: 'dt__expanded' }, h('td', { colSpan: cols.length + 3 }, o.expandable(r))));
    return out;
  }
  edit(td, r, c) {
    const inp = h('input', { class: 'input', value: r[c.key] ?? '', 'aria-label': `Edit ${c.label}` }); td.classList.add('is-editing'); td.replaceChildren(inp); inp.focus(); inp.select();
    const done = async (save) => {
      td.classList.remove('is-editing');
      if (save && inp.value !== String(r[c.key] ?? '')) { try { await this.opts.onEdit(r, c.key, inp.value); r[c.key] = inp.value; toast({ type: 'success', message: `${c.label} updated` }); } catch (e) { toastError(e.message); } }
      this.draw();
    };
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); }); inp.addEventListener('blur', () => done(true));
  }
  drawBulk() {
    const n = this.selected.size; this.bulk.hidden = !n; if (!n) return;
    this.bulk.replaceChildren(h('strong', null, `${n} selected`), ...(this.opts.bulkActions || []).map((a) => button(a.label, { variant: a.variant || 'outline', size: 'sm', icon: a.icon, onClick: async () => { await a.onClick([...this.selected.values()]); this.selected.clear(); this.reload(); } })), button('Clear', { variant: 'ghost', size: 'sm', onClick: () => { this.selected.clear(); this.draw(); } }));
  }
}
customElements.define('eh-data-table', EhDataTable);

/** Convenience: create and configure a data table element. */
export function dataTable({ columns, loader, options }) { const t = document.createElement('eh-data-table'); t.columns = columns; t.loader = loader; t.opts = options || {}; return t; }
