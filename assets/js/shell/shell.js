/* Purpose: app shell - mounts layout grid, sidebar, topbar, mobile drawer, page header, router outlet, bottom nav and accessibility landmarks. */
import { h } from '../core/dom.js';
import { appStore } from '../core/store.js';
import { bus } from '../core/events.js';
import { createSidebar } from './sidebar.js';
import { createTopbar } from './topbar.js';
import { createBottomNav } from './bottom-nav.js';
import { createPageHead } from './page-head.js';

/**
 * Mount the full application shell into the container.
 * @param {HTMLElement} root container element (e.g. document.body)
 * @returns {{outlet: HTMLElement, announcer: HTMLElement, rebuild: () => void}}
 */
export function mountShell(root = document.body) {
  const app = h('div', { class: 'app', id: 'app' });
  const scrim = h('div', { class: 'app__scrim', 'aria-hidden': 'true', onClick: () => closeDrawer() });
  const skipLink = h('a', { href: '#view', class: 'skip-link' }, 'Skip to main content');
  const announcer = h('div', { id: 'announcer', class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });

  let isDrawerOpen = false;
  let isCollapsed = !!appStore.sidebarCollapsed;

  function setCollapsed(c) {
    isCollapsed = c;
    appStore.sidebarCollapsed = c;
    if (c) app.setAttribute('data-collapsed', '');
    else app.removeAttribute('data-collapsed');
    sidebar.setCollapsed(c);
  }

  function openDrawer() {
    isDrawerOpen = true;
    app.setAttribute('data-drawer-open', '');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    isDrawerOpen = false;
    app.removeAttribute('data-drawer-open');
    document.body.style.overflow = '';
  }

  // Auto-collapse on tablet (768 - 1023px)
  const tabletMq = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
  function checkTablet(mq) {
    if (mq.matches) {
      // Always collapse sidebar on tablet regardless of stored pref
      setCollapsed(true);
    }
  }
  tabletMq.addEventListener('change', checkTablet);

  const sidebar = createSidebar({
    onClose: closeDrawer,
    onToggleCollapse: () => setCollapsed(!isCollapsed),
  });

  const topbar = createTopbar({
    onOpenSidebar: openDrawer,
  });

  const pageHead = createPageHead();
  const outlet = h('main', { class: 'app__main', id: 'view', tabindex: '-1' }, pageHead, h('div', { id: 'router-outlet' }));

  const bottomNav = createBottomNav({
    onOpenMore: openDrawer,
  });

  if (isCollapsed) app.setAttribute('data-collapsed', '');
  checkTablet(tabletMq);

  app.append(sidebar.el, topbar.el, outlet, scrim, bottomNav.el);
  root.append(skipLink, app, announcer);
  // Signal that the app shell is active so body resets its pre-login flex styles
  document.body.classList.add('app-mounted');

  // Sync route changes
  bus.on('route-change', ({ path }) => {
    closeDrawer();
    sidebar.setActive(path);
    bottomNav.setActive(path);
  });

  // Role or session change rebuilds sidebar & topbar
  bus.on('role-change', () => {
    sidebar.rebuild();
    topbar.rebuild();
  });

  bus.on('login', () => {
    sidebar.rebuild();
    topbar.rebuild();
  });

  bus.on('logout', () => {
    sidebar.rebuild();
    topbar.rebuild();
  });

  // Lang change rebuilds menus
  bus.on('lang-change', () => {
    sidebar.rebuild();
    topbar.rebuild();
  });

  return {
    outlet: outlet.querySelector('#router-outlet'),
    announcer,
    rebuild() {
      sidebar.rebuild();
      topbar.rebuild();
    },
  };
}
