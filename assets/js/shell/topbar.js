/* Purpose: topbar - company/branch switcher, global search trigger (Ctrl+K), quick-add button, notifications, theme toggle, language switcher and role switch menu. */
import { h, icon } from '../core/dom.js';
import { appStore } from '../core/store.js';
import { bus } from '../core/events.js';
import { t, setLang, getLang } from '../core/i18n.js';
import { toggleTheme, resolveTheme } from '../core/theme-engine.js';
import { ROLES } from '../core/permissions.js';
import { switchRole, logout } from '../core/auth.js';
import { api } from '../services/api.js';
import { createMenu } from '../components/menu.js';
import { avatar } from '../components/display.js';
import { createNotifications } from './notifications.js';
import { openPalette } from './palette.js';
import { quickActions } from './nav-model.js';
import { router } from '../core/router.js';

/**
 * Build the topbar header.
 * @param {{onOpenSidebar: () => void}} o
 * @returns {{el: HTMLElement, rebuild: () => void}}
 */
export function createTopbar({ onOpenSidebar }) {
  const el = h('header', { class: 'app__header topbar', 'aria-label': 'Top bar' });

  // Mobile menu button
  const menuBtn = h('button', {
    class: 'btn btn--ghost btn--icon show-mobile',
    type: 'button',
    'aria-label': 'Open navigation menu',
    onClick: onOpenSidebar,
  }, icon('menu', { size: 20 }));

  // Tenant / branch switcher
  const companySelect = h('select', {
    class: 'select-lite',
    'aria-label': t('top.company'),
    onChange: (e) => {
      appStore.companyId = e.target.value;
      appStore.branchId = 'all';
      updateBranches();
      bus.emit('context-change');
    },
  });

  const branchSelect = h('select', {
    class: 'select-lite',
    'aria-label': t('top.branch'),
    onChange: (e) => {
      appStore.branchId = e.target.value;
      bus.emit('context-change');
    },
  });

  const switcher = h('div', { class: 'topbar__switch hide-mobile' }, companySelect, branchSelect);

  // Global search trigger
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const searchBtn = h('button', {
    class: 'topbar__search',
    type: 'button',
    'aria-label': 'Search employees, clients, projects, timesheets, invoices...',
    onClick: () => openPalette(),
  },
    icon('search', { size: 16 }),
    h('span', null, 'Search employees, clients, projects, timesheets, invoices...'),
    h('kbd', { class: 'hide-mobile' }, isMac ? '⌘K' : 'Ctrl K'));

  // Quick-add menu button
  const quickBtn = h('button', {
    class: 'btn btn--ghost btn--icon',
    type: 'button',
    'aria-label': t('top.quickAdd'),
    'data-tooltip': t('top.quickAdd'),
  }, icon('plus', { size: 20 }));

  let quickMenu;
  function updateQuickMenu() {
    const actions = quickActions();
    const items = actions.map((a) => ({
      label: a.label,
      icon: a.icon,
      onClick: () => router.navigate(a.href),
    }));
    if (quickMenu) quickMenu.update(items);
    else quickMenu = createMenu(quickBtn, items, { placement: 'bottom-start' });
    quickBtn.hidden = !actions.length;
  }

  // Notifications
  const notifs = createNotifications();

  // Theme toggle
  const themeBtn = h('button', {
    class: 'btn btn--ghost btn--icon',
    type: 'button',
    'aria-label': t('top.theme'),
    'data-tooltip': t('top.theme'),
    onClick: (e) => toggleTheme(e),
  }, icon(resolveTheme() === 'dark' ? 'sun' : 'moon', { size: 20 }));

  bus.on('theme-change', () => {
    const ic = themeBtn.querySelector('eh-icon');
    if (ic) ic.setAttribute('name', resolveTheme() === 'dark' ? 'sun' : 'moon');
  });

  // Language switcher
  const langBtn = h('button', {
    class: 'btn btn--ghost btn--icon',
    type: 'button',
    'aria-label': t('top.language'),
    'data-tooltip': t('top.language'),
  }, icon('globe', { size: 20 }));

  const langMenu = createMenu(langBtn, [
    { label: 'English', checked: getLang() === 'en', onClick: () => setLang('en') },
    { label: 'हिन्दी (Hindi)', checked: getLang() === 'hi', onClick: () => setLang('hi') },
    { label: 'தமிழ் (Tamil)', checked: getLang() === 'ta', onClick: () => setLang('ta') },
  ], { placement: 'bottom-end' });

  bus.on('lang-change', () => {
    langMenu.update([
      { label: 'English', checked: getLang() === 'en', onClick: () => setLang('en') },
      { label: 'हिन्दी (Hindi)', checked: getLang() === 'hi', onClick: () => setLang('hi') },
      { label: 'தமிழ் (Tamil)', checked: getLang() === 'ta', onClick: () => setLang('ta') },
    ]);
  });

  // Help button & modal
  const helpBtn = h('button', {
    class: 'btn btn--ghost btn--icon',
    type: 'button',
    'aria-label': 'Help and keyboard shortcuts',
    'data-tooltip': 'Help & Support',
    onClick: () => {
      openHelpModal();
    },
  }, icon('help-circle', { size: 20 }));

  function openHelpModal() {
    import('../components/ui.js').then(({ openModal }) => {
      openModal({
        title: 'Help & Quick Reference',
        size: 'md',
        body: h('div', { class: 'stack gap-4' },
          h('p', { class: 'text-sm text-muted' }, 'Welcome to ELLOWRING Enterprise HRMS. Here are helpful shortcuts and navigation keys:'),
          h('div', { class: 'grid gap-2' },
            h('div', { class: 'split p-3', style: { background: 'var(--surface-2)', borderRadius: '10px' } },
              h('span', { class: 'fw-600 text-sm' }, 'Global Search & Command Palette'),
              h('kbd', { style: 'background:var(--surface);padding:3px 8px;border-radius:6px;border:1px solid var(--border);font-size:12px' }, 'Ctrl + K')
            ),
            h('div', { class: 'split p-3', style: { background: 'var(--surface-2)', borderRadius: '10px' } },
              h('span', { class: 'fw-600 text-sm' }, 'Toggle Theme'),
              h('span', { class: 'text-xs text-muted' }, 'Available in user profile menu')
            ),
            h('div', { class: 'split p-3', style: { background: 'var(--surface-2)', borderRadius: '10px' } },
              h('span', { class: 'fw-600 text-sm' }, 'Customer Support'),
              h('span', { class: 'text-xs text-muted' }, 'hello@ellowring.in · 1800-419-HRMS')
            )
          )
        )
      });
    });
  }

  // User profile / Role switch menu
  const userBtn = h('button', {
    class: 'user-chip',
    type: 'button',
    'aria-label': 'User account and demo role switcher',
  });

  let userMenu;
  function updateUserMenu() {
    const u = appStore.user;
    if (!u) {
      userBtn.replaceChildren(icon('user', { size: 20 }));
      return;
    }

    const userName = u.name || 'Vignesh Palanisamy';
    const userRole = u.role === 'super_admin' ? 'Admin' : (ROLES[u.role]?.label || u.role);
    const isVignesh = userName.toLowerCase().includes('vignesh') || u.role === 'super_admin';
    const avatarSrc = u.avatar || (isVignesh ? '../assets/images/vignesh.jpg' : null);

    const avatarEl = avatarSrc
      ? h('img', { src: avatarSrc, class: 'user-chip__avatar', alt: userName, width: 36, height: 36, style: 'width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid var(--border)' })
      : avatar(userName, { size: 'sm' });

    userBtn.replaceChildren(
      avatarEl,
      h('div', { class: 'user-chip__info hide-mobile', style: 'display:flex;flex-direction:column;text-align:left;line-height:1.25' },
        h('span', { class: 'user-chip__name fw-700 text-sm', style: 'color:var(--text)' }, userName),
        h('span', { class: 'user-chip__role text-xs text-muted' }, userRole),
      ),
      icon('chevron-down', { size: 14, style: 'color: var(--text-muted); margin-left: 2px;' }),
    );

    const roleItems = Object.entries(ROLES).map(([roleKey, roleDef]) => ({
      label: roleDef.label,
      icon: roleDef.icon || 'user',
      checked: u.role === roleKey,
      onClick: async () => {
        await switchRole(roleKey);
        router.refresh();
      },
    }));

    const items = [
      { heading: `${userName} (${userRole})` },
      { label: t('user.profile'), icon: 'user', onClick: () => router.navigate('/core-hr') },
      {
        label: resolveTheme() === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: resolveTheme() === 'dark' ? 'sun' : 'moon',
        onClick: (e) => toggleTheme(e),
      },
      {
        label: `Language (${getLang().toUpperCase()})`,
        icon: 'globe',
        children: [
          { label: 'English', checked: getLang() === 'en', onClick: () => setLang('en') },
          { label: 'हिन्दी (Hindi)', checked: getLang() === 'hi', onClick: () => setLang('hi') },
          { label: 'தமிழ் (Tamil)', checked: getLang() === 'ta', onClick: () => setLang('ta') },
        ],
      },
      { separator: true },
      { heading: t('user.switchRole') },
      ...roleItems,
      { separator: true },
      {
        label: t('user.signOut'),
        icon: 'log-out',
        danger: true,
        onClick: () => {
          logout();
          router.navigate('/login');
        },
      },
    ];

    if (userMenu) userMenu.update(items);
    else userMenu = createMenu(userBtn, items, { placement: 'bottom-end' });
  }

  // Populate company and branch options
  let allBranches = [];
  async function loadContextData() {
    try {
      const [comps, brs] = await Promise.all([
        api.list('companies', { pageSize: 'all', scope: false }),
        api.list('branches', { pageSize: 'all', scope: false }),
      ]);
      allBranches = brs.data;

      companySelect.replaceChildren(
        h('option', { value: 'all', selected: appStore.companyId === 'all' }, t('top.allCompanies') || 'All companies'),
        ...comps.data.map((c) => h('option', { value: c.id, selected: appStore.companyId === c.id }, c.short || c.name)),
      );

      updateBranches();
    } catch {
      // offline / mock fallback
    }
  }

  function updateBranches() {
    const filtered = appStore.companyId === 'all'
      ? allBranches
      : allBranches.filter((b) => b.companyId === appStore.companyId);

    branchSelect.replaceChildren(
      h('option', { value: 'all', selected: appStore.branchId === 'all' }, t('top.allBranches') || 'All branches'),
      ...filtered.map((b) => h('option', { value: b.id, selected: appStore.branchId === b.id }, `${b.city} (${b.name})`)),
    );
  }

  const brandLockup = h('div', { class: 'topbar__tagline-lockup hide-mobile' },
    h('span', { class: 'topbar__tagline-primary' }, 'One Ecosystem. Zero Gaps.'),
    h('span', { class: 'topbar__tagline-secondary' }, 'Total Business Automation.')
  );

  // Mobile-only compact search icon button
  const mobileSearchBtn = h('button', {
    class: 'btn btn--ghost btn--icon show-mobile',
    type: 'button',
    'aria-label': 'Search',
    onClick: () => openPalette(),
  }, icon('search', { size: 20 }));

  el.append(
    menuBtn,
    mobileSearchBtn,
    searchBtn,
    h('div', { class: 'topbar__spacer' }),
    notifs.button,
    helpBtn,
    userBtn,
    brandLockup,
  );

  loadContextData();
  updateQuickMenu();
  updateUserMenu();

  bus.on('role-change', () => {
    updateQuickMenu();
    updateUserMenu();
  });

  bus.on('login', () => {
    updateQuickMenu();
    updateUserMenu();
  });

  bus.on('logout', () => {
    updateQuickMenu();
    updateUserMenu();
  });

  return {
    el,
    rebuild() {
      searchBtn.querySelector('span').textContent = t('top.searchPlaceholder');
      updateQuickMenu();
      updateUserMenu();
      notifs.refresh();
    },
  };
}
