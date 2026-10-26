/* Purpose: lazy CDN loader for allowed third-party libraries (loaded only on screens that need them). */

const LIBS = {
  lucide: { js: 'https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js', global: 'lucide' },
  chart: { js: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.7/dist/chart.umd.min.js', global: 'Chart' },
  leaflet: { js: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js', css: 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css', global: 'L' },
  sortable: { js: 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.3/Sortable.min.js', global: 'Sortable' },
  xlsx: { js: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js', global: 'XLSX' },
  jspdf: { js: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js', global: 'jspdf' },
  autotable: { js: 'https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.4/dist/jspdf.plugin.autotable.min.js', global: null },
};
const cache = new Map();

/**
 * Load a library once; resolves with its global.
 * @param {keyof typeof LIBS} name
 */
export function loadLib(name) {
  const def = LIBS[name];
  if (!def) return Promise.reject(new Error(`Unknown library: ${name}`));
  if (cache.has(name)) return cache.get(name);
  const p = new Promise((resolve, reject) => {
    if (def.css) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = def.css; document.head.append(l); }
    const s = document.createElement('script');
    s.src = def.js; s.async = true;
    s.onload = () => resolve(def.global ? window[def.global] : true);
    s.onerror = () => { cache.delete(name); reject(new Error(`Could not load ${name} (offline?)`)); };
    document.head.append(s);
  });
  cache.set(name, p);
  return p;
}
