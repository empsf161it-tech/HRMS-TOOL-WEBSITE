/* Purpose: validation helpers built on the native Constraint Validation API plus password strength and phone masks. */

export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v || '');
/** Indian mobile: 10 digits starting 6-9, optional +91 prefix. */
export const isPhoneIN = (v) => /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test((v || '').replace(/\s/g, ''));

/** Mask input as "+91 98765 43210". */
export function maskPhoneIN(v) {
  const d = String(v || '').replace(/\D/g, '').replace(/^91(?=\d{10})/, '').slice(0, 10);
  return d ? `+91 ${d.slice(0, 5)}${d.length > 5 ? ' ' + d.slice(5) : ''}` : '';
}

/** Score a password 0–4 with a label and hints. */
export function passwordStrength(pw = '') {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  s = Math.min(4, s);
  return { score: s, label: ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s], pct: (s / 4) * 100 };
}

/** Validate every control in a form using native validation; returns true when valid. Focuses the first invalid control. */
export function validateForm(form) {
  if (form.checkValidity()) return true;
  form.reportValidity?.();
  form.querySelector(':invalid')?.focus();
  return false;
}

/** Collect form data as a plain object (multi-values become arrays). */
export function formToObject(form) {
  const out = {};
  for (const [k, v] of new FormData(form)) {
    if (k in out) out[k] = [].concat(out[k], v); else out[k] = v;
  }
  return out;
}
