/* Purpose: <eh-file-upload> (drag-drop, previews, simulated progress) and <eh-avatar-upload> (pick → crop in a modal → preview). */
import { h, icon } from '../core/dom.js';
import { fileSize } from '../core/utils/format.js';
import { openModal, toastError } from './ui.js';
import { button } from './eh-button.js';
import { avatar } from './display.js';
import './eh-media.js';

class EhFileUpload extends HTMLElement {
  /** Attributes: accept, multiple, max-size (MB), label. `.files` returns selected File[]. Fires eh-change. INTEGRATION: replace the simulated progress with a real upload. */
  connectedCallback() {
    if (this.drop) return;
    this._files = [];
    const max = (+this.getAttribute('max-size') || 5) * 1048576;
    this.input = h('input', { type: 'file', accept: this.getAttribute('accept') || '', multiple: this.hasAttribute('multiple'), name: this.getAttribute('name'), 'aria-label': this.getAttribute('label') || 'Choose files' });
    this.list = h('ul', { class: 'files', 'aria-live': 'polite' });
    this.drop = h('label', { class: 'drop' }, this.input, icon('cloud-upload', { size: 28 }), h('strong', null, this.getAttribute('label') || 'Drag files here or click to browse'), h('span', { class: 'text-sm' }, `${this.getAttribute('accept') || 'Any file'} · up to ${max / 1048576} MB`));
    this.replaceChildren(this.drop, this.list);
    const add = (fl) => { for (const f of fl) { if (f.size > max) { toastError(`${f.name} is larger than ${max / 1048576} MB`, 'File too large'); continue; } if (!this.hasAttribute('multiple')) { this._files = []; this.list.replaceChildren(); } this._files.push(f); this.row(f); } this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { files: this._files } })); };
    this.input.addEventListener('change', () => { add(this.input.files); });
    ['dragenter', 'dragover'].forEach((ev) => this.drop.addEventListener(ev, (e) => { e.preventDefault(); this.drop.classList.add('is-over'); }));
    ['dragleave', 'drop'].forEach((ev) => this.drop.addEventListener(ev, (e) => { e.preventDefault(); this.drop.classList.remove('is-over'); }));
    this.drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
  }
  get files() { return this._files; }
  row(f) {
    const thumb = h('span', { class: 'file__thumb' }, f.type.startsWith('image/') ? h('img', { src: URL.createObjectURL(f), alt: '' }) : icon('file', { size: 20 }));
    const bar = h('div', { class: 'progress', role: 'progressbar', 'aria-valuenow': 0, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `Uploading ${f.name}` }, h('span'));
    const meta = h('span', { class: 'text-xs text-muted' }, `${fileSize(f.size)} · uploading…`);
    const li = h('li', { class: 'file' }, thumb, h('div', { class: 'stack', style: { '--gap': '4px', minInlineSize: 0 } }, h('span', { class: 'truncate fw-500' }, f.name), bar, meta),
      h('button', { type: 'button', class: 'btn btn--ghost btn--sm btn--icon', 'aria-label': `Remove ${f.name}`, onClick: () => { this._files = this._files.filter((x) => x !== f); li.remove(); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { files: this._files } })); } }, icon('x', { size: 14 })));
    this.list.append(li);
    let p = 0; const t = setInterval(() => { p = Math.min(100, p + 8 + Math.random() * 14); bar.firstChild.style.setProperty('--p', `${p}%`); bar.firstChild.style.inlineSize = `${p}%`; bar.setAttribute('aria-valuenow', Math.round(p)); if (p >= 100) { clearInterval(t); meta.textContent = `${fileSize(f.size)} · uploaded`; } }, 120);
  }
}
customElements.define('eh-file-upload', EhFileUpload);

class EhAvatarUpload extends HTMLElement {
  /** Attributes: name (person), src. Fires eh-change {dataUrl}. */
  connectedCallback() {
    if (this.holder) return;
    this.holder = h('span'); this.show(this.getAttribute('src'));
    const input = h('input', { type: 'file', accept: 'image/*', hidden: true, onChange: () => this.crop(input.files[0]) });
    this.replaceChildren(h('div', { class: 'avatar-upload' }, this.holder, h('div', { class: 'stack', style: { '--gap': '4px' } }, button('Upload photo', { variant: 'outline', size: 'sm', icon: 'camera', onClick: () => input.click() }), h('span', { class: 'text-xs text-muted' }, 'JPG or PNG, cropped to a square')), input));
  }
  show(src) { this.holder.replaceChildren(avatar(this.getAttribute('name') || 'New User', { src, size: 'xl' })); }
  crop(file) {
    if (!file) return; const r = new FileReader();
    r.onload = () => {
      const c = h('eh-cropper', { round: '', size: 280 }); c.src = r.result;
      const m = openModal({ title: 'Crop photo', size: 'sm', body: c, footer: [button('Cancel', { variant: 'ghost', onClick: () => m.close() }), button('Use photo', { variant: 'primary', onClick: () => { const url = c.crop(); this.show(url); this.dispatchEvent(new CustomEvent('eh-change', { bubbles: true, detail: { dataUrl: url } })); m.close(); } })] });
    };
    r.readAsDataURL(file);
  }
}
customElements.define('eh-avatar-upload', EhAvatarUpload);
