/* Purpose: advanced inputs - <eh-otp>, <eh-signature-pad>, <eh-rich-text>, <eh-repeater>. */
import { h, icon, sanitizeHTML, uid } from '../core/dom.js';
import { button } from './eh-button.js';

class EhOtp extends HTMLElement {
  /** Attributes: length (6), label. Fires eh-complete {value}. Supports paste and backspace navigation. */
  connectedCallback() {
    if (this.boxes) return;
    const n = +this.getAttribute('length') || 6;
    this.boxes = Array.from({ length: n }, (_, i) => h('input', { type: 'text', inputmode: 'numeric', maxlength: 1, autocomplete: i === 0 ? 'one-time-code' : 'off', 'aria-label': `Digit ${i + 1} of ${n}` }));
    this.wrap = h('div', { class: 'otp', role: 'group', 'aria-label': this.getAttribute('label') || 'One-time password' }, ...this.boxes);
    this.replaceChildren(this.wrap);
    this.boxes.forEach((b, i) => {
      b.addEventListener('input', () => { b.value = b.value.replace(/\D/g, ''); if (b.value && i < n - 1) this.boxes[i + 1].focus(); this.check(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !b.value && i > 0) this.boxes[i - 1].focus(); if (e.key === 'ArrowLeft' && i > 0) this.boxes[i - 1].focus(); if (e.key === 'ArrowRight' && i < n - 1) this.boxes[i + 1].focus(); });
      b.addEventListener('paste', (e) => { e.preventDefault(); const d = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, n); [...d].forEach((c, k) => { this.boxes[k].value = c; }); this.boxes[Math.min(d.length, n - 1)].focus(); this.check(); });
      b.addEventListener('focus', () => b.select());
    });
  }
  get value() { return this.boxes.map((b) => b.value).join(''); }
  check() { this.wrap.classList.remove('is-invalid'); if (this.value.length === this.boxes.length) this.dispatchEvent(new CustomEvent('eh-complete', { bubbles: true, detail: { value: this.value } })); }
  /** Mark the code as wrong (shake + red) and clear. */
  fail() { this.wrap.classList.add('is-invalid'); this.boxes.forEach((b) => { b.value = ''; }); this.boxes[0].focus(); }
}
customElements.define('eh-otp', EhOtp);

class EhSignaturePad extends HTMLElement {
  /** Canvas e-signature. `.toDataURL()`, `.isEmpty`, `.clear()`. Pointer events cover mouse, pen and touch. */
  connectedCallback() {
    if (this.canvas) return;
    this.canvas = h('canvas', { role: 'img', 'aria-label': 'Signature area. Draw your signature using mouse, pen or touch.' }); this.empty = true;
    this.replaceChildren(h('div', { class: 'sig' }, this.canvas, h('div', { class: 'split' }, h('span', { class: 'text-xs text-muted' }, 'Sign inside the box'), button('Clear', { variant: 'ghost', size: 'sm', icon: 'eraser', onClick: () => this.clear() }))));
    const fit = () => { const r = this.canvas.getBoundingClientRect(); const d = devicePixelRatio || 1; const img = this.empty ? null : this.canvas.toDataURL(); this.canvas.width = r.width * d; this.canvas.height = r.height * d; const c = this.canvas.getContext('2d'); c.scale(d, d); c.lineWidth = 2.2; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = getComputedStyle(this).color; if (img) { const i = new Image(); i.onload = () => c.drawImage(i, 0, 0, r.width, r.height); i.src = img; } };
    new ResizeObserver(fit).observe(this.canvas);
    let last = null; const pos = (e) => { const r = this.canvas.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    this.canvas.addEventListener('pointerdown', (e) => { last = pos(e); this.canvas.setPointerCapture(e.pointerId); });
    this.canvas.addEventListener('pointermove', (e) => { if (!last) return; const p = pos(e); const c = this.canvas.getContext('2d'); c.strokeStyle = getComputedStyle(this).color; c.beginPath(); c.moveTo(...last); c.lineTo(...p); c.stroke(); last = p; this.empty = false; });
    const end = () => { if (last && !this.empty) this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true })); last = null; };
    this.canvas.addEventListener('pointerup', end); this.canvas.addEventListener('pointerleave', end);
  }
  get isEmpty() { return this.empty; }
  clear() { const c = this.canvas.getContext('2d'); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, this.canvas.width, this.canvas.height); c.restore(); this.empty = true; }
  toDataURL() { return this.canvas.toDataURL('image/png'); }
}
customElements.define('eh-signature-pad', EhSignaturePad);

