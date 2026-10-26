/* Purpose: routes definition for timesheets module. */
export const routes = [
  { path: '', title: 'Timesheet Management', load: () => import('./views/timesheets.js') },
  { path: 'overview', title: 'Timesheet Management', load: () => import('./views/timesheets.js') },
  { path: 'approvals', title: 'Timesheet Approvals', load: () => import('./views/timesheets.js') },
];
