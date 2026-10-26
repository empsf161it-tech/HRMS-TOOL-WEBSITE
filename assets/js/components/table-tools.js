/* Purpose: data-table toolbar tools - column manager (show/hide/reorder), saved views, export (CSV/Excel/PDF) and print. Used by <eh-data-table>. */
import { h, icon } from '../core/dom.js';
import { createMenu } from './menu.js';
import { button } from './eh-button.js';
import { ls } from '../services/mock-db.js';
import { downloadCSV, downloadXLSX, downloadPDF } from '../core/utils/download.js';
import { toast, toastError, openModal } from './ui.js';

const plain = (c) => ({ key: c.key, label: c.label, value: c.value || ((r) => { const v = r[c.key]; return v == null ? '' : v; }) });

/** Column manager popover: toggle visibility and reorder. */
export function columnManager(table, trigger) {
  const m = createMenu(trigger, [], { label: 'Columns', focusFirst: false });
  const panel = m.panel; panel.setAttribute('role', 'group'); panel.style.padding = 'var(--space-3)';
  const draw = () => {
    panel.replaceChildren(h('div', { class: 'menu__heading' }, 'Show / hide and reorder'), ...table.order.map((key, i) => {
      const c = table.columns.find((x) => x.key === key);
      return h('div', { class: 'cluster', style: { justifyContent: 'space-between' } },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !table.hiddenCols.has(key), onChange: (e) => { e.target.checked ? table.hiddenCols.delete(key) : table.hiddenCols.add(key); table.draw(); } }), c.label),
        h('span', { class: 'cluster', style: { '--gap': '0' } },
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': `Move ${c.label} up`, disabled: i === 0, onClick: () => { [table.order[i - 1], table.order[i]] = [table.order[i], table.order[i - 1]]; draw(); table.draw(); } }, icon('arrow-up', { size: 14 })),
          h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': `Move ${c.label} down`, disabled: i === table.order.length - 1, onClick: () => { [table.order[i + 1], table.order[i]] = [table.order[i], table.order[i + 1]]; draw(); table.draw(); } }, icon('arrow-down', { size: 14 }))));
    }));
  };
  panel.addEventListener('eh-open', draw);
  return m;
}

/** Saved views menu (stored per table viewKey in localStorage). */
export function savedViews(table, trigger) {
  const key = `views.${table.opts.viewKey || 'default'}`;
  const m = createMenu(trigger, [], { label: 'Saved views' });
  const refresh = () => {
    const views = ls.get(key, []);
    m.update([{ heading: 'Saved views' }, ...(views.length ? views.map((v, i) => ({ label: v.name, icon: 'bookmark', onClick: () => table.applyView(v.state), hint: '' })) : [{ label: 'No saved views yet', disabled: true }]), { separator: true }, { label: 'Save current view…', icon: 'bookmark-plus', onClick: save }, ...(views.length ? [{ label: 'Delete all views', icon: 'trash-2', danger: true, onClick: () => { ls.remove(key); refresh(); toast({ type: 'info', message: 'Saved views cleared' }); } }] : [])]);
  };
  const save = () => {
    const name = h('eh-input', { label: 'View name', required: '' });
    const mod = openModal({ title: 'Save view', size: 'sm', body: name, footer: [button('Cancel', { variant: 'ghost', onClick: () => mod.close() }), button('Save', { variant: 'primary', onClick: () => { if (!name.validate()) return; ls.set(key, [...ls.get(key, []), { name: name.value, state: table.viewState() }]); mod.close(); refresh(); toast({ type: 'success', title: 'View saved', message: name.value }); } })] });
  };
  refresh(); return m;
}

/** Export menu: CSV, Excel, PDF over all rows matching the current query. */
export function exportMenu(table, trigger) {
  const run = async (fmt) => {
    try {
      const { data } = await table.fetchAll(); const cols = table.visibleColumns().filter((c) => !c.noExport).map(plain); const name = table.opts.exportName || 'export';
      if (fmt === 'csv') downloadCSV(data, cols, name); else if (fmt === 'xlsx') await downloadXLSX(data, cols, name); else await downloadPDF(data, cols, name, table.opts.exportTitle || name);
      toast({ type: 'success', title: 'Export ready', message: `${data.length} rows exported as ${fmt.toUpperCase()}` });
    } catch (e) { toastError(e.message, 'Export failed'); }
  };
  return createMenu(trigger, [{ heading: 'Export all matching rows' }, { label: 'CSV', icon: 'file-text', onClick: () => run('csv') }, { label: 'Excel (.xlsx)', icon: 'file-spreadsheet', onClick: () => run('xlsx') }, { label: 'PDF', icon: 'file-down', onClick: () => run('pdf') }], { placement: 'bottom-end', label: 'Export' });
}
