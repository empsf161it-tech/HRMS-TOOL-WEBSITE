/* Purpose: Staffing & Deployments Overview view matching client UI design Image 2. */
import { h, icon } from '../../../core/dom.js';
import { router } from '../../../core/router.js';
import { toastSuccess as toast, openModal } from '../../../components/ui.js';

function formatInr(val) {
  return new Intl.NumberFormat('en-IN').format(val);
}

function animateCounter(el, target, prefix = '', suffix = '') {
  const isFloat = String(target).includes('.');
  const num = parseFloat(target) || 0;
  const dur = 750;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const cur = num * ease;
    el.textContent = `${prefix}${isFloat ? cur.toFixed(1) : Math.round(cur)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export default async function staffingView() {
  const root = h('div', { class: 'dash-animate-fade', style: 'display: flex; flex-direction: column; gap: 20px; padding-bottom: 24px;' });

  // 1. Header with Breadcrumbs, Title, Subtitle, Date Selector & Deploy Employee Button
  let selectedMonth = 'Sep 2026';
  const monthBtn = h('button', {
    class: 'period-chip',
    type: 'button',
    onClick: (e) => toggleMonthMenu(e)
  },
    icon('calendar', { size: 14 }),
    h('span', { class: 'period-chip__label' }, selectedMonth),
    icon('chevron-down', { size: 14 })
  );

  function toggleMonthMenu(e) {
    e.stopPropagation();
    const existing = document.getElementById('staffing-month-popover');
    if (existing) {
      existing.remove();
      return;
    }
    const months = ['Sep 2026', 'Aug 2026', 'Jul 2026', 'Jun 2026', 'May 2026', 'Q3 2026', 'YTD 2026'];
    const pop = h('div', {
      id: 'staffing-month-popover',
      class: 'dash-animate-scale',
      style: `position: absolute; right: 0; top: calc(100% + 6px); background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15); z-index: 50; min-width: 130px; padding: 4px; display: flex; flex-direction: column; gap: 2px;`
    }, ...months.map((m) => h('button', {
      type: 'button',
      style: `padding: 7px 12px; text-align: left; background: ${m === selectedMonth ? 'var(--surface-2)' : 'transparent'}; border: none; border-radius: 6px; font-size: 12.5px; font-weight: ${m === selectedMonth ? '700' : '500'}; color: var(--text); cursor: pointer; transition: background 0.15s;`,
      onClick: () => {
        selectedMonth = m;
        monthBtn.querySelector('.period-chip__label').textContent = m;
        pop.remove();
        toast(`Switched view to ${m}`);
      }
    }, m)));

    monthBtn.parentElement.style.position = 'relative';
    monthBtn.parentElement.append(pop);

    const closeHandler = (ev) => {
      if (!monthBtn.parentElement.contains(ev.target)) {
        pop.remove();
        document.removeEventListener('click', closeHandler);
        window.removeEventListener('scroll', closeHandler);
      }
    };
    setTimeout(() => {
      document.addEventListener('click', closeHandler);
      window.addEventListener('scroll', closeHandler, { passive: true, once: true });
    }, 10);
  }

  const deployBtn = h('button', {
    class: 'btn',
    type: 'button',
    style: 'background: #0B132B; color: #FFFFFF; font-weight: 700; border-radius: 8px; padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 2px 8px rgba(11,19,43,0.25); cursor: pointer;',
    onClick: () => openDeployModal()
  },
    icon('plus', { size: 16 }),
    h('span', null, 'Deploy Employee')
  );

  function openDeployModal() {
    openModal({
      title: 'Deploy Employee to Client',
      size: 'md',
      body: h('div', { class: 'stack gap-4' },
        h('p', { class: 'text-sm text-muted' }, 'Assign an active candidate or bench employee to a client project.'),
        h('div', { class: 'grid gap-3' },
          h('label', { class: 'field' },
            h('span', { class: 'field__label text-xs fw-600' }, 'Select Employee'),
            h('select', { class: 'input' },
              h('option', null, 'Arun Kumar (EMP0012) - Application Development'),
              h('option', null, 'Priya Sharma (EMP0034) - QA & Testing'),
              h('option', null, 'Rahul Verma (EMP0095) - Full Stack Developer')
            )
          ),
          h('label', { class: 'field' },
            h('span', { class: 'field__label text-xs fw-600' }, 'Target Client Company'),
            h('select', { class: 'input' },
              h('option', null, 'Tata Consultancy Services (TCS)'),
              h('option', null, 'Infosys Technologies'),
              h('option', null, 'Wipro Enterprises'),
              h('option', null, 'Accenture')
            )
          ),
          h('label', { class: 'field' },
            h('span', { class: 'field__label text-xs fw-600' }, 'Joining / Deployment Date'),
            h('input', { type: 'date', class: 'input', value: '2026-10-01' })
          )
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => { toast('Employee deployment scheduled!'); } }, 'Confirm Deployment')
        )
      )
    });
  }

  const header = h('div', { class: 'dash-header' },
    h('div', { class: 'dash-header__left' },
      h('div', { style: 'font-size: 11.5px; color: var(--text-muted); display: flex; align-items: center; gap: 6px; margin-bottom: 2px;' },
        h('span', null, 'Staffing / Deployments'),
        icon('chevron-right', { size: 12 }),
        h('span', { style: 'color: var(--text); font-weight: 600;' }, 'Overview')
      ),
      h('h1', { class: 'dash-header__title' }, 'Staffing & Deployments'),
      h('p', { class: 'dash-header__sub' }, 'Manage your client companies, deployed employees, timesheets, payroll and billing — all in one place.')
    ),
    h('div', { class: 'dash-header__right', style: 'display: flex; align-items: center; gap: 10px;' },
      h('div', { style: 'position: relative;' }, monthBtn),
      deployBtn
    )
  );

  // 2. Row of 6 KPI Cards matching Image 2
  const kpisData = [
    { title: 'Deployed Employees', target: 186, prefix: '', suffix: '', trend: '↑ 12%', trendDir: 'up', sub: 'vs last month', iconBg: '#EFF6FF', iconColor: '#1E60FF', iconName: 'users' },
    { title: 'Client Companies', target: 12, prefix: '', suffix: '', trend: '↑ 20%', trendDir: 'up', sub: 'vs last month', iconBg: '#E0F2FE', iconColor: '#0284C7', iconName: 'building-2' },
    { title: 'Open Positions', target: 28, prefix: '', suffix: '', trend: '↑ 33%', trendDir: 'up', sub: 'vs last month', iconBg: '#ECFDF5', iconColor: '#10B981', iconName: 'file-text' },
    { title: 'Timesheets Approved', target: 92, prefix: '', suffix: '%', trend: '↑ 6%', trendDir: 'up', sub: 'vs last month', iconBg: '#F0F9FF', iconColor: '#0284C7', iconName: 'clock' },
    { title: 'Client Billing (This Month)', target: 48.5, prefix: '₹', suffix: 'L', trend: '', trendDir: '', sub: 'vs last month', iconBg: '#CCFBF1', iconColor: '#0D9488', iconName: 'indian-rupee' },
    { title: 'Gross Margin (This Month)', target: 12.3, prefix: '₹', suffix: 'L', trend: '↑ 14%', trendDir: 'up', sub: 'vs last month', iconBg: '#FFE4E6', iconColor: '#E11D48', iconName: 'line-chart' },
  ];

  const kpisContainer = h('div', { class: 'kpi-grid' });
  kpisData.forEach((k) => {
    const valEl = h('div', { class: 'kpi-card__val' }, `${k.prefix}0${k.suffix}`);
    const card = h('div', { class: 'kpi-card' },
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

  // 3. Middle 3 Analytics Charts matching Image 2
  const chartsRow = h('div', { class: 'dash-middle-grid', style: 'display: grid; grid-template-columns: 1.15fr 0.95fr 1fr; gap: 16px; align-items: stretch;' });

  // Tooltip helper
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

  // Chart 1: Deployment Trend (Jan-Sep stacked bar)
  const trendMonths = [
    { m: 'Jan', dep: 60, onb: 15, ext: 5 },
    { m: 'Feb', dep: 75, onb: 18, ext: 6 },
    { m: 'Mar', dep: 95, onb: 22, ext: 7 },
    { m: 'Apr', dep: 110, onb: 25, ext: 8 },
    { m: 'May', dep: 125, onb: 28, ext: 8 },
    { m: 'Jun', dep: 140, onb: 30, ext: 10 },
    { m: 'Jul', dep: 155, onb: 32, ext: 11 },
    { m: 'Aug', dep: 170, onb: 30, ext: 12 },
    { m: 'Sep', dep: 186, onb: 32, ext: 14 },
  ];
  const trendW = 380, trendH = 200, padL = 36, padB = 26, padT = 16, padR = 12;
  const tInnerW = trendW - padL - padR;
  const tInnerH = trendH - padT - padB;
  const colW = tInnerW / trendMonths.length;

  let trendBarsSvg = '';
  trendMonths.forEach((d, i) => {
    const x = padL + i * colW + (colW - 16) / 2;
    const hDep = (d.dep / 240) * tInnerH;
    const hOnb = (d.onb / 240) * tInnerH;
    const hExt = (d.ext / 240) * tInnerH;
    const yDep = padT + tInnerH - hDep;
    const yOnb = yDep - hOnb;
    const yExt = yOnb - hExt;

    trendBarsSvg += `
      <rect x="${x}" y="${yDep}" width="16" height="${hDep}" fill="#1E60FF" rx="2" class="chart-bar" data-tip="${d.m}: ${d.dep} Deployed" />
      <rect x="${x}" y="${yOnb}" width="16" height="${hOnb}" fill="#10B981" rx="2" class="chart-bar" data-tip="${d.m}: ${d.onb} Onboarding" />
      <rect x="${x}" y="${yExt}" width="16" height="${hExt}" fill="#F87171" rx="2" class="chart-bar" data-tip="${d.m}: ${d.ext} Exits" />
      <text x="${x + 8}" y="${trendH - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">${d.m}</text>
    `;
  });

  const trendCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Deployment Trend'),
      h('div', { class: 'cluster gap-3', style: 'font-size: 11.5px;' },
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #1E60FF;' }),
          'Deployed'
        ),
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #10B981;' }),
          'Onboarding'
        ),
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #F87171;' }),
          'Exits'
        )
      )
    ),
    h('div', { style: 'width: 100%; position: relative;' },
      (() => {
        const div = document.createElement('div');
        div.innerHTML = `
          <svg viewBox="0 0 ${trendW} ${trendH}" style="width: 100%; height: auto; display: block;">
            <line x1="${padL}" y1="${padT}" x2="${trendW - padR}" y2="${padT}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${padL - 6}" y="${padT + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">200</text>
            <line x1="${padL}" y1="${padT + tInnerH * 0.25}" x2="${trendW - padR}" y2="${padT + tInnerH * 0.25}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${padL - 6}" y="${padT + tInnerH * 0.25 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">150</text>
            <line x1="${padL}" y1="${padT + tInnerH * 0.5}" x2="${trendW - padR}" y2="${padT + tInnerH * 0.5}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${padL - 6}" y="${padT + tInnerH * 0.5 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">100</text>
            <line x1="${padL}" y1="${padT + tInnerH * 0.75}" x2="${trendW - padR}" y2="${padT + tInnerH * 0.75}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${padL - 6}" y="${padT + tInnerH * 0.75 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">50</text>
            <line x1="${padL}" y1="${padT + tInnerH}" x2="${trendW - padR}" y2="${padT + tInnerH}" stroke="var(--border)"/>
            <text x="${padL - 6}" y="${padT + tInnerH + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">0</text>
            ${trendBarsSvg}
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

  // Chart 2: Client-wise Deployment (Donut Chart)
  const clientsData = [
    { label: 'TCS', count: 42, color: '#1E60FF' },
    { label: 'Infosys', count: 36, color: '#00A3E0' },
    { label: 'Wipro', count: 28, color: '#14B8A6' },
    { label: 'HCL', count: 22, color: '#10B981' },
    { label: 'Accenture', count: 18, color: '#F59E0B' },
    { label: 'Tech Mahindra', count: 14, color: '#F97316' },
    { label: 'Others', count: 26, color: '#94A3B8' },
  ];
  const donutTotal = 186;
  const radius = 62;
  const circ = 2 * Math.PI * radius;
  let cum = 0;
  const donutPaths = clientsData.map((c) => {
    const frac = c.count / donutTotal;
    const strokeDash = frac * circ;
    const strokeOffset = -cum * circ;
    cum += frac;
    return `<circle cx="85" cy="85" r="${radius}" fill="none" stroke="${c.color}" stroke-width="24"
      stroke-dasharray="${strokeDash} ${circ - strokeDash}" stroke-dashoffset="${strokeOffset}"
      class="donut-slice" data-client="${c.label}" data-count="${c.count}" data-pct="${Math.round(frac * 100)}" style="transition: transform 0.2s ease, opacity 0.2s ease; cursor: pointer; transform-origin: 85px 85px;" />`;
  }).join('');

  const donutLegend = h('div', { class: 'donut-legend', style: 'flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 12px;' },
    ...clientsData.map((c) => h('div', { class: 'donut-legend__item', style: 'display: flex; align-items: center; justify-content: space-between; padding: 2px 4px;' },
      h('div', { class: 'cluster gap-2' },
        h('span', { class: 'donut-legend__dot', style: `width: 8px; height: 8px; border-radius: 50%; background: ${c.color}; flex-shrink: 0;` }),
        h('span', { style: 'color: var(--text);' }, c.label)
      ),
      h('span', { style: 'font-weight: 700; color: var(--text);' }, c.count)
    ))
  );

  const donutCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Client-wise Deployment')
    ),
    h('div', { style: 'display: flex; align-items: center; gap: 14px; padding-top: 4px;' },
      (() => {
        const div = document.createElement('div');
        div.style.cssText = 'position: relative; width: 150px; height: 150px; flex-shrink: 0;';
        div.innerHTML = `
          <svg viewBox="0 0 170 170" style="width: 100%; height: 100%; transform: rotate(-90deg);">
            ${donutPaths}
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-size: 19px; font-weight: 800; font-family: var(--font-heading); color: var(--text);">186</span>
            <span style="font-size: 10px; color: var(--text-muted); font-weight: 600;">Deployed</span>
          </div>
        `;
        div.querySelectorAll('.donut-slice').forEach((s) => {
          s.addEventListener('mouseenter', (e) => {
            s.style.transform = 'scale(1.04)';
            showTip(e, `<strong>${s.dataset.client}</strong>: ${s.dataset.count} (${s.dataset.pct}%)`);
          });
          s.addEventListener('mouseleave', () => {
            s.style.transform = 'scale(1)';
            hideTip();
          });
        });
        return div;
      })(),
      donutLegend
    )
  );

  // Chart 3: Billing vs Payroll Cost (Apr-Sep Clustered Bar)
  const billingMonths = [
    { m: 'Apr', bill: 38, cost: 26 },
    { m: 'May', bill: 40, cost: 27 },
    { m: 'Jun', bill: 43, cost: 28 },
    { m: 'Jul', bill: 45, cost: 29 },
    { m: 'Aug', bill: 47, cost: 30 },
    { m: 'Sep', bill: 48.5, cost: 31 },
  ];
  const bW = 340, bH = 200, bPadL = 34, bPadB = 26, bPadT = 16, bPadR = 12;
  const bInW = bW - bPadL - bPadR;
  const bInH = bH - bPadT - bPadB;
  const bColW = bInW / billingMonths.length;

  let billingBarsSvg = '';
  billingMonths.forEach((d, i) => {
    const cx = bPadL + i * bColW + bColW / 2;
    const hBill = (d.bill / 60) * bInH;
    const hCost = (d.cost / 60) * bInH;
    const yBill = bPadT + bInH - hBill;
    const yCost = bPadT + bInH - hCost;

    billingBarsSvg += `
      <rect x="${cx - 13}" y="${yBill}" width="11" height="${hBill}" fill="#1E60FF" rx="2" class="chart-bar" data-tip="${d.m}: ₹${d.bill}L Billed" />
      <rect x="${cx + 2}" y="${yCost}" width="11" height="${hCost}" fill="#10B981" rx="2" class="chart-bar" data-tip="${d.m}: ₹${d.cost}L Payroll Cost" />
      <text x="${cx}" y="${bH - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-muted)">${d.m}</text>
    `;
  });

  const billingCard = h('div', { class: 'chart-card' },
    h('div', { class: 'chart-card__head' },
      h('h2', { class: 'chart-card__title' }, 'Billing vs Payroll Cost'),
      h('div', { class: 'cluster gap-3', style: 'font-size: 11.5px;' },
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #1E60FF;' }),
          'Client Billing'
        ),
        h('span', { class: 'cluster gap-1', style: 'color: var(--text-muted);' },
          h('span', { style: 'width: 8px; height: 8px; border-radius: 50%; background: #10B981;' }),
          'Employee Cost'
        )
      )
    ),
    h('div', { style: 'width: 100%; position: relative;' },
      (() => {
        const div = document.createElement('div');
        div.innerHTML = `
          <svg viewBox="0 0 ${bW} ${bH}" style="width: 100%; height: auto; display: block;">
            <line x1="${bPadL}" y1="${bPadT}" x2="${bW - bPadR}" y2="${bPadT}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">60L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH * 0.33}" x2="${bW - bPadR}" y2="${bPadT + bInH * 0.33}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH * 0.33 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">40L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH * 0.67}" x2="${bW - bPadR}" y2="${bPadT + bInH * 0.67}" stroke="var(--border)" stroke-dasharray="3 3"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH * 0.67 + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">20L</text>
            <line x1="${bPadL}" y1="${bPadT + bInH}" x2="${bW - bPadR}" y2="${bPadT + bInH}" stroke="var(--border)"/>
            <text x="${bPadL - 6}" y="${bPadT + bInH + 4}" text-anchor="end" font-size="10" fill="var(--text-muted)">0L</text>
            ${billingBarsSvg}
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

  chartsRow.append(trendCard, donutCard, billingCard);

  // 4. Recent Deployments Table (left 75%) & Quick Actions (right 25%)
  const tableAndActionsRow = h('div', { style: 'display: grid; grid-template-columns: 3fr 1fr; gap: 16px; align-items: start;' });

  const deployments = [
    { num: 1, name: 'Arun Kumar', id: 'EMP0012', client: 'TCS', clientClass: 'company-pill--tcs', project: 'Application Development', date: 'Aug 01, 2026', type: 'Contract', status: 'Active', statusClass: 'dash-status-pill--active' },
    { num: 2, name: 'Priya Sharma', id: 'EMP0034', client: 'Infosys', clientClass: 'company-pill--infosys', project: 'QA & Testing', date: 'Jul 15, 2026', type: 'Contract', status: 'Active', statusClass: 'dash-status-pill--active' },
    { num: 3, name: 'Vikram S', id: 'EMP0045', client: 'Wipro', clientClass: 'company-pill--wipro', project: 'Infrastructure', date: 'Jun 10, 2026', type: 'Contract', status: 'Active', statusClass: 'dash-status-pill--active' },
    { num: 4, name: 'Sneha R', id: 'EMP0067', client: 'HCL', clientClass: 'company-pill--hcl', project: 'Product Support', date: 'Aug 20, 2026', type: 'Contract', status: 'On Probation', statusClass: 'dash-status-pill--probation' },
    { num: 5, name: 'Karthik M', id: 'EMP0078', client: 'Accenture', clientClass: 'company-pill--accenture', project: 'Cloud Operations', date: 'Jul 01, 2026', type: 'Contract', status: 'Active', statusClass: 'dash-status-pill--active' },
  ];

  const tableWrap = h('div', { class: 'dash-table-wrap' },
    h('div', { style: 'padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border);' },
      h('h2', { style: 'font-size: 15px; font-weight: 700; color: var(--text); margin: 0;' }, 'Recent Deployments'),
      h('button', {
        class: 'btn btn--ghost btn--sm',
        style: 'color: #1E60FF; font-weight: 600;',
        onClick: () => router.navigate('/geo-attendance/deployments')
      }, 'View All')
    ),
    h('div', { style: 'overflow-x: auto;' },
      h('table', { class: 'dash-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, '#'),
            h('th', null, 'Employee'),
            h('th', null, 'Client Company'),
            h('th', null, 'Project / Department'),
            h('th', null, 'Joining Date'),
            h('th', null, 'Employment Type'),
            h('th', null, 'Status'),
            h('th', null, 'Actions')
          )
        ),
        h('tbody', null,
          ...deployments.map((d) => h('tr', null,
            h('td', { style: 'color: var(--text-muted);' }, String(d.num)),
            h('td', null,
              h('div', { class: 'table-emp-cell' },
                h('div', { class: 'table-emp-avatar-fallback' }, d.name[0]),
                h('div', { class: 'table-emp-meta' },
                  h('span', { class: 'table-emp-name' }, d.name),
                  h('span', { class: 'table-emp-id' }, d.id)
                )
              )
            ),
            h('td', null,
              h('div', { class: 'company-cell' },
                h('span', { class: `company-pill ${d.clientClass}` }, d.client),
                h('span', null, d.client)
              )
            ),
            h('td', null, d.project),
            h('td', null, d.date),
            h('td', null, d.type),
            h('td', null,
              h('span', { class: `dash-status-pill ${d.statusClass}` }, d.status)
            ),
            h('td', null,
              h('button', {
                class: 'dash-action-btn',
                type: 'button',
                'aria-label': 'More options',
                onClick: (e) => {
                  toast(`Action menu for ${d.name}`);
                }
              }, '⋮')
            )
          ))
        )
      )
    )
  );

  // Quick Actions Card (Image 2)
  const quickActionsData = [
    { label: 'Add Client Company', icon: 'building-2', color: '#1E60FF', bg: '#EFF6FF', action: () => openAddClientModal() },
    { label: 'Create Job Opening', icon: 'briefcase', color: '#0284C7', bg: '#E0F2FE', action: () => toast('Opened Job Opening wizard') },
    { label: 'Deploy Candidate', icon: 'user-plus', color: '#10B981', bg: '#ECFDF5', action: () => openDeployModal() },
    { label: 'Generate Invoice', icon: 'receipt', color: '#0D9488', bg: '#CCFBF1', action: () => router.navigate('/compliance') },
    { label: 'View Timesheets', icon: 'clock', color: '#2563EB', bg: '#DBEAFE', action: () => router.navigate('/timesheets') },
    { label: 'Process Payroll', icon: 'wallet', color: '#059669', bg: '#D1FAE5', action: () => router.navigate('/payroll') },
  ];

  function openAddClientModal() {
    openModal({
      title: 'Add New Client Company',
      size: 'md',
      body: h('div', { class: 'stack gap-3' },
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Company Legal Name'),
          h('input', { class: 'input', placeholder: 'e.g. Acme Global Technologies Ltd.' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Industry / Domain'),
          h('input', { class: 'input', placeholder: 'e.g. IT Services & Consulting' })
        ),
        h('label', { class: 'field' },
          h('span', { class: 'field__label text-xs fw-600' }, 'Primary Account Manager'),
          h('input', { class: 'input', value: 'Vignesh Palanisamy' })
        ),
        h('div', { class: 'cluster justify-end gap-2' },
          h('button', { class: 'btn btn--primary', onClick: () => toast('New Client Company added!') }, 'Create Company Profile')
        )
      )
    });
  }

  const quickCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head', style: 'margin-bottom: 12px;' },
      h('h2', { class: 'panel-card__title' }, 'Quick Actions')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
      ...quickActionsData.map((q) => h('button', {
        class: 'quick-action-btn',
        type: 'button',
        onClick: q.action
      },
        h('div', { class: 'quick-action-btn__left' },
          h('div', { class: 'quick-action-btn__icon', style: `background: ${q.bg}; color: ${q.color};` },
            icon(q.icon, { size: 14 })
          ),
          h('span', { class: 'quick-action-btn__label' }, q.label)
        ),
        icon('chevron-right', { size: 14, cls: 'quick-action-btn__arrow' })
      ))
    )
  );

  tableAndActionsRow.append(tableWrap, quickCard);

  // 5. Bottom Row: 4 Cards (Pending Approvals 12, Client Requests 5, Upcoming Renewals 3, Partnership Promo Card)
  const bottomRow = h('div', { style: 'display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: stretch;' });

  // Card 1: Pending Approvals
  const pendingApprovalsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('div', { class: 'panel-card__title-wrap' },
        h('h2', { class: 'panel-card__title' }, 'Pending Approvals'),
        h('span', { class: 'panel-card__badge' }, '12')
      ),
      h('span', { class: 'panel-card__link', onClick: () => router.navigate('/timesheets') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' },
      [
        { title: 'Timesheet approval (5)', sub: 'Client: TCS, Infosys', time: '2 hours ago', icon: 'file-text', bg: '#FEE2E2', color: '#EF4444' },
        { title: 'Leave requests (3)', sub: 'Awaiting manager approval', time: '5 hours ago', icon: 'calendar', bg: '#FEF3C7', color: '#D97706' },
        { title: 'Invoice approval (2)', sub: 'Client: HCL, Wipro', time: '1 day ago', icon: 'receipt', bg: '#E0F2FE', color: '#0284C7' }
      ].map((it) => h('div', {
        style: 'display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2);'
      },
        h('div', { style: 'display: flex; align-items: center; gap: 10px;' },
          h('div', { style: `width: 32px; height: 32px; border-radius: 8px; background: ${it.bg}; color: ${it.color}; display: grid; place-items: center; flex-shrink: 0;` },
            icon(it.icon, { size: 16 })
          ),
          h('div', { style: 'display: flex; flex-direction: column; line-height: 1.25;' },
            h('span', { style: 'font-size: 12.5px; font-weight: 700; color: var(--text);' }, it.title),
            h('span', { style: 'font-size: 11px; color: var(--text-muted);' }, it.sub)
          )
        ),
        h('span', { style: 'font-size: 10.5px; color: var(--text-muted); white-space: nowrap;' }, it.time)
      ))
    )
  );

  // Card 2: Client Requests
  const clientRequestsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('div', { class: 'panel-card__title-wrap' },
        h('h2', { class: 'panel-card__title' }, 'Client Requests'),
        h('span', { class: 'panel-card__badge' }, '5')
      ),
      h('span', { class: 'panel-card__link', onClick: () => toast('All Client Requests reviewed') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' },
      [
        { title: 'Need 5 Java Developers', client: 'TCS', time: '2 hours ago', icon: 'briefcase', bg: '#EFF6FF', color: '#1E60FF' },
        { title: 'Need 3 QA Engineers', client: 'Infosys', time: '6 hours ago', icon: 'user-check', bg: '#E0F2FE', color: '#0284C7' },
        { title: 'Request for replacement', client: 'Wipro', time: '1 day ago', icon: 'refresh-cw', bg: '#F5F3FF', color: '#7C3AED' }
      ].map((it) => h('div', {
        style: 'display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2);'
      },
        h('div', { style: 'display: flex; align-items: center; gap: 10px;' },
          h('div', { style: `width: 32px; height: 32px; border-radius: 8px; background: ${it.bg}; color: ${it.color}; display: grid; place-items: center; flex-shrink: 0;` },
            icon(it.icon, { size: 16 })
          ),
          h('div', { style: 'display: flex; flex-direction: column; line-height: 1.25;' },
            h('span', { style: 'font-size: 12.5px; font-weight: 700; color: var(--text);' }, it.title),
            h('span', { style: 'font-size: 11px; color: var(--text-muted);' }, it.client)
          )
        ),
        h('span', { style: 'font-size: 10.5px; color: var(--text-muted); white-space: nowrap;' }, it.time)
      ))
    )
  );

  // Card 3: Upcoming Renewals
  const renewalsCard = h('div', { class: 'panel-card' },
    h('div', { class: 'panel-card__head' },
      h('div', { class: 'panel-card__title-wrap' },
        h('h2', { class: 'panel-card__title' }, 'Upcoming Renewals'),
        h('span', { class: 'panel-card__badge' }, '3')
      ),
      h('span', { class: 'panel-card__link', onClick: () => router.navigate('/documents') }, 'View All')
    ),
    h('div', { style: 'display: flex; flex-direction: column; gap: 10px;' },
      [
        { title: 'Contract Renewal - TCS', days: '12 days left', icon: 'file-text' },
        { title: 'Contract Renewal - Oct 28, 2026', days: '25 days left', icon: 'file-text' },
        { title: 'Contract Renewal - Wipro', days: '33 days left', icon: 'file-text' }
      ].map((it) => h('div', {
        style: 'display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2);'
      },
        h('div', { style: 'display: flex; align-items: center; gap: 10px;' },
          h('div', { style: 'width: 32px; height: 32px; border-radius: 8px; background: #EFF6FF; color: #1E60FF; display: grid; place-items: center; flex-shrink: 0;' },
            icon(it.icon, { size: 16 })
          ),
          h('div', { style: 'display: flex; flex-direction: column; line-height: 1.25;' },
            h('span', { style: 'font-size: 12.5px; font-weight: 700; color: var(--text);' }, it.title)
          )
        ),
        h('span', { style: 'font-size: 11px; font-weight: 700; color: #DC2626; white-space: nowrap;' }, it.days)
      ))
    )
  );

  // Card 4: Stronger Partnerships Promo Card
  const promoCard = h('div', { class: 'promo-banner-card promo-banner-card--blue', style: 'flex-direction: column; align-items: flex-start; justify-content: space-between;' },
    h('div', { style: 'display: flex; align-items: center; gap: 12px;' },
      h('span', { style: 'font-size: 32px;' }, '🤝'),
      h('div', null,
        h('h3', { class: 'promo-banner-card__title', style: 'font-size: 14px;' }, 'Stronger Partnerships. Brighter Futures.'),
        h('p', { class: 'promo-banner-card__text', style: 'font-size: 11px;' }, 'We build teams that build tomorrow.')
      )
    ),
    h('button', {
      class: 'promo-banner-card__btn',
      type: 'button',
      style: 'margin-top: 8px; width: 100%; text-align: center; justify-content: center;',
      onClick: () => openAddClientModal()
    }, 'Add New Client')
  );

  bottomRow.append(pendingApprovalsCard, clientRequestsCard, renewalsCard, promoCard);

  // 6. Footer matching Image 2
  const footerRow = h('div', { style: 'display: flex; align-items: center; justify-content: space-between; margin-top: 10px; padding: 12px 4px; border-top: 1px solid var(--border); flex-wrap: wrap; gap: 10px;' },
    h('span', { style: 'font-size: 12px; color: var(--text-muted);' }, '© 2026 Ellowring. All rights reserved.'),
    h('span', { class: 'dash-tagline', style: 'margin: 0;' }, 'One Ecosystem. Zero Gaps. Total Business Automation.')
  );

  root.append(
    header,
    kpisContainer,
    chartsRow,
    tableAndActionsRow,
    bottomRow,
    footerRow
  );

  return root;
}
