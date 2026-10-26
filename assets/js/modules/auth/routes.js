/* Purpose: authentication routes (in-app sign in, role quick login). */
export const routes = [
  { path: '', title: 'Sign In', load: () => import('./views/login.js') },
  { path: 'login', title: 'Sign In', load: () => import('./views/login.js') },
  { path: 'signup', title: 'Create Account', load: () => import('./views/signup.js') },
  { path: 'register', title: 'Create Account', load: () => import('./views/signup.js') },
];
