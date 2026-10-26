/* Purpose: seed generator for notifications, announcements and other small starter collections. */

const now = Date.UTC(2026, 9, 22, 5, 30);
const ago = (min) => new Date(now - min * 60000).toISOString();

export function generateMisc() {
  const notifications = [
    { id: 'N1', type: 'approval', title: 'Leave request awaiting approval', body: 'Karthik Nair applied for 2 days of Casual Leave (26–27 Oct).', at: ago(12), read: false, link: '#/home' },
    { id: 'N2', type: 'attendance', title: 'Missing punch detected', body: '3 employees at Chennai HQ have a missing out-punch for yesterday.', at: ago(55), read: false, link: '#/home' },
    { id: 'N3', type: 'payroll', title: 'Payroll for September is ready to review', body: 'Variance report shows 4 items above the 5% threshold.', at: ago(180), read: false, link: '#/home' },
    { id: 'N4', type: 'device', title: 'Device offline: Gate 2 Face Terminal', body: 'Pune Manufacturing Plant — no heartbeat for 20 minutes.', at: ago(260), read: true, link: '#/home' },
    { id: 'N5', type: 'compliance', title: 'PF return due in 3 days', body: 'Monthly ECR for Ellowring Industries Ltd is due on 25 Oct.', at: ago(600), read: true, link: '#/home' },
    { id: 'N6', type: 'announcement', title: 'Diwali holiday schedule published', body: 'Offices remain closed on 8 Nov. Plant shifts follow the roster.', at: ago(1500), read: true, link: '#/home' },
  ];
  const announcements = [
    { id: 'A1', title: 'Diwali holiday schedule', body: 'Offices remain closed on 8 November. Plant and hotel shifts follow the festival roster.', at: ago(1500), author: 'HR Team' },
    { id: 'A2', title: 'Open enrolment for group health insurance', body: 'Add dependents until 15 November through the Employee Self Service portal.', at: ago(4300), author: 'Benefits Desk' },
    { id: 'A3', title: 'New attendance geo-fence at Kochi Harbour Hotel', body: 'Mobile punches are now validated within 120 m of the staff entrance.', at: ago(9000), author: 'Admin' },
  ];
  return { notifications, announcements, audit: [] };
}
