/* Purpose: media components - <eh-cropper> (canvas crop with drag + zoom), <eh-camera> (getUserMedia with face guide), <eh-doc-viewer> (PDF / image). */
import { h, icon } from '../core/dom.js';
import { button } from './eh-button.js';

class EhCropper extends HTMLElement {
  /** Set `.src` (data/blob URL); read result with crop() → dataURL. Attribute `size` = output px (default 256), `round` for circular preview. */
  set src(v) { this._src = v; this.load(); }
  connectedCallback() {
    if (this.canvas) return;
    const size = +this.getAttribute('size') || 256; this.size = size; this.zoom = 1; this.off = { x: 0, y: 0 };
    this.canvas = h('canvas', { width: size, height: size, class: 'cropper__canvas', tabindex: 0, role: 'img', 'aria-label': 'Crop area. Drag to move, use the slider or arrow keys to adjust.' });
    this.range = h('input', { type: 'range', min: 1, max: 4, step: 0.01, value: 1, 'aria-label': 'Zoom', onInput: () => { this.zoom = +this.range.value; this.draw(); } });
    this.replaceChildren(h('div', { class: 'cropper' + (this.hasAttribute('round') ? ' cropper--round' : '') }, this.canvas, h('div', { class: 'cluster' }, icon('zoom-out', { size: 16 }), this.range, icon('zoom-in', { size: 16 }))));
    let drag = null;
    this.canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, o: { ...this.off } }; this.canvas.setPointerCapture(e.pointerId); });
    this.canvas.addEventListener('pointermove', (e) => { if (!drag) return; const k = size / this.canvas.getBoundingClientRect().width; this.off = { x: drag.o.x + (e.clientX - drag.x) * k, y: drag.o.y + (e.clientY - drag.y) * k }; this.draw(); });
    this.canvas.addEventListener('pointerup', () => { drag = null; });
    this.canvas.addEventListener('keydown', (e) => { const s = 10; const d = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key]; if (d) { e.preventDefault(); this.off.x += d[0]; this.off.y += d[1]; this.draw(); } });
    if (this._src) this.load();
  }
  load() { if (!this.canvas) return; this.img = new Image(); this.img.onload = () => { this.zoom = 1; this.off = { x: 0, y: 0 }; this.range.value = 1; this.draw(); }; this.img.src = this._src; }
  draw() {
    if (!this.img) return; const c = this.canvas.getContext('2d'); const s = this.size; c.clearRect(0, 0, s, s);
    const base = Math.max(s / this.img.width, s / this.img.height) * this.zoom; const w = this.img.width * base, hh = this.img.height * base;
    this.off.x = Math.max(-(w - s) / 2, Math.min((w - s) / 2, this.off.x)); this.off.y = Math.max(-(hh - s) / 2, Math.min((hh - s) / 2, this.off.y));
    c.drawImage(this.img, (s - w) / 2 + this.off.x, (s - hh) / 2 + this.off.y, w, hh);
  }
  /** Export the cropped area as a JPEG data URL. */
  crop(type = 'image/jpeg', q = 0.9) { return this.canvas.toDataURL(type, q); }
}
customElements.define('eh-cropper', EhCropper);

class EhCamera extends HTMLElement {
  /** Camera capture with an oval face guide. Fires `capture` {dataUrl}. Attributes: facing (user|environment), guide (oval|none). Call stop() when done. */
  async connectedCallback() {
    if (this.video) return;
    this.video = h('video', { playsinline: true, muted: true, autoplay: true, 'aria-label': 'Camera preview' });
    this.status = h('p', { class: 'text-sm text-muted text-center', role: 'status' }, 'Starting camera…');
    const guide = this.getAttribute('guide') !== 'none' ? h('div', { class: 'camera__guide', 'aria-hidden': 'true' }) : null;
    this.shot = button('Capture', { variant: 'primary', icon: 'camera', onClick: () => this.capture() });
    this.shot.disabled = true;
    this.replaceChildren(h('div', { class: 'camera' }, h('div', { class: 'camera__frame' }, this.video, guide), this.status, h('div', { class: 'cluster', style: { justifyContent: 'center' } }, this.shot)));
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.getAttribute('facing') || 'user', width: { ideal: 720 } }, audio: false });
      this.video.srcObject = this.stream; this.status.textContent = this.getAttribute('hint') || 'Align your face inside the oval and tap Capture.'; this.shot.disabled = false;
    } catch (err) {
      this.status.textContent = err?.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow access in your browser settings and retry.' : 'No camera is available on this device.';
      this.status.classList.add('color-danger');
      this.shot.replaceWith(button('Upload a photo instead', { variant: 'outline', icon: 'upload', onClick: () => this.pickFile() }));
    }
  }
  pickFile() { const i = h('input', { type: 'file', accept: 'image/*', capture: 'user' }); i.onchange = () => { const f = i.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => this.dispatchEvent(new CustomEvent('capture', { detail: { dataUrl: r.result } })); r.readAsDataURL(f); }; i.click(); }
  capture() {
    const v = this.video; const c = h('canvas'); c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    this.dispatchEvent(new CustomEvent('capture', { detail: { dataUrl: c.toDataURL('image/jpeg', 0.85) } }));
  }
  stop() { this.stream?.getTracks().forEach((t) => t.stop()); }
  disconnectedCallback() { this.stop(); }
}
customElements.define('eh-camera', EhCamera);

class EhDocViewer extends HTMLElement {
  /** Attributes: src (URL/data/blob), type (pdf|image, inferred), title. */
  connectedCallback() { this.render(); }
  static observedAttributes = ['src'];
  attributeChangedCallback() { if (this.isConnected) this.render(); }
  render() {
    const src = this.getAttribute('src'); if (!src) { this.replaceChildren(h('p', { class: 'text-muted' }, 'No document selected.')); return; }
    const type = this.getAttribute('type') || (/\.pdf($|\?)|^data:application\/pdf/i.test(src) ? 'pdf' : 'image');
    const title = this.getAttribute('title') || 'Document';
    this.replaceChildren(h('div', { class: 'docview' }, h('div', { class: 'docview__bar' }, icon(type === 'pdf' ? 'file-text' : 'image', { size: 16 }), h('span', { class: 'grow truncate fw-600' }, title), h('a', { class: 'btn btn--ghost btn--sm', href: src, download: title, target: '_blank', rel: 'noopener' }, icon('download', { size: 14 }), 'Download')),
      type === 'pdf' ? h('iframe', { src, title, class: 'docview__frame', loading: 'lazy' }) : h('div', { class: 'docview__img' }, h('img', { src, alt: title, loading: 'lazy' }))));
  }
}
customElements.define('eh-doc-viewer', EhDocViewer);
