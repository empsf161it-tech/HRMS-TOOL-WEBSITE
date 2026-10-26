/* Purpose: single entry that registers every eh-* custom element and wires global behaviours (tooltips, ripple). Third-party libraries (Chart.js, Leaflet ...) stay lazy inside their components. */
import './eh-icon.js';
import './eh-button.js';
import './display.js';
import './feedback.js';
import './ui.js';
import './menu.js';
import './eh-input.js';
import './eh-choice.js';
import './eh-pickers.js';
import './eh-media.js';
import './eh-upload.js';
import './eh-inputs-adv.js';
import './eh-wizard.js';
import './eh-nav.js';
import './table-tools.js';
import './eh-data-table.js';
import './eh-chart.js';
import './eh-structure.js';
import './eh-calendar.js';
import './eh-map.js';
import { initTooltips } from './menu.js';
import { initRipple } from '../core/motion-engine.js';

export * from './eh-button.js';
export * from './display.js';
export * from './feedback.js';
export * from './ui.js';
export * from './menu.js';
export * from './eh-data-table.js';
export * from './eh-chart.js';
export * from './eh-nav.js';
export * from './illustrations.js';

let started = false;
/** Start delegated global behaviours once (call from the bootstrap). */
export function initComponents() {
  if (started) return; started = true;
  initTooltips(); initRipple();
}
