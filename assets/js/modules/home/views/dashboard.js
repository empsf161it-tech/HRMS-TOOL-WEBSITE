/* Purpose: home dashboard view - client-matched pixel-perfect UI with 6 KPIs, Timesheet Stacked Bar, Client Donut, Quick Actions, Activities, Approvals, Upcoming, 12 Additional Features, and Ecosystem CTA. */
import { h, icon } from '../../../core/dom.js';
import { api } from '../../../services/api.js';
import { appStore } from '../../../core/store.js';
import { button } from '../../../components/eh-button.js';
import { toast, toastSuccess } from '../../../components/ui.js';
import { openModal } from '../../../components/ui.js';
import { statusBadge, avatar } from '../../../components/display.js';
import { router } from '../../../core/router.js';

export default async function dashboardView(ctx) {
  const user = appStore.user;
  const role = user?.role || 'super_admin';

  if (role === 'site_admin') {
    return renderSiteAdminDashboard(user);
  }
  if (role === 'employee') {
    return renderEmployeeDashboard(user, ctx);
  }
  if (role === 'manager') {
    return renderManagerDashboard(user, ctx);
  }
  // Admin & HR roles
  return renderAdminDashboard(user, ctx);
}

/* =========================================================================
   1. ADMIN / CLIENT-MATCHED DASHBOARD
   ========================================================================= */
/* =========================================================================
   1. ADMIN / CLIENT-MATCHED DASHBOARD (WORLD-CLASS SaaS UPGRADE)
   ========================================================================= */

