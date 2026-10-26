/* Purpose: popover-based menus and tooltips (native Popover API with feature-detected fallback), arrow-key navigation, viewport-aware placement. */
import { h, icon, uid } from '../core/dom.js';

const SUPPORTS = typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;

function place(trigger, panel, placement = 'bottom-start', offset = 6) {
  const r = trigger.getBoundingClientRect();
  panel.style.position = 'fixed'; panel.style.inset = 'auto'; panel.style.margin = '0';
  panel.style.left = '0px'; panel.style.top = '0px';
  const p = panel.getBoundingClientRect();
  const rtl = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
  let left = placement.endsWith('end') !== rtl ? r.right - p.width : r.left;
  let top = placement.startsWith('top') ? r.top - p.height - offset : r.bottom + offset;
  if (placement.startsWith('right')) { left = r.right + offset; top = r.top; }
  if (top + p.height > innerHeight - 8 && r.top - p.height - offset > 8) top = r.top - p.height - offset;
  left = Math.max(8, Math.min(left, innerWidth - p.width - 8)); top = Math.max(8, top);
  panel.style.left = `${left}px`; panel.style.top = `${top}px`;
}

/**
 * Wire a trigger to a popover panel (menus, dropdowns, notification center).
 * @returns {{open:Function, close:Function, toggle:Function}}
 */
export function attachPopover(trigger, panel, { placement = 'bottom-start', focusFirst = true } = {}) {
  panel.id ||= uid('pop');
  panel.classList.add('popover-panel');
  trigger.setAttribute('aria-haspopup', panel.getAttribute('role') === 'menu' ? 'menu' : 'true');
  trigger.setAttribute('aria-expanded', 'false'); trigger.setAttribute('aria-controls', panel.id);
  let isOpen = false;
  const open = () => { if (isOpen) return; place(trigger, panel, placement); SUPPORTS ? panel.showPopover() : (panel.hidden = false); isOpen = true; trigger.setAttribute('aria-expanded', 'true'); place(trigger, panel, placement); panel.dispatchEvent(new CustomEvent('eh-open')); if (focusFirst) panel.querySelector('[role^="menuitem"],button,a,input')?.focus({ preventScroll: true }); };
  const close = () => { if (!isOpen) return; SUPPORTS ? panel.hidePopover() : (panel.hidden = true); isOpen = false; trigger.setAttribute('aria-expanded', 'false'); };
  if (SUPPORTS) {
    panel.setAttribute('popover', 'auto');
    panel.addEventListener('toggle', (e) => { isOpen = e.newState === 'open'; trigger.setAttribute('aria-expanded', String(isOpen)); if (!isOpen) trigger.focus({ preventScroll: true }); });
  } else {
    panel.hidden = true;
    document.addEventListener('pointerdown', (e) => { if (isOpen && !panel.contains(e.target) && !trigger.contains(e.target)) close(); });
    panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { close(); trigger.focus(); } });
  }
  trigger.addEventListener('click', (e) => { e.stopPropagation(); isOpen ? close() : open(); });
  addEventListener('resize', () => isOpen && place(trigger, panel, placement));
  panel.addEventListener('keydown', menuKeys);
  return { open, close, toggle: () => (isOpen ? close() : open()), get isOpen() { return isOpen; } };
}

/** Arrow-key / Home / End navigation for role=menu panels. */
function menuKeys(e) {
  const panel = e.currentTarget; if (panel.getAttribute('role') !== 'menu') return;
  const items = [...panel.querySelectorAll('[role^="menuitem"]:not([disabled])')];
  const i = items.indexOf(document.activeElement);
  const go = { ArrowDown: (i + 1) % items.length, ArrowUp: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[e.key];
  if (go !== undefined) { e.preventDefault(); items[go]?.focus(); }
}

/**
 * Build a dropdown menu from items and attach it to a trigger.
 * Items: {label, icon, onClick, danger, checked, disabled, href, separator, heading}
 */
export function createMenu(trigger, items, opts = {}) {
  const panel = h('div', { role: 'menu', class: 'menu', 'aria-label': opts.label || 'Menu' });
  const ctl = attachPopover(trigger, panel, opts);
  const render = (list) => {
    panel.replaceChildren(...list.map((it) => {
      if (it.separator) return h('hr', { class: 'menu__sep', role: 'separator' });
      if (it.heading) return h('div', { class: 'menu__heading', role: 'presentation' }, it.heading);
      const tag = it.href ? 'a' : 'button';
      return h(tag, {
        role: it.checked !== undefined ? 'menuitemradio' : 'menuitem', 'aria-checked': it.checked !== undefined ? String(!!it.checked) : null,
        class: `menu__item${it.danger ? ' menu__item--danger' : ''}`, href: it.href, type: it.href ? null : 'button', disabled: it.disabled, tabindex: -1,
        onClick: (e) => { ctl.close(); it.onClick?.(e); },
      }, it.icon ? icon(it.icon, { size: 16 }) : h('span', { class: 'menu__icon-gap' }), h('span', { class: 'grow truncate' }, it.label), it.checked ? icon('check', { size: 16, cls: 'menu__check' }) : null, it.hint ? h('kbd', null, it.hint) : null);
    }));
  };
  render(items);
  document.body.append(panel);
  return { ...ctl, panel, update: render };
}

/* ---------- tooltips: one shared popover for every [data-tooltip] element ---------- */
let tip, tipTimer;
/** Initialise delegated tooltips (hover + keyboard focus, Esc to dismiss). */
export function initTooltips() {
  tip = h('div', { class: 'tooltip', role: 'tooltip', id: 'eh-tooltip' });
  if (SUPPORTS) tip.setAttribute('popover', 'manual'); else tip.hidden = true;
  document.body.append(tip);
  const show = (el) => {
    clearTimeout(tipTimer);
    tipTimer = setTimeout(() => {
      tip.textContent = el.dataset.tooltip; el.setAttribute('aria-describedby', 'eh-tooltip');
      SUPPORTS ? tip.showPopover() : (tip.hidden = false);
      place(el, tip, 'top-start', 8);
      const r = el.getBoundingClientRect(); const tw = tip.getBoundingClientRect().width;
      tip.style.left = `${Math.max(8, Math.min(r.left + r.width / 2 - tw / 2, innerWidth - tw - 8))}px`;
    }, 350);
  };
  const hide = (el) => { clearTimeout(tipTimer); el?.removeAttribute?.('aria-describedby'); try { SUPPORTS ? tip.hidePopover() : (tip.hidden = true); } catch { /* not open */ } };
  document.addEventListener('pointerover', (e) => { const el = e.target.closest?.('[data-tooltip]'); if (el) show(el); });
  document.addEventListener('pointerout', (e) => { const el = e.target.closest?.('[data-tooltip]'); if (el) hide(el); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest?.('[data-tooltip]'); if (el && e.target.matches(':focus-visible')) show(el); });
  document.addEventListener('focusout', (e) => hide(e.target.closest?.('[data-tooltip]')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
