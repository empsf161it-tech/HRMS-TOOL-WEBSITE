/* Purpose: sidebar - client-matching navigation with active dashboard, core modules, New Modules section, AI HR Assistant card and collapse menu. */
import { h, icon } from '../core/dom.js';
import { appStore } from '../core/store.js';
import { ROLES } from '../core/permissions.js';
import { ls } from '../services/mock-db.js';
import { t } from '../core/i18n.js';
import { brandMark, brandName } from './brand.js';
import { activeIdFor } from './nav-model.js';

/**
 * Robot SVG avatar for the AI HR Assistant widget
 */
function robotAvatarSvg() {
  const div = document.createElement('div');
  div.className = 'sidebar__ai-avatar';
  div.innerHTML = `
    <svg viewBox="0 0 44 44" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="22" cy="22" r="20" fill="url(#ai-robot-bg)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
      <defs>
        <linearGradient id="ai-robot-bg" x1="0" y1="0" x2="44" y2="44">
          <stop offset="0%" stop-color="#1E3A8A"/>
          <stop offset="100%" stop-color="#0F172A"/>
        </linearGradient>
      </defs>
      <line x1="22" y1="11" x2="22" y2="6" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/>
      <circle cx="22" cy="5" r="2" fill="#38BDF8"/>
      <rect x="7" y="17" width="3" height="10" rx="1.5" fill="#93C5FD"/>
      <rect x="34" y="17" width="3" height="10" rx="1.5" fill="#93C5FD"/>
      <rect x="9" y="11" width="26" height="20" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1"/>
      <rect x="13" y="14" width="18" height="12" rx="4" fill="#0F172A"/>
      <circle cx="17.5" cy="20" r="2" fill="#38BDF8"/>
      <circle cx="26.5" cy="20" r="2" fill="#38BDF8"/>
      <path d="M 20 23 Q 22 25 24 23" stroke="#38BDF8" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M 16 32 L 28 32 L 31 38 L 13 38 Z" fill="#E2E8F0"/>
      <rect x="16" y="32" width="12" height="2" rx="1" fill="#2563EB"/>
    </svg>
  `;
  return div.firstElementChild;
}

