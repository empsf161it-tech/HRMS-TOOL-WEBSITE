/* Purpose: <eh-wizard> - multi-step form with progress stepper, per-step native validation and Back/Next/Finish actions. */
import { h } from '../core/dom.js';
import { button } from './eh-button.js';
import './feedback.js';

class EhWizard extends HTMLElement {
  /** Children: <section data-title="Step name"> panels. Fires eh-finish. Attribute finish-label. `.step` current index. */
  connectedCallback() {
    if (this.panels) return;
    this.panels = [...this.querySelectorAll(':scope > section')]; this.step = 0;
    this.stepper = h('eh-stepper'); this.stepper.steps = this.panels.map((p, i) => p.dataset.title || `Step ${i + 1}`);
    this.back = button('Back', { variant: 'ghost', icon: 'arrow-left', onClick: () => this.go(this.step - 1, false) });
    this.next = button('Next', { variant: 'primary', iconEnd: 'arrow-right', onClick: () => this.go(this.step + 1, true) });
    this.body = h('div', { class: 'wizard__panel' });
    this.replaceChildren(h('div', { class: 'wizard' }, this.stepper, this.body, h('div', { class: 'wizard__actions' }, this.back, this.next)));
    this.show();
  }
  /** Move to a step; when moving forward the current panel's fields must be valid. */
  go(i, validate) {
    if (validate && !this.valid()) return;
    if (i >= this.panels.length) { this.dispatchEvent(new CustomEvent('eh-finish', { bubbles: true })); return; }
    this.step = Math.max(0, i); this.show();
  }
  valid() {
    const p = this.panels[this.step]; let ok = true;
    p.querySelectorAll('eh-input').forEach((e) => { if (!e.validate()) ok = false; });
    p.querySelectorAll('input:not(eh-input input),select:not(eh-input select),textarea:not(eh-input textarea)').forEach((el) => { if (!el.checkValidity()) { el.reportValidity(); ok = false; } });
    p.querySelector('.is-invalid input, .is-invalid select, .is-invalid textarea')?.focus();
    return ok;
  }
  show() {
    this.panels.forEach((p, i) => { p.hidden = i !== this.step; });
    this.body.replaceChildren(this.panels[this.step]); this.body.style.animation = 'none'; void this.body.offsetWidth; this.body.style.animation = '';
    this.stepper.setAttribute('current', this.step);
    this.back.hidden = this.step === 0;
    const last = this.step === this.panels.length - 1;
    this.next.querySelector('.btn__label span').textContent = last ? (this.getAttribute('finish-label') || 'Finish') : 'Next';
    this.dispatchEvent(new CustomEvent('eh-step', { detail: { step: this.step } }));
  }
}
customElements.define('eh-wizard', EhWizard);
