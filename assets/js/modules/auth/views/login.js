/* Purpose: Login view matching the client reference UI design with emerald branding, feature highlights, team illustration, Google SSO, role quick-access, and responsive card form. */
import { h, icon } from '../../../core/dom.js';
import { login, quickLogin } from '../../../core/auth.js';
import { ROLES } from '../../../core/permissions.js';
import { brandMark, brandName } from '../../../shell/brand.js';
import { router } from '../../../core/router.js';
import { toastSuccess, openModal } from '../../../components/ui.js';

function googleSvg() {
  const span = document.createElement('span');
  span.style.display = 'inline-flex';
  span.style.alignItems = 'center';
  span.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  `;
  return span.firstElementChild;
}

export default async function loginView(ctx) {
  const nextUrl = ctx.query.next ? decodeURIComponent(ctx.query.next) : '/home';

  // If role is passed via query param (e.g. from landing page quick persona links), auto-login immediately
  if (ctx.query.role && ROLES[ctx.query.role]) {
    try {
      await quickLogin(ctx.query.role);
      setTimeout(() => router.navigate(nextUrl, { replace: true }), 40);
      return h('div', { class: 'p-8 text-center stack gap-2', style: 'margin: auto;' },
        h('h3', { class: 'fw-700' }, `Signing in as ${ROLES[ctx.query.role]?.label || ctx.query.role}…`),
        h('p', { class: 'text-sm text-muted' }, 'Redirecting to your personalized workspace…'));
    } catch (e) {
      console.warn('Auto quick-login failed:', e);
    }
  }

  // 1. Dedicated Top Navigation Bar
  const topbar = h('header', { class: 'auth-topbar fade-down' },
    h('a', { href: '#/login', class: 'auth-logo' },
      brandMark(32),
      h('span', null, brandName())
    ),
    h('div', { class: 'auth-topbar__switch' },
      "Don't have an account?",
      h('a', { href: '#/signup', class: 'auth-topbar__link' }, 'Sign Up')
    )
  );

  // 2. Left Column: Branding, Feature Bullets & Team Illustration
  const featuresList = [
    { title: 'Manage Employees', sub: 'Keep your team organized', iconName: 'users' },
    { title: 'Track Attendance', sub: 'View check-ins and check-outs', iconName: 'calendar-check-2' },
    { title: 'Access Payrolls', sub: 'Download salary details', iconName: 'file-text' },
    { title: 'Stay Connected', sub: 'Communicate with your team', iconName: 'bar-chart-2' },
  ];

  const leftCol = h('div', { class: 'auth-left fade-left' },
    h('span', { class: 'auth-badge' }, 'HRMS'),
    h('h1', { class: 'auth-hero-title' },
      'Welcome Back',
      h('br'),
      h('span', { class: 'auth-hero-title--accent' }, 'to HRMS')
    ),
    h('p', { class: 'auth-hero-desc' },
      'Access your dashboard, manage your team, track attendance and handle payroll — all in one place.'
    ),
    h('div', { class: 'auth-features' },
      ...featuresList.map((f) => h('div', { class: 'auth-feature-item' },
        h('div', { class: 'auth-feature-icon' }, icon(f.iconName, { size: 19 })),
        h('div', { class: 'auth-feature-text' },
          h('h4', { class: 'auth-feature-title' }, f.title),
          h('span', { class: 'auth-feature-sub' }, f.sub)
        )
      ))
    ),
    h('div', { class: 'auth-team-img-wrap' },
      h('img', {
        src: '../assets/images/auth-team.jpg',
        alt: 'Ellowring Team Collaboration',
        class: 'auth-team-img',
        loading: 'eager'
      })
    ),
    h('div', { class: 'auth-signature-quote' },
      'Better People',
      h('br'),
      'Better Teams',
      h('br'),
      'A Brighter Future'
    )
  );

  // 3. Right Column: Form Card
  const emailInput = h('input', {
    class: 'auth-input',
    type: 'email',
    required: true,
    value: 'superadmin@ellowring.in',
    placeholder: 'Enter your email address',
    id: 'login-email',
  });

  const passInput = h('input', {
    class: 'auth-input',
    type: 'password',
    required: true,
    value: 'Demo@123',
    placeholder: 'Enter your password',
    id: 'login-password',
  });

  let showPassword = false;
  const togglePwdBtn = h('button', {
    type: 'button',
    class: 'auth-toggle-pwd',
    'aria-label': 'Toggle password visibility',
    onClick: () => {
      showPassword = !showPassword;
      passInput.type = showPassword ? 'text' : 'password';
      togglePwdBtn.replaceChildren(icon(showPassword ? 'eye-off' : 'eye', { size: 16 }));
    }
  }, icon('eye', { size: 16 }));

  const errorEl = h('div', {
    class: 'alert alert--danger',
    style: 'margin-bottom: 12px; font-size: 13px; padding: 10px 14px; border-radius: 8px;',
    hidden: true
  });

  const submitBtn = h('button', {
    type: 'submit',
    class: 'auth-btn-primary'
  },
    h('span', null, 'Login'),
    icon('arrow-right', { size: 16 })
  );

  async function performLogin(fn) {
    errorEl.hidden = true;
    submitBtn.disabled = true;
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Signing in…';
    try {
      await fn();
      toastSuccess('Signed in successfully! Loading workspace…');
      router.navigate(nextUrl);
    } catch (err) {
      errorEl.textContent = err.message || 'Invalid email or password.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  }

  const form = h('form', {
    onSubmit: (e) => {
      e.preventDefault();
      performLogin(() => login(emailInput.value, passInput.value));
    }
  },
    errorEl,
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'login-email' }, 'Email Address'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('mail', { size: 16 })),
        emailInput
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'login-password' }, 'Password'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('lock', { size: 16 })),
        passInput,
        togglePwdBtn
      )
    ),
    h('div', { class: 'auth-row-options' },
      h('label', { class: 'auth-checkbox-label' },
        h('input', { type: 'checkbox', class: 'auth-checkbox', checked: true }),
        'Remember me'
      ),
      h('a', {
        href: 'javascript:void(0)',
        class: 'auth-forgot-link',
        onClick: () => {
          openModal({
            title: 'Forgot Password',
            size: 'sm',
            body: h('div', { class: 'stack gap-3', style: 'padding: 8px 0;' },
              h('p', { style: 'font-size: 13.5px; color: var(--text-muted); margin: 0;' },
                'Enter your registered email address and we will send a password reset verification link.'
              ),
              h('input', { class: 'auth-input', style: 'padding-left: 14px;', placeholder: 'name@company.com', value: emailInput.value })
            ),
            footer: [
              h('button', {
                class: 'auth-btn-primary',
                style: 'width: auto; padding: 8px 18px;',
                type: 'button',
                onClick: () => toastSuccess('Password reset link sent to your email!')
              }, 'Send Reset Link')
            ]
          });
        }
      }, 'Forgot password?')
    ),
    submitBtn,
    h('div', { class: 'auth-divider' }, h('span', null, 'OR')),
    h('button', {
      type: 'button',
      class: 'auth-btn-google',
      onClick: () => performLogin(() => quickLogin('super_admin'))
    },
      googleSvg(),
      h('span', null, 'Continue with Google')
    )
  );

  // Quick Role Selector with 8 roles
  const rolesList = [
    { key: 'super_admin', label: 'Admin', iconName: 'shield' },
    { key: 'hr_admin', label: 'HR Admin', iconName: 'user-check' },
    { key: 'branch_hr', label: 'Branch HR', iconName: 'building-2' },
    { key: 'payroll_admin', label: 'Payroll Admin', iconName: 'wallet' },
    { key: 'recruiter', label: 'Recruiter', iconName: 'user-search' },
    { key: 'manager', label: 'Manager', iconName: 'users' },
    { key: 'employee', label: 'Employee', iconName: 'user' },
    { key: 'site_admin', label: 'Site Admin', iconName: 'globe' },
  ];

  const roleSelector = h('div', { class: 'auth-role-section' },
    h('div', { class: 'auth-role-title' }, 'Login with your Role'),
    h('div', { class: 'auth-role-list' },
      ...rolesList.map((r) => h('div', {
        class: 'auth-role-item',
        role: 'button',
        tabindex: 0,
        onClick: () => performLogin(() => quickLogin(r.key))
      },
        h('div', { class: 'auth-role-item__left' },
          h('span', { class: 'auth-role-item__icon' }, icon(r.iconName, { size: 15 })),
          h('span', null, r.label)
        ),
        h('span', { class: 'auth-role-item__arrow' }, icon('chevron-right', { size: 14 }))
      ))
    )
  );

  const card = h('div', { class: 'auth-card fade-right' },
    h('h2', { class: 'auth-card__title' }, 'Login to ', h('span', null, 'HRMS')),
    h('p', { class: 'auth-card__sub' }, 'Enter your credentials to access your account'),
    form,
    roleSelector,
    h('div', { class: 'auth-trust-badge' },
      icon('shield-check', { size: 15 }),
      h('span', null, 'Secure · Fast · Reliable')
    )
  );

  const container = h('main', { class: 'auth-container' }, leftCol, card);

  return h('div', { class: 'auth-viewport' }, topbar, container);
}
