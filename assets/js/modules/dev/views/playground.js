/* Purpose: theme playground - live customisation of theme presets, primary/secondary colors, border radius, density, button effects and mock API latency/error toggles. */
import { h } from '../../../core/dom.js';
import { configStore } from '../../../core/config-store.js';
import { applyTheme } from '../../../core/theme-engine.js';
import { api, apiSettings } from '../../../services/api.js';
import { button } from '../../../components/eh-button.js';
import { toastSuccess, toastError, confirmDialog } from '../../../components/ui.js';
import { appStore } from '../../../core/store.js';

export default async function playgroundView() {
  const cfg = configStore.config;
  const presets = cfg.theme.presets || {};

  const container = h('div', { class: 'stack gap-6' });

  // Header info
  const intro = h('div', { class: 'card p-6 stack gap-2' },
    h('h2', { class: 'text-xl fw-700' }, 'Theme & System Playground'),
    h('p', { class: 'text-sm text-muted' },
      'Adjust design tokens and mock API behaviour in real time. Changes are stored in IndexedDB/localStorage and immediately update the entire application.'));
  container.append(intro);

  const grid = h('div', { class: 'grid grid--2 gap-6' });

  // 1. Presets & Colors
  const presetBtns = Object.entries(presets).map(([k, p]) => {
    return button(p.label, {
      variant: cfg.theme.preset === k ? 'primary' : 'outline',
      size: 'sm',
      onClick: () => {
        configStore.set('theme.preset', k);
        configStore.set('theme.light.primary', p.light.primary);
        configStore.set('theme.light.secondary', p.light.secondary);
        configStore.set('theme.light.accent', p.light.accent);
        configStore.set('theme.dark.primary', p.dark.primary);
        configStore.set('theme.dark.secondary', p.dark.secondary);
        configStore.set('theme.dark.accent', p.dark.accent);
        applyTheme(configStore.config);
        toastSuccess(`Applied ${p.label} preset.`);
      },
    });
  });

  const primaryPicker = h('input', {
    type: 'color',
    class: 'color-picker',
    value: cfg.theme.light?.primary || '#5414B8',
    onInput: (e) => {
      configStore.set('theme.light.primary', e.target.value);
      applyTheme(configStore.config);
    },
  });

  const secondaryPicker = h('input', {
    type: 'color',
    class: 'color-picker',
    value: cfg.theme.light?.secondary || '#00A3E0',
    onInput: (e) => {
      configStore.set('theme.light.secondary', e.target.value);
      applyTheme(configStore.config);
    },
  });

  const colorCard = h('div', { class: 'card p-6 stack gap-4' },
    h('h3', { class: 'card__title' }, 'Brand Presets & Colors'),
    h('div', { class: 'cluster' }, ...presetBtns),
    h('hr', null),
    h('div', { class: 'grid grid--2 gap-4' },
      h('div', { class: 'field' },
        h('label', { class: 'label' }, 'Primary Brand Color'),
        h('div', { class: 'cluster' }, primaryPicker, h('span', { class: 'text-sm font-mono' }, cfg.theme.light?.primary))),
      h('div', { class: 'field' },
        h('label', { class: 'label' }, 'Secondary Brand Color'),
        h('div', { class: 'cluster' }, secondaryPicker, h('span', { class: 'text-sm font-mono' }, cfg.theme.light?.secondary)))));

  // 2. Shape, Density & Layout
  const radiusSlider = h('input', {
    type: 'range',
    min: 0,
    max: 20,
    value: cfg.theme.radius?.md ?? 10,
    onInput: (e) => {
      const v = +e.target.value;
      configStore.set('theme.radius.sm', Math.max(0, v - 4));
      configStore.set('theme.radius.md', v);
      configStore.set('theme.radius.lg', v + 6);
      configStore.set('theme.radius.xl', v + 14);
      applyTheme(configStore.config);
    },
  });

  const densitySelect = h('select', {
    class: 'input',
    onChange: (e) => {
      appStore.density = e.target.value;
      configStore.set('layout.density', e.target.value);
      applyTheme(configStore.config);
      toastSuccess(`Density set to ${e.target.value}`);
    },
  },
    h('option', { value: 'comfortable', selected: appStore.density === 'comfortable' || cfg.layout?.density === 'comfortable' }, 'Comfortable (Standard rows)'),
    h('option', { value: 'compact', selected: appStore.density === 'compact' || cfg.layout?.density === 'compact' }, 'Compact (Dense data rows)'));

  const layoutCard = h('div', { class: 'card p-6 stack gap-4' },
    h('h3', { class: 'card__title' }, 'Shape & Layout Density'),
    h('div', { class: 'field' },
      h('div', { class: 'split mb-1' },
        h('label', { class: 'label', style: { margin: 0 } }, 'Border Radius Scale'),
        h('span', { class: 'text-xs text-muted' }, `${cfg.theme.radius?.md ?? 10}px base`)),
      radiusSlider),
    h('div', { class: 'field' },
      h('label', { class: 'label' }, 'Data Density'),
      densitySelect));

  grid.append(colorCard, layoutCard);
  container.append(grid);

  // 3. API Simulation & Data Reset
  const settings = apiSettings.get();
  const latencySlider = h('input', {
    type: 'range',
    min: 0,
    max: 1500,
    step: 50,
    value: settings.minDelay || 200,
    onInput: (e) => {
      const v = +e.target.value;
      apiSettings.set({ minDelay: v, maxDelay: v + 300 });
      latencyLabel.textContent = `${v}ms – ${v + 300}ms`;
    },
  });
  const latencyLabel = h('span', { class: 'text-xs text-muted' }, `${settings.minDelay}ms – ${settings.maxDelay}ms`);

  const failSlider = h('input', {
    type: 'range',
    min: 0,
    max: 50,
    step: 5,
    value: Math.round((settings.failRate || 0) * 100),
    onInput: (e) => {
      const v = +e.target.value;
      apiSettings.set({ failRate: v / 100 });
      failLabel.textContent = `${v}%`;
    },
  });
  const failLabel = h('span', { class: 'text-xs text-muted' }, `${Math.round((settings.failRate || 0) * 100)}%`);

  const resetBtn = button('Reset Demo Data to Seed', {
    variant: 'danger',
    icon: 'refresh-cw',
    onClick: async () => {
      const ok = await confirmDialog({
        title: 'Reset All Data?',
        message: 'This will reset all employees, notifications, audit logs and session back to the clean seed dataset.',
        confirmLabel: 'Reset Data',
        danger: true,
      });
      if (ok) {
        await api.resetDemoData();
        toastSuccess('Demo data reset to factory seed. Reloading...');
        setTimeout(() => location.reload(), 800);
      }
    },
  });

  const apiCard = h('div', { class: 'card p-6 stack gap-4' },
    h('h3', { class: 'card__title' }, 'Mock API Simulator & Factory Reset'),
    h('div', { class: 'grid grid--2 gap-6' },
      h('div', { class: 'field' },
        h('div', { class: 'split mb-1' },
          h('label', { class: 'label', style: { margin: 0 } }, 'Network Latency Simulation'),
          latencyLabel),
        latencySlider),
      h('div', { class: 'field' },
        h('div', { class: 'split mb-1' },
          h('label', { class: 'label', style: { margin: 0 } }, 'Simulated Failure Rate'),
          failLabel),
        failSlider)),
    h('hr', null),
    h('div', { class: 'split' },
      h('span', { class: 'text-sm text-muted' }, 'Restore 240 employees, 8 branches and 8 demo user logins:'),
      resetBtn));

  container.append(apiCard);

  return container;
}
