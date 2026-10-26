/* Purpose: routes definition for staffing and deployments module. */
export const routes = [
  { path: '', title: 'Staffing & Deployments', load: () => import('./views/staffing.js') },
  { path: 'overview', title: 'Staffing & Deployments', load: () => import('./views/staffing.js') },
  { path: 'deployments', title: 'Staffing & Deployments', load: () => import('./views/staffing.js') },
];