class EhRichText extends HTMLElement {
  /** Attributes: label, name (hidden input receives sanitised HTML), value. Output is always allow-list sanitised. */
  connectedCallback() {
    if (this.area) return;
    const id = uid('rte'); const cmds = [['bold', 'bold', 'Bold'], ['italic', 'italic', 'Italic'], ['underline', 'underline', 'Underline'], ['insertUnorderedList', 'list', 'Bulleted list'], ['insertOrderedList', 'list-ordered', 'Numbered list'], ['createLink', 'link', 'Link'], ['removeFormat', 'remove-formatting', 'Clear formatting']];
    this.area = h('div', { class: 'rte__area', contenteditable: 'true', role: 'textbox', 'aria-multiline': 'true', 'aria-labelledby': `${id}-l`, 'data-placeholder': this.getAttribute('placeholder') || 'Write something…', html: this.getAttribute('value') || '' });
    this.hiddenIn = h('input', { type: 'hidden', name: this.getAttribute('name') });
    const bar = h('div', { class: 'rte__bar', role: 'toolbar', 'aria-label': 'Formatting' }, ...cmds.map(([c, ic, t]) => h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': t, 'data-tooltip': t, onMousedown: (e) => e.preventDefault(), onClick: () => { if (c === 'createLink') { const u = prompt('Link URL (https://…)'); if (u && /^(https?:|mailto:)/i.test(u)) document.execCommand(c, false, u); } else document.execCommand(c); this.sync(); } }, icon(ic, { size: 15 }))));
    this.replaceChildren(h('div', { class: 'stack', style: { '--gap': '4px' } }, h('label', { id: `${id}-l`, class: 'text-sm fw-500' }, this.getAttribute('label') || ''), h('div', { class: 'rte' }, bar, this.area), this.hiddenIn));
    this.area.addEventListener('input', () => this.sync());
    this.area.addEventListener('paste', (e) => { e.preventDefault(); document.execCommand('insertText', false, e.clipboardData.getData('text/plain')); });
    this.sync();
  }
  sync() { this.hiddenIn.value = sanitizeHTML(this.area.innerHTML); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true })); }
  get value() { return sanitizeHTML(this.area.innerHTML); }
  set value(v) { this.area.innerHTML = sanitizeHTML(v); this.sync(); }
}
customElements.define('eh-rich-text', EhRichText);

class EhRepeater extends HTMLElement {
  /** Set `.fields = [{name,label,type?,options?}]` and optionally `.rows = [{...}]` (education, experience, family). Attributes: label, add-label, name. `.value` → array of objects. */
  connectedCallback() { this.render(); }
  set fields(v) { this._f = v; if (this.isConnected) this.render(); }
  set rows(v) { this._r = v; if (this.isConnected) this.render(); }
  render() {
    const fields = this._f || []; this.list = h('div', { class: 'repeater' });
    const add = (data = {}) => {
      const row = h('div', { class: 'repeater__row' }, ...fields.map((f) => h('eh-input', { label: f.label, type: f.type || 'text', name: f.name, value: data[f.name] ?? '', ...(f.required ? { required: '' } : {}) }, ...(f.options || []).map((o) => h('option', { value: o }, o)))),
        h('button', { type: 'button', class: 'btn btn--ghost btn--icon', 'aria-label': 'Remove row', onClick: () => { row.remove(); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true })); } }, icon('trash-2', { size: 16 })));
      this.list.append(row);
    };
    (this._r?.length ? this._r : [{}]).forEach(add);
    this.replaceChildren(h('div', { class: 'stack' }, this.getAttribute('label') ? h('div', { class: 'fw-600' }, this.getAttribute('label')) : null, this.list, button(this.getAttribute('add-label') || 'Add row', { variant: 'outline', size: 'sm', icon: 'plus', onClick: () => { add(); this.list.lastElementChild.querySelector('input,select')?.focus(); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true })); } })));
  }
  get value() { return [...this.list.children].map((r) => Object.fromEntries([...r.querySelectorAll('eh-input')].map((e) => [e.name, e.value]))); }
}
customElements.define('eh-repeater', EhRepeater);