/** Open the interactive AI HR Assistant dialog */
function openAiAssistantModal() {
  import('../components/ui.js').then(({ openModal }) => {
    const messages = [
      { sender: 'bot', text: 'Hello Vignesh! I am your Ellowring AI HR Assistant. Ask me anything about your workforce, timesheets, candidate pipelines, or client deployments.' }
    ];

    const chatList = h('div', { class: 'stack gap-3', style: 'max-height: 320px; overflow-y: auto; padding: 4px;' });

    function renderMessages() {
      chatList.replaceChildren(...messages.map((m) => {
        const isBot = m.sender === 'bot';
        return h('div', {
          style: `display: flex; gap: 10px; align-items: flex-start; justify-content: ${isBot ? 'flex-start' : 'flex-end'};`
        },
          isBot ? robotAvatarSvg() : null,
          h('div', {
            style: `max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.45; ${
              isBot
                ? 'background: var(--surface-2); color: var(--text); border: 1px solid var(--border);'
                : 'background: var(--color-primary); color: #fff;'
            }`
          }, m.text)
        );
      }));
      chatList.scrollTop = chatList.scrollHeight;
    }

    renderMessages();

    const input = h('input', {
      type: 'text',
      class: 'input',
      placeholder: 'Ask about attendance, payroll, hiring, or client billing…',
      style: 'flex: 1;',
      onKeydown: (e) => {
        if (e.key === 'Enter') sendQuery(input.value);
      }
    });

    const sendBtn = h('button', {
      class: 'btn btn--primary',
      type: 'button',
      onClick: () => sendQuery(input.value)
    }, 'Send');

    function sendQuery(txt) {
      const q = (txt || '').trim();
      if (!q) return;
      messages.push({ sender: 'user', text: q });
      input.value = '';
      renderMessages();

      setTimeout(() => {
        let reply = "Here is what I found in the system:";
        const lower = q.toLowerCase();
        if (lower.includes('leave') || lower.includes('absent')) {
          reply = "Today at Ellowring: 248 total staff, 186 deployed, 12 on approved leave, and 92% timesheets submitted on schedule.";
        } else if (lower.includes('payroll') || lower.includes('salary')) {
          reply = "Payroll processed for August 2026 was ₹48.5 Lakhs across all 6 entities. September payroll calculation is in progress and on track.";
        } else if (lower.includes('client') || lower.includes('deployment')) {
          reply = "Active Client Deployments: TCS (42), Infosys (36), Wipro (28), HCL (22), Accenture (18), Others (40). Total deployed: 186 employees.";
        } else if (lower.includes('candidate') || lower.includes('recruitment') || lower.includes('ats')) {
          reply = "ATS update: 2 new candidates moved to the technical interview stage for the Project Alpha team.";
        } else {
          reply = `Analysis for "${q}": All workforce indicators are operating within normal parameters. Headcount: 248, Client Companies: 12, Revenue billed: ₹62.3L.`;
        }
        messages.push({ sender: 'bot', text: reply });
        renderMessages();
      }, 450);
    }

    const quickPills = [
      'Who is on leave today?',
      'Pending timesheet approvals',
      'Client deployment breakdown',
      'Payroll status for Sep 2026'
    ].map((prompt) => h('button', {
      class: 'btn btn--ghost btn--sm',
      style: 'font-size: 11.5px; border: 1px solid var(--border); border-radius: 9999px; background: var(--surface);',
      type: 'button',
      onClick: () => sendQuery(prompt)
    }, prompt));

    const body = h('div', { class: 'stack gap-4' },
      chatList,
      h('div', { class: 'cluster', style: 'gap: 6px;' }, ...quickPills),
      h('div', { class: 'cluster', style: 'gap: 8px;' }, input, sendBtn)
    );

    openModal({
      title: 'AI HR Assistant · Workforce Intelligence',
      size: 'lg',
      body
    });
  });
}

/**
 * Create the sidebar.
 * @param {{onClose: () => void, onToggleCollapse: () => void}} o callbacks for the mobile close button and the collapse button
 * @returns {{el: HTMLElement, rebuild: () => void, setActive: (path: string) => void, setCollapsed: (c: boolean) => void}}
 */
