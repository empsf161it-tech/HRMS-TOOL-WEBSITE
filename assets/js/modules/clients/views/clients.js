/* Purpose: Client Details (Tata Consultancy Services) view matching client UI design Image 5. */
import { h, icon } from '../../../core/dom.js';
import { router } from '../../../core/router.js';
import { toastSuccess as toast, openModal } from '../../../components/ui.js';

function animateCounter(el, target, prefix = '', suffix = '') {
  const isFloat = String(target).includes('.');
  const num = parseFloat(String(target).replace(/,/g, '')) || 0;
  const dur = 750;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const cur = num * ease;
    const formatted = isFloat ? cur.toFixed(1) : new Intl.NumberFormat('en-IN').format(Math.round(cur));
    el.textContent = `${prefix}${formatted}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export default async function clientsView() {
  const root = h('div', { class: 'dash-animate-fade', style: 'display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px;' });

  // 1. Breadcrumb
  const breadcrumb = h('div', { style: 'font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;' },
    h('span', null, 'Clients & Projects'),
    icon('chevron-right', { size: 12 }),
    h('span', { style: 'color: var(--text); font-weight: 600;' }, 'Client Details')
  );

  // 2. TCS Hero Header Card matching Image 5
  function openEditClientModal() {
    openModal({
      title: 'Edit Client Profile · Tata Consultancy Services',
      size: 'md',
      body: h('div', { class: 'stack gap-3' },
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Company Legal Name'),
          h('input', { class: 'input', value: 'Tata Consultancy Services (TCS)' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Head Office Location'),
          h('input', { class: 'input', value: 'Bengaluru, Karnataka, India' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Account Manager'),
          h('input', { class: 'input', value: 'Karthik M' })
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => toast('Client profile updated!') }, 'Save Changes')
        )
      )
    });
  }

  function openCreateOpeningModal() {
    openModal({
      title: 'Create Job Opening for TCS',
      size: 'md',
      body: h('div', { class: 'stack gap-3' },
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Position Title'),
          h('input', { class: 'input', placeholder: 'e.g. Senior Java Full Stack Developer' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Number of Openings'),
          h('input', { type: 'number', class: 'input', value: '5' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Client Project'),
          h('select', { class: 'input' },
            h('option', null, 'Application Development'),
            h('option', null, 'Cloud Operations'),
            h('option', null, 'Infrastructure Support')
          )
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => toast('New Job Opening published!') }, 'Publish Position')
        )
      )
    });
  }

  const clientHeroCard = h('div', { class: 'client-hero-card' },
    h('div', { class: 'client-hero-top' },
      h('div', { class: 'client-hero-brand' },
        h('div', { class: 'client-hero-logo' }, 'TCS'),
        h('div', null,
          h('div', { class: 'client-hero-name-row' },
            h('h1', { class: 'client-hero-title' }, 'Tata Consultancy Services'),
            h('span', { class: 'dash-status-pill dash-status-pill--active' }, 'Active')
          ),
          h('div', { class: 'client-hero-sub' }, 'IT Services & Consulting  |  Bengaluru, Karnataka')
        )
      ),
      h('div', { class: 'client-hero-actions fade-right', style: '--anim-delay: 90ms;' },
        h('button', {
          class: 'btn btn--ghost btn--sm',
          style: 'border: 1px solid var(--border); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;',
          onClick: openEditClientModal
        },
          icon('pencil', { size: 14 }),
          h('span', null, 'Edit Client')
        ),
        h('button', {
          class: 'btn btn--ghost btn--sm',
          style: 'border: 1px solid var(--border); font-weight: 600; display: inline-flex; align-items: center; gap: 6px;',
          onClick: () => toast('More client options menu opened')
        },
          h('span', null, 'More Actions'),
          icon('chevron-down', { size: 14 })
        ),
        h('button', {
          class: 'btn btn--primary btn--sm',
          style: 'display: inline-flex; align-items: center; gap: 6px; font-weight: 700; background: #1E60FF;',
          onClick: openCreateOpeningModal
        },
          icon('plus', { size: 14 }),
          h('span', null, 'Create Job Opening')
        )
      )
    ),
    h('div', { class: 'client-hero-meta-grid stagger-children', dataset: { animateStagger: '80' } },
      [
        { label: 'Client Since', val: 'Jan 15, 2024', icon: 'calendar', bg: '#EFF6FF', color: '#1E60FF' },
        { label: 'Contract Type', val: 'Staffing Agreement', icon: 'file-text', bg: '#F5F3FF', color: '#7C3AED' },
        { label: 'Payment Terms', val: 'Net 30 Days', icon: 'credit-card', bg: '#E0F2FE', color: '#0284C7' },
        { label: 'Account Manager', val: 'Karthik M', icon: 'user', bg: '#ECFDF5', color: '#10B981' },
      ].map((it) => h('div', { class: 'client-meta-chip fade-up' },
        h('div', { class: 'client-meta-chip__icon', style: `background: ${it.bg}; color: ${it.color};` },
          icon(it.icon, { size: 15 })
        ),
        h('div', { class: 'client-meta-chip__body' },
          h('span', { class: 'client-meta-chip__label' }, it.label),
          h('span', { class: 'client-meta-chip__val' }, it.val)
        )
      ))
    )
  );

  // 3. Subtabs Bar (Top to Center)
  const tabNames = ['Overview', 'Employees', 'Timesheets', 'Payroll & Billing', 'Contracts', 'Contacts', 'Job Openings', 'Invoices', 'Reports'];
  let activeTab = 'Overview';
  const subtabsBar = h('div', { class: 'dash-subtabs fade-down', style: '--anim-delay: 100ms;' },
    ...tabNames.map((tab) => h('button', {
      class: `dash-subtab${tab === activeTab ? ' active' : ''}`,
      type: 'button',
      onClick: (e) => {
        activeTab = tab;
        subtabsBar.querySelectorAll('.dash-subtab').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        toast(`Viewing ${tab} for TCS`);
      }
    }, tab))
  );

  // 4. 6 KPI Cards matching Image 5 (Staggered Bottom to Center)
  const kpisData = [
    { title: 'Deployed Employees', target: 42, prefix: '', suffix: '', trend: '↑ 20%', trendDir: 'up', sub: 'vs last month', iconBg: '#EFF6FF', iconColor: '#1E60FF', iconName: 'users' },
    { title: 'Active Projects', target: 5, prefix: '', suffix: '', trend: '↑ 25%', trendDir: 'up', sub: '', iconBg: '#E0F2FE', iconColor: '#0284C7', iconName: 'briefcase' },
    { title: 'Timesheet Approval Rate', target: 92, prefix: '', suffix: '%', trend: '↑ 8%', trendDir: 'up', sub: '', iconBg: '#F0F9FF', iconColor: '#0284C7', iconName: 'clock' },
    { title: 'Monthly Billing', target: 14.8, prefix: '₹', suffix: ' L', trend: '↑ 18%', trendDir: 'up', sub: '', iconBg: '#ECFDF5', iconColor: '#10B981', iconName: 'indian-rupee' },
    { title: 'Monthly Payroll Cost', target: 11.2, prefix: '₹', suffix: ' L', trend: '↑ 16%', trendDir: 'up', sub: '', iconBg: '#FFE4E6', iconColor: '#E11D48', iconName: 'wallet' },
    { title: 'Gross Margin', target: 3.6, prefix: '₹', suffix: ' L', trend: '↑ 24%', trendDir: 'up', sub: '', iconBg: '#ECFDF5', iconColor: '#059669', iconName: 'line-chart' },
  ];

  const kpisContainer = h('div', { class: 'kpi-grid stagger-children', dataset: { animateStagger: '90' } });
  kpisData.forEach((k, idx) => {
    const valEl = h('div', { class: 'kpi-card__val' }, `${k.prefix}0${k.suffix}`);
    const card = h('div', { class: 'kpi-card fade-up', style: `--anim-delay: ${idx * 85}ms;` },
      h('div', { class: 'kpi-card__top' },
        h('div', { class: 'kpi-card__icon-box', style: `background: ${k.iconBg}; color: ${k.iconColor};` },
          icon(k.iconName, { size: 18 })
        )
      ),
      valEl,
      h('div', { class: 'kpi-card__title' }, k.title),
      h('div', { class: 'kpi-card__meta' },
        k.trend ? h('span', { class: `kpi-card__trend kpi-card__trend--${k.trendDir}` }, k.trend) : null,
        h('span', { class: 'kpi-card__trend-sub' }, k.sub)
      )
    );
    kpisContainer.append(card);
    animateCounter(valEl, k.target, k.prefix, k.suffix);
  });

  // 5. Middle 3 Analytics Charts
  const chartsRow = h('div', { class: 'dash-middle-grid', style: 'display: grid; grid-template-columns: 1.15fr 0.95fr 1fr; gap: 16px; align-items: stretch;' });

  // Tooltip
  const tooltip = h('div', { class: 'chart-tooltip', style: 'display: none;' });
  root.append(tooltip);
  function showTip(e, text) {
    tooltip.innerHTML = text;
    tooltip.style.display = 'block';
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2}px`;
    tooltip.style.top = `${rect.top - 8}px`;
  }
  function hideTip() { tooltip.style.display = 'none'; }

  // Chart 1: Employee Deployment Trend (Jan-Sep Column Bars: 28, 32, 35, 38, 40, 42, 42, 42, 42)
  const depHistory = [
    { m: 'Jan', count: 28 },
    { m: 'Feb', count: 32 },
    { m: 'Mar', count: 35 },
    { m: 'Apr', count: 38 },
    { m: 'May', count: 40 },
    { m: 'Jun', count: 42 },
    { m: 'Jul', count: 42 },
    { m: 'Aug', count: 42 },
    { m: 'Sep', count: 42 },
  ];
  const dW = 380, dH = 190, dPadL = 32, dPadB = 26, dPadT = 16, dPadR = 12;
  const dInW = dW - dPadL - dPadR;
  const dInH = dH - dPadT - dPadB;
  const dColW = dInW / depHistory.length;

  let depBarsSvg = '';
  depHistory.forEach((d, i) => {
    const cx = dPadL + i * dColW + (dColW - 18) / 2;
    const hBar = (d.count / 50) * dInH;
    const yBar = dPadT + dInH - hBar;

    depBarsSvg += `
      <rect x="${cx}" y="${yBar}" width="18" height="${hBar}" fill="#1E60FF" rx="3" class="chart-bar" data-tip="${d.m}: ${d.count} Deployed" />
      <text x="${cx + 9}" y="${yBar - 4}" text-anchor="middle" font-size="9.5" font-weight="700" fill="var(--text)">${d.count}</text>
      <text x="${cx + 9}" y="${dH - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">${d.m}</text>
    `;
  });

  const depTrendCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Employee Deployment Trend')
    ),
    h('div', { style: 'width: 100%; position: relative;' },
      (() => {
        const div = document.createElement('div');
        div.innerHTML = `
          <svg viewBox="0 0 ${dW} ${dH}" style="width: 100%; height: auto; display: block;">
            <line x1="${dPadL}" y1="${dPadT}" x2="${dW - dPadR}" y2="${dPadT}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${dPadL - 6}" y="${dPadT + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">50</text>
            <line x1="${dPadL}" y1="${dPadT + dInH * 0.25}" x2="${dW - dPadR}" y2="${dPadT + dInH * 0.25}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${dPadL - 6}" y="${dPadT + dInH * 0.25 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">40</text>
            <line x1="${dPadL}" y1="${dPadT + dInH * 0.5}" x2="${dW - dPadR}" y2="${dPadT + dInH * 0.5}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${dPadL - 6}" y="${dPadT + dInH * 0.5 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">30</text>
            <line x1="${dPadL}" y1="${dPadT + dInH * 0.75}" x2="${dW - dPadR}" y2="${dPadT + dInH * 0.75}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${dPadL - 6}" y="${dPadT + dInH * 0.75 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">20</text>
            <line x1="${dPadL}" y1="${dPadT + dInH}" x2="${dW - dPadR}" y2="${dPadT + dInH}" stroke="var(--border)"/>
            <text x="${dPadL - 6}" y="${dPadT + dInH + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">0</text>
            ${depBarsSvg}
          </svg>
        `;
        div.querySelectorAll('.chart-bar').forEach((b) => {
          b.addEventListener('mouseenter', (e) => showTip(e, b.dataset.tip));
          b.addEventListener('mouseleave', hideTip);
        });
        return div;
      })()
    )
  );

  // Chart 2: Project-wise Employees Donut (Total: 42)
  const projectShare = [
    { label: 'Application Development', count: 14, color: '#1E60FF' },
    { label: 'Infrastructure Support', count: 10, color: '#14B8A6' },
    { label: 'QA & Testing', count: 8, color: '#F59E0B' },
    { label: 'Service Desk', count: 6, color: '#8B5CF6' },
    { label: 'Cloud Operations', count: 4, color: '#F97316' },
  ];
  const pTotal = 42;
  const pRadius = 60;
  const pCirc = 2 * Math.PI * pRadius;
  let pCum = 0;
  const pDonutPaths = projectShare.map((p) => {
    const frac = p.count / pTotal;
    const strokeDash = frac * pCirc;
    const strokeOffset = -pCum * pCirc;
    pCum += frac;
    return `<circle cx="85" cy="85" r="${pRadius}" fill="none" stroke="${p.color}" stroke-width="22"
      stroke-dasharray="${strokeDash} ${pCirc - strokeDash}" stroke-dashoffset="${strokeOffset}"
      class="donut-slice" data-project="${p.label}" data-count="${p.count}" style="transition: transform 0.2s ease; cursor: pointer; transform-origin: 85px 85px;" />`;
  }).join('');

  const pLegend = h('div', { class: 'donut-legend', style: 'flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 11.5px;' },
    ...projectShare.map((p) => h('div', { class: 'donut-legend__item', style: 'display: flex; align-items: center; justify-content: space-between; padding: 2px 4px;' },
      h('div', { class: 'cluster gap-2' },
        h('span', { class: 'donut-legend__dot', style: `width: 8px; height: 8px; border-radius: 50%; background: ${p.color}; flex-shrink: 0;` }),
        h('span', { style: 'color: var(--text);' }, p.label)
      ),
      h('span', { style: 'font-weight: 700; color: var(--text);' }, p.count)
    ))
  );

  const projectDonutCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Project-wise Employees')
    ),
    h('div', { style: 'display: flex; align-items: center; gap: 14px; padding-top: 4px;' },
      (() => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 140px; height: 140px; flex-shrink: 0;';
        div.innerHTML = `
          <svg viewBox="0 0 170 170" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            ${pDonutPaths}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 20px; font-weight: 800; font-family: var(--font-heading); color: var(--text);">42</span>
            <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">Total</span>
          </div>
        `;
        div.querySelectorAll('.donut-slice').forEach((s) => {
          s.addEventListener('mouseenter', (e) => {
            s.style.transform = 'scale(1.04)';
            showTip(e, `<strong>${s.dataset.project}</strong>: ${s.dataset.count} staff`);
          });
          s.addEventListener('mouseleave', () => {
            s.style.transform = 'scale(1)';
            hideTip();
          });
        });
        return div;
      })(),
      pLegend
    )
  );

  // Chart 3: Billing vs Payroll Cost (Last 6 Months)
  const last6Months = [
    { m: 'Apr', bill: 11.5, cost: 8.8 },
    { m: 'May', bill: 12.2, cost: 9.3 },
    { m: 'Jun', bill: 13.0, cost: 9.9 },
    { m: 'Jul', bill: 13.8, cost: 10.4 },
    { m: 'Aug', bill: 14.2, cost: 10.8 },
    { m: 'Sep', bill: 14.8, cost: 11.2 },
  ];
  const bW = 340, bH = 190, bPadL = 32, bPadB = 26, bPadT = 16, bPadR = 12;
  const bInW = bW - bPadL - bPadR;
  const bInH = bH - bPadT - bPadB;
  const bColW = bInW / last6Months.length;

  let last6Svg = '';
  last6Months.forEach((d, i) => {
    const cx = bPadL + i * bColW + bColW / 2;
    const hBill = (d.bill / 20) * bInH;
    const hCost = (d.cost / 20) * bInH;
    const yBill = bPadT + bInH - hBill;
    const yCost = bPadT + bInH - hCost;

    last6Svg += `
      <rect x="${cx - 12}" y="${yBill}" width="10" height="${hBill}" fill="#1E60FF" rx="2" class="chart-bar" data-tip="${d.m}: ₹${d.bill}L Billed" />
      <rect x="${cx + 2}" y="${yCost}" width="10" height="${hCost}" fill="#10B981" rx="2" class="chart-bar" data-tip="${d.m}: ₹${d.cost}L Payroll Cost" />
      <text x="${cx}" y="${bH - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">${d.m}</text>
    `;
  });

  const last6Card = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Billing vs Payroll Cost (Last 6 Months)'),
      h('div', { class: 'cluster gap-3', style: 'font-size: 11.5px;' },
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #1E60FF;' }),
          'Client Billing'
        ),
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #10B981;' }),
          'Payroll Cost'
        )
      )
    ),
    h('div', { style: 'width: 100%; position: relative;' },
      (() => {
        const div = document.createElement('div');
        div.innerHTML = `
          <svg viewBox="0 0 ${bW} ${bH}" style="width: 100%; height: auto; display: block;">
            <line x1="${bPadL}" y1="${bPadT}" x2="${bW - bPadR}" y2="${bPadT}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">20L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH * 0.25}" x2="${bW - bPadR}" y2="${bPadT + bInH * 0.25}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH * 0.25 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">15L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH * 0.5}" x2="${bW - bPadR}" y2="${bPadT + bInH * 0.5}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH * 0.5 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">10L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH * 0.75}" x2="${bW - bPadR}" y2="${bPadT + bInH * 0.75}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH * 0.75 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">5L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH}" x2="${bW - bPadR}" y2="${bPadT + bInH}" stroke="var(--border)"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">0L</text>
            ${last6Svg}
          </svg>
        `;
        div.querySelectorAll('.chart-bar').forEach((b) => {
          b.addEventListener('mouseenter', (e) => showTip(e, b.dataset.tip));
          b.addEventListener('mouseleave', hideTip);
        });
        return div;
      })()
    )
  );

  chartsRow.append(depTrendCard, projectDonutCard, last6Card);

  // 6. Bottom 3-Column Section matching Image 5
  const bottomGrid = h('div', { style: 'display: grid; grid-template-columns: 1fr 1.15fr 1fr; gap: 16px; align-items: stretch;' });

  // Column 1: Client Information Card
  const clientInfoCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('h2', { class: 'panel-card__title' }, 'Client Information'),
      h('button', {
        class: 'btn btn--ghost btn--sm',
        style: 'color: #1E60FF; font-weight: 600; padding: 2px 6px;',
        onClick: openEditClientModal
      }, 'Edit')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px; font-size: 12.5px;' },
      [
        { label: 'Company Name', val: 'Tata Consultancy Services (TCS)' },
        { label: 'Industry', val: 'IT Services & Consulting' },
        { label: 'Head Office', val: 'Bengaluru, Karnataka, India' },
        { label: 'Website', val: 'https://www.tcs.com', isLink: true },
        { label: 'GST Number', val: '29AAACT2727Q1Z1' },
        { label: 'Agreement Start Date', val: 'Jan 15, 2024' },
        { label: 'Agreement End Date', val: 'Jan 14, 2027' },
        { label: 'Payment Terms', val: 'Net 30 Days' },
        { label: 'Account Manager', val: 'Karthik M' },
        { label: 'Notes', val: 'Key strategic client. High growth potential.' }
      ].map((f) => h('div', { style: 'display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;' },
        h('span', { style: 'color: var(--text-muted); flex-shrink: 0; min-width: 130px;' }, f.label),
        f.isLink
          ? h('a', { href: f.val, target: '_blank', rel: 'noopener noreferrer', style: 'color: #1E60FF; font-weight: 600; text-decoration: none;' }, `${f.val} ↗`)
          : h('span', { style: 'font-weight: 600; color: var(--text); text-align: right;' }, f.val)
      ))
    )
  );

  // Column 2: Key Contacts (top) + Active Job Openings & Upcoming Renewals (bottom split)
  const col2 = h('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });

  const contactsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('h2', { class: 'panel-card__title' }, 'Key Contacts'),
      h('span', { class: 'panel-card__link', onClick: () => toast('View all TCS contacts') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' },
      [
        { name: 'Ramesh Iyer', role: 'HR Manager', email: 'ramesh.iyer@tcs.com', phone: '+91 98765 43210' },
        { name: 'Priya Menon', role: 'Vendor Management', email: 'priya.menon@tcs.com', phone: '+91 98765 43211' },
        { name: 'Suresh Nair', role: 'Project Manager', email: 'suresh.nair@tcs.com', phone: '+91 98765 43212' },
        { name: 'Anita Rao', role: 'Finance', email: 'anita.rao@tcs.com', phone: '+91 98765 43213' }
      ].map((c) => h('div', {
        style: 'display: flex; align-items: center; justify-content: space-between; padding: 6px 4px; border-bottom: 1px solid var(--border); font-size: 12px;'
      },
        h('div', { style: 'display: flex; align-items: center; gap: 10px;' },
          h('div', { class: 'table-emp-avatar-fallback', style: 'width: 28px; height: 28px; font-size: 11px;' }, c.name[0]),
          h('div', { style: 'display: flex; flex-direction: column; line-height: 1.25;' },
            h('span', { style: 'font-weight: 700; color: var(--text);' }, c.name),
            h('span', { style: 'font-size: 11px; color: var(--text-muted);' }, c.role)
          )
        ),
        h('div', { style: 'display: flex; flex-direction: column; align-items: flex-end; line-height: 1.25;' },
          h('a', { href: `mailto:${c.email}`, style: 'color: #1E60FF; text-decoration: none; font-size: 11px;' }, c.email),
          h('span', { style: 'font-size: 11px; color: var(--text-muted);' }, c.phone)
        )
      ))
    )
  );

  const col2LowerSplit = h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' });

  const openingsMiniCard = h('div', { class: 'panel-card', style: 'padding: 14px;' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 8px;' },
      h('h3', { style: 'font-size: 13px; font-weight: 700; color: var(--text); margin: 0;' }, 'Active Job Openings'),
      h('span', { class: 'panel-card__link', style: 'font-size: 11px;', onClick: openCreateOpeningModal }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
      [
        { title: 'Java Developers', pos: '5 Positions' },
        { title: 'QA Engineers', pos: '3 Positions' },
        { title: 'Infrastructure Support', pos: '2 Positions' },
      ].map((j) => h('div', { style: 'display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;' },
        h('div', { style: 'display: flex; flex-direction: column;' },
          h('span', { style: 'font-weight: 700; color: var(--text);' }, j.title),
          h('span', { style: 'color: var(--text-muted); font-size: 10.5px;' }, j.pos)
        ),
        h('span', { class: 'dash-status-pill dash-status-pill--ready', style: 'font-size: 10px; padding: 1px 6px;' }, 'Open')
      ))
    )
  );

  const renewalsMiniCard = h('div', { class: 'panel-card', style: 'padding: 14px;' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 8px;' },
      h('h3', { style: 'font-size: 13px; font-weight: 700; color: var(--text); margin: 0;' }, 'Upcoming Renewals'),
      h('span', { class: 'panel-card__link', style: 'font-size: 11px;', onClick: () => router.navigate('/documents') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
      [
        { title: 'Staffing Agreement', left: '120 days left' },
        { title: 'NDA', left: '120 days left' },
        { title: 'SOW - Project Alpha', left: '45 days left' },
      ].map((r) => h('div', { style: 'display: flex; justify-content: space-between; align-items: center; font-size: 11.5px;' },
        h('span', { style: 'font-weight: 600; color: var(--text);' }, r.title),
        h('span', { style: 'font-weight: 700; color: #D97706; font-size: 10.5px;' }, r.left)
      ))
    )
  );

  col2LowerSplit.append(openingsMiniCard, renewalsMiniCard);
  col2.append(contactsCard, col2LowerSplit);

  // Column 3: Recent Activities (top) + Partnerships Banner (bottom)
  const col3 = h('div', { style: 'display: flex; flex-direction: column; gap: 16px;' });

  const activitiesCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('h2', { class: 'panel-card__title' }, 'Recent Activities'),
      h('span', { class: 'panel-card__link', onClick: () => toast('All activity logs') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' },
      [
        { text: '5 timesheets approved for Aug 2026', time: '2 hours ago', icon: 'check-circle-2', color: '#16A34A', bg: '#DCFCE7' },
        { text: '2 new employees deployed', time: '5 hours ago', icon: 'user-plus', color: '#1E60FF', bg: '#EFF6FF' },
        { text: 'Invoice #INV-2026-089 generated (₹14,80,000)', time: '1 day ago', icon: 'receipt', color: '#D97706', bg: '#FEF3C7' },
        { text: 'Contract renewal discussion scheduled', time: '2 days ago', icon: 'calendar', color: '#7C3AED', bg: '#F5F3FF' },
        { text: 'New job opening created – Java Developers (5 positions)', time: '3 days ago', icon: 'briefcase', color: '#0284C7', bg: '#E0F2FE' },
      ].map((act) => h('div', { style: 'display: flex; align-items: flex-start; gap: 10px;' },
        h('div', { style: `width: 26px; height: 26px; border-radius: 50%; background: ${act.bg}; color: ${act.color}; display: grid; place-items: center; flex-shrink: 0; margin-top: 1px;` },
          icon(act.icon, { size: 14 })
        ),
        h('div', { style: 'display: flex; flex-direction: column; line-height: 1.3;' },
          h('span', { style: 'font-size: 12px; font-weight: 500; color: var(--text);' }, act.text),
          h('span', { style: 'font-size: 10.5px; color: var(--text-muted);' }, act.time)
        )
      ))
    )
  );

  const partnerPromoCard = h('div', { class: 'promo-banner-card promo-banner-card--blue', style: 'flex-direction: column; align-items: flex-start;' },
    h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
      h('span', { style: 'font-size: 32px;' }, '🤝'),
      h('div', null,
        h('h3', { class: 'promo-banner-card__title', style: 'font-size: 14px;' }, 'Stronger Clients. Longer Partnerships.'),
        h('p', { class: 'promo-banner-card__text', style: 'font-size: 11px;' }, 'Manage client relationships, deliver talent, create value.')
      )
    ),
    h('button', {
      class: 'promo-banner-card__btn',
      type: 'button',
      style: 'margin-top: 8px; width: 100%; text-align: center; justify-content: center;',
      onClick: () => toast('Created new staffing requirement opportunity for TCS!')
    }, 'Create New Opportunity →')
  );

  col3.append(activitiesCard, partnerPromoCard);

  bottomGrid.append(clientInfoCard, col2, col3);

  // 7. Footer
  const footerRow = h('div', { style: 'display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 12px 4px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px;' },
    h('span', { style: 'font-size: 12px; color: var(--text-muted);' }, '© 2026 Ellowring. All rights reserved.'),
    h('span', { class: 'dash-tagline', style: 'margin: 0;' }, 'One Ecosystem. Zero Gaps. Total Business Automation.')
  );

  root.append(
    breadcrumb,
    clientHeroCard,
    subtabsBar,
    kpisContainer,
    chartsRow,
    bottomGrid,
    footerRow
  );

  return root;
}
