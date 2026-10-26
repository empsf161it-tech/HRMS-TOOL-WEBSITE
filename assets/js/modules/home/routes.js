/* Purpose: home dashboard routes definition. */
export const routes = [
  { path: '', title: 'Dashboard', load: () => import('./views/dashboard.js') },
];
