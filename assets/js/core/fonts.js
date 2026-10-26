/* Purpose: curated Google Fonts catalogue (Control Center font picker) and URL builder with only the weights in use. */

export const FONT_CATALOG = [
  'Inter', 'Plus Jakarta Sans', 'Manrope', 'DM Sans', 'Poppins', 'Outfit', 'Sora', 'Urbanist', 'Lexend',
  'Space Grotesk', 'IBM Plex Sans', 'Nunito', 'Figtree', 'Onest', 'Geist',
];

/**
 * Build a Google Fonts CSS2 URL (display=swap, only used weights).
 * @param {{heading:string, body:string, mono:string}} t typography config
 * @param {string[]} [extra] extra families such as Noto Sans Devanagari
 */
export function fontsUrl(t, extra = []) {
  const fam = new Map();
  const add = (name, weights) => fam.set(name, [...new Set([...(fam.get(name) || []), ...weights])].sort((a, b) => a - b));
  add(t.heading, [600, 700, 800]);
  add(t.body, [400, 500, 600]);
  add(t.mono, [400, 500]);
  extra.forEach((n) => add(n, [400, 500, 600]));
  const q = [...fam].map(([n, w]) => `family=${n.replace(/ /g, '+')}:wght@${w.join(';')}`).join('&');
  return `https://fonts.googleapis.com/css2?${q}&display=swap`;
}