/** Smooth animated number counter */
function animateCounter(el, targetStr, duration = 900) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = targetStr;
    return;
  }

  const match = targetStr.match(/^([^0-9.]*)([0-9.]+)(.*)$/);
  if (!match) {
    el.textContent = targetStr;
    return;
  }

  const prefix = match[1] || '';
  const targetNum = parseFloat(match[2]);
  const suffix = match[3] || '';
  const isFloat = match[2].includes('.');

  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // easeOutCubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = targetNum * ease;

    el.textContent = `${prefix}${isFloat ? current.toFixed(1) : Math.round(current)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = targetStr;
    }
  }

  requestAnimationFrame(update);
}

// Global approval count tracker for live UI reactivity
let currentPendingApprovalsCount = 12;

async function renderAdminDashboard(user, ctx) {
  const container = h('div', { class: 'dashboard-page' });

  // 1. HEADER / GREETING WITH LIVE PULSE & PERIOD POPOVER
  const greetingName = user?.name ? user.name.split(' ')[0] : 'Vignesh';

  let currentPeriod = 'Sep 2026';
  let datePopoverEl = null;

  const periodBtn = h('button', {
    class: 'dash-date-filter',
    type: 'button',
    'aria-label': 'Select period',
    onClick: (e) => {
      e.stopPropagation();
      togglePeriodPopover();
    }
  },
    icon('calendar', { size: 16 }),
    h('span', { class: 'dash-date-label' }, currentPeriod),
    icon('chevron-down', { size: 14 })
  );

  const actionsWrap = h('div', { class: 'dash-header__actions' }, periodBtn);

  function togglePeriodPopover() {
    if (datePopoverEl) {
      datePopoverEl.remove();
      datePopoverEl = null;
      return;
    }

    const periods = [
      { label: 'Sep 2026', desc: 'Current Active Cycle', multiplier: 1 },
      { label: 'Aug 2026', desc: 'Closed Period (Audited)', multiplier: 0.96 },
      { label: 'Jul 2026', desc: 'Archived Cycle', multiplier: 0.91 },
      { label: 'Q3 2026', desc: 'Quarter Consolidated', multiplier: 2.85 },
      { label: 'YTD 2026', desc: 'Fiscal Year 2026-27', multiplier: 5.6 },
    ];

    datePopoverEl = h('div', { class: 'dash-date-popover' },
      ...periods.map((p) => h('button', {
        class: `dash-date-option ${p.label === currentPeriod ? 'selected' : ''}`,
        type: 'button',
        onClick: () => {
          currentPeriod = p.label;
          periodBtn.querySelector('.dash-date-label').textContent = p.label;
          datePopoverEl.remove();
          datePopoverEl = null;

          // Re-animate KPIs with updated period targets
          updateKpisForPeriod(p.multiplier, p.label);
          toastSuccess(`Active period switched to ${p.label}.`);
        }
      },
        h('div', null,
          h('div', null, p.label),
          h('small', { style: 'font-size: 10.5px; opacity: 0.7; font-weight: normal;' }, p.desc)
        ),
        p.label === currentPeriod ? icon('check', { size: 14 }) : null
      ))
    );

    actionsWrap.append(datePopoverEl);

    const onOutside = (evt) => {
      if (datePopoverEl && !datePopoverEl.contains(evt.target) && !periodBtn.contains(evt.target)) {
        datePopoverEl.remove();
        datePopoverEl = null;
        document.removeEventListener('click', onOutside);
        window.removeEventListener('scroll', onOutside);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', onOutside);
      window.addEventListener('scroll', onOutside, { passive: true, once: true });
    }, 10);
  }

  const header = h('div', { class: 'dash-header dash-animate-fade' },
    h('div', { class: 'dash-header__titles' },
      h('h1', { class: 'dash-header__title' },
        `Welcome back, ${greetingName}!`,
        h('span', { class: 'dash-header__live-indicator' },
          h('span', { class: 'dash-header__live-dot' }),
          'System Live'
        )
      ),
      h('p', { class: 'dash-header__subtitle' }, "Here's what's happening at Ellowring enterprise ecosystem today.")
    ),
    actionsWrap
  );
  container.append(header);

  // 2. ROW OF 6 KEY METRICS / KPI CARDS WITH LIVE NUMBER ANIMATION
  const kpiGrid = h('div', { class: 'dash-kpi-grid' });
  const kpiItems = [
    {
      tone: 'blue',
      glow: '#2563EB',
      icon: 'users',
      val: '248',
      baseNum: 248,
      format: (n) => String(Math.round(n)),
      label: 'Total Employees',
      trend: '12%',
      hint: 'vs last month',
      route: '/core-hr'
    },
    {
      tone: 'cyan',
      glow: '#0284C7',
      icon: 'building-2',
      val: '12',
      baseNum: 12,
      format: (n) => String(Math.round(n)),
      label: 'Client Companies',
      trend: '20%',
      hint: 'vs last month',
      route: '/it'
    },
    {
      tone: 'purple',
      glow: '#7C3AED',
      icon: 'user-check',
      val: '186',
      baseNum: 186,
      format: (n) => String(Math.round(n)),
      label: 'Deployed Employees',
      trend: '8%',
      hint: 'vs last month',
      route: '/geo-attendance'
    },
    {
      tone: 'sky',
      glow: '#0284C7',
      icon: 'clock',
      val: '92%',
      baseNum: 92,
      format: (n) => `${Math.min(100, Math.round(n))}%`,
      label: 'Timesheet Submitted',
      trend: '6%',
      hint: 'vs last month',
      route: '/timesheets'
    },
    {
      tone: 'mint',
      glow: '#16A34A',
      icon: 'rupee',
      val: '₹48.5L',
      baseNum: 48.5,
      format: (n) => `₹${n.toFixed(1)}L`,
      label: 'Payroll Processed',
      trend: '14%',
      hint: 'vs last month',
      route: '/payroll'
    },
    {
      tone: 'teal',
      glow: '#0D9488',
      icon: 'file-text',
      val: '₹62.3L',
      baseNum: 62.3,
      format: (n) => `₹${n.toFixed(1)}L`,
      label: 'Client Invoiced',
      trend: '18%',
      hint: 'vs last month',
      route: '/compliance'
    }
  ];

  const cardValueEls = [];

  kpiItems.forEach((k, idx) => {
    const valueEl = h('div', { class: 'kpi-card__value' }, '0');
    cardValueEls.push({ el: valueEl, item: k });

    const card = h('div', {
      class: `kpi-card dash-animate-fade dash-delay-${idx + 1}`,
      style: `--card-glow: ${k.glow};`,
      tabindex: '0',
      role: 'button',
      'aria-label': `${k.label}: ${k.val}`,
      onClick: () => router.navigate(k.route)
    },
      h('div', { class: 'kpi-card__top' },
        h('div', { class: `kpi-card__icon-box kpi-card__icon-box--${k.tone}` },
          k.icon === 'rupee'
            ? h('span', { style: 'font-weight: 700; font-size: 18px;' }, '₹')
            : icon(k.icon, { size: 18 })
        ),
        icon('arrow-up-right', { size: 14, cls: 'text-muted' })
      ),
      valueEl,
      h('div', { class: 'kpi-card__label' }, k.label),
      h('div', { class: 'kpi-card__trend' },
        h('span', { class: 'kpi-card__trend-val' }, `↑ ${k.trend}`),
        h('span', { class: 'kpi-card__trend-text' }, k.hint)
      )
    );

    kpiGrid.append(card);

    // Trigger smooth count-up animation on initial view
    setTimeout(() => {
      animateCounter(valueEl, k.val, 850 + idx * 70);
    }, 50);
  });
  container.append(kpiGrid);

  function updateKpisForPeriod(multiplier, label) {
    cardValueEls.forEach(({ el, item }, idx) => {
      let targetVal;
      if (item.format) {
        targetVal = item.format(item.baseNum * (multiplier || 1));
      } else {
        targetVal = item.val;
      }
      animateCounter(el, targetVal, 750 + idx * 60);
    });
  }

  // 3. MIDDLE ROW 1: CHARTS & QUICK ACTIONS
  const middleRow1 = h('div', { class: 'dash-middle-row dash-animate-fade dash-delay-3' });

  // 3A. Card 1: Timesheet Overview (Stacked Bar Chart with Time Segment Tabs & Floating Tooltip)
  const barCard = h('div', { class: 'chart-card' });
  const chartComponent = renderTimesheetStackedChart();
  barCard.append(chartComponent.el);

  // 3B. Card 2: Client-wise Deployment (Donut Chart with Interactive Slice Hover & Center Label)
  const donutCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h3', { class: 'chart-card__title' }, 'Client-wise Deployment'),
      h('span', { class: 'text-xs text-muted fw-600' }, '186 Active')
    ),
    renderDeploymentDonut()
  );

  // 3C. Card 3: Quick Actions (Vertical List with hover glide)
  const quickActionsCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h3', { class: 'chart-card__title' }, 'Quick Actions'),
      h('span', { class: 'text-xs text-muted fw-600' }, 'Shortcuts')
    ),
    renderQuickActionsList()
  );

  middleRow1.append(barCard, donutCard, quickActionsCard);
  container.append(middleRow1);

  // 4. MIDDLE ROW 2: ACTIVITIES, APPROVALS, UPCOMING (3 COLUMNS)
  const middleRow2 = h('div', { class: 'dash-three-col dash-animate-fade dash-delay-5' });

  // 4A. Recent Activities
  const activitiesCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('div', { class: 'panel-card__title-wrap' },
        h('h3', { class: 'panel-card__title' }, 'Recent Activities'),
        h('span', { class: 'badge badge--success', style: 'font-size: 10px; font-weight: 700;' }, 'Live')
      ),
      h('a', { class: 'panel-card__link', href: '#/audit' }, 'View All')
    ),
    renderRecentActivities()
  );

  // 4B. Pending Approvals (With live counter decrement and inline action support)
  const approvalsBadge = h('span', { class: 'panel-card__badge' }, String(currentPendingApprovalsCount));
  const approvalsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('div', { class: 'panel-card__title-wrap' },
        h('h3', { class: 'panel-card__title' }, 'Pending Approvals'),
        approvalsBadge
      ),
      h('a', { class: 'panel-card__link', href: '#/mss' }, 'View All')
    ),
    renderPendingApprovals((newCount) => {
      currentPendingApprovalsCount = newCount;
      approvalsBadge.textContent = String(newCount);
      if (newCount === 0) {
        approvalsBadge.style.background = '#10B981';
      }
    })
  );

  // 4C. Upcoming Milestones
  const upcomingCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('h3', { class: 'panel-card__title' }, 'Upcoming'),
      h('a', { class: 'panel-card__link', href: '#/core-hr' }, 'View All')
    ),
    renderUpcomingMilestones()
  );

  middleRow2.append(activitiesCard, approvalsCard, upcomingCard);
  container.append(middleRow2);

  // 5. LOWER SECTION: ADDITIONAL FEATURES (12 CARDS GRID WITH LINEAR/STRIPE BENTO AESTHETICS)
  const featuresSection = h('div', { class: 'features-section dash-animate-fade dash-delay-6' },
    h('div', { class: 'features-section__head' },
      h('h2', { class: 'features-section__title' },
        icon('sparkles', { size: 20, cls: 'color-accent' }),
        h('span', null, 'Additional Features to Add (Based on Your Current System)')
      ),
      h('p', { class: 'features-section__sub' }, 'Take your HRMS to the next level with these powerful enterprise modules')
    ),
    render12FeatureCards()
  );
  container.append(featuresSection);

  // 6. BOTTOM BANNER / CTA & TAGLINE
  const promoSection = h('div', { class: 'stack gap-2 dash-animate-fade dash-delay-7', style: 'margin-top: 4px;' },
    h('div', { class: 'dash-bottom-promo' },
      h('div', { class: 'dash-bottom-promo__left' },
        h('div', { class: 'dash-bottom-promo__icon' }, '🚀'),
        h('div', { class: 'dash-bottom-promo__content' },
          h('div', { class: 'dash-bottom-promo__title' }, 'From HR Management to Complete Staffing & Payroll Ecosystem'),
          h('div', { class: 'dash-bottom-promo__sub' }, 'Hire • Deploy • Track • Manage • Bill • Grow')
        )
      ),
      h('button', {
        class: 'dash-bottom-promo__btn',
        type: 'button',
        onClick: openEcosystemRoadmapModal
      },
        h('span', null, "Let's Build the Next Version"),
        icon('arrow-right', { size: 15 })
      )
    ),
    h('div', { class: 'dash-tagline' }, 'One Platform. Endless Possibilities.')
  );
  container.append(promoSection);

  return container;
}

/* =========================================================================
   COMPONENTS & CHART RENDERERS
   ========================================================================= */

/** Period Selector modal/popover */
function openPeriodSelector() {
  openModal({
    title: 'Select Active Period',
    size: 'sm',
    body: h('div', { class: 'stack gap-3' },
      h('p', { class: 'text-sm text-muted' }, 'Select a billing and attendance cycle:'),
      ...['September 2026 (Active)', 'August 2026 (Closed)', 'July 2026 (Archived)', 'October 2026 (Upcoming)'].map((p, idx) =>
        h('button', {
          class: `btn ${idx === 0 ? 'btn--primary' : 'btn--ghost'} btn--block`,
          style: 'justify-content: flex-start; text-align: left;',
          type: 'button',
          onClick: () => {
            toast({ type: 'info', title: 'Period Updated', message: `Displaying metrics for ${p.split(' ')[0]} 2026` });
          }
        }, p)
      )
    )
  });
}

/** Render Stacked Timesheet Chart with Time Segment Tabs & Interactive Floating Tooltip */
function renderTimesheetStackedChart() {
  const container = h('div', { class: 'stack gap-3', style: 'width: 100%;' });

  // Time segment tab datasets
  const dataSets = {
    thisWeek: [
      { day: 'Mon', date: 'Sep 15', sub: 48, pen: 44, app: 48, rej: 8 },
      { day: 'Tue', date: 'Sep 16', sub: 64, pen: 42, app: 52, rej: 6 },
      { day: 'Wed', date: 'Sep 17', sub: 72, pen: 32, app: 64, rej: 8 },
      { day: 'Thu', date: 'Sep 18', sub: 58, pen: 42, app: 58, rej: 6 },
      { day: 'Fri', date: 'Sep 19', sub: 74, pen: 36, app: 48, rej: 8 },
      { day: 'Sat', date: 'Sep 20', sub: 34, pen: 28, app: 38, rej: 6 },
      { day: 'Sun', date: 'Sep 21', sub: 46, pen: 30, app: 46, rej: 6 },
    ],
    lastWeek: [
      { day: 'Mon', date: 'Sep 08', sub: 42, pen: 38, app: 45, rej: 5 },
      { day: 'Tue', date: 'Sep 09', sub: 56, pen: 40, app: 50, rej: 8 },
      { day: 'Wed', date: 'Sep 10', sub: 68, pen: 30, app: 60, rej: 6 },
      { day: 'Thu', date: 'Sep 11', sub: 52, pen: 36, app: 55, rej: 7 },
      { day: 'Fri', date: 'Sep 12', sub: 70, pen: 32, app: 46, rej: 6 },
      { day: 'Sat', date: 'Sep 13', sub: 30, pen: 24, app: 35, rej: 5 },
      { day: 'Sun', date: 'Sep 14', sub: 40, pen: 28, app: 42, rej: 4 },
    ],
    monthly: [
      { day: 'W1', date: 'Week 1', sub: 190, pen: 140, app: 180, rej: 24 },
      { day: 'W2', date: 'Week 2', sub: 210, pen: 130, app: 195, rej: 20 },
      { day: 'W3', date: 'Week 3', sub: 230, pen: 125, app: 205, rej: 22 },
      { day: 'W4', date: 'Week 4', sub: 198, pen: 110, app: 190, rej: 18 },
    ]
  };

  let activeTab = 'thisWeek';

  // Header with Title, Legend, and Segmented Control
  const head = h('div', { class: 'chart-card__head' },
    h('div', { style: 'display: flex; align-items: center; gap: 12px; flex-wrap: wrap;' },
      h('h3', { class: 'chart-card__title' }, 'Timesheet Overview'),
      h('div', { class: 'chart-time-tabs' },
        h('button', {
          class: 'chart-time-tab active',
          type: 'button',
          onClick: (e) => switchTab('thisWeek', e.target)
        }, 'This Week'),
        h('button', {
          class: 'chart-time-tab',
          type: 'button',
          onClick: (e) => switchTab('lastWeek', e.target)
        }, 'Last Week'),
        h('button', {
          class: 'chart-time-tab',
          type: 'button',
          onClick: (e) => switchTab('monthly', e.target)
        }, 'Month')
      )
    ),
    h('div', { class: 'chart-card__legend' },
      h('span', { class: 'chart-card__legend-item' },
        h('span', { class: 'chart-card__legend-dot', style: 'background: #2563EB;' }),
        'Submitted'
      ),
      h('span', { class: 'chart-card__legend-item' },
        h('span', { class: 'chart-card__legend-dot', style: 'background: #F59E0B;' }),
        'Pending'
      ),
      h('span', { class: 'chart-card__legend-item' },
        h('span', { class: 'chart-card__legend-dot', style: 'background: #10B981;' }),
        'Approved'
      ),
      h('span', { class: 'chart-card__legend-item' },
        h('span', { class: 'chart-card__legend-dot', style: 'background: #EF4444;' }),
        'Rejected'
      )
    )
  );

  // SVG Chart Stage
  const stage = h('div', { style: 'position: relative; width: 100%; height: 200px;' });

  // Floating Glass Tooltip
  const tooltip = h('div', { class: 'chart-tooltip' });
  stage.append(tooltip);

  function switchTab(tabKey, btn) {
    activeTab = tabKey;
    head.querySelectorAll('.chart-time-tab').forEach((t) => t.classList.remove('active'));
    btn.classList.add('active');
    drawChart();
  }

  function drawChart() {
    const values = dataSets[activeTab];
    const isMonthly = activeTab === 'monthly';
    const maxVal = isMonthly ? 600 : 200;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 380 180');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.overflow = 'visible';

    // Y-axis grid lines
    const gridSteps = isMonthly ? [0, 150, 300, 450, 600] : [0, 50, 100, 150, 200];
    let gridLines = '';
    gridSteps.forEach((step) => {
      const y = 145 - (step / maxVal) * 135;
      gridLines += `
        <text x="22" y="${y + 4}" fill="#94A3B8" font-size="10" text-anchor="end" font-family="system-ui">${step}</text>
        <line x1="28" y1="${y}" x2="375" y2="${y}" stroke="currentColor" opacity="0.08" stroke-width="1" stroke-dasharray="${step === 0 ? 'none' : '3 3'}"/>
      `;
    });

    // Bars
    const barCount = values.length;
    const barWidth = isMonthly ? 32 : 22;
    const startX = isMonthly ? 65 : 50;
    const barSpacing = isMonthly ? 82 : 46;

    let barsHtml = '';
    values.forEach((d, i) => {
      const x = startX + i * barSpacing;
      const baseScale = 135 / maxVal;

      const hSub = d.sub * baseScale;
      const hPen = d.pen * baseScale;
      const hApp = d.app * baseScale;
      const hRej = d.rej * baseScale;

      const ySub = 145 - hSub;
      const yPen = ySub - hPen;
      const yApp = yPen - hApp;
      const yRej = yApp - hRej;

      const totalDay = d.sub + d.pen + d.app + d.rej;

      barsHtml += `
        <g class="bar-group" data-idx="${i}" style="cursor: pointer; transition: opacity 0.2s ease;">
          <!-- Base Submitted (Blue) -->
          <rect x="${x}" y="${ySub}" width="${barWidth}" height="${hSub}" fill="#2563EB" rx="0" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);"/>
          <!-- Pending (Orange) -->
          <rect x="${x}" y="${yPen}" width="${barWidth}" height="${hPen}" fill="#F59E0B" rx="0" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);"/>
          <!-- Approved (Emerald Green) -->
          <rect x="${x}" y="${yApp}" width="${barWidth}" height="${hApp}" fill="#10B981" rx="0" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);"/>
          <!-- Rejected (Red) -->
          <rect x="${x}" y="${yRej}" width="${barWidth}" height="${hRej}" fill="#EF4444" rx="3 3 0 0" style="transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);"/>
          <!-- X Axis Label -->
          <text x="${x + barWidth / 2}" y="165" fill="#64748B" font-size="11" font-weight="600" text-anchor="middle" font-family="system-ui">${d.day}</text>
        </g>
      `;
    });

    svg.innerHTML = gridLines + barsHtml;

    // Attach interactive tooltips and click feedback
    svg.querySelectorAll('.bar-group').forEach((g) => {
      const idx = parseInt(g.dataset.idx, 10);
      const d = values[idx];
      const totalDay = d.sub + d.pen + d.app + d.rej;

      g.addEventListener('mouseenter', (e) => {
        // Dim other bars
        svg.querySelectorAll('.bar-group').forEach((other) => {
          if (other !== g) other.style.opacity = '0.4';
        });

        tooltip.innerHTML = `
          <div class="chart-tooltip__title">
            <span>${d.date || d.day}</span>
            <span style="color: #60A5FA;">${totalDay} Total</span>
          </div>
          <div class="chart-tooltip__row"><span style="color:#60A5FA">● Submitted:</span> <strong>${d.sub}</strong></div>
          <div class="chart-tooltip__row"><span style="color:#FBBF24">● Pending:</span> <strong>${d.pen}</strong></div>
          <div class="chart-tooltip__row"><span style="color:#34D399">● Approved:</span> <strong>${d.app}</strong></div>
          <div class="chart-tooltip__row"><span style="color:#F87171">● Rejected:</span> <strong>${d.rej}</strong></div>
        `;

        const bbox = g.getBoundingClientRect();
        const stageBox = stage.getBoundingClientRect();
        const leftPos = bbox.left - stageBox.left + bbox.width / 2;
        const topPos = Math.max(10, bbox.top - stageBox.top - 105);

        tooltip.style.left = `${Math.min(stageBox.width - 150, Math.max(10, leftPos - 65))}px`;
        tooltip.style.top = `${topPos}px`;
        tooltip.classList.add('visible');
      });

      g.addEventListener('mouseleave', () => {
        svg.querySelectorAll('.bar-group').forEach((other) => {
          other.style.opacity = '1';
        });
        tooltip.classList.remove('visible');
      });

      g.addEventListener('click', () => {
        toast({
          type: 'info',
          title: `${d.date || d.day} Timesheet Audit`,
          message: `${totalDay} records logged · ${d.app} approved by client`
        });
      });
    });

    const oldSvg = stage.querySelector('svg');
    if (oldSvg) oldSvg.remove();
    stage.prepend(svg);
  }

  drawChart();
  container.append(head, stage);
  return { el: container };
}

/** Render Client Deployment Donut Chart with Dynamic Hover Details & Center Highlight */
function renderDeploymentDonut() {
  const container = h('div', { class: 'donut-layout' });

  const clients = [
    { name: 'TCS', count: 42, color: '#2563EB', pct: '22.6%' },
    { name: 'Infosys', count: 36, color: '#06B6D4', pct: '19.4%' },
    { name: 'Wipro', count: 28, color: '#38BDF8', pct: '15.1%' },
    { name: 'HCL', count: 22, color: '#F59E0B', pct: '11.8%' },
    { name: 'Accenture', count: 18, color: '#F87171', pct: '9.7%' },
    { name: 'Others', count: 40, color: '#CBD5E1', pct: '21.5%' },
  ];

  const total = clients.reduce((acc, c) => acc + c.count, 0); // 186

  // SVG Donut
  const donutWrap = h('div', { class: 'donut-chart-wrap' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 160 160');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');

  const radius = 58;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius; // ~364.42
  let accumulatedAngle = 0;

  let segmentsHtml = '';
  clients.forEach((c) => {
    const fraction = c.count / total;
    const dashLength = fraction * circumference;
    const dashOffset = -accumulatedAngle * circumference;
    accumulatedAngle += fraction;

    segmentsHtml += `
      <circle cx="80" cy="80" r="${radius}"
        fill="transparent"
        stroke="${c.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${dashLength} ${circumference - dashLength}"
        stroke-dashoffset="${dashOffset}"
        transform="rotate(-90 80 80)"
        style="transition: stroke-width 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease; cursor: pointer;"
        data-client="${c.name}"
        data-count="${c.count}"
        data-pct="${c.pct}"
        data-color="${c.color}"
      />
    `;
  });

  svg.innerHTML = segmentsHtml;

  // Center cutout text (with live state transitions on hover)
  const centerVal = h('div', { class: 'donut-center-val' }, String(total));
  const centerLbl = h('div', { class: 'donut-center-lbl' }, 'Deployed');

  const centerText = h('div', { class: 'donut-center-text' },
    centerVal,
    centerLbl
  );

  donutWrap.append(svg, centerText);

  // Right-side legend list
  const legendList = h('div', { class: 'donut-legend-list' });
  const legendRows = [];

  clients.forEach((c) => {
    const row = h('div', {
      class: 'donut-legend-row',
      'data-client': c.name,
      style: 'cursor: pointer;',
      onClick: () => {
        toast({ type: 'info', title: `${c.name} Deployments`, message: `${c.count} active consultants currently deployed at ${c.name} (${c.pct} share)` });
      },
      onMouseEnter: () => highlightClient(c.name),
      onMouseLeave: () => resetDonut()
    },
      h('span', { class: 'donut-legend-client' },
        h('span', { style: `width: 8px; height: 8px; border-radius: 50%; background: ${c.color}; flex-shrink: 0;` }),
        h('span', null, c.name)
      ),
      h('span', { class: 'donut-legend-count' }, String(c.count))
    );
    legendRows.push(row);
    legendList.append(row);
  });

  function highlightClient(clientName) {
    const c = clients.find((x) => x.name === clientName);
    if (!c) return;

    centerVal.textContent = String(c.count);
    centerVal.style.color = c.color;
    centerLbl.textContent = `${c.name} (${c.pct})`;
    centerLbl.style.color = 'var(--text)';

    svg.querySelectorAll('circle').forEach((circle) => {
      if (circle.dataset.client === clientName) {
        circle.setAttribute('stroke-width', '30');
        circle.style.opacity = '1';
      } else {
        circle.setAttribute('stroke-width', '24');
        circle.style.opacity = '0.35';
      }
    });

    legendRows.forEach((r) => {
      if (r.dataset.client === clientName) r.classList.add('highlighted');
      else r.classList.remove('highlighted');
    });
  }

  function resetDonut() {
    centerVal.textContent = String(total);
    centerVal.style.color = 'var(--text)';
    centerLbl.textContent = 'Deployed';
    centerLbl.style.color = 'var(--text-muted)';

    svg.querySelectorAll('circle').forEach((circle) => {
      circle.setAttribute('stroke-width', '24');
      circle.style.opacity = '1';
    });

    legendRows.forEach((r) => r.classList.remove('highlighted'));
  }

  // Attach hover effects directly to svg slices
  svg.querySelectorAll('circle').forEach((circle) => {
    circle.addEventListener('mouseenter', () => {
      highlightClient(circle.dataset.client);
    });
    circle.addEventListener('mouseleave', () => {
      resetDonut();
    });
    circle.addEventListener('click', () => {
      toast({
        type: 'info',
        title: `${circle.dataset.client} Deployments`,
        message: `${circle.dataset.count} deployed staff (${circle.dataset.pct} of total workforce)`
      });
    });
  });

  container.append(donutWrap, legendList);
  return container;
}

/** Render Quick Actions List with Arrow Slide & Micro-Interactions */
function renderQuickActionsList() {
  const container = h('div', { class: 'quick-action-list' });

  const actions = [
    { label: 'Add Employee', sub: '1-click onboarding', icon: 'user-plus', color: '#16A34A', onClick: openAddEmployeeModal },
    { label: 'Create Timesheet', sub: 'Log billable hours', icon: 'clock', color: '#16A34A', onClick: openCreateTimesheetModal },
    { label: 'Process Payroll', sub: 'India statutory run', icon: 'wallet', color: '#16A34A', onClick: () => router.navigate('/payroll') },
    { label: 'Generate Invoice', sub: 'GST billing PDF', icon: 'file-text', color: '#16A34A', onClick: openGenerateInvoiceModal },
    { label: 'Add Client', sub: 'Enterprise account', icon: 'building-2', color: '#2563EB', onClick: openAddClientModal },
    { label: 'Create Job Opening', sub: 'ATS candidate requisition', icon: 'briefcase', color: '#2563EB', onClick: openCreateJobOpeningModal },
  ];

  actions.forEach((a) => {
    const btn = h('button', {
      class: 'quick-action-btn',
      type: 'button',
      onClick: a.onClick
    },
      h('div', { class: 'quick-action-btn__left' },
        h('span', { class: 'quick-action-btn__icon', style: `color: ${a.color}; background: color-mix(in srgb, ${a.color} 12%, transparent);` },
          icon(a.icon, { size: 16 })
        ),
        h('div', { style: 'display: flex; flex-direction: column; text-align: left; line-height: 1.25;' },
          h('span', { class: 'quick-action-btn__label' }, a.label),
          h('small', { style: 'font-size: 10.5px; color: var(--text-muted); font-weight: normal;' }, a.sub)
        )
      ),
      icon('arrow-right', { size: 14, cls: 'quick-action-btn__arrow' })
    );
    container.append(btn);
  });

  return container;
}

/** Render Recent Activities List */
function renderRecentActivities() {
  const container = h('div', { class: 'activity-list' });

  const items = [
    {
      icon: 'check',
      bg: '#DCFCE7',
      color: '#16A34A',
      bold: 'Arun Kumar',
      text: ' submitted timesheet for Sep 15, 2026',
      time: '10 mins ago',
      link: '#/timesheets'
    },
    {
      icon: 'shield-check',
      bg: '#EFF6FF',
      color: '#2563EB',
      bold: 'Client approval',
      text: ' received from TCS (Project Alpha)',
      time: '45 mins ago',
      link: '#/it'
    },
    {
      icon: 'users',
      bg: '#F3E8FF',
      color: '#7C3AED',
      bold: '2 new candidates',
      text: ' moved to Interview stage',
      time: '1 hour ago',
      link: '#/recruitment'
    },
    {
      icon: 'wallet',
      bg: '#DCFCE7',
      color: '#16A34A',
      bold: 'Payroll processed',
      text: ' for Aug 2026',
      time: '2 hours ago',
      link: '#/payroll'
    },
    {
      icon: 'building-2',
      bg: '#EFF6FF',
      color: '#2563EB',
      bold: 'New client onboarding',
      text: ' - TechNova Solutions',
      time: '3 hours ago',
      link: '#/it'
    },
  ];

  items.forEach((it) => {
    const el = h('div', {
      class: 'activity-item',
      style: 'cursor: pointer;',
      onClick: () => { location.hash = it.link; }
    },
      h('div', { class: 'activity-item__icon', style: `background: ${it.bg}; color: ${it.color};` },
        icon(it.icon, { size: 14 })
      ),
      h('div', { class: 'activity-item__main' },
        h('div', { class: 'activity-item__text' },
          h('strong', null, it.bold),
          it.text
        ),
        h('div', { class: 'activity-item__time' }, it.time)
      )
    );
    container.append(el);
  });

  return container;
}

/** Render Pending Approvals List with Inline Actions and Live Counter Decrement */
function renderPendingApprovals(onCountChange) {
  const container = h('div', { class: 'approval-list' });

  const items = [
    {
      id: 'appr-1',
      title: 'Timesheet approval (5)',
      sub: 'Client: TCS, Infosys',
      icon: 'file-text',
      bg: '#FEE2E2',
      color: '#EF4444',
      type: 'Timesheet'
    },
    {
      id: 'appr-2',
      title: 'Leave requests (3)',
      sub: 'Awaiting manager approval',
      icon: 'calendar-days',
      bg: '#FEF3C7',
      color: '#D97706',
      type: 'Leave'
    },
    {
      id: 'appr-3',
      title: 'Expense claims (2)',
      sub: 'Total amount: ₹12,450',
      icon: 'receipt',
      bg: '#DBEAFE',
      color: '#2563EB',
      type: 'Expense'
    },
    {
      id: 'appr-4',
      title: 'Invoice approval (2)',
      sub: 'Client: HCL, Wipro',
      icon: 'file-check',
      bg: '#DCFCE7',
      color: '#16A34A',
      type: 'Invoice'
    },
  ];

  let remaining = currentPendingApprovalsCount;

  items.forEach((it) => {
    const approveBtn = h('button', {
      class: 'approval-mini-btn approval-mini-btn--approve',
      type: 'button',
      onClick: (e) => {
        e.stopPropagation();
        el.classList.add('resolved');
        approveBtn.textContent = '✓ Done';
        approveBtn.disabled = true;
        rejectBtn.remove();
        remaining = Math.max(0, remaining - 1);
        if (onCountChange) onCountChange(remaining);
        toastSuccess(`${it.title} approved and signed.`);
      }
    }, '✓ Approve');

    const rejectBtn = h('button', {
      class: 'approval-mini-btn approval-mini-btn--reject',
      type: 'button',
      onClick: (e) => {
        e.stopPropagation();
        el.classList.add('resolved');
        rejectBtn.textContent = '✕ Rejected';
        rejectBtn.disabled = true;
        approveBtn.remove();
        remaining = Math.max(0, remaining - 1);
        if (onCountChange) onCountChange(remaining);
        toast({ type: 'warning', title: 'Action Rejected', message: `${it.title} was rejected.` });
      }
    }, '✕');

    const el = h('div', {
      class: 'approval-item',
      onClick: () => openQuickApprovalModal(it)
    },
      h('div', { class: 'approval-item__left' },
        h('div', { class: 'approval-item__icon', style: `background: ${it.bg}; color: ${it.color};` },
          icon(it.icon, { size: 18 })
        ),
        h('div', { class: 'approval-item__main' },
          h('div', { class: 'approval-item__title' }, it.title),
          h('div', { class: 'approval-item__sub' }, it.sub)
        )
      ),
      h('div', { class: 'approval-item__actions' },
        approveBtn,
        rejectBtn,
        icon('chevron-right', { size: 14, cls: 'approval-item__chevron' })
      )
    );
    container.append(el);
  });

  return container;
}

/** Render Upcoming Milestones List with Calendar Date Chips */
function renderUpcomingMilestones() {
  const container = h('div', { class: 'upcoming-list' });

  const items = [
    {
      title: 'Employee Onboarding',
      sub: '3 candidates joining team',
      date: 'Sep 18',
      year: '2026',
      icon: 'user-plus',
      bg: '#EFF6FF',
      color: '#2563EB'
    },
    {
      title: 'Contract Renewal',
      sub: 'TechNova Solutions Ltd',
      date: 'Sep 25',
      year: '2026',
      icon: 'file-text',
      bg: '#FEF3C7',
      color: '#D97706'
    },
    {
      title: 'Payroll Processing',
      sub: 'September 2026 Run',
      date: 'Sep 28',
      year: '2026',
      icon: 'check-circle-2',
      bg: '#DCFCE7',
      color: '#16A34A'
    },
    {
      title: 'Client Review Meeting',
      sub: 'TCS - Project Alpha Q3',
      date: 'Sep 30',
      year: '2026',
      icon: 'video',
      bg: '#F3E8FF',
      color: '#7C3AED'
    },
  ];

  items.forEach((it) => {
    const el = h('div', {
      class: 'upcoming-item',
      style: 'cursor: pointer;',
      onClick: () => {
        toast({ type: 'info', title: it.title, message: `${it.sub} scheduled for ${it.date}, ${it.year}` });
      }
    },
      h('div', { class: 'upcoming-item__left' },
        h('div', { class: 'upcoming-item__icon', style: `background: ${it.bg}; color: ${it.color};` },
          icon(it.icon, { size: 16 })
        ),
        h('div', null,
          h('div', { class: 'upcoming-item__title' }, it.title),
          h('div', { class: 'upcoming-item__sub' }, it.sub)
        )
      ),
      h('span', { class: 'upcoming-item__date' }, `${it.date}, ${it.year}`)
    );
    container.append(el);
  });

  return container;
}

/** Render the 12 Additional Features Cards Grid (Linear/Stripe Bento Aesthetics) */
function render12FeatureCards() {
  const grid = h('div', { class: 'features-grid' });

  const features = [
    {
      title: 'Recruitment / ATS',
      icon: 'user-search',
      bg: '#F0FDF4',
      border: '#BBF7D0',
      iconBg: '#10B981',
      accent: '#059669',
      bullets: ['Job posting', 'Candidate tracking', 'Interview management'],
      route: '/recruitment'
    },
    {
      title: 'Clients & Projects',
      icon: 'briefcase',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      iconBg: '#2563EB',
      accent: '#1D4ED8',
      bullets: ['Client management', 'Multiple branches', 'Billing terms'],
      route: '/it'
    },
    {
      title: 'Staffing / Deployments',
      icon: 'users-round',
      bg: '#FFF7ED',
      border: '#FED7AA',
      iconBg: '#F97316',
      accent: '#C2410C',
      bullets: ['Employee deployment', 'Client mapping', 'Deployment history'],
      route: '/geo-attendance'
    },
    {
      title: 'Timesheet Management',
      icon: 'clock',
      bg: '#ECFDF5',
      border: '#A7F3D0',
      iconBg: '#10B981',
      accent: '#047857',
      bullets: ['Daily timesheet', 'Client approval', 'Billable hours & OT'],
      route: '/timesheets'
    },
    {
      title: 'Client Portal',
      icon: 'monitor',
      bg: '#EFF6FF',
      border: '#BFDBFE',
      iconBg: '#1D4ED8',
      accent: '#1E40AF',
      bullets: ['Client login', 'Approve timesheets', 'View invoices'],
      route: '/ess'
    },
    {
      title: 'Invoicing & Billing',
      icon: 'receipt',
      bg: '#FEF2F2',
      border: '#FECACA',
      iconBg: '#EF4444',
      accent: '#B91C1C',
      bullets: ['Auto invoice generation', 'GST support', 'Payment tracking'],
      route: '/compliance'
    },
    {
      title: 'Contract Management',
      icon: 'file-text',
      bg: '#FFFBEB',
      border: '#FDE68A',
      iconBg: '#F59E0B',
      accent: '#B45309',
      bullets: ['MSA, SOW, NDA', 'Expiry alerts', 'Document storage'],
      route: '/documents'
    },
    {
      title: 'Assets & Equipment',
      icon: 'laptop',
      bg: '#F0FDFA',
      border: '#99F6E4',
      iconBg: '#0D9488',
      accent: '#0F766E',
      bullets: ['Laptop, ID card, devices', 'Assign & track', 'Return management'],
      route: '/assets'
    },
    {
      title: 'Training & Development',
      icon: 'graduation-cap',
      bg: '#FAF5FF',
      border: '#E9D5FF',
      iconBg: '#8B5CF6',
      accent: '#6D28D9',
      bullets: ['Course assignment', 'Certification tracking', 'Skill matrix'],
      route: '/training'
    },
    {
      title: 'Expenses & Reimbursement',
      icon: 'wallet',
      bg: '#F7FEE7',
      border: '#D9F99D',
      iconBg: '#84CC16',
      accent: '#4D7C0F',
      bullets: ['Travel, Food, Others', 'Approval workflow', 'Policy management'],
      route: '/expenses'
    },
    {
      title: 'Helpdesk & Support',
      icon: 'life-buoy',
      bg: '#ECFEFF',
      border: '#A5F3FC',
      iconBg: '#06B6D4',
      accent: '#0E7490',
      bullets: ['Employee queries', 'IT support', 'HR support'],
      route: '/helpdesk'
    },
    {
      title: 'Advanced Reports',
      icon: 'line-chart',
      bg: '#F5F3FF',
      border: '#DDD6FE',
      iconBg: '#7C3AED',
      accent: '#5B21B6',
      bullets: ['Profitability report', 'Client-wise revenue', 'Attrition, utilization'],
      route: '/analytics'
    },
  ];

  features.forEach((f, idx) => {
    const card = h('div', {
      class: `feature-card dash-animate-fade dash-delay-${(idx % 6) + 1}`,
      style: `--feat-bg: ${f.bg}; --feat-border: ${f.border}; --feat-icon-bg: ${f.iconBg}; --feat-accent: ${f.accent};`,
      onClick: () => {
        router.navigate(f.route);
      }
    },
      h('div', { class: 'feature-card__top' },
        h('div', { class: 'feature-card__top-left' },
          h('div', { class: 'feature-card__icon' },
            icon(f.icon, { size: 16 })
          ),
          h('div', { class: 'feature-card__title' }, f.title)
        ),
        icon('arrow-right', { size: 14, cls: 'feature-card__arrow' })
      ),
      h('ul', { class: 'feature-card__list' },
        ...f.bullets.map((b) => h('li', { class: 'feature-card__item' }, b))
      )
    );
    grid.append(card);
  });

  return grid;
}

/* =========================================================================
   INTERACTIVE ACTION MODALS
   ========================================================================= */

function openAddEmployeeModal() {
  openModal({
    title: 'Add New Employee',
    size: 'md',
    body: h('form', {
      class: 'stack gap-3',
      onSubmit: (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        toastSuccess(`Employee ${fd.get('name') || 'New Hire'} added successfully!`);
        e.target.closest('dialog')?.close();
      }
    },
      h('div', { class: 'stack gap-1' },
        h('label', { class: 'form-label text-sm fw-600' }, 'Full Name *'),
        h('input', { class: 'input', name: 'name', required: true, placeholder: 'e.g. Anand Sundaram' })
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Work Email *'),
          h('input', { class: 'input', type: 'email', name: 'email', required: true, placeholder: 'anand.s@company.com' })
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Phone Number *'),
          h('input', { class: 'input', name: 'phone', required: true, placeholder: '+91 98765 43210' })
        )
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Designation *'),
          h('input', { class: 'input', name: 'desig', required: true, placeholder: 'Software Engineer' })
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Department *'),
          h('select', { class: 'select', name: 'dept' },
            h('option', null, 'Engineering & Technology'),
            h('option', null, 'Product & Design'),
            h('option', null, 'Consulting & Staffing'),
            h('option', null, 'Human Resources'),
            h('option', null, 'Finance & Payroll')
          )
        )
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Client Deployment'),
          h('select', { class: 'select', name: 'client' },
            h('option', null, 'Internal / Bench'),
            h('option', null, 'TCS (Project Alpha)'),
            h('option', null, 'Infosys Digital'),
            h('option', null, 'Wipro Enterprise'),
            h('option', null, 'HCL Tech'),
            h('option', null, 'TechNova Solutions')
          )
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Annual CTC (INR) *'),
          h('input', { class: 'input', name: 'ctc', required: true, placeholder: '₹ 8,50,000' })
        )
      ),
      h('div', { class: 'split mt-4' },
        h('span', { class: 'text-xs text-muted' }, '* Required fields'),
        button('Create & Deploy Employee', { variant: 'primary', type: 'submit' })
      )
    )
  });
}

function openCreateTimesheetModal() {
  openModal({
    title: 'Create Weekly Timesheet',
    size: 'md',
    body: h('form', {
      class: 'stack gap-3',
      onSubmit: (e) => {
        e.preventDefault();
        toastSuccess('Timesheet submitted for client approval!');
        e.target.closest('dialog')?.close();
      }
    },
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Client Account *'),
          h('select', { class: 'select', required: true },
            h('option', null, 'TCS - Project Alpha'),
            h('option', null, 'Infosys - Cloud Core'),
            h('option', null, 'Wipro - FinTech Hub'),
            h('option', null, 'TechNova Solutions')
          )
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Week Ending Date *'),
          h('input', { class: 'input', type: 'date', required: true, value: '2026-09-20' })
        )
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Regular Billable Hours *'),
          h('input', { class: 'input', type: 'number', required: true, value: '40', min: '0', max: '60' })
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Overtime (OT) Hours'),
          h('input', { class: 'input', type: 'number', value: '4', min: '0', max: '20' })
        )
      ),
      h('div', { class: 'stack gap-1' },
        h('label', { class: 'form-label text-sm fw-600' }, 'Tasks & Deliverables Summary'),
        h('textarea', { class: 'textarea', rows: 3, placeholder: 'Sprint milestones, deployment scripts, client sync meetings completed…' })
      ),
      h('div', { class: 'split mt-4' },
        h('span', { class: 'text-xs text-muted' }, 'Approval workflow routes automatically to Client Manager'),
        button('Submit Timesheet', { variant: 'primary', type: 'submit' })
      )
    )
  });
}

function openGenerateInvoiceModal() {
  openModal({
    title: 'Generate Client Invoice',
    size: 'md',
    body: h('form', {
      class: 'stack gap-3',
      onSubmit: (e) => {
        e.preventDefault();
        toastSuccess('Invoice #INV-2026-0941 generated & sent to client!');
        e.target.closest('dialog')?.close();
      }
    },
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Client Company *'),
          h('select', { class: 'select' },
            h('option', null, 'Tata Consultancy Services (TCS)'),
            h('option', null, 'Infosys Technologies Ltd'),
            h('option', null, 'Wipro Technologies'),
            h('option', null, 'TechNova Solutions Ltd')
          )
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Billing Month *'),
          h('input', { class: 'input', value: 'September 2026', readOnly: true })
        )
      ),
      h('div', { class: 'p-4', style: 'background: var(--surface-2); border-radius: 10px;' },
        h('div', { class: 'split text-sm' }, h('span', null, 'Approved Consultant Hours:'), h('strong', null, '186 hrs')),
        h('div', { class: 'split text-sm mt-1' }, h('span', null, 'Rate per Hour:'), h('span', null, '₹ 1,850')),
        h('div', { class: 'split text-sm mt-1' }, h('span', null, 'Taxable Amount:'), h('span', null, '₹ 3,44,100')),
        h('div', { class: 'split text-sm mt-1' }, h('span', null, 'GST (18%):'), h('span', null, '₹ 61,938')),
        h('hr', { style: 'margin: 8px 0; border-color: var(--border);' }),
        h('div', { class: 'split fw-700 text-base' }, h('span', null, 'Total Invoice Amount:'), h('span', { class: 'color-primary' }, '₹ 4,06,038'))
      ),
      h('div', { class: 'split mt-4' },
        button('Cancel', { variant: 'ghost', onClick: (e) => e.target.closest('dialog')?.close() }),
        button('Generate & Email PDF', { variant: 'primary', type: 'submit' })
      )
    )
  });
}

function openAddClientModal() {
  openModal({
    title: 'Add New Client Partner',
    size: 'md',
    body: h('form', {
      class: 'stack gap-3',
      onSubmit: (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        toastSuccess(`Client "${fd.get('clientName') || 'Partner'}" added to Ellowring ecosystem!`);
        e.target.closest('dialog')?.close();
      }
    },
      h('div', { class: 'stack gap-1' },
        h('label', { class: 'form-label text-sm fw-600' }, 'Client Company Name *'),
        h('input', { class: 'input', name: 'clientName', required: true, placeholder: 'e.g. Cognizant Global Services' })
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Primary Industry *'),
          h('select', { class: 'select', name: 'industry' },
            h('option', null, 'IT & Software Development'),
            h('option', null, 'Banking & Financial Services'),
            h('option', null, 'Healthcare & Life Sciences'),
            h('option', null, 'Manufacturing & Logistics')
          )
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Billing Terms *'),
          h('select', { class: 'select', name: 'terms' },
            h('option', null, 'Net 30 Days'),
            h('option', null, 'Net 15 Days'),
            h('option', null, 'Net 45 Days'),
            h('option', null, 'Advance Milestone')
          )
        )
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'GSTIN / Tax ID'),
          h('input', { class: 'input', placeholder: '33AAAAA0000A1Z5' })
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Account Manager'),
          h('input', { class: 'input', value: 'Vignesh Palanisamy', readOnly: true })
        )
      ),
      h('div', { class: 'split mt-4' },
        button('Cancel', { variant: 'ghost', onClick: (e) => e.target.closest('dialog')?.close() }),
        button('Save Client Profile', { variant: 'primary', type: 'submit' })
      )
    )
  });
}

function openCreateJobOpeningModal() {
  openModal({
    title: 'Create ATS Job Opening',
    size: 'md',
    body: h('form', {
      class: 'stack gap-3',
      onSubmit: (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        toastSuccess(`Requisition for "${fd.get('title') || 'Role'}" posted to ATS!`);
        e.target.closest('dialog')?.close();
      }
    },
      h('div', { class: 'stack gap-1' },
        h('label', { class: 'form-label text-sm fw-600' }, 'Position Title *'),
        h('input', { class: 'input', name: 'title', required: true, placeholder: 'e.g. Senior Full-Stack Cloud Architect' })
      ),
      h('div', { class: 'grid grid--2 gap-2' },
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Target Client Account'),
          h('select', { class: 'select' },
            h('option', null, 'TCS (Project Alpha)'),
            h('option', null, 'Infosys Enterprise'),
            h('option', null, 'Direct Hiring / Internal')
          )
        ),
        h('div', { class: 'stack gap-1' },
          h('label', { class: 'form-label text-sm fw-600' }, 'Open Positions *'),
          h('input', { class: 'input', type: 'number', value: '3', min: '1', max: '25' })
        )
      ),
      h('div', { class: 'split mt-4' },
        button('Cancel', { variant: 'ghost', onClick: (e) => e.target.closest('dialog')?.close() }),
        button('Publish Requisition', { variant: 'primary', type: 'submit' })
      )
    )
  });
}

function openQuickApprovalModal(item) {
  openModal({
    title: `${item.title}`,
    size: 'md',
    body: h('div', { class: 'stack gap-4' },
      h('div', { class: 'p-4', style: 'background: var(--surface-2); border-radius: 10px;' },
        h('div', { class: 'split mb-2' },
          h('span', { class: 'fw-600' }, item.sub),
          h('span', { class: 'badge badge--warning' }, 'Pending Manager Action')
        ),
        h('p', { class: 'text-sm text-muted mb-0' },
          'Review the submission details below before confirming. Verification rules check against biometric muster, policy limits, and contractual billing terms.'
        )
      ),
      h('div', { class: 'split' },
        button('Reject with Reason', {
          variant: 'danger',
          onClick: (e) => {
            toast({ type: 'warning', title: 'Request Rejected', message: `${item.title} has been rejected.` });
            e.target.closest('dialog')?.close();
          }
        }),
        button('Approve & Forward', {
          variant: 'primary',
          onClick: (e) => {
            toastSuccess(`${item.title} approved successfully!`);
            e.target.closest('dialog')?.close();
          }
        })
      )
    )
  });
}

function openEcosystemRoadmapModal() {
  openModal({
    title: 'Ellowring Next-Gen Ecosystem Roadmap',
    size: 'lg',
    body: h('div', { class: 'stack gap-4' },
      h('div', { class: 'p-4', style: 'background: linear-gradient(135deg, #0B132B, #1A284E); color: #fff; border-radius: 12px;' },
        h('h3', { style: 'color: #fff; margin-bottom: 4px;' }, '🚀 From HR Management to Complete Staffing & Payroll Ecosystem'),
        h('p', { style: 'color: #94A3B8; font-size: 13.5px; margin: 0;' },
          'Your HRMS is seamlessly expanding with full-lifecycle recruitment, multi-branch client billing, GPS field tracking, timesheet approvals, and client self-service.'
        )
      ),
      h('div', { class: 'grid grid--2 gap-3' },
        ...[
          { title: 'Recruitment & ATS', status: 'Live & Ready', desc: 'Integrated candidate pipeline, resume screening & job requisition manager.' },
          { title: 'Clients & Deployments', status: 'Live & Ready', desc: 'Manage staffing accounts, billable rates, and client-wise resource mapping.' },
          { title: 'Automated Invoicing & GST', status: 'Live & Ready', desc: 'Auto-generate monthly billing from client-approved timesheets.' },
          { title: 'Client Self-Service Portal', status: 'Live & Ready', desc: 'Dedicated client login to approve weekly rosters and verify milestones.' },
        ].map((m) =>
          h('div', { class: 'card p-4 stack gap-1', style: 'border: 1px solid var(--border);' },
            h('div', { class: 'split' },
              h('strong', { class: 'text-sm' }, m.title),
              h('span', { class: 'badge badge--success' }, m.status)
            ),
            h('p', { class: 'text-xs text-muted mb-0' }, m.desc)
          )
        )
      )
    )
  });
}

/* =========================================================================
   2. MANAGER DASHBOARD
   ========================================================================= */
async function renderManagerDashboard(user, ctx) {
  const container = h('div', { class: 'stack gap-6' });

  container.append(h('div', { class: 'dash-hero' },
    h('div', { class: 'stack gap-1' },
      h('h2', { class: 'fw-800' }, `Manager Portal · ${user.name}`),
      h('p', { class: 'text-sm' }, 'Review your team attendance, leave requests and approvals.')),
    h('div', { class: 'cluster' },
      button('View Approvals Inbox', { variant: 'secondary', icon: 'clipboard-check', onClick: () => router.navigate('/mss') }))));

  let team = [];
  try {
    team = await api.query('managerTeam', { managerId: user.employeeId }, { signal: ctx.signal });
  } catch {
    team = [];
  }

  const teamPresent = team.filter((m) => m.today === 'Present').length;
  const teamLeave = team.filter((m) => m.today === 'Leave').length;

  const kpis = h('div', { class: 'grid grid--kpi' },
    h('eh-kpi-card', { label: 'Direct Reports', value: String(team.length), format: 'number', icon: 'users', tone: 'primary' }),
    h('eh-kpi-card', { label: 'Present Today', value: String(teamPresent), format: 'number', icon: 'check', tone: 'success' }),
    h('eh-kpi-card', { label: 'On Leave Today', value: String(teamLeave), format: 'number', icon: 'calendar', tone: 'warning' }),
    h('eh-kpi-card', { label: 'Pending Approvals', value: '3', format: 'number', icon: 'clipboard-list', tone: 'info' }));
  container.append(kpis);

  const teamList = h('div', { class: 'stack gap-2' },
    ...team.map((member) => h('div', { class: 'list-row' },
      avatar(member.name, { size: 'sm' }),
      h('div', { class: 'list-row__main' },
        h('div', { class: 'list-row__title' }, member.name),
        h('div', { class: 'list-row__meta' }, member.designation)),
      statusBadge(member.today.toLowerCase(), member.today))));

  const teamCard = h('div', { class: 'card p-5 stack gap-3' },
    h('h3', { class: 'card__title' }, "Today's Team Attendance"),
    team.length ? teamList : h('p', { class: 'p-4 text-muted text-sm' }, 'No direct reports assigned.'));
  container.append(teamCard);

  return container;
}

/* =========================================================================
   3. EMPLOYEE DASHBOARD
   ========================================================================= */
function renderEmployeeDashboard(user, ctx) {
  const container = h('div', { class: 'stack gap-6' });

  container.append(h('div', { class: 'dash-hero' },
    h('div', { class: 'stack gap-1' },
      h('h2', { class: 'fw-800' }, `Hello, ${user?.name || 'Employee'}`),
      h('p', { class: 'text-sm' }, 'Check in for your shift and manage your leave balances.')),
    h('div', { class: 'cluster' },
      button('Apply for Leave', { variant: 'secondary', icon: 'calendar-plus', onClick: () => router.navigate('/leave') }))));

  const punchRow = h('div', { class: 'grid grid--2' });

  let isPunchedIn = false;
  const clockEl = h('div', { class: 'punch__clock' }, '--:--:--');
  const updateClock = () => {
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString('en-IN', { hour12: false });
  };
  updateClock();
  const clockTimer = setInterval(updateClock, 1000);
  ctx.onDispose(() => clearInterval(clockTimer));

  const punchBtn = h('button', {
    class: 'punch__btn',
    type: 'button',
    onClick: () => {
      isPunchedIn = !isPunchedIn;
      punchBtn.setAttribute('data-state', isPunchedIn ? 'in' : 'out');
      punchBtn.querySelector('.punch__text').textContent = isPunchedIn ? 'Check Out' : 'Check In';
      toastSuccess(isPunchedIn ? 'Checked in successfully at ' + clockEl.textContent : 'Checked out successfully at ' + clockEl.textContent);
    },
  },
    icon('fingerprint', { size: 36 }),
    h('span', { class: 'punch__text' }, 'Check In'));

  const punchCard = h('div', { class: 'card p-6 punch' },
    h('span', { class: 'text-xs text-muted fw-600 uppercase tracking-wider' }, 'Current Time · Asia/Kolkata'),
    clockEl,
    punchBtn,
    h('span', { class: 'text-xs text-muted' }, 'Shift: General (09:00 AM – 06:00 PM)'));

  const balancesCard = h('div', { class: 'card p-6 stack gap-4' },
    h('h3', { class: 'card__title' }, 'Leave Balances'),
    h('div', { class: 'grid grid--3 gap-3' },
      h('div', { class: 'balance' },
        h('span', { class: 'text-xs text-muted' }, 'Casual Leave'),
        h('strong', null, '6.0'),
        h('small', { class: 'text-xs text-muted' }, 'Available')),
      h('div', { class: 'balance' },
        h('span', { class: 'text-xs text-muted' }, 'Sick Leave'),
        h('strong', null, '8.0'),
        h('small', { class: 'text-xs text-muted' }, 'Available')),
      h('div', { class: 'balance' },
        h('span', { class: 'text-xs text-muted' }, 'Privilege Leave'),
        h('strong', null, '14.5'),
        h('small', { class: 'text-xs text-muted' }, 'Available'))),
    h('hr', null),
    h('div', { class: 'split' },
      h('span', { class: 'text-sm text-muted' }, 'Latest Payslip: September 2026'),
      button('Download Payslip', { variant: 'outline', size: 'sm', icon: 'file-text', onClick: () => toastSuccess('Payslip PDF ready.') })));

  punchRow.append(punchCard, balancesCard);
  container.append(punchRow);

  return container;
}

/* =========================================================================
   4. SITE ADMIN DASHBOARD
   ========================================================================= */
function renderSiteAdminDashboard(user) {
  return h('div', { class: 'container stack gap-6', style: { maxInlineSize: '840px', paddingBlock: 'var(--space-8)' } },
    h('div', { class: 'card p-8 stack gap-4' },
      h('div', { class: 'cluster' },
        icon('palette', { size: 36, cls: 'color-primary' }),
        h('h2', { class: 'text-2xl fw-800' }, 'Website Control Center')),
      h('p', { class: 'text-muted text-base' },
        'Welcome, Site Administrator. You have permissions to configure marketing copy, brand colours, fonts, layout density, and system presets without touching source code.'),
      h('hr', null),
      h('div', { class: 'split' },
        h('span', { class: 'text-sm text-muted' }, 'Experiment with theme tokens right now:'),
        h('div', { class: 'cluster' },
          button('Theme Playground', { variant: 'primary', icon: 'sparkles', onClick: () => router.navigate('/dev/playground') }),
          button('Explore Components', { variant: 'secondary', icon: 'blocks', onClick: () => router.navigate('/dev/components') })))));
}
