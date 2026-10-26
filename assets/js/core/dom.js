/* Purpose: DOM helpers - hyperscript h(), query shortcuts, safe HTML sanitiser (allow-list), unique ids. Views build DOM through h(). */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let _uid = 0;
/** Unique id for aria wiring. */
export const uid = (p = 'eh') => `${p}-${++_uid}`;

/**
 * Create an element. Props: class, style (object), dataset, on<Event> handlers, ".prop" for DOM properties, `html` (sanitised).
 * Children may be Nodes, strings, numbers, arrays (flattened) or falsy (skipped).
 * @param {string} tag
 * @param {object|null} [props]
 * @param {...any} kids
 * @returns {HTMLElement}
 */
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else if (k === 'html') el.innerHTML = sanitizeHTML(v);
    else if (k.startsWith('.')) el[k.slice(1)] = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, kids);
  return el;
}

/** Append children (flattening arrays, skipping null/false). */
export function append(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}

/** Remove all children of an element. */
export const clear = (el) => { el.replaceChildren(); return el; };

/** Create an <eh-icon> (Lucide icon by kebab-case name). */
export function icon(name, { size = 18, cls = '', label } = {}) {
  const el = document.createElement('eh-icon');
  el.setAttribute('name', name); el.setAttribute('size', size);
  if (cls) el.className = cls;
  if (label) el.setAttribute('label', label);
  return el;
}

const ALLOWED_TAGS = new Set(['B', 'I', 'EM', 'STRONG', 'U', 'A', 'P', 'BR', 'UL', 'OL', 'LI', 'SPAN', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'CODE', 'MARK', 'SMALL', 'DIV']);
const SAFE_URL = /^(https?:|mailto:|tel:|#|\/|\.\/|\.\.\/)/i;

/** Allow-list HTML sanitiser for rich text injected by the Control Center. Blocks scripts, handlers and javascript: URLs. */
export function sanitizeHTML(html) {
  const tpl = document.createElement('template');
  tpl.innerHTML = String(html ?? '');
  const walk = (node) => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE || !ALLOWED_TAGS.has(child.tagName)) {
        if (child.nodeType === Node.ELEMENT_NODE && ['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED'].includes(child.tagName)) child.remove();
        else if (child.nodeType === Node.ELEMENT_NODE) { walk(child); child.replaceWith(...child.childNodes); } else child.remove();
        continue;
      }
      for (const a of [...child.attributes]) {
        const n = a.name.toLowerCase();
        const ok = (child.tagName === 'A' && (n === 'href' || n === 'target' || n === 'rel')) || (n === 'style' && /^(color|background-color):\s*[#\w(),.\s%-]+;?$/i.test(a.value));
        if (!ok) child.removeAttribute(a.name);
        else if (n === 'href' && !SAFE_URL.test(a.value.trim())) child.removeAttribute('href');
      }
      if (child.tagName === 'A') { child.setAttribute('rel', 'noopener noreferrer'); }
      walk(child);
    }
  };
  walk(tpl.content);
  return tpl.innerHTML;
}

/** Escape text for use inside an HTML string. */
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Block javascript:/data: URLs from config-supplied links. */
export const safeUrl = (u, fallback = '#') => (SAFE_URL.test(String(u || '').trim()) ? u : fallback);

/** Clone a <template> by id and return its first element. */
export function fromTemplate(id) { return document.getElementById(id).content.firstElementChild.cloneNode(true); }
