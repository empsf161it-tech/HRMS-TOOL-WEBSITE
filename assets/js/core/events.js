/* Purpose: pub/sub event bus shared by all modules (theme-change, notification, punch, config-change ...). */
const target = new EventTarget();

export const bus = {
  /** Subscribe to an event; returns an unsubscribe function. */
  on(name, fn) {
    const h = (e) => fn(e.detail, e);
    target.addEventListener(name, h);
    return () => target.removeEventListener(name, h);
  },
  /** Subscribe once. */
  once(name, fn) {
    const h = (e) => fn(e.detail, e);
    target.addEventListener(name, h, { once: true });
  },
  /** Publish an event with an optional payload. */
  emit(name, detail) { target.dispatchEvent(new CustomEvent(name, { detail })); },
};
