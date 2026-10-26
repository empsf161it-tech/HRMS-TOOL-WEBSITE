/* Purpose: command palette (Ctrl/Cmd+K) - fast search across pages, actions and employees with arrow-key navigation and instant execution. */
import { h, icon, uid } from '../core/dom.js';
import { api } from '../services/api.js';
import { navItems, quickActions } from './nav-model.js';
import { toggleTheme, resolveTheme } from '../core/theme-engine.js';
import { router } from '../core/router.js';
import { debounce } from '../core/utils/debounce.js';
import { t } from '../core/i18n.js';

let dialog, input, list, selectedIndex = 0, currentResults = [];

/**
 * Open the command palette.
 * @param {string} [initialQuery='']
 */
export function openPalette(initialQuery = '') {
  if (!dialog) initPalette();
  input.value = initialQuery;
  selectedIndex = 0;
  dialog.showModal();
  updateSearch(initialQuery);
  input.focus();
}

function initPalette() {
  dialog = h('dialog', { class: 'palette', 'aria-label': 'Command palette' });
  input = h('input', {
    type: 'search',
    placeholder: t('top.searchPlaceholder') || 'Search pages, people, actions…',
    autocomplete: 'off',
    spellcheck: 'false',
    'aria-autocomplete': 'list',
  });
  list = h('div', { class: 'palette__list', role: 'listbox', id: uid('pal-list') });
  input.setAttribute('aria-controls', list.id);

  const head = h('div', { class: 'palette__input' }, icon('search', { size: 18 }), input);
  const foot = h('div', { class: 'palette__foot' },
    h('span', null, h('kbd', null, '↑↓'), ' navigate'),
    h('span', null, h('kbd', null, '↵'), ' select'),
    h('span', null, h('kbd', null, 'esc'), ' close'));

  dialog.append(head, list, foot);
  document.body.append(dialog);

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const debouncedSearch = debounce((q) => updateSearch(q), 120);

  input.addEventListener('input', (e) => {
    selectedIndex = 0;
    debouncedSearch(e.target.value.trim());
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentResults.length) {
        selectedIndex = (selectedIndex + 1) % currentResults.length;
        renderItems();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentResults.length) {
        selectedIndex = (selectedIndex - 1 + currentResults.length) % currentResults.length;
        renderItems();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = currentResults[selectedIndex];
      if (item) execute(item);
    } else if (e.key === 'Escape') {
      dialog.close();
    }
  });

  // Global hotkey Ctrl+K / Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (dialog.open) dialog.close();
      else openPalette();
    }
  });
}

async function updateSearch(q) {
  const norm = q.toLowerCase();
  const pages = navItems();
  const matchedPages = pages
    .filter((p) => !norm || p.label.toLowerCase().includes(norm) || p.summary?.toLowerCase().includes(norm))
    .slice(0, 6)
    .map((p) => ({ type: 'page', title: p.label, subtitle: p.summary, icon: p.icon, run: () => router.navigate(p.href) }));

  const actions = [
    ...quickActions().map((a) => ({ type: 'action', title: a.label, subtitle: 'Quick action', icon: a.icon, run: () => router.navigate(a.href) })),
    {
      type: 'action',
      title: `Switch to ${resolveTheme() === 'dark' ? 'Light' : 'Dark'} theme`,
      subtitle: 'Appearance',
      icon: resolveTheme() === 'dark' ? 'sun' : 'moon',
      run: () => toggleTheme(),
    },
    {
      type: 'action',
      title: 'Sign out',
      subtitle: 'Session',
      icon: 'log-out',
      run: () => router.navigate('/login'),
    },
  ].filter((a) => !norm || a.title.toLowerCase().includes(norm));

  let matchedEmployees = [];
  if (norm.length >= 2) {
    try {
      const res = await api.list('employees', { search: norm, pageSize: 5, scope: false });
      matchedEmployees = res.data.map((emp) => ({
        type: 'employee',
        title: emp.name,
        subtitle: `${emp.designation} · ${emp.code}`,
        icon: 'user',
        run: () => router.navigate(`/core-hr?search=${encodeURIComponent(emp.code)}`),
      }));
    } catch {
      matchedEmployees = [];
    }
  }

  currentResults = [];
  if (matchedPages.length) currentResults.push({ group: 'Pages', items: matchedPages });
  if (actions.length) currentResults.push({ group: 'Actions', items: actions });
  if (matchedEmployees.length) currentResults.push({ group: 'People', items: matchedEmployees });

  // Flatten for index tracking
  const flat = [];
  currentResults.forEach((g) => g.items.forEach((it) => flat.push(it)));
  currentResults = flat;

  if (selectedIndex >= currentResults.length) selectedIndex = 0;
  renderItems();
}

function renderItems() {
  list.replaceChildren();
  if (!currentResults.length) {
    list.append(h('div', { class: 'p-4 text-center text-muted text-sm' }, 'No matching results found.'));
    return;
  }

  let lastGroup = null;
  currentResults.forEach((item, idx) => {
    if (item.type !== lastGroup) {
      lastGroup = item.type;
      const groupTitle = { page: 'Pages', action: 'Actions', employee: 'People' }[item.type] || 'Items';
      list.append(h('div', { class: 'palette__group' }, groupTitle));
    }

    const btn = h('button', {
      class: 'palette__item',
      type: 'button',
      role: 'option',
      'aria-selected': String(idx === selectedIndex),
      onClick: () => execute(item),
    },
      icon(item.icon, { size: 18 }),
      h('div', { class: 'grow truncate' },
        h('div', { class: 'fw-600 text-sm truncate' }, item.title),
        item.subtitle ? h('small', { class: 'text-xs text-muted truncate' }, item.subtitle) : null),
      h('span', { class: 'text-xs text-muted' }, icon('corner-down-left', { size: 14 })));

    if (idx === selectedIndex) {
      requestAnimationFrame(() => btn.scrollIntoView({ block: 'nearest' }));
    }
    list.append(btn);
  });
}

function execute(item) {
  dialog.close();
  item.run?.();
}
