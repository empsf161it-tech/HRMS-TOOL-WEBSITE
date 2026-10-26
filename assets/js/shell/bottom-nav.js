/* Purpose: mobile bottom navigation bar (Home, Attendance, Leave, Payslip, More). */
import { h, icon } from '../core/dom.js';
import { t } from '../core/i18n.js';

/**
 * Create mobile bottom navigation bar.
 * @param {{onOpenMore: () => void}} o
 * @returns {{el: HTMLElement, setActive: (path: string) => void}}
 */
export function createBottomNav({ onOpenMore }) {
  const el = h('nav', { class: 'bottom-nav show-mobile', 'aria-label': 'Mobile navigation' });

  const tabs = [
    { label: t('nav.home') || 'Home', icon: 'layout-dashboard', href: '#/home', path: '/home' },
    { label: t('nav.attendance') || 'Attendance', icon: 'clock', href: '#/attendance', path: '/attendance' },
    { label: t('nav.leave') || 'Leave', icon: 'calendar-days', href: '#/leave', path: '/leave' },
    { label: t('nav.payslip') || 'Payslip', icon: 'wallet', href: '#/payroll', path: '/payroll' },
  ];

  const links = tabs.map((tab) => h('a', {
    href: tab.href,
    'data-path': tab.path,
  },
    icon(tab.icon, { size: 20 }),
    h('span', null, tab.label)));

  const moreBtn = h('button', {
    type: 'button',
    'aria-label': t('nav.more') || 'More menu',
    onClick: onOpenMore,
  },
    icon('menu', { size: 20 }),
    h('span', null, t('nav.more') || 'More'));

  el.append(...links, moreBtn);

  function setActive(path = location.hash.slice(1) || '/home') {
    links.forEach((a) => {
      const p = a.dataset.path;
      if (path.startsWith(p)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  setActive();

  return { el, setActive };
}
