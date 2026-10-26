/* Purpose: <eh-map> - Leaflet + OpenStreetMap with markers, geofence circles/polygons, live location dot and a radius editor. Leaflet loads lazily. */
import { h } from '../core/dom.js';
import { loadLib } from '../core/loader.js';
import { errorState } from './feedback.js';

class EhMap extends HTMLElement {
  /** Attributes: center ("lat,lng"), zoom, height, radius-editor. Properties: markers [{lat,lng,label}], circles [{id,lat,lng,radius,label,color?}], polygons [{points:[[lat,lng]],label}]. Methods: setLive(lat,lng), fit(). Fires eh-radius {id,radius}, eh-click {lat,lng}. */
  set markers(v) { this._m = v; this.sync(); } set circles(v) { this._c = v; this.sync(); } set polygons(v) { this._p = v; this.sync(); }
  async connectedCallback() {
    if (this.el) return;
    this.el = h('div', { class: 'map__el', style: this.hasAttribute('height') ? { '--map-h': `${this.getAttribute('height')}px` } : null, role: 'application', 'aria-label': 'Map' });
    this.editor = this.hasAttribute('radius-editor') ? h('label', { class: 'cluster', style: { marginBlockStart: 'var(--space-2)' } }, h('span', { class: 'text-sm fw-500' }, 'Geofence radius'), h('input', { type: 'range', min: 25, max: 1000, step: 5, value: 150, style: { flex: 1, minBlockSize: '44px' }, onInput: (e) => { const c = this._c?.[0]; if (c) { c.radius = +e.target.value; this.out.textContent = `${c.radius} m`; this.sync(); this.dispatchEvent(new CustomEvent('eh-radius', { bubbles: true, detail: { id: c.id, radius: c.radius } })); } } }), this.out = h('output', { class: 'tabular fw-600' }, '150 m')) : null;
    this.replaceChildren(this.el, this.editor); this.el.append(h('eh-skeleton', { variant: 'chart' }));
    try { this.L = await loadLib('leaflet'); } catch { this.el.replaceChildren(errorState({ title: 'Map unavailable', text: 'The map library could not load. Check your connection.', onRetry: () => { this.el = null; this.connectedCallback(); } })); return; }
    const L = this.L; this.el.replaceChildren();
    const [lat, lng] = (this.getAttribute('center') || '13.0067,80.2206').split(',').map(Number);
    this.map = L.map(this.el, { zoomControl: true, attributionControl: true }).setView([lat, lng], +this.getAttribute('zoom') || 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(this.map);
    this.layer = L.layerGroup().addTo(this.map); this.map.on('click', (e) => this.dispatchEvent(new CustomEvent('eh-click', { bubbles: true, detail: { lat: e.latlng.lat, lng: e.latlng.lng } })));
    this.sync(); setTimeout(() => this.map.invalidateSize(), 200);
  }
  sync() {
    if (!this.map) return; const L = this.L; this.layer.clearLayers(); const color = () => getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    (this._c || []).forEach((c) => L.circle([c.lat, c.lng], { radius: c.radius, color: c.color || color(), fillOpacity: 0.15, weight: 2 }).bindTooltip(`${c.label || 'Geofence'} · ${c.radius} m`).addTo(this.layer));
    (this._p || []).forEach((p) => L.polygon(p.points, { color: p.color || color(), fillOpacity: 0.15, weight: 2 }).bindTooltip(p.label || 'Geofence').addTo(this.layer));
    (this._m || []).forEach((m) => L.marker([m.lat, m.lng]).bindTooltip(m.label || '').addTo(this.layer));
    if (this.live) this.live.addTo(this.layer);
  }
  /** Show / move the live location dot. */
  setLive(lat, lng) { if (!this.map) { setTimeout(() => this.setLive(lat, lng), 400); return; } const L = this.L; if (!this.live) this.live = L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).bindTooltip('You are here'); this.live.setLatLng([lat, lng]); this.live.addTo(this.layer); }
  fit() { const g = []; (this._c || []).forEach((c) => g.push(this.L.circle([c.lat, c.lng], { radius: c.radius }).getBounds())); if (g.length) this.map.fitBounds(g.reduce((a, b) => a.extend(b))); }
  disconnectedCallback() { this.map?.remove(); this.map = null; this.el = null; }
}
customElements.define('eh-map', EhMap);
