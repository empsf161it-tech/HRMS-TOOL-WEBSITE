/* Purpose: <eh-icon> custom element - renders Lucide icons (lazy CDN) by kebab-case name. */
import { loadLib } from '../core/loader.js';

const pascal = (n) => n.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
const pending = new Set();
let ready = false;
loadLib('lucide').then(() => { ready = true; pending.forEach((el) => el.render()); pending.clear(); }).catch(() => { /* offline: icons stay blank, labels still work */ });

class EhIcon extends HTMLElement {
  static observedAttributes = ['name', 'size'];
  connectedCallback() {
    this.style.setProperty('--sz', `${this.getAttribute('size') || 18}px`);
    if (this.hasAttribute('label')) { this.setAttribute('role', 'img'); this.setAttribute('aria-label', this.getAttribute('label')); } else this.setAttribute('aria-hidden', 'true');
    this.render();
  }
  attributeChangedCallback(n) { if (n === 'size') this.style.setProperty('--sz', `${this.getAttribute('size') || 18}px`); if (this.isConnected) this.render(); }
  render() {
    const L = window.lucide;
    if (!ready || !L) { pending.add(this); return; }
    const name = this.getAttribute('name') || '';
    const node = L.icons?.[pascal(name)];
    if (!node) { this.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/></svg>'; return; }
    const svg = L.createElement(node); svg.removeAttribute('class');
    svg.setAttribute('width', '100%'); svg.setAttribute('height', '100%');
    this.replaceChildren(svg);
  }
}
customElements.define('eh-icon', EhIcon);
