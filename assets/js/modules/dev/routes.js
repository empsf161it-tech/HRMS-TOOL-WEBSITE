/* Purpose: developer and style guide routes. */
export const routes = [
  { path: '', redirect: 'components' },
  { path: 'components', title: 'Component Library', load: () => import('./views/components.js') },
  { path: 'playground', title: 'Theme Playground', load: () => import('./views/playground.js') },
];
