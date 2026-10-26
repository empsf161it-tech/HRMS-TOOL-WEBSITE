/* Purpose: small looping SVG illustrations for empty, success, error, 404 and forbidden states. Static trusted markup. */

const wrap = (inner) => `<svg class="ill" viewBox="0 0 160 128" fill="none" aria-hidden="true">${inner}</svg>`;

const ART = {
  empty: wrap(`<ellipse cx="80" cy="114" rx="46" ry="6" class="ill-dot" opacity=".12"/>
    <path class="ill-fill" d="M34 62l14-30h64l14 30v34a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6z"/>
    <path class="ill-line" d="M34 62h30l6 10h20l6-10h30"/>
    <g class="ill-float"><circle cx="118" cy="26" r="5" class="ill-dot" opacity=".5"/></g>
    <g class="ill-float-2"><path class="ill-line" d="M40 24l4 8M44 24l-4 8" opacity=".6"/><circle cx="64" cy="16" r="3" class="ill-dot" opacity=".4"/></g>`),
  error: wrap(`<ellipse cx="80" cy="114" rx="46" ry="6" class="ill-dot" opacity=".12"/>
    <g class="ill-float"><path class="ill-fill" d="M46 88a20 20 0 0 1 2-40 28 28 0 0 1 54-4 22 22 0 0 1 8 44z"/>
    <path class="ill-line" d="M80 56v18"/><circle cx="80" cy="82" r="2.5" class="ill-dot"/></g>
    <g class="ill-float-2"><path class="ill-line" d="M120 30l8 8M128 30l-8 8" opacity=".6"/></g>`),
  notfound: wrap(`<ellipse cx="80" cy="114" rx="46" ry="6" class="ill-dot" opacity=".12"/>
    <path class="ill-fill" d="M42 26h52l14 14v62a4 4 0 0 1-4 4H42a4 4 0 0 1-4-4V30a4 4 0 0 1 4-4z"/>
    <path class="ill-line" d="M94 26v14h14M50 54h40M50 66h28"/>
    <g class="ill-float"><circle cx="102" cy="82" r="16" class="ill-fill"/><path class="ill-line" d="M114 94l12 12M96 80h12"/></g>`),
  forbidden: wrap(`<ellipse cx="80" cy="114" rx="46" ry="6" class="ill-dot" opacity=".12"/>
    <path class="ill-line" d="M58 56V42a22 22 0 0 1 44 0v14"/>
    <g class="ill-float"><rect class="ill-fill" x="46" y="54" width="68" height="52" rx="8"/><circle cx="80" cy="78" r="6" class="ill-dot"/><path class="ill-line" d="M80 84v10"/></g>`),
  success: wrap(`<ellipse cx="80" cy="114" rx="46" ry="6" class="ill-dot" opacity=".12"/>
    <g class="ill-float"><circle cx="80" cy="60" r="38" class="ill-fill"/><path class="ill-line ill-check" d="M62 60l13 13 25-27"/></g>
    <g class="ill-float-2"><circle cx="126" cy="30" r="4" class="ill-dot" opacity=".5"/><circle cx="32" cy="40" r="3" class="ill-dot" opacity=".4"/></g>`),
};

/** Return an illustration element by name: empty | error | notfound | forbidden | success. */
export function illustration(name) {
  const d = document.createElement('div'); d.className = 'state__art'; d.innerHTML = ART[name] || ART.empty; return d;
}
