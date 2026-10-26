/* Purpose: shared error, 403 Forbidden and 404 Not Found route views with looping illustrations and recovery actions. */
import { h } from '../../core/dom.js';
import { illustration } from '../../components/illustrations.js';
import { button } from '../../components/eh-button.js';
import { errorState } from '../../components/feedback.js';
import { router } from '../../core/router.js';
import { t } from '../../core/i18n.js';

/** 404 Not Found view */
export function notFound() {
  return h('div', { class: 'state', role: 'alert' },
    illustration('notfound'),
    h('h2', { class: 'state__title' }, t('state.notFound') || 'Page Not Found'),
    h('p', { class: 'state__text' }, 'The page you requested does not exist or may have been moved.'),
    button('Go to Dashboard', { variant: 'primary', icon: 'home', onClick: () => router.navigate('/home') }));
}

/** 403 Forbidden view */
export function forbidden() {
  return h('div', { class: 'state', role: 'alert' },
    illustration('forbidden'),
    h('h2', { class: 'state__title' }, t('state.forbidden') || 'Access Restricted'),
    h('p', { class: 'state__text' }, "Your current role does not have permission to view this module. Use the role switcher in the top right to switch roles."),
    button('Go to Dashboard', { variant: 'secondary', icon: 'home', onClick: () => router.navigate('/home') }));
}

/** Error state with retry */
export function errorView(err, retry) {
  return errorState({
    title: t('state.error') || 'Something went wrong',
    text: err?.message || 'An unexpected error occurred while loading this view.',
    onRetry: retry,
  });
}
