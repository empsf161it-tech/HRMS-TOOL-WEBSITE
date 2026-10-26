/* Purpose: UI services - toast, confirm dialog, modal and side drawer (native <dialog>), plus <eh-modal>. Every action should end with a toast. */
import { h, icon, uid } from '../core/dom.js';
import { button } from './eh-button.js';

/* ---------- toasts ---------- */
let region;
const TOAST_ICON = { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x' };

/**
 * Show a toast (top-right on desktop, bottom on mobile; swipe to dismiss).
 * @param {{type?:'info'|'success'|'warning'|'danger', title?:string, message?:string, duration?:number}} o
 * @returns {() => void} dismiss function
 */
export function toast({ type = 'info', title, message, duration = 4500 } = {}) {
  if (!region) { region = h('div', { class: 'toast-region', 'aria-live': 'polite', 'aria-atomic': 'false' }); document.body.append(region); }
  const el = h('div', { class: `toast toast--${type}`, role: type === 'danger' ? 'alert' : 'status' }, icon(TOAST_ICON[type], { size: 18 }),
    h('div', { class: 'grow' }, title ? h('div', { class: 'toast__title' }, title) : null, message ? h('div', { class: 'toast__msg' }, message) : null),
    h('button', { class: 'btn btn--ghost btn--sm btn--icon', type: 'button', 'aria-label': 'Dismiss', onClick: () => dismiss() }, icon('x', { size: 14 })));
  let timer; let gone = false;
  const dismiss = () => { if (gone) return; gone = true; clearTimeout(timer); el.classList.add('is-leaving'); setTimeout(() => el.remove(), 260); };
  let x0 = null;
  el.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; x0 = e.clientX; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', (e) => { if (x0 === null) return; const dx = e.clientX - x0; el.style.transform = `translateX(${dx}px)`; el.style.opacity = String(1 - Math.min(1, Math.abs(dx) / 200)); });
  el.addEventListener('pointerup', (e) => { if (x0 === null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 80) { el.style.setProperty('--swipe', `${dx * 2}px`); el.style.transform = ''; dismiss(); } else { el.style.transform = ''; el.style.opacity = ''; } });
  el.addEventListener('pointerenter', () => clearTimeout(timer));
  el.addEventListener('pointerleave', () => { if (duration) timer = setTimeout(dismiss, 1500); });
  region.append(el);
  if (duration) timer = setTimeout(dismiss, duration);
  return dismiss;
}
export const toastSuccess = (message, title = 'Done') => toast({ type: 'success', title, message });
export const toastError = (message, title = 'Something went wrong') => toast({ type: 'danger', title, message, duration: 7000 });

/* ---------- dialog infrastructure ---------- */
function buildDialog(kind, { title, body, footer, size = 'md', side = 'right', label }) {
  const id = uid('dlg'); const titleId = `${id}-title`;
  const dialog = h('dialog', { class: kind === 'drawer' ? `drawer${side === 'left' ? ' drawer--left' : ''}${size === 'lg' ? ' drawer--lg' : ''}` : `modal modal--${size}`, 'aria-labelledby': titleId, 'aria-label': label });
  const close = () => dialog.close();
  const head = h('div', { class: 'modal__head' }, h('h2', { class: 'modal__title', id: titleId }, title || ''), h('button', { class: 'btn btn--ghost btn--icon btn--sm', type: 'button', 'aria-label': 'Close', onClick: close }, icon('x', { size: 18 })));
  const bodyEl = h('div', { class: 'modal__body' }, body);
  dialog.append(head, bodyEl); if (footer?.length) dialog.append(h('div', { class: 'modal__foot' }, footer));
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
  document.body.append(dialog);
  return { dialog, close, bodyEl, head };
}

/**
 * Open a modal dialog. Focus is trapped natively, Esc closes, focus returns to the opener.
 * @param {{title:string, body:Node|string, footer?:Node[], size?:'sm'|'md'|'lg'|'full', onClose?:Function}} o
 */
export function openModal(o) {
  const { dialog, close, bodyEl } = buildDialog('modal', o);
  dialog.addEventListener('close', () => { o.onClose?.(); setTimeout(() => dialog.remove(), 320); });
  dialog.showModal();
  return { dialog, close, body: bodyEl };
}

/** Open a right-hand (or left) side drawer. */
export function openDrawer(o) {
  const { dialog, close, bodyEl } = buildDialog('drawer', o);
  dialog.addEventListener('close', () => { o.onClose?.(); setTimeout(() => dialog.remove(), 420); });
  dialog.showModal();
  return { dialog, close, body: bodyEl };
}

/**
 * Confirm dialog resolving true/false.
 * @param {{title?:string, message:string, confirmLabel?:string, cancelLabel?:string, danger?:boolean}} o
 */
export function confirmDialog({ title = 'Are you sure?', message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', danger = false } = {}) {
  return new Promise((resolve) => {
    let result = false;
    const ok = button(confirmLabel, { variant: danger ? 'danger' : 'primary', onClick: () => { result = true; m.close(); } });
    const no = button(cancelLabel, { variant: 'ghost', onClick: () => m.close() });
    const m = openModal({ title, size: 'sm', body: h('p', { class: 'text-muted' }, message), footer: [no, ok], onClose: () => resolve(result) });
    (danger ? no : ok).focus();
  });
}

class EhModal extends HTMLElement {
  /** Declarative modal: <eh-modal size="md" title="..."> content </eh-modal>; call el.open()/close(). */
  connectedCallback() {
    if (this.dialog) return;
    const kids = [...this.childNodes];
    const { dialog, close, bodyEl } = buildDialog('modal', { title: this.getAttribute('title'), body: kids, size: this.getAttribute('size') || 'md' });
    this.dialog = dialog; this.closeFn = close; this.bodyEl = bodyEl; this.append(dialog);
    dialog.addEventListener('close', () => this.dispatchEvent(new CustomEvent('closed')));
  }
  open() { this.dialog.showModal(); }
  close() { this.dialog.close(); }
}
customElements.define('eh-modal', EhModal);
