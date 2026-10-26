/* Purpose: i18n - JSON dictionaries (English, Hindi, Tamil), t() lookup, language switch with script fonts, RTL toggle. */
import { ls } from '../services/mock-db.js';
import { bus } from './events.js';
import { setLocaleOptions } from './utils/format.js';

const dicts = {}; let lang = 'en'; const base = new URL('../../../data/i18n/', import.meta.url);

async function load(code) {
  if (dicts[code]) return dicts[code];
  try { dicts[code] = await (await fetch(new URL(`${code}.json`, base))).json(); } catch { dicts[code] = {}; }
  return dicts[code];
}

/** Initialise i18n with the saved or default language. */
export async function initI18n(defaultLang = 'en') {
  await load('en');
  await setLang(ls.get('app.lang') || defaultLang, { silent: true });
}

/** Translate key with {{var}} interpolation; falls back to English then to the key. */
export function t(key, vars = {}) {
  const s = dicts[lang]?.[key] ?? dicts.en?.[key] ?? key;
  return s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? '');
}

/** Current language code. */
export const getLang = () => lang;

/** Switch language: loads dictionary, sets <html lang/dir>, adjusts number locale, fires 'lang-change'. */
export async function setLang(code, { silent = false, dir } = {}) {
  await load(code);
  lang = code; ls.set('app.lang', code);
  const html = document.documentElement;
  html.lang = code; html.dir = dir || ls.get('dir.' + code, 'ltr');
  setLocaleOptions({ locale: code === 'en' ? 'en-IN' : `${code}-IN` });
  if (!silent) bus.emit('lang-change', { lang: code });
}

/** Toggle RTL for the current language (used by the Languages settings). */
export function setDirection(dir) { ls.set('dir.' + lang, dir); document.documentElement.dir = dir; bus.emit('lang-change', { lang }); }

/** Fill [data-i18n] elements (textContent) and [data-i18n-attr="placeholder:key"] attributes under root. */
export function applyI18n(root = document) {
  root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const [attr, key] = el.dataset.i18nAttr.split(':'); el.setAttribute(attr, t(key));
  });
}
