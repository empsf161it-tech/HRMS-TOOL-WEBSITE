/* Purpose: applies animation settings (speed, on/off, reduced motion), runs scroll reveals, stagger and helper effects (count-up, ripple). */
import { bus } from './events.js';

const canScrollDriven = () => globalThis.CSS?.supports?.('animation-timeline: view()');
let io;

/** Apply config.animations to the document (speed token, enable switch, reduced-motion policy, scroll-driven mode). */
export function applyMotion(cfg) {
  const a = cfg.animations || {}; const root = document.documentElement;
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduced = a.reducedMotion === 'always' || (a.reducedMotion !== 'ignore' && prefersReduced);
  root.dataset.motion = a.enabled === false ? 'off' : 'on';
  reduced ? root.setAttribute('data-reduced-motion', '') : root.removeAttribute('data-reduced-motion');
  root.style.setProperty('--motion-speed', a.enabled === false ? 1000 : String(a.speed || 1));
  if (a.scrollDriven !== false && canScrollDriven() && !reduced) root.setAttribute('data-scroll-driven', ''); else root.removeAttribute('data-scroll-driven');
  bus.emit('motion-applied', { reduced });
}

/** Prefer-reduced-motion check including the config policy. */
export const motionReduced = () => document.documentElement.hasAttribute('data-reduced-motion') || document.documentElement.dataset.motion === 'off';

/**
 * Observe elements with 4-direction animation classes or [data-animate] attributes.
 * Adds .is-visible once when element enters the viewport via IntersectionObserver.
 * Also configures automated stagger delays for .stagger-children and [data-animate-stagger].
 */
export function observeReveals(root = document) {
  if (motionReduced()) {
    const all = root.querySelectorAll?.('.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in, .center-reveal, [data-animate], .dash-animate-fade, .stagger-children > *') || [];
    all.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  // 1. Process stagger containers (.stagger-children, [data-animate-stagger], .subtab-grid, .pipeline-board)
  const staggerContainers = root.querySelectorAll?.('.stagger-children, [data-animate-stagger], .subtab-grid, .pipeline-board') || [];
  staggerContainers.forEach((container) => {
    const step = +container.dataset.animateStagger || 110;
    const defaultAnim = container.dataset.animateChild || 'fade-up';
    const children = [...container.children];
    children.forEach((child, idx) => {
      // Ensure child has an animation class if none specified
      const hasAnim = child.matches('.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in, .center-reveal, [data-animate], .interactive-card, .pipeline-col');
      if (!hasAnim) {
        child.classList.add(defaultAnim);
      }
      child.style.setProperty('--anim-delay', `${idx * step}ms`);
      child.style.setProperty('--stagger-delay', `${idx * step}ms`);
    });
  });

  // 2. Query all animatable elements in the root
  const selector = '.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in, .center-reveal, [data-animate], .dash-animate-fade, .interactive-card, .pipeline-col';
  const els = root.querySelectorAll ? [...root.querySelectorAll(selector)] : [];
  if (root.matches && root.matches(selector)) {
    els.unshift(root);
  }

  // Apply explicit delay/duration overrides from data attributes
  els.forEach((el) => {
    if (el.dataset.animateDelay) el.style.setProperty('--anim-delay', `${el.dataset.animateDelay}ms`);
    if (el.dataset.animateDuration) el.style.setProperty('--anim-dur', `${el.dataset.animateDuration}ms`);
  });

  // 3. Setup lightweight, high-performance IntersectionObserver
  io ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: [0, 0.08, 0.15],
    rootMargin: '0px 0px -40px 0px'
  });

  // Observe every unrevealed element
  els.forEach((el) => {
    if (!el.classList.contains('is-visible')) {
      io.observe(el);
    }
  });
}

// Auto-wire with the application route changes
bus.on('route-change', () => {
  requestAnimationFrame(() => {
    setTimeout(() => observeReveals(document), 30);
  });
});

/** Re-run entrance animations inside a root (Control Center "Replay"). */
export function replayAnimations(root = document) {
  root.querySelectorAll('.fade-up, .fade-down, .fade-left, .fade-right, .zoom-in, .center-reveal, [data-animate], .dash-animate-fade').forEach((el) => el.classList.remove('is-visible'));
  requestAnimationFrame(() => requestAnimationFrame(() => observeReveals(root)));
}

/** Animate a number from 0 to its target text (formatted with the given function). Respects reduced motion. */
export function countUp(el, to, { duration = 900, format = (n) => Math.round(n).toLocaleString('en-IN') } = {}) {
  if (motionReduced() || duration <= 0) { el.textContent = format(to); return; }
  const t0 = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - t0) / duration); const eased = 1 - (1 - p) ** 3;
    el.textContent = format(to * eased);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/** Global delegated ripple effect on .btn press (sets origin from the pointer, no layout work). */
export function initRipple() {
  document.addEventListener('pointerdown', (e) => {
    const b = e.target.closest?.('.btn:not([disabled]):not(.btn--link)');
    if (!b || motionReduced()) return;
    const r = b.getBoundingClientRect(); const size = Math.max(r.width, r.height);
    const s = document.createElement('span'); s.className = 'btn__ripple';
    s.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
    b.append(s); s.addEventListener('animationend', () => s.remove());
  });
}
