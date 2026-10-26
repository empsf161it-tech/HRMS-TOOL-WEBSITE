/* Purpose: Sign Up routes for direct #/signup and #/register navigation. */
export const routes = [
  { path: '', title: 'Create Account', load: () => import('./views/signup.js') },
  { path: 'signup', title: 'Create Account', load: () => import('./views/signup.js') },
  { path: 'register', title: 'Create Account', load: () => import('./views/signup.js') },
];
