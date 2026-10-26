/* Purpose: color math (hex parsing, luminance, WCAG contrast ratio, readable text color). */

/** Parse #rgb/#rrggbb to [r,g,b]; returns null if invalid. */
export function hexToRgb(hex) {
  let h = String(hex || '').trim().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/** WCAG relative luminance of a hex color. */
export function luminance(hex) {
  const rgb = hexToRgb(hex); if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio between two hex colors (1–21). */
export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Pick white or near-black text, whichever contrasts better with `bg`. */
export function contrastText(bg, light = '#FFFFFF', dark = '#0B1020') {
  return contrast(bg, light) >= contrast(bg, dark) ? light : dark;
}

/** AA/AAA rating for normal text. */
export function wcagBadge(ratio) { return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail'; }
