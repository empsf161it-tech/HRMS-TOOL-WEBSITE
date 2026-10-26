/* Purpose: routes definition for clients and projects module. */
export const routes = [
  { path: '', title: 'Client Details · TCS', load: () => import('./views/clients.js') },
  { path: 'overview', title: 'Client Details · TCS', load: () => import('./views/clients.js') },
  { path: 'companies', title: 'Client Companies', load: () => import('./views/clients.js') },
  { path: 'contacts', title: 'Client Contacts', load: () => import('./views/clients.js') },
];
