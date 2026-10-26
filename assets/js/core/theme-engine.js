/* Purpose: turns the site config into CSS custom properties (colors, shades, fonts, radii, density, component tokens) and manages theme mode. */
import { contrastText } from './utils/color.js';
import { fontsUrl } from './fonts.js';
import { bus } from './events.js';
import { ls } from '../services/mock-db.js';

const SURFACE = { bg: '--bg', surface: '--surface', surface2: '--surface-2', border: '--border', text: '--text', textMuted: '--text-muted' };
const BRAND = ['primary', 'secondary', 'accent', 'success', 'warning', 'danger', 'info'];
const SHADES = [[50, 8, 'white'], [100, 16, 'white'], [200, 32, 'white'], [300, 52, 'white'], [400, 76, 'white'], [500, 100, null], [600, 88, 'black'], [700, 72, 'black'], [800, 56, 'black'], [900, 40, 'black'], [950, 26, 'black']];
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function themeBlock(selector, tokens) {
  const lines = [];
  for (const c of BRAND) {
    if (!tokens[c]) continue;
    lines.push(`--color-${c}:${tokens[c]};`, `--on-${c}:${contrastText(tokens[c])};`);
  }
  if (tokens.primary) lines.push(`--on-primary:${contrastText(tokens.primary)};`);
  for (const [k, v] of Object.entries(SURFACE)) if (tokens[k]) lines.push(`${v}:${tokens[k]};`);
  return `${selector}{${lines.join('')}}`;
}

function shadeCSS() {
  const decl = [];
  for (const c of BRAND) for (const [n, pct, mix] of SHADES) {
    decl.push(`--color-${c}-${n}:${mix ? `color-mix(in oklch, var(--color-${c}) ${pct}%, ${mix})` : `var(--color-${c})`};`);
  }
  return `@supports (color: color-mix(in oklch, red, blue)){:root{${decl.join('')}}}`;
}

/** Map a button's hoverEffect (lift | glow | shine | none) and pressEffect (scale | none) to the --btn-* variables used by button.css. */
function buttonEffectVars(name, o = {}) {
  const p = `--btn-${name}`; const out = [];
  const hover = { lift: ['translateY(-2px)', ''], glow: ['none', `0 0 0 4px color-mix(in oklab, var(--color-${name === 'danger' ? 'danger' : 'primary'}) 28%, transparent)`], shine: ['none', ''], none: ['none', 'none'] }[o.hoverEffect];
  if (hover) { out.push(`${p}-hover-transform:${hover[0]};`); if (hover[1]) out.push(`${p}-hover-shadow:${hover[1]};`); }
  if (o.hoverEffect === 'shine' && name === 'primary') out.push('--btn-shine:1;');
  if (name === 'primary' && o.pressEffect) out.push(`--btn-press-scale:${o.pressEffect === 'none' ? 1 : 0.96};`);
  return out.join('');
}

/** Flatten component/button config into --btn- and --card- tokens (empty values are skipped). */
function componentVars(cfg) {
  const out = [];
  const add = (prefix, obj) => {
    for (const [k, v] of Object.entries(obj || {})) {
      if (v && typeof v === 'object') add(`${prefix}-${kebab(k)}`, v);
      else if (v !== '' && v != null && typeof v !== 'boolean') out.push(`--${prefix}-${kebab(k)}:${typeof v === 'number' && !/weight/.test(k) ? `${v}px` : v};`);
    }
  };
  for (const [name, obj] of Object.entries(cfg.buttons || {})) { add(`btn-${name}`, obj); out.push(buttonEffectVars(name, obj)); }
  for (const [name, obj] of Object.entries(cfg.components || {})) add(name, obj);
  return out.join('');
}

