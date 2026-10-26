/* Purpose: brand mark - renders the official Ellowring 5-segment glossy 3D ring mark with raised center disc and returns the configured brand name. */
import { uid } from '../core/dom.js';
import { configStore } from '../core/config-store.js';

/**
 * Build the official Ellowring 5-segment 3D ring mark as an SVG element.
 * @param {number} [size=34] pixel size
 * @returns {SVGSVGElement}
 */
export function brandMark(size = 34) {
  const ns = 'http://www.w3.org/2000/svg';
  const id = uid('bm');
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 100 100');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'brand__mark');

  svg.innerHTML = `
    <defs>
      <filter id="${id}-sh" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.25"/>
      </filter>
      <filter id="${id}-dsh" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="#000" flood-opacity="0.28"/>
      </filter>
      <linearGradient id="${id}-red" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FF3843"/><stop offset="60%" stop-color="#E51821"/><stop offset="100%" stop-color="#B30911"/>
      </linearGradient>
      <linearGradient id="${id}-purple" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#7028E4"/><stop offset="60%" stop-color="#5414B8"/><stop offset="100%" stop-color="#360882"/>
      </linearGradient>
      <linearGradient id="${id}-blue" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#14B8FF"/><stop offset="60%" stop-color="#00A3E0"/><stop offset="100%" stop-color="#0077B6"/>
      </linearGradient>
      <linearGradient id="${id}-green" x1="1" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#009618"/><stop offset="60%" stop-color="#00B824"/><stop offset="100%" stop-color="#2AE252"/>
      </linearGradient>
      <linearGradient id="${id}-yellow" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#EAA600"/><stop offset="60%" stop-color="#FFC500"/><stop offset="100%" stop-color="#FFE169"/>
      </linearGradient>
      <linearGradient id="${id}-disc" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF"/><stop offset="70%" stop-color="#F1F5F9"/><stop offset="100%" stop-color="#CBD5E1"/>
      </linearGradient>
      <linearGradient id="${id}-gloss" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/><stop offset="40%" stop-color="#FFFFFF" stop-opacity="0.2"/><stop offset="100%" stop-color="#000000" stop-opacity="0.25"/>
      </linearGradient>
    </defs>
    <g filter="url(#${id}-sh)">
      <path d="M 50.00 6.00 A 44 44 0 0 1 91.85 36.40 L 72.83 42.58 A 24 24 0 0 0 50.00 26.00 Z" fill="url(#${id}-red)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.6"/>
      <path d="M 91.85 36.40 A 44 44 0 0 1 75.86 85.60 L 64.11 69.42 A 24 24 0 0 0 72.83 42.58 Z" fill="url(#${id}-purple)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.6"/>
      <path d="M 75.86 85.60 A 44 44 0 0 1 24.14 85.60 L 35.89 69.42 A 24 24 0 0 0 64.11 69.42 Z" fill="url(#${id}-blue)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.6"/>
      <path d="M 24.14 85.60 A 44 44 0 0 1 8.15 36.40 L 27.17 42.58 A 24 24 0 0 0 35.89 69.42 Z" fill="url(#${id}-green)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.6"/>
      <path d="M 8.15 36.40 A 44 44 0 0 1 50.00 6.00 L 50.00 26.00 A 24 24 0 0 0 27.17 42.58 Z" fill="url(#${id}-yellow)" stroke="#FFFFFF" stroke-opacity="0.35" stroke-width="0.6"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="url(#${id}-gloss)" stroke-width="2.6" opacity="0.65"/>
    </g>
    <g filter="url(#${id}-dsh)">
      <circle cx="50" cy="50" r="14" fill="url(#${id}-disc)" stroke="#FFFFFF" stroke-width="1.2"/>
      <circle cx="50" cy="49" r="12.5" fill="none" stroke="#FFFFFF" stroke-width="0.75" opacity="0.8"/>
    </g>
  `;
  return svg;
}

/** Brand name from the site config (defaults to 'ELLOWRING'). */
export const brandName = () => configStore.config.brand?.name || 'ELLOWRING';
