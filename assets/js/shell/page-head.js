/* Purpose: page header component - breadcrumbs, title and action buttons rendered dynamically from router 'page-header' events. */
import { h } from '../core/dom.js';
import { bus } from '../core/events.js';

/**
 * Create the reactive page header.
 * @returns {HTMLElement}
 */
export function createPageHead() {
  const crumbs = h('eh-breadcrumbs');
  const title = h('h1', { class: 'page-head__title' });
  const actionsWrap = h('div', { class: 'page-head__actions' });

  const el = h('div', { class: 'page-head' },
    h('div', { class: 'page-head__titles' }, crumbs, title),
    actionsWrap);

  bus.on('page-header', (header) => {
    // Module views render their own integrated dashboard header
    el.hidden = true;
    el.style.display = 'none';
  });

  return el;
}