/** Build the full CSS text for a config. */
export function buildThemeCSS(cfg) {
  const t = cfg.theme, ty = cfg.typography, r = t.radius;
  const root = [
    `--radius-sm:${r.sm}px;--radius-md:${r.md}px;--radius-lg:${r.lg}px;--radius-xl:${r.xl}px;`,
    `--font-heading:"${ty.heading}",system-ui,sans-serif;--font-body:"${ty.body}",system-ui,sans-serif;--font-mono:"${ty.mono}",ui-monospace,monospace;`,
    `--text-base:${ty.baseSize}px;--type-scale:${(ty.scaleRatio / 1.25).toFixed(4)};--lh-body:${ty.lineHeight};--lh-heading:${ty.headingLineHeight};`,
    `--ls-display:${ty.letterSpacing}em;--heading-case:${ty.headingCase};--angle:${t.gradient?.angle ?? 135}deg;`,
    `--sidebar-w:${cfg.components?.sidebar?.width ?? 264}px;`,
    componentVars(cfg),
  ].join('');
  return [`:root{${root}}`, themeBlock(':root,[data-theme="light"]', t.light), themeBlock('[data-theme="dark"]', t.dark), themeBlock('[data-theme="hc"]', t.hc || t.dark), shadeCSS()].join('\n');
}

/** Write theme tokens, load fonts and set root attributes for density, sidebar and header styles. */
export function applyTheme(cfg) {
  let style = document.getElementById('eh-theme');
  if (!style) { style = document.createElement('style'); style.id = 'eh-theme'; document.head.append(style); }
  style.textContent = buildThemeCSS(cfg);
  const lang = document.documentElement.lang;
  const extra = lang === 'hi' ? ['Noto Sans Devanagari'] : lang === 'ta' ? ['Noto Sans Tamil'] : [];
  let link = document.getElementById('eh-fonts');
  if (!link) { link = document.createElement('link'); link.id = 'eh-fonts'; link.rel = 'stylesheet'; document.head.append(link); }
  const href = fontsUrl(cfg.typography, extra);
  if (link.getAttribute('href') !== href) link.setAttribute('href', href);
  const root = document.documentElement;
  root.dataset.density = ls.get('app.density') || cfg.layout?.density || 'comfortable';
  root.dataset.sidebarStyle = cfg.components?.sidebar?.style || 'light';
  root.dataset.headerStyle = cfg.components?.header?.style || 'blur';
  root.dataset.cardGlass = String(!!cfg.components?.card?.glass);
  root.dataset.tableZebra = String(!!cfg.components?.table?.zebra);
  bus.emit('theme-applied', cfg);
}

/* ---------- theme mode (light / dark / system / hc) ---------- */
const mq = matchMedia('(prefers-color-scheme: dark)');
const mqc = matchMedia('(prefers-contrast: more)');
/** @returns {'light'|'dark'|'system'|'hc'} stored mode */
export const getThemeMode = () => ls.get('theme', 'system');
/** Resolve mode to a concrete theme name. */
export const resolveTheme = (mode = getThemeMode()) => (mode === 'system' ? (mqc.matches ? 'hc' : mq.matches ? 'dark' : 'light') : mode);

/** Set theme mode and notify listeners (charts redraw on 'theme-change'). */
export function setThemeMode(mode) {
  ls.set('theme', mode);
  document.documentElement.setAttribute('data-theme', resolveTheme(mode));
  bus.emit('theme-change', { mode, theme: resolveTheme(mode) });
}

/** Toggle light/dark with a circular reveal from the click point (View Transitions API when available). */
export function toggleTheme(origin) {
  const next = resolveTheme() === 'dark' ? 'light' : 'dark';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.motion === 'off';
  if (!document.startViewTransition || reduce) return setThemeMode(next);
  const x = origin?.clientX ?? innerWidth / 2, y = origin?.clientY ?? 0;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.documentElement.classList.add('vt-theme');
  const vt = document.startViewTransition(() => setThemeMode(next));
  vt.ready.then(() => document.documentElement.animate(
    { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
    { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)', pseudoElement: '::view-transition-new(root)' },
  )).catch(() => {});
  vt.finished.finally(() => document.documentElement.classList.remove('vt-theme'));
}

mq.addEventListener('change', () => { if (getThemeMode() === 'system') setThemeMode('system'); });
mqc.addEventListener('change', () => { if (getThemeMode() === 'system') setThemeMode('system'); });
