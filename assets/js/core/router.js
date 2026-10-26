/* Purpose: hash router - lazy import() per module, permission guards, View Transitions between routes, abortable loads, skeletons, error/403/404 states. */
import { findModule } from '../modules/registry.js';
import { can, canModule } from './permissions.js';
import { appStore } from './store.js';
import { bus } from './events.js';
import { motionReduced } from './motion-engine.js';
import { configStore } from './config-store.js';
import { t } from './i18n.js';
import { h } from './dom.js';

let outlet, announcer, abort, disposers = [], ignoreNext = false, lastHash = '';
const guards = [];

/** Parse the current hash into {path, segs, query}. */
export function parseHash(hash = location.hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  return { path: path || '/', segs: path.split('/').filter(Boolean), query: Object.fromEntries(new URLSearchParams(qs)) };
}

function matchRoute(routes, segs) {
  for (const r of routes) {
    const ps = r.path.split('/').filter(Boolean);
    if (ps.length !== segs.length) continue;
    const params = {}; let ok = true;
    ps.forEach((p, i) => { if (p.startsWith(':')) params[p.slice(1)] = decodeURIComponent(segs[i]); else if (p !== segs[i]) ok = false; });
    if (ok) return { route: r, params };
  }
  return null;
}

const errors = () => import('../modules/shared/states.js');

async function resolve({ segs, query, path }) {
  if (!segs.length) return { redirect: '/home' };
  const mod = findModule(segs[0]);
  if (!mod) return { view: (await errors()).notFound, route: { title: '404' }, params: {} };
  if (!mod.public && !appStore.user) return { redirect: `/login?next=${encodeURIComponent(path)}` };
  if (mod.public && appStore.user && segs[0] === 'login' && !query.switch) return { redirect: '/home' };
  if (!mod.public && !mod.always && !canModule(mod.id)) return { view: (await errors()).forbidden, route: { title: '403' }, params: {}, mod };
  if (!mod.routes) return { view: (await import('../modules/shared/scheduled.js')).default, route: { title: mod.label }, params: { sub: segs.slice(1).join('/') }, mod };
  const { routes } = await mod.routes();
  const m = matchRoute(routes, segs.slice(1));
  if (!m) return { view: (await errors()).notFound, route: { title: '404' }, params: {}, mod };
  if (m.route.redirect) return { redirect: m.route.redirect.startsWith('/') ? m.route.redirect : `/${mod.id}/${m.route.redirect}` };
  if (m.route.perm && !can(m.route.perm)) return { view: (await errors()).forbidden, route: { title: '403' }, params: {}, mod };
  return { view: (await m.route.load()).default, route: m.route, params: m.params, mod };
}

async function swap(node) {
  const update = () => { disposers.splice(0).forEach((fn) => { try { fn(); } catch { /* ignore */ } }); outlet.replaceChildren(node); };
  const useVT = document.startViewTransition && !motionReduced() && configStore.config.animations?.toggles?.pageTransitions !== false;
  if (useVT) {
    try {
      const vt = document.startViewTransition(update);
      await (vt.updateCallbackDone || vt.finished || Promise.resolve());
    } catch {
      update();
    }
  } else {
    update();
  }
}

/** Render the current route. */
async function render() {
  const loc = parseHash();
  abort?.abort(); abort = new AbortController(); const { signal } = abort;
  let skeletonTimer;
  try {
    const r = await resolve(loc);
    if (r.redirect) {
      const targetHash = `#${r.redirect}`;
      if (location.hash === targetHash) {
        render();
      } else {
        location.replace(targetHash);
      }
      return;
    }
    const header = {
      moduleId: r.mod?.id,
      title: r.route.title || r.mod?.label || '',
      breadcrumbs: [{ label: t('nav.home'), href: '#/home' }, ...(r.mod && r.mod.id !== 'home' ? [{ label: r.mod.label, href: `#/${r.mod.id}` }] : []), ...(r.route.title && r.mod && r.route.title !== r.mod.label ? [{ label: r.route.title }] : [])],
      actions: []
    };
    bus.emit('page-header', header);
    skeletonTimer = setTimeout(() => { if (outlet.firstElementChild?.tagName !== 'EH-SKELETON') outlet.replaceChildren(h('eh-skeleton', { variant: 'page' })); }, 160);
    const ctx = {
      params: r.params, query: loc.query, path: loc.path, signal, route: r.route, module: r.mod, user: appStore.user,
      setHeader: (patch) => bus.emit('page-header', { ...header, ...patch }),
      onDispose: (fn) => disposers.push(fn),
      navigate: router.navigate,
    };
    const node = await r.view(ctx);
    clearTimeout(skeletonTimer);
    if (signal.aborted) return;
    await swap(node instanceof Node ? node : h('div', null, String(node ?? '')));
    document.title = `${header.title || 'Ellowring'} · ${t('app.name')}`;
    announcer && (announcer.textContent = header.title);
    outlet.focus({ preventScroll: true }); scrollTo({ top: 0 });
    bus.emit('route-change', { ...loc, module: r.mod, route: r.route });
  } catch (err) {
    clearTimeout(skeletonTimer);
    if (err?.name === 'AbortError' || signal.aborted) return;
    console.error(err);
    const { errorView } = await errors();
    await swap(errorView(err, () => render()));
  }
}

export const router = {
  /**
   * Start routing into an outlet element.
   * @param {HTMLElement} el main outlet; @param {HTMLElement} [live] aria-live announcer
   */
  start(el, live) {
    outlet = el; announcer = live; lastHash = location.hash;
    addEventListener('hashchange', async () => {
      if (ignoreNext) { ignoreNext = false; return; }
      for (const g of guards) { if (g() === false) { ignoreNext = true; location.hash = lastHash; return; } }
      lastHash = location.hash;
      render();
    });
    if (!location.hash || location.hash === '#' || location.hash === '#/') {
      location.replace('#/home');
      lastHash = '#/home';
    }
    render();
  },
  /** Navigate to a path like "/attendance/daily?x=1". */
  navigate(path, { replace = false } = {}) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const h2 = `#${cleanPath}`;
    if (location.hash === h2) {
      render();
      return;
    }
    replace ? location.replace(h2) : (location.hash = h2);
  },
  /** Re-render the current route. */
  refresh: () => render(),
  /** Register a navigation guard; return false to block (e.g. unsaved changes). */
  guard(fn) { guards.push(fn); return () => guards.splice(guards.indexOf(fn), 1); },
  parse: parseHash,
};
