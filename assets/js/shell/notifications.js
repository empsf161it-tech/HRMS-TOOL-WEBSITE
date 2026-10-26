/* Purpose: notification center - bell with unread badge, popover list, mark read / mark all read, live updates from the bus (real-time simulation). */
import { h, icon } from '../core/dom.js';
import { appStore } from '../core/store.js';
import { bus } from '../core/events.js';
import { t } from '../core/i18n.js';
import { api } from '../services/api.js';
import { attachPopover } from '../components/menu.js';
import { button } from '../components/eh-button.js';
import { emptyState } from '../components/feedback.js';
import { relTime } from '../core/utils/format.js';

const TYPES = {
  approval: ['clipboard-check', '--color-primary'], attendance: ['clock', '--color-warning'], payroll: ['wallet', '--color-success'],
  device: ['scan-face', '--color-danger'], compliance: ['shield-check', '--color-info'], announcement: ['megaphone', '--color-accent'],
};

/**
 * Create the bell button and its notification panel.
 * @returns {{button: HTMLButtonElement, refresh: () => Promise<void>}}
 */
export function createNotifications() {
  const badge = h('span', { class: 'bell__badge', hidden: true, 'aria-hidden': 'true' });
  const bell = h('button', { class: 'btn btn--ghost btn--icon bell', type: 'button', 'aria-label': t('top.notifications'), 'data-tooltip': t('top.notifications') }, icon('bell', { size: 20 }), badge);
  const list = h('div', { class: 'notif__list', role: 'list' });
  const markAll = button(t('top.markAllRead'), { variant: 'ghost', size: 'sm', onClick: async () => { const rows = await load(); await Promise.all(rows.filter((r) => !r.read).map((r) => api.update('notifications', r.id, { read: true }, { audit: false }))); refresh(); } });
  const panel = h('div', { class: 'notif', role: 'dialog', 'aria-label': t('top.notifications') }, h('div', { class: 'notif__head' }, h('span', null, t('top.notifications')), markAll), list);
  document.body.append(panel);
  const pop = attachPopover(bell, panel, { placement: 'bottom-end', focusFirst: false });
  panel.addEventListener('eh-open', refresh);

  const load = async () => (await api.list('notifications', { pageSize: 30, sort: { key: 'at', dir: 'desc' }, scope: false })).data;

  async function refresh() {
    try {
      const rows = await load(); const unread = rows.filter((r) => !r.read).length;
      appStore.unread = unread; badge.textContent = unread > 9 ? '9+' : String(unread); badge.hidden = !unread;
      bell.setAttribute('aria-label', `${t('top.notifications')}${unread ? `, ${unread} unread` : ''}`);
      markAll.disabled = !unread;
      list.replaceChildren(...(rows.length ? rows.map(item) : [emptyState({ title: "You're all caught up", text: 'New alerts will appear here.', art: 'success' })]));
    } catch (e) { list.replaceChildren(h('p', { class: 'p-4 color-danger text-sm' }, e.message)); }
  }

  function item(n) {
    const [ic, tone] = TYPES[n.type] || ['bell', '--color-primary'];
    return h('button', { class: 'notif__item', type: 'button', role: 'listitem', 'data-unread': String(!n.read), onClick: async () => { if (!n.read) await api.update('notifications', n.id, { read: true }, { audit: false }); pop.close(); if (n.link) location.hash = n.link; refresh(); } },
      h('span', { class: 'notif__dot' }), h('span', { class: 'notif__icon', style: { '--_tone': `var(${tone})` } }, icon(ic, { size: 18 })),
      h('span', { class: 'grow' }, h('span', { class: 'notif__title', style: { display: 'block' } }, n.title), h('span', { class: 'notif__body', style: { display: 'block' } }, n.body), h('span', { class: 'notif__time' }, relTime(n.at))));
  }

  bus.on('notification', () => { bell.removeAttribute('data-ring'); void bell.offsetWidth; bell.setAttribute('data-ring', ''); refresh(); });
  bus.on('lang-change', () => { bell.setAttribute('aria-label', t('top.notifications')); });
  return { button: bell, refresh };
}
