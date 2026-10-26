/* Purpose: simulated real-time event generator - pushes notifications and attendance heartbeats over the event bus. */
import { api } from './api.js';
import { bus } from '../core/events.js';
import { createRng } from './seed/rng.js';

let timer = null;

const SIMULATED_EVENTS = [
  { type: 'attendance', title: 'Regularization approved', body: 'Your missing punch on 20 Oct was approved by your manager.' },
  { type: 'payroll', title: 'Reimbursement credited', body: 'Travel claim #CLM-892 (₹3,450) has been processed.' },
  { type: 'approval', title: 'New leave request from team', body: 'Sneha Patel requested 1 day of Sick Leave for tomorrow.' },
  { type: 'device', title: 'Biometric device synced', body: 'Chennai HQ Terminal #1 synced 14 punches successfully.' },
  { type: 'announcement', title: 'System maintenance reminder', body: 'Scheduled platform update tonight between 02:00 AM and 03:00 AM IST.' },
];

/**
 * Start simulated real-time notifications.
 */
export function startRealtimeSimulator() {
  if (timer) return;
  const rng = createRng(42);

  function scheduleNext() {
    const delay = 45000 + rng.int(0, 45000); // 45 to 90 seconds
    timer = setTimeout(async () => {
      const template = rng.pick(SIMULATED_EVENTS);
      try {
        const notif = await api.create('notifications', {
          type: template.type,
          title: template.title,
          body: template.body,
          at: new Date().toISOString(),
          read: false,
          link: '#/home',
        }, { audit: false });
        bus.emit('notification', notif);
      } catch {
        // ignore
      }
      scheduleNext();
    }, delay);
  }

  scheduleNext();
}

export function stopRealtimeSimulator() {
  clearTimeout(timer);
  timer = null;
}
