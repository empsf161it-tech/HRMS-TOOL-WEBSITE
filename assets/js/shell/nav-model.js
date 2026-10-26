/* Purpose: navigation model - the list of pages the current role can see (modules filtered by config, industry packs and permissions). Shared by the sidebar, bottom nav and command palette. */
import { MODULES, GROUPS } from '../modules/registry.js';
import { canModule, can } from '../core/permissions.js';
import { configStore } from '../core/config-store.js';
import { t } from '../core/i18n.js';

/**
 * Pages visible to the current role.
 * @returns {{id:string, moduleId:string, label:string, icon:string, group:string, href:string, tag?:string, summary:string}[]}
 */
export function navItems() {
  const cfg = configStore.config.modules || {};
  const labels = cfg.labels || {}; const enabled = cfg.enabled || {}; const industries = cfg.industries;
  let mods = MODULES.filter((m) => enabled[m.id] !== false
    && (m.always || canModule(m.id))
    && (!m.industry || !industries || industries.includes(m.id)));
  if (cfg.order?.length) mods = mods.toSorted((a, b) => (cfg.order.indexOf(a.id) + 1 || 999) - (cfg.order.indexOf(b.id) + 1 || 999) || a.no - b.no);
  return mods.flatMap((m) => {
    const label = labels[m.id] || m.label; const tag = !m.routes ? `Phase ${m.phase}` : undefined;
    if (m.children) return m.children.map((c) => ({ id: `${m.id}/${c.path}`, moduleId: m.id, label: c.label, icon: m.icon, group: m.group, href: `#/${m.id}/${c.path}`, summary: m.summary }));
    return [{ id: m.id, moduleId: m.id, label: m.id === 'home' ? t('nav.home') : label, icon: m.icon, group: m.group, href: `#/${m.id}`, tag, summary: m.summary }];
  });
}

/** Group visible pages in sidebar order: [[groupKey, i18nLabelKey, items[]]]. */
export function navGroups(items = navItems()) {
  return GROUPS.map(([key, labelKey]) => [key, labelKey, items.filter((i) => i.group === key)]).filter(([, , list]) => list.length);
}

/** Quick-add actions the current role may use. */
export function quickActions() {
  return [
    { label: 'Add employee', icon: 'user-plus', href: '#/core-hr/new', perm: 'core-hr.employee.create' },
    { label: 'Apply for leave', icon: 'calendar-plus', href: '#/leave/apply', perm: 'leave.request.create' },
    { label: 'Raise a ticket', icon: 'life-buoy', href: '#/helpdesk/new', perm: 'helpdesk.ticket.create' },
    { label: 'Post a job', icon: 'briefcase', href: '#/recruitment/jobs/new', perm: 'recruitment.requisition.create' },
    { label: 'New expense claim', icon: 'receipt', href: '#/expenses/new', perm: 'ess.claim.create' },
  ].filter((a) => can(a.perm));
}

/** Which nav item id matches the current hash path (longest prefix wins). */
export function activeIdFor(path, items = navItems()) {
  const p = path.replace(/\/$/, '') || '/home';
  const hit = items.filter((i) => `${p}/`.startsWith(`${i.href.slice(1)}/`)).sort((a, b) => b.href.length - a.href.length)[0];
  return hit?.id;
}
