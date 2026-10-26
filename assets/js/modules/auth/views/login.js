/* Purpose: login view - Aurora background, email/password form, 8 role quick-login chips, credentials error handling. */
import { h, icon } from '../../../core/dom.js';
import { login, quickLogin } from '../../../core/auth.js';
import { ROLES } from '../../../core/permissions.js';
import { button, withLoading } from '../../../components/eh-button.js';
import { brandMark, brandName } from '../../../shell/brand.js';
import { router } from '../../../core/router.js';

export default async function loginView(ctx) {
  const nextUrl = ctx.query.next ? decodeURIComponent(ctx.query.next) : '/home';

  // If role is passed via query param (e.g. from landing page quick persona links), auto-login immediately
  if (ctx.query.role && ROLES[ctx.query.role]) {
    try {
      await quickLogin(ctx.query.role);
      setTimeout(() => router.navigate(nextUrl, { replace: true }), 50);
      return h('div', { class: 'p-8 text-center stack gap-2', style: 'margin: auto;' },
        h('h3', { class: 'fw-700' }, `Signing in as ${ROLES[ctx.query.role]?.label || ctx.query.role}…`),
        h('p', { class: 'text-sm text-muted' }, 'Redirecting to your personalized workspace…'));
    } catch (e) {
      console.warn('Auto quick-login failed:', e);
    }
  }

  // Left art panel
  const art = h('div', { class: 'login__art' },
    h('div', { class: 'aurora', 'aria-hidden': 'true' }),
    h('div', { class: 'stack gap-4 relative' },
      h('div', { class: 'cluster' }, brandMark(48), h('span', { class: 'brand__name text-2xl fw-800' }, brandName())),
      h('h2', { class: 'fw-800' }, 'Modern HR & Workforce Platform for India'),
      h('p', { class: 'text-sm' }, 'From live biometrics and GPS geo-fencing to statutory payroll and multi-company enterprise workflows.'),
      h('div', { class: 'login__pills' },
        h('span', null, '30 Integrated Modules'),
        h('span', null, '8 Industry Packs'),
        h('span', null, 'Live GPS & Face Terminal'),
        h('span', null, 'PF · ESI · PT · TDS'))));

  // Right form panel
  const emailInput = h('input', {
    class: 'input',
    type: 'email',
    required: true,
    value: 'superadmin@ellowring.in',
    placeholder: 'name@company.in',
    id: 'login-email',
  });

  const passInput = h('input', {
    class: 'input',
    type: 'password',
    required: true,
    value: 'Demo@123',
    placeholder: '••••••••',
    id: 'login-password',
  });

  const errorEl = h('div', { class: 'alert alert--danger', hidden: true });
  const submitBtn = button('Sign In to Account', { variant: 'primary', block: true, type: 'submit' });

  async function performLogin(fn) {
    errorEl.hidden = true;
    try {
      await withLoading(submitBtn, fn);
      router.navigate(nextUrl);
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid email or password.';
      errorEl.hidden = false;
    }
  }

  const form = h('form', {
    class: 'stack gap-4',
    onSubmit: (e) => {
      e.preventDefault();
      performLogin(() => login(emailInput.value, passInput.value));
    },
  },
    errorEl,
    h('div', { class: 'field' },
      h('label', { class: 'label', for: 'login-email' }, 'Work Email'),
      emailInput),
    h('div', { class: 'field' },
      h('div', { class: 'split mb-1' },
        h('label', { class: 'label', for: 'login-password', style: { margin: 0 } }, 'Password'),
        h('span', { class: 'text-xs text-muted' }, 'Demo pass: Demo@123')),
      passInput),
    submitBtn);

  // Quick-login chips
  const quickChips = Object.entries(ROLES).map(([roleKey, roleDef]) => {
    return h('button', {
      type: 'button',
      class: 'role-chip',
      onClick: () => performLogin(() => quickLogin(roleKey)),
    },
      icon(roleDef.icon || 'user', { size: 14 }),
      h('span', null, roleDef.label));
  });

  const card = h('div', { class: 'card p-6 login__card' },
    h('div', { class: 'stack gap-1' },
      h('div', { style: 'inline-size:48px;block-size:4px;border-radius:4px;background:linear-gradient(90deg, #E51821 0%, #5414B8 24%, #00A3E0 48%, #00B824 74%, #FFC500 100%);box-shadow:0 2px 8px rgba(84,20,184,0.35);margin-bottom:0.25rem' }),
      h('h1', { class: 'text-2xl fw-700' }, 'Sign In'),
      h('p', { class: 'text-muted text-sm' }, 'Select a demo persona or enter your credentials.')),
    h('div', { class: 'stack gap-2' },
      h('span', { class: 'text-xs fw-600 text-muted uppercase tracking-wider' }, 'Instant Demo Access:'),
      h('div', { class: 'role-chips' }, ...quickChips)),
    h('hr', null),
    form);

  const panel = h('div', { class: 'login__panel' }, card);

  return h('div', { class: 'login' }, art, panel);
}
