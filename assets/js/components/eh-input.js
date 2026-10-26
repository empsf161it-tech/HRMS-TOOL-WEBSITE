/* Purpose: <eh-input> - floating-label field for text, number, email, tel (+91 mask), password (strength meter), textarea (counter), select, date, time, month. Native validation, aria-live errors, shake. */
import { h, icon, uid } from '../core/dom.js';
import { maskPhoneIN, isPhoneIN, passwordStrength } from '../core/utils/validate.js';

const PASS = ['id', 'name', 'required', 'min', 'max', 'step', 'minlength', 'maxlength', 'pattern', 'autocomplete', 'inputmode', 'disabled', 'readonly', 'accept'];

class EhInput extends HTMLElement {
  connectedCallback() {
    if (this.field) return;
    const type = this.getAttribute('type') || 'text'; const id = uid('in'); const errId = `${id}-err`; const hintId = `${id}-hint`;
    const label = this.getAttribute('label') || ''; const options = [...this.querySelectorAll('option')];
    const tag = type === 'textarea' ? 'textarea' : type === 'select' ? 'select' : 'input';
    const el = h(tag, { id, 'aria-describedby': `${hintId} ${errId}`, placeholder: ' ' });
    if (tag === 'input') el.type = type === 'tel' ? 'tel' : type === 'number' || type === 'password' ? type : type;
    if (tag === 'textarea') el.rows = +this.getAttribute('rows') || 3;
    PASS.forEach((a) => { if (this.hasAttribute(a) && a !== 'id') el.setAttribute(a, this.getAttribute(a)); });
    if (type === 'tel') { el.inputMode = 'tel'; el.placeholder = ' '; }
    if (tag === 'select') { el.append(h('option', { value: '' }, ''), ...options.map((o) => o.cloneNode(true))); el.required = this.hasAttribute('required'); }
    if (this.hasAttribute('value')) el.value = this.getAttribute('value');
    const labelEl = h('label', { class: 'field__label', for: id }, label, this.hasAttribute('required') ? h('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : null);
    const affix = type === 'password' ? h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon field__affix', 'aria-label': 'Show password', onClick: (e) => { const show = el.type === 'password'; el.type = show ? 'text' : 'password'; e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); e.currentTarget.replaceChildren(icon(show ? 'eye-off' : 'eye', { size: 16 })); } }, icon('eye', { size: 16 })) : null;
    const meter = type === 'password' && this.hasAttribute('strength') ? h('div', { class: 'strength', 'data-s': '0', 'aria-hidden': 'true' }, h('span')) : null;
    const meterText = meter ? h('span', null, '') : null;
    const counter = tag === 'textarea' && this.hasAttribute('maxlength') ? h('span', { class: 'tabular' }, `0/${this.getAttribute('maxlength')}`) : null;
    const hint = h('div', { class: 'field__hint', id: hintId }, h('span', null, this.getAttribute('hint') || ''), meterText || counter);
    const err = h('div', { class: 'field__error', id: errId, 'aria-live': 'polite' });
    this.field = h('div', { class: `field${tag === 'select' || label ? ' field--float' : ''}` }, h('div', { class: 'field__control' }, el, labelEl, affix), meter, hint, err);
    this.input = el; this.err = err;
    this.replaceChildren(this.field);

    el.addEventListener('input', () => {
      if (type === 'tel') { el.value = maskPhoneIN(el.value); el.setCustomValidity(!el.value || isPhoneIN(el.value) ? '' : 'Enter a valid 10-digit Indian mobile number'); }
      if (meter) { const s = passwordStrength(el.value); meter.dataset.s = s.score; meter.firstChild.style.setProperty('--p', `${Math.max(el.value ? 10 : 0, s.pct)}%`); meterText.textContent = el.value ? s.label : ''; }
      if (counter) counter.textContent = `${el.value.length}/${this.getAttribute('maxlength')}`;
      if (this.field.classList.contains('is-invalid') && el.checkValidity()) this.clearError();
      this.dispatchEvent(new CustomEvent('eh-input', { bubbles: true, detail: { value: el.value } }));
    });
    el.addEventListener('change', () => this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { value: el.value } })));
    el.addEventListener('blur', () => { if (el.value || this.dirty) this.validate(); });
    el.addEventListener('input', () => { this.dirty = true; }, { once: true });
    el.addEventListener('invalid', (e) => { e.preventDefault(); this.showError(el.validationMessage); });
    if (type === 'tel' && el.value) el.value = maskPhoneIN(el.value);
  }
  /** Validate and show the native message; returns validity. */
  validate() { const ok = this.input.checkValidity(); if (ok) this.clearError(); return ok; }
  showError(msg) {
    this.err.replaceChildren(icon('circle-alert', { size: 14 }), msg);
    this.field.classList.add('is-invalid', 'is-shaking'); this.input.setAttribute('aria-invalid', 'true');
    setTimeout(() => this.field.classList.remove('is-shaking'), 700);
  }
  clearError() { this.field.classList.remove('is-invalid'); this.input.removeAttribute('aria-invalid'); this.err.replaceChildren(); }
  get value() { return this.input?.value ?? this.getAttribute('value') ?? ''; }
  set value(v) { if (this.input) { this.input.value = v ?? ''; this.input.dispatchEvent(new Event('input')); } else this.setAttribute('value', v); }
  get name() { return this.getAttribute('name'); }
  focus() { this.input?.focus(); }
  checkValidity() { return this.input.checkValidity(); }
  reportValidity() { return this.input.reportValidity(); }
}
customElements.define('eh-input', EhInput);