export function createSidebar({ onClose, onToggleCollapse }) {
  let query = '';
  let activePath = location.hash.slice(1) || '/home';
  let collapsed = false;

  const indicator = h('span', { class: 'nav-indicator', 'aria-hidden': 'true' });
  const nav = h('nav', { class: 'sidebar__nav', 'aria-label': 'Modules' });

  const search = h('input', {
    class: 'input',
    type: 'search',
    placeholder: t('nav.search') || 'Search menu…',
    'aria-label': t('nav.search') || 'Search menu',
    autocomplete: 'off',
    onInput: (e) => {
      query = e.target.value.trim().toLowerCase();
      renderNav();
    },
    onKeydown: (e) => {
      if (e.key === 'Escape') {
        e.target.value = '';
        query = '';
        renderNav();
      }
      if (e.key === 'Enter') {
        nav.querySelector('.nav-item:not([hidden])')?.click();
      }
    }
  });

  const brandRow = h('div', { class: 'sidebar__brand' },
    h('a', { class: 'brand', href: '#/home', 'aria-label': `${brandName()} home` },
      brandMark(36),
      h('div', { class: 'brand__text' },
        h('span', { class: 'brand__name' }, brandName()),
        h('span', { class: 'brand__tagline' }, 'One Ecosystem. Zero Gaps.')
      )
    ),
    h('button', {
      class: 'btn btn--ghost btn--icon btn--sm show-mobile',
      style: { marginInlineStart: 'auto', color: '#fff' },
      type: 'button',
      'aria-label': t('common.close') || 'Close',
      onClick: onClose
    }, icon('x', { size: 18 }))
  );

  const foot = h('div', { class: 'sidebar__foot' });

  const el = h('aside', {
    class: 'app__sidebar sidebar',
    id: 'sidebar',
    'aria-label': 'Primary navigation'
  },
    brandRow,
    h('div', { class: 'sidebar__search hide-mobile' }, search),
    nav,
    foot
  );

  const STAFFING_SUBITEMS = [
    { label: 'Overview', href: '#/geo-attendance', match: (p) => p === '/geo-attendance' || p === '/staffing' },
    { label: 'Clients', href: '#/it' },
    { label: 'Job Openings', href: '#/recruitment' },
    { label: 'Candidates (ATS)', href: '#/recruitment' },
    { label: 'Deployments', href: '#/geo-attendance' },
    { label: 'Timesheets', href: '#/timesheets', match: (p) => p.startsWith('/timesheets') },
    { label: 'Client Approvals', href: '#/timesheets' },
    { label: 'Payroll & Billing', href: '#/compliance' },
    { label: 'Contracts', href: '#/documents' },
    { label: 'Replacements', href: '#/geo-attendance' },
  ];

  const PAYROLL_SUBITEMS = [
    { label: 'Overview', href: '#/payroll/overview' },
    { label: 'Process Payroll', href: '#/payroll', match: (p) => p === '/payroll' || p === '/payroll/process' },
    { label: 'Payslips', href: '#/payroll/payslips' },
    { label: 'Salary Components', href: '#/payroll/components' },
    { label: 'Deductions & Statutory', href: '#/payroll/deductions' },
    { label: 'Loans & Advances', href: '#/payroll/loans' },
    { label: 'Reimbursements', href: '#/expenses' },
    { label: 'PF / ESI / TDS', href: '#/compliance' },
    { label: 'Bank Upload', href: '#/payroll/bank' },
    { label: 'Reports', href: '#/analytics' },
  ];

  const CLIENTS_SUBITEMS = [
    { label: 'Overview', href: '#/it', match: (p) => p === '/it' || p === '/clients' },
    { label: 'Client Companies', href: '#/it' },
    { label: 'Client Contacts', href: '#/it' },
    { label: 'Job Openings', href: '#/recruitment' },
    { label: 'Candidates (ATS)', href: '#/recruitment' },
    { label: 'Deployments', href: '#/geo-attendance' },
    { label: 'Timesheets', href: '#/timesheets' },
    { label: 'Client Approvals', href: '#/timesheets' },
    { label: 'Invoicing & Billing', href: '#/compliance' },
    { label: 'Contracts', href: '#/documents' },
    { label: 'Replacements', href: '#/geo-attendance' },
  ];

  // Core navigation items matching client reference design
  const CORE_ITEMS = [
    { id: 'home', label: 'Dashboard', icon: 'layout-dashboard', href: '#/home' },
    { id: 'core-hr', label: 'Employees', icon: 'users', href: '#/core-hr', hasChevron: true },
    { id: 'multi-company', label: 'Organization', icon: 'building-2', href: '#/multi-company', hasChevron: true },
    { id: 'attendance', label: 'Attendance', icon: 'clock', href: '#/attendance' },
    { id: 'leave', label: 'Leave', icon: 'calendar-days', href: '#/leave' },
    { id: 'payroll', label: 'Payroll', icon: 'wallet', href: '#/payroll', subitems: PAYROLL_SUBITEMS },
    { id: 'performance', label: 'Performance', icon: 'activity', href: '#/performance' },
  ];

  // New Modules section matching client reference design
  const NEW_MODULES = [
    { id: 'recruitment', label: 'Recruitment (ATS)', icon: 'user-search', href: '#/recruitment', isNew: true },
    { id: 'it', label: 'Clients & Projects', icon: 'briefcase', href: '#/it', isNew: true, subitems: CLIENTS_SUBITEMS },
    { id: 'geo-attendance', label: 'Staffing / Deployments', icon: 'users-round', href: '#/geo-attendance', isNew: true, subitems: STAFFING_SUBITEMS },
    { id: 'timesheets', label: 'Timesheet', icon: 'clock', href: '#/timesheets', isNew: true },
    { id: 'ess', label: 'Client Portal', icon: 'monitor', href: '#/ess', isNew: true },
    { id: 'compliance', label: 'Invoicing & Billing', icon: 'receipt', href: '#/compliance', isNew: true },
    { id: 'documents', label: 'Contracts & Documents', icon: 'file-text', href: '#/documents', isNew: true },
    { id: 'assets', label: 'Assets & Equipment', icon: 'laptop', href: '#/assets', isNew: true },
    { id: 'training', label: 'Training & Development', icon: 'graduation-cap', href: '#/training', isNew: true },
    { id: 'expenses', label: 'Expenses & Reimbursements', icon: 'wallet', href: '#/expenses', isNew: true },
    { id: 'helpdesk', label: 'Helpdesk & Support', icon: 'life-buoy', href: '#/helpdesk', isNew: true },
    { id: 'analytics', label: 'Reports & Analytics', icon: 'line-chart', href: '#/analytics', isNew: true },
  ];

  const BOTTOM_ITEMS = [
    { id: 'configuration', label: 'Settings', icon: 'settings', href: '#/configuration' }
  ];

  function renderNavItem(item) {
    const isMatched = !query || item.label.toLowerCase().includes(query);
    const hasSub = item.subitems && item.subitems.length > 0;
    
    // Check if parent should be open
    const isParentActive = (
      activePath === `/${item.id}` ||
      (item.id === 'geo-attendance' && (activePath === '/geo-attendance' || activePath === '/staffing' || activePath.startsWith('/timesheets'))) ||
      (item.id === 'payroll' && activePath.startsWith('/payroll')) ||
      (item.id === 'it' && (activePath.startsWith('/it') || activePath.startsWith('/clients')))
    );

    const a = h('a', {
      class: 'nav-item',
      href: item.href,
      'data-id': item.id,
      'data-tooltip': collapsed ? item.label : null
    },
      icon(item.icon, { size: 18 }),
      h('span', { class: 'nav-item__label' }, item.label),
      item.isNew && !isParentActive ? h('span', { class: 'nav-badge-new' }, 'New') : null,
      (hasSub && isParentActive && !collapsed)
        ? icon('chevron-down', { size: 14, cls: 'nav-item__arrow' })
        : (item.hasChevron && !collapsed ? icon('chevron-right', { size: 14, cls: 'nav-item__arrow' }) : null)
    );

    let subMenuEl = null;
    if (hasSub && isParentActive && !collapsed) {
      const subRows = item.subitems.map((sub) => {
        let isSubActive = false;
        if (sub.match) {
          isSubActive = sub.match(activePath);
        } else if (sub.href === `#${activePath}`) {
          isSubActive = true;
        }

        return h('a', {
          class: `nav-subitem${isSubActive ? ' active' : ''}`,
          href: sub.href,
          'aria-current': isSubActive ? 'page' : null,
        },
          h('span', { class: 'nav-subitem__dot', 'aria-hidden': 'true' }),
          h('span', { class: 'nav-subitem__label' }, sub.label)
        );
      });

      subMenuEl = h('div', { class: 'nav-submenu' }, ...subRows);
    }

    const row = h('div', {
      class: 'nav-row',
      hidden: !isMatched ? true : null
    }, a, subMenuEl);

    return row;
  }

  function renderAiCard() {
    if (collapsed) {
      return h('button', {
        class: 'btn btn--ghost btn--icon sidebar__ai-collapsed',
        type: 'button',
        'data-tooltip': 'AI HR Assistant',
        onClick: openAiAssistantModal,
        style: 'margin: 12px auto; display: grid; place-items: center;'
      }, robotAvatarSvg());
    }

    const card = h('div', { class: 'sidebar__ai-card' },
      h('div', { style: 'display: flex; gap: 10px; align-items: center;' },
        robotAvatarSvg(),
        h('div', { class: 'sidebar__ai-text' },
          h('div', { class: 'sidebar__ai-title' }, 'AI HR Assistant'),
          h('div', { class: 'sidebar__ai-desc' }, 'Ask anything about your workforce')
        )
      ),
      h('button', {
        class: 'sidebar__ai-btn',
        type: 'button',
        onClick: openAiAssistantModal
      }, 'Try Now →')
    );

    return card;
  }

  function renderNav() {
    nav.replaceChildren(indicator);

    // 1. Core items (Dashboard, Employees, Org, Attendance, Leave, Payroll, Performance)
    const coreRows = CORE_ITEMS.map(renderNavItem);
    nav.append(...coreRows);

    // 2. Section divider: ─── NEW MODULES ───
    const sectionDivider = h('div', {
      class: 'sidebar__section-title',
      hidden: query ? true : null
    }, h('span', null, 'NEW MODULES'));
    nav.append(sectionDivider);

    // 3. New Modules
    const newRows = NEW_MODULES.map(renderNavItem);
    nav.append(...newRows);

    // 4. Settings
    const bottomRows = BOTTOM_ITEMS.map(renderNavItem);
    nav.append(...bottomRows);

    // 5. AI HR Assistant Widget
    nav.append(renderAiCard());

    if (query && !nav.querySelector('.nav-row:not([hidden])')) {
      nav.append(h('p', { class: 'nav-empty' }, `No pages match “${query}”`));
    }

    markActive();
    requestAnimationFrame(moveIndicator);
  }

  function markActive() {
    const allItems = [...CORE_ITEMS, ...NEW_MODULES, ...BOTTOM_ITEMS];
    const id = activeIdFor(activePath, allItems);
    nav.querySelectorAll('.nav-item').forEach((a) => {
      if (a.dataset.id === id || (id === 'home' && a.dataset.id === 'home')) {
        a.setAttribute('aria-current', 'page');
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function moveIndicator() {
    const a = [...nav.querySelectorAll('.nav-item[aria-current="page"]')].find((x) => x.offsetParent);
    if (!a) {
      indicator.style.setProperty('--ind-o', '0');
      return;
    }
    const row = a.closest('.nav-row');
    if (!row) {
      indicator.style.setProperty('--ind-o', '0');
      return;
    }
    indicator.style.setProperty('--ind-y', `${row.offsetTop}px`);
    indicator.style.setProperty('--ind-h', `${a.offsetHeight}px`);
    indicator.style.setProperty('--ind-o', '1');
  }

  function renderFoot() {
    foot.replaceChildren(
      h('button', {
        class: 'sidebar__collapse-btn',
        type: 'button',
        'aria-label': collapsed ? 'Expand sidebar' : 'Collapse sidebar',
        onClick: onToggleCollapse
      },
        icon(collapsed ? 'chevrons-right' : 'chevrons-left', { size: 16 }),
        collapsed ? null : h('span', null, 'Collapse Menu')
      )
    );
  }

  new ResizeObserver(() => moveIndicator()).observe(nav);
  nav.addEventListener('scroll', () => { if (nav.scrollLeft !== 0) nav.scrollLeft = 0; }, { passive: true });
  el.addEventListener('scroll', () => { if (el.scrollLeft !== 0) el.scrollLeft = 0; }, { passive: true });
  renderNav();
  renderFoot();

  return {
    el,
    rebuild() {
      search.placeholder = t('nav.search') || 'Search menu…';
      renderNav();
      renderFoot();
    },
    setActive(path) {
      activePath = path;
      renderNav();
      const target = nav.querySelector('.nav-item[aria-current="page"]');
      if (target) {
        target.scrollIntoView({ block: 'nearest', inline: 'start' });
        nav.scrollLeft = 0;
        el.scrollLeft = 0;
      }
    },
    setCollapsed(c) {
      collapsed = c;
      nav.querySelectorAll('.nav-item').forEach((a) => {
        if (c) a.setAttribute('data-tooltip', a.textContent.trim());
        else a.removeAttribute('data-tooltip');
      });
      renderNav();
      renderFoot();
      requestAnimationFrame(moveIndicator);
    },
  };
}
