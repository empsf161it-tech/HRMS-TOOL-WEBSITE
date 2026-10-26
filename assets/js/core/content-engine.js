/* Purpose: fills [data-cms="page.section.field"] elements from the site config (text, rich text, image, link) with escaping and URL checks. */
import { getPath } from './utils/object.js';
import { sanitizeHTML, safeUrl } from './dom.js';

/**
 * Apply content from config to every [data-cms] element under root.
 * Field shapes: string | {html} | {src, alt} | {label, href, newTab} | {hidden:true} for sections.
 */
export function applyContent(cfg, root = document) {
  root.querySelectorAll('[data-cms]').forEach((el) => {
    const v = getPath(cfg.content, el.dataset.cms);
    if (v === undefined || v === null) return;
    if (typeof v === 'string') { el.textContent = v; return; }
    if (v.html !== undefined) { el.innerHTML = sanitizeHTML(v.html); return; }
    if (el.tagName === 'IMG' && v.src) { el.src = safeUrl(v.src, el.src); if (v.alt !== undefined) el.alt = v.alt; return; }
    if (v.label !== undefined || v.href !== undefined) {
      if (v.label !== undefined) el.textContent = v.label;
      if (v.href !== undefined && el.tagName === 'A') el.href = safeUrl(v.href);
      if (v.newTab) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
    }
  });
  root.querySelectorAll('[data-cms-section]').forEach((el) => {
    const s = getPath(cfg.content, el.dataset.cmsSection);
    el.hidden = !!s?._hidden;
  });
}
