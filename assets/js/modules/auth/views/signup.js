/* Purpose: Sign Up view matching the client reference UI design with emerald branding, feature highlights, team illustration, registration form with department & role pickers, and instant account creation. */
import { h, icon } from '../../../core/dom.js';
import { register } from '../../../core/auth.js';
import { brandMark, brandName } from '../../../shell/brand.js';
import { router } from '../../../core/router.js';
import { toastSuccess, openModal } from '../../../components/ui.js';

export default async function signupView(ctx) {
  const nextUrl = ctx.query.next ? decodeURIComponent(ctx.query.next) : '/home';

  // 1. Dedicated Top Navigation Bar
  const topbar = h('header', { class: 'auth-topbar fade-down' },
    h('a', { href: '#/login', class: 'auth-logo', 'aria-label': `${brandName()} Home` },
      brandMark(32),
      h('span', null, brandName())
    ),
    h('div', { class: 'auth-topbar__switch' },
      h('span', { class: 'auth-topbar__prompt' }, 'Already have an account?'),
      h('a', { href: '#/login', class: 'auth-topbar__link' }, 'Login')
    )
  );

  // 2. Left Column: Branding, Feature Bullets & Team Illustration
  const featuresList = [
    { title: 'Professional Growth', sub: 'Build your career with us', iconName: 'building-2' },
    { title: 'Work-Life Balance', sub: 'Because you matter', iconName: 'heart' },
    { title: 'Great Team Culture', sub: 'Together we achieve more', iconName: 'users' },
  ];

  const leftCol = h('div', { class: 'auth-left fade-left' },
    h('span', { class: 'auth-badge' }, 'HRMS'),
    h('h1', { class: 'auth-hero-title' },
      'Create Your',
      h('br'),
      h('span', { class: 'auth-hero-title--accent' }, 'HRMS Account')
    ),
    h('p', { class: 'auth-hero-desc' },
      'Join our team and take the first step towards a better work experience.'
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
        alt: 'Ellowring Team Growth',
        class: 'auth-team-img',
        loading: 'eager'
      })
    ),
    h('div', { class: 'auth-signature-quote', style: 'font-size: 32px; transform: rotate(-3deg);' },
      'Grow Together'
    )
  );

  // 3. Right Column: Sign Up Form Card
  const nameInput = h('input', {
    class: 'auth-input',
    type: 'text',
    required: true,
    placeholder: 'Enter your full name',
    id: 'signup-name',
  });

  const emailInput = h('input', {
    class: 'auth-input',
    type: 'email',
    required: true,
    placeholder: 'Enter your email address',
    id: 'signup-email',
  });

  const phoneInput = h('input', {
    class: 'auth-input',
    type: 'tel',
    placeholder: 'Enter your phone number',
    id: 'signup-phone',
  });

  const deptSelect = h('select', { class: 'auth-select', id: 'signup-dept' },
    h('option', { value: 'Engineering & Tech' }, 'Engineering & Tech'),
    h('option', { value: 'Human Resources' }, 'Human Resources'),
    h('option', { value: 'Finance & Accounts' }, 'Finance & Accounts'),
    h('option', { value: 'Operations' }, 'Operations'),
    h('option', { value: 'Product Design' }, 'Product Design'),
    h('option', { value: 'Sales & Marketing' }, 'Sales & Marketing')
  );

  const passInput = h('input', {
    class: 'auth-input',
    type: 'password',
    required: true,
    placeholder: 'Create a password',
    id: 'signup-pass',
  });

  const confirmPassInput = h('input', {
    class: 'auth-input',
    type: 'password',
    required: true,
    placeholder: 'Confirm your password',
    id: 'signup-confirm-pass',
  });

  let showPassword1 = false;
  const togglePwdBtn1 = h('button', {
    type: 'button',
    class: 'auth-toggle-pwd',
    'aria-label': 'Toggle password visibility',
    onClick: () => {
      showPassword1 = !showPassword1;
      passInput.type = showPassword1 ? 'text' : 'password';
      togglePwdBtn1.replaceChildren(icon(showPassword1 ? 'eye-off' : 'eye', { size: 16 }));
    }
  }, icon('eye', { size: 16 }));

  let showPassword2 = false;
  const togglePwdBtn2 = h('button', {
    type: 'button',
    class: 'auth-toggle-pwd',
    'aria-label': 'Toggle password visibility',
    onClick: () => {
      showPassword2 = !showPassword2;
      confirmPassInput.type = showPassword2 ? 'text' : 'password';
      togglePwdBtn2.replaceChildren(icon(showPassword2 ? 'eye-off' : 'eye', { size: 16 }));
    }
  }, icon('eye', { size: 16 }));

  const roleSelect = h('select', { class: 'auth-select', id: 'signup-role' },
    h('option', { value: 'super_admin' }, 'Admin (Super Administrator)'),
    h('option', { value: 'hr_admin' }, 'HR Admin'),
    h('option', { value: 'branch_hr' }, 'Branch HR'),
    h('option', { value: 'payroll_admin' }, 'Payroll Admin'),
    h('option', { value: 'recruiter' }, 'Recruiter'),
    h('option', { value: 'manager' }, 'Manager'),
    h('option', { value: 'employee', selected: true }, 'Employee')
  );

  const termsCheckbox = h('input', {
    type: 'checkbox',
    class: 'auth-checkbox',
    required: true,
    checked: true,
    id: 'signup-terms',
  });

  const errorEl = h('div', {
    class: 'alert alert--danger',
    style: 'margin-bottom: 12px; font-size: 13px; padding: 10px 14px; border-radius: 8px;',
    hidden: true
  });

  const submitBtn = h('button', {
    type: 'submit',
    class: 'auth-btn-primary'
  },
    h('span', null, 'Create Account'),
    icon('arrow-right', { size: 16 })
  );

  async function performRegister() {
    errorEl.hidden = true;
    if (passInput.value !== confirmPassInput.value) {
      errorEl.textContent = 'Passwords do not match. Please verify.';
      errorEl.hidden = false;
      confirmPassInput.focus();
      return;
    }
    if (passInput.value.length < 6) {
      errorEl.textContent = 'Password must be at least 6 characters.';
      errorEl.hidden = false;
      passInput.focus();
      return;
    }

    submitBtn.disabled = true;
    const origText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Creating account…';
    try {
      await register({
        name: nameInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        department: deptSelect.value,
        role: roleSelect.value,
        password: passInput.value
      });
      toastSuccess(`Welcome to Ellowring, ${nameInput.value.trim()}! Account created.`);
      router.navigate(nextUrl);
    } catch (err) {
      errorEl.textContent = err.message || 'Registration failed. Please try again.';
      errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origText;
    }
  }

  function showTermsModal(type) {
    openModal({
      title: type === 'terms' ? 'Terms of Service' : 'Privacy Policy',
      size: 'md',
      body: h('div', { class: 'stack gap-3', style: 'padding: 8px 0; font-size: 13px; line-height: 1.55; color: var(--text);' },
        h('p', null, `Welcome to Ellowring HRMS. By accessing or using our enterprise workforce platform, you agree to comply with our enterprise data governance and service reliability standards.`),
        h('p', null, `All employee records, face templates, GPS coordinates and biometric punch logs are encrypted in accordance with standard statutory and ISO-27001 data safety practices.`),
        h('p', null, `For support or queries, contact compliance@ellowring.in.`)
      ),
      footer: [
        h('button', {
          class: 'auth-btn-primary',
          style: 'width: auto; padding: 8px 18px;',
          type: 'button',
          onClick: (e) => e.target.closest('dialog')?.close?.()
        }, 'I Understand')
      ]
    });
  }

  const form = h('form', {
    onSubmit: (e) => {
      e.preventDefault();
      performRegister();
    }
  },
    errorEl,
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-name' }, 'Full Name'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('user', { size: 16 })),
        nameInput
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-email' }, 'Email Address'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('mail', { size: 16 })),
        emailInput
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-phone' }, 'Phone Number'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('phone', { size: 16 })),
        phoneInput
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-dept' }, 'Department'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('building', { size: 16 })),
        deptSelect
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-pass' }, 'Password'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('lock', { size: 16 })),
        passInput,
        togglePwdBtn1
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-confirm-pass' }, 'Confirm Password'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('lock', { size: 16 })),
        confirmPassInput,
        togglePwdBtn2
      )
    ),
    h('div', { class: 'auth-field' },
      h('label', { class: 'auth-label', for: 'signup-role' }, 'Select Role'),
      h('div', { class: 'auth-input-group' },
        h('span', { class: 'auth-input-icon' }, icon('users', { size: 16 })),
        roleSelect
      )
    ),
    h('div', { style: 'margin: 12px 0 18px;' },
      h('label', { class: 'auth-checkbox-label', style: 'align-items: flex-start;' },
        termsCheckbox,
        h('span', { style: 'font-size: 12.5px; line-height: 1.4;' },
          'I agree to the ',
          h('a', { href: 'javascript:void(0)', class: 'auth-inline-link', onClick: () => showTermsModal('terms') }, 'Terms of Service'),
          ' and ',
          h('a', { href: 'javascript:void(0)', class: 'auth-inline-link', onClick: () => showTermsModal('privacy') }, 'Privacy Policy')
        )
      )
    ),
    submitBtn,
    h('div', { class: 'auth-card-footer-switch' },
      'Already have an account?',
      h('a', { href: '#/login', class: 'auth-card-footer-link' }, 'Login')
    )
  );

  const card = h('div', { class: 'auth-card fade-right' },
    h('h2', { class: 'auth-card__title' }, 'Get Started'),
    h('p', { class: 'auth-card__sub' }, 'Fill in your details to create your account'),
    form
  );

  const container = h('main', { class: 'auth-container' }, leftCol, card);

  return h('div', { class: 'auth-viewport' }, topbar, container);
}
