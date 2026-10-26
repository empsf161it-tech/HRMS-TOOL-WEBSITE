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

/** Observe [data-animate] elements: adds .is-visible once, applies delay/duration/stagger attributes. */
export function observeReveals(root = document) {
  const els = [...root.querySelectorAll('[data-animate]')];
  els.forEach((el) => {
    if (el.dataset.animateDelay) el.style.setProperty('--anim-delay', `${el.dataset.animateDelay}ms`);
    if (el.dataset.animateDuration) el.style.setProperty('--anim-dur', `${el.dataset.animateDuration}ms`);
  });
  root.querySelectorAll('[data-animate-stagger]').forEach((p) => {
    const step = +p.dataset.animateStagger || 60;
    [...p.children].forEach((c, i) => { if (c.hasAttribute('data-animate')) c.style.setProperty('--anim-delay', `${i * step}ms`); });
  });
  if (document.documentElement.hasAttribute('data-scroll-driven')) return;
  io ??= new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: 0.12 });
  els.forEach((el) => { if (!el.classList.contains('is-visible')) io.observe(el); });
}

/** Re-run entrance animations inside a root (Control Center "Replay"). */
export function replayAnimations(root = document) {
  root.querySelectorAll('[data-animate]').forEach((el) => el.classList.remove('is-visible'));
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
