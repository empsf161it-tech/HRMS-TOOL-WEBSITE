/* Purpose: routes definition for payroll module. */
export const routes = [
  { path: '', title: 'Process Payroll', load: () => import('./views/payroll.js') },
  { path: 'overview', title: 'Payroll Overview', load: () => import('./views/payroll.js') },
  { path: 'process', title: 'Process Payroll', load: () => import('./views/payroll.js') },
  { path: 'payslips', title: 'Payslips', load: () => import('./views/payroll.js') },
];
