/* Purpose: early theme bootstrap (classic script, runs before first paint) to avoid a flash of the wrong theme. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var mode = 'system';
  try { mode = localStorage.getItem('eh.theme') || 'system'; mode = JSON.parse(mode); } catch (e) { mode = 'system'; }
  if (mode === 'system') {
    mode = matchMedia('(prefers-contrast: more)').matches ? 'hc' : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  root.setAttribute('data-theme', mode);
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.setAttribute('data-reduced-motion', '');
})();
