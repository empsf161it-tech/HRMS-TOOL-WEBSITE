/* Purpose: Interactive subtab view builders for all module sections (Recruitment ATS pipeline, Leave approvals, Attendance boards, Org tree, Performance OKRs, Reports) with rich animations. */
import { h, icon } from '../../core/dom.js';
import { toastSuccess, openModal } from '../../components/ui.js';

/**
 * 1. RECRUITMENT (ATS) SUBTAB VIEWS
 */
export function buildRecruitmentSubtab(tabName, employees, switchSubtab) {
  const container = h('div', { class: 'subtab-view' });

  // TAB: Job Openings
  if (tabName === 'Job Openings') {
    const jobList = [
      { id: 'job-1', title: 'Lead Full Stack Engineer', dept: 'Engineering', loc: 'Chennai · Hybrid', exp: '5-8 Yrs', ctc: '₹24L - ₹32L', openings: 4, applied: 42, active: 18, status: 'Active Hiring', tag: 'blue' },
      { id: 'job-2', title: 'Senior Product Designer (UI/UX)', dept: 'Product Design', loc: 'Remote · Pan India', exp: '4-7 Yrs', ctc: '₹18L - ₹26L', openings: 2, applied: 28, active: 12, status: 'Interviewing', tag: 'purple' },
      { id: 'job-3', title: 'DevOps & Cloud Security Architect', dept: 'Infrastructure', loc: 'Bangalore · Onsite', exp: '6-9 Yrs', ctc: '₹26L - ₹36L', openings: 3, applied: 19, active: 8, status: 'Active Hiring', tag: 'blue' },
      { id: 'job-4', title: 'Frontend Engineer (React / TypeScript)', dept: 'Engineering', loc: 'Chennai · Hybrid', exp: '3-5 Yrs', ctc: '₹14L - ₹20L', openings: 5, applied: 54, active: 22, status: 'Active Hiring', tag: 'green' },
      { id: 'job-5', title: 'Staff Data Platform Engineer', dept: 'Data Engineering', loc: 'Chennai · Hybrid', exp: '7-10 Yrs', ctc: '₹28L - ₹40L', openings: 2, applied: 16, active: 6, status: 'Sourcing', tag: 'amber' },
      { id: 'job-6', title: 'Technical Recruiter & Talent Lead', dept: 'People & HR', loc: 'Chennai · Onsite', exp: '4-6 Yrs', ctc: '₹12L - ₹18L', openings: 1, applied: 31, active: 14, status: 'Final Stage', tag: 'purple' },
    ];

    let currentFilter = 'All';
    const filterPills = ['All', 'Engineering', 'Product Design', 'Infrastructure', 'Data Engineering'].map((dept) => h('button', {
      class: `dash-filter-pill${dept === currentFilter ? ' active' : ''}`,
      type: 'button',
      onClick: (e) => {
        currentFilter = dept;
        cardsGrid.querySelectorAll('.interactive-card').forEach((card) => {
          const cardDept = card.dataset.dept;
          card.style.display = (dept === 'All' || cardDept === dept) ? 'flex' : 'none';
        });
        filterRow.querySelectorAll('.dash-filter-pill').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
      }
    }, dept));

    const postJobBtn = h('button', {
      class: 'btn btn--primary',
      type: 'button',
      style: 'background: #1E60FF; color: #fff; font-weight: 700; border-radius: 8px; padding: 8px 16px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;',
      onClick: () => {
        openModal({
          title: 'Post New Job Requisition',
          size: 'md',
          body: h('form', { class: 'stack gap-3', style: 'padding: 8px 0;' },
            h('div', { class: 'field' }, h('label', { class: 'label' }, 'Job Title'), h('input', { class: 'input', placeholder: 'e.g. Senior Backend Engineer' })),
            h('div', { class: 'grid grid--2' },
              h('div', { class: 'field' }, h('label', { class: 'label' }, 'Department'), h('select', { class: 'select' }, h('option', null, 'Engineering'), h('option', null, 'Product'), h('option', null, 'Operations'))),
              h('div', { class: 'field' }, h('label', { class: 'label' }, 'Target CTC Range'), h('input', { class: 'input', placeholder: 'e.g. ₹18L - ₹24L' }))
            ),
            h('div', { class: 'field' }, h('label', { class: 'label' }, 'Job Description / Requirements'), h('textarea', { class: 'textarea', rows: 3, placeholder: 'Core responsibilities…' }))
          ),
          footer: [
            h('button', { class: 'btn btn--primary', type: 'button', onClick: () => toastSuccess('Job Requisition published successfully!') }, 'Publish Opening')
          ]
        });
      }
    }, icon('plus', { size: 15 }), 'Post Job Opening');

    const filterRow = h('div', { class: 'split gap-3', style: 'align-items: center; margin-bottom: 6px;' },
      h('div', { class: 'cluster gap-2' }, ...filterPills),
      postJobBtn
    );

    const cardsGrid = h('div', { class: 'subtab-grid' });
    jobList.forEach((job) => {
      const card = h('div', {
        class: 'interactive-card',
        dataset: { dept: job.dept }
      },
        h('div', { class: 'interactive-card__head' },
          h('div', null,
            h('h4', { class: 'interactive-card__title' }, job.title),
            h('div', { class: 'interactive-card__sub' }, `${job.dept} · ${job.loc}`)
          ),
          h('span', { class: `interactive-card__tag tag--${job.tag}` }, job.status)
        ),
        h('div', { class: 'cluster gap-2', style: 'font-size: 11.5px;' },
          h('span', { class: 'skill-chip' }, `${job.openings} Openings`),
          h('span', { class: 'skill-chip' }, job.exp),
          h('span', { class: 'skill-chip', style: 'color: #10B981; font-weight: 700;' }, job.ctc)
        ),
        h('div', { style: 'display: flex; flex-direction: column; gap: 4px; margin-top: 4px;' },
          h('div', { class: 'split', style: 'font-size: 11.5px; color: var(--text-muted);' },
            h('span', null, `${job.applied} Total Applicants`),
            h('span', { style: 'font-weight: 700; color: #1E60FF;' }, `${job.active} in Active Pipeline`)
          ),
          h('div', { style: 'height: 6px; width: 100%; background: var(--surface-2); border-radius: 99px; overflow: hidden;' },
            h('div', { style: `height: 100%; width: ${Math.round((job.active / job.applied) * 100)}%; background: #1E60FF; border-radius: 99px;` })
          )
        ),
        h('div', { class: 'split gap-2', style: 'margin-top: 8px; border-top: 1px solid var(--border); padding-top: 10px;' },
          h('button', {
            class: 'btn btn--ghost btn--sm',
            type: 'button',
            style: 'font-size: 12px; color: #1E60FF; font-weight: 700; padding: 4px 8px;',
            onClick: () => {
              switchSubtab('Candidate Pipeline');
              toastSuccess(`Opening candidate pipeline for: ${job.title}`);
            }
          }, 'View Candidates →'),
          h('div', { class: 'cluster gap-1' },
            h('button', {
              class: 'btn btn--ghost btn--icon btn--sm',
              type: 'button',
              'data-tooltip': 'Share Link',
              onClick: () => toastSuccess('Referral link copied to clipboard!')
            }, icon('share-2', { size: 14 })),
            h('button', {
              class: 'btn btn--ghost btn--icon btn--sm',
              type: 'button',
              'data-tooltip': 'Add Candidate',
              onClick: () => toastSuccess(`Candidate addition form opened for ${job.title}`)
            }, icon('user-plus', { size: 14 }))
          )
        )
      );
      cardsGrid.append(card);
    });

    container.append(filterRow, cardsGrid);
    return container;
  }

  // TAB: Candidate Pipeline (Kanban)
  if (tabName === 'Candidate Pipeline') {
    const stages = [
      {
        id: 'stage-1', title: 'Sourced & Applied', color: '#2563EB',
        candidates: [
          { name: 'Akash Sharma', role: 'Lead Full Stack', comp: 'Cognizant · 4.8y', match: '96% Match', exp: '4.8y', notice: '15 Days' },
          { name: 'Sneha Reddy', role: 'UI/UX Designer', comp: 'Swiggy · 3.5y', match: '92% Match', exp: '3.5y', notice: 'Immediate' },
          { name: 'Karthik V', role: 'DevOps Architect', comp: 'Wipro · 6y', match: '88% Match', exp: '6y', notice: '30 Days' },
        ]
      },
      {
        id: 'stage-2', title: 'AI Screening', color: '#0EA5E9',
        candidates: [
          { name: 'Rohan Gupta', role: 'Lead Full Stack', comp: 'Infosys · 6y', match: '98% Match', exp: '6y', notice: '30 Days' },
          { name: 'Ananya Sen', role: 'Product Designer', comp: 'Razorpay · 4y', match: '95% Match', exp: '4y', notice: '15 Days' },
          { name: 'Vikram Bose', role: 'Cloud Security', comp: 'HCL · 7y', match: '91% Match', exp: '7y', notice: 'Immediate' },
        ]
      },
      {
        id: 'stage-3', title: 'Technical Interview', color: '#7C3AED',
        candidates: [
          { name: 'Divya Pillai', role: 'Frontend Engineer', comp: 'Accenture · 5y', match: '94% Match', exp: '5y', notice: 'Immediate' },
          { name: 'Harish K', role: 'Go / Python Backend', comp: 'Freshworks · 4.2y', match: '89% Match', exp: '4.2y', notice: '15 Days' },
        ]
      },
      {
        id: 'stage-4', title: 'Manager Cultural Fit', color: '#F59E0B',
        candidates: [
          { name: 'Pooja Deshmukh', role: 'Senior React Dev', comp: 'Mindtree · 5y', match: '97% Match', exp: '5y', notice: 'Immediate' },
          { name: 'Sameer Joshi', role: 'DevOps Specialist', comp: 'Capgemini · 4.5y', match: '92% Match', exp: '30 Days' },
        ]
      },
      {
        id: 'stage-5', title: 'Offer Extended', color: '#10B981',
        candidates: [
          { name: 'Nikhil Roy', role: 'Lead Full Stack', comp: 'L&T Infotech · 6.5y', match: '99% Match', exp: '6.5y', notice: 'Accepted' },
          { name: 'Priyanka Kapoor', role: 'UI/UX Designer', comp: 'Zoho · 4.5y', match: '96% Match', exp: '4.5y', notice: 'Offer Sent' },
        ]
      }
    ];

    const kanbanBoard = h('div', { class: 'pipeline-board' });

    stages.forEach((stg, stgIdx) => {
      const col = h('div', { class: 'pipeline-col', id: stg.id });
      const countBadge = h('span', { class: 'pipeline-col__count' }, String(stg.candidates.length));
      
      const head = h('div', { class: 'pipeline-col__head' },
        h('span', { class: 'cluster gap-2', style: 'align-items: center;' },
          h('span', { style: `width: 8px; height: 8px; border-radius: 50%; background: ${stg.color}; display: inline-block;` }),
          h('span', null, stg.title)
        ),
        countBadge
      );
      col.append(head);

      stg.candidates.forEach((cand) => {
        const card = h('div', { class: 'pipeline-card' },
          h('div', { class: 'split', style: 'align-items: flex-start;' },
            h('div', { class: 'cluster gap-2', style: 'align-items: center;' },
              h('div', {
                style: `width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, ${stg.color}, #1E3A8A); color: #fff; font-weight: 700; font-size: 13px; display: grid; place-items: center;`
              }, cand.name[0]),
              h('div', null,
                h('div', { style: 'font-weight: 700; font-size: 13px; color: var(--text);' }, cand.name),
                h('div', { style: 'font-size: 11.5px; color: var(--text-muted);' }, cand.role)
              )
            ),
            h('span', {
              style: 'font-size: 10.5px; font-weight: 700; color: #10B981; background: rgba(16,185,129,0.12); padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(16,185,129,0.25);'
            }, cand.match)
          ),
          h('div', { class: 'cluster gap-2', style: 'font-size: 11px; color: var(--text-muted); margin-top: 4px;' },
            h('span', null, cand.comp),
            h('span', null, '•'),
            h('span', { style: 'color: #2563EB; font-weight: 600;' }, `Notice: ${cand.notice}`)
          ),
          h('div', { class: 'split', style: 'margin-top: 6px; border-top: 1px solid var(--border); padding-top: 8px;' },
            h('button', {
              class: 'btn btn--ghost btn--sm',
              type: 'button',
              style: 'font-size: 11px; padding: 2px 6px;',
              onClick: () => toastSuccess(`Viewing resume & score for ${cand.name}`)
            }, 'Resume'),
            stgIdx < stages.length - 1 ? h('button', {
              class: 'btn btn--primary btn--sm',
              type: 'button',
              style: 'font-size: 11px; padding: 3px 10px; background: #1E60FF; border-radius: 6px; font-weight: 700;',
              onClick: () => {
                toastSuccess(`${cand.name} promoted to next stage: ${stages[stgIdx + 1].title}!`);
                card.style.opacity = '0.4';
                setTimeout(() => card.remove(), 250);
              }
            }, 'Advance →') : h('span', { style: 'font-size: 11px; font-weight: 700; color: #10B981;' }, '✓ Complete')
          )
        );
        col.append(card);
      });

      kanbanBoard.append(col);
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('div', null,
          h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Candidate Pipeline Kanban'),
          h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 2px 0 0;' }, 'Drag or advance candidates across evaluation stages in real time.')
        ),
        h('button', {
          class: 'btn btn--secondary btn--sm',
          type: 'button',
          onClick: () => toastSuccess('AI Auto-Screening parsed and ranked 14 new applications!')
        }, icon('sparkles', { size: 14 }), 'Run AI Screening')
      ),
      kanbanBoard
    );
    return container;
  }

  // TAB: Interview Schedule / Rounds
  if (tabName === 'Interview Schedule' || tabName === 'Interview Rounds') {
    const interviews = [
      { time: 'Today, 3:30 PM - 4:30 PM', badge: 'Starts in 25 mins', cand: 'Rohan Gupta', role: 'Lead Full Stack', panel: 'Arun Kumar & Priya Sharma', type: 'Round 2: Architecture & Code', link: 'https://meet.google.com' },
      { time: 'Today, 5:00 PM - 6:00 PM', badge: 'Today', cand: 'Divya Pillai', role: 'Frontend Engineer', panel: 'Vikram S (Tech Lead)', type: 'Round 3: Live Problem Solving', link: 'https://meet.google.com' },
      { time: 'Tomorrow, 11:00 AM', badge: 'Tomorrow', cand: 'Pooja Deshmukh', role: 'Senior React Dev', panel: 'Sneha Raman (Engineering Mgr)', type: 'Manager & Cultural Fit', link: 'https://meet.google.com' },
      { time: 'Tomorrow, 2:30 PM', badge: 'Tomorrow', cand: 'Sameer Joshi', role: 'DevOps Specialist', panel: 'TCS Client Interview Panel', type: 'Client Technical Assessment', link: 'https://meet.google.com' },
    ];

    const list = h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' });
    interviews.forEach((iv) => {
      list.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'split gap-3', style: 'align-items: flex-start;' },
          h('div', { class: 'cluster gap-3', style: 'align-items: center;' },
            h('div', {
              style: 'width: 44px; height: 44px; border-radius: 10px; background: rgba(30,96,255,0.12); color: #1E60FF; display: grid; place-items: center;'
            }, icon('video', { size: 20 })),
            h('div', null,
              h('div', { style: 'font-weight: 700; font-size: 14.5px; color: var(--text);' }, iv.cand),
              h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, `${iv.role} · Panel: ${iv.panel}`)
            )
          ),
          h('span', { class: 'interactive-card__tag tag--blue' }, iv.badge)
        ),
        h('div', { class: 'split gap-3', style: 'background: var(--surface-2); padding: 10px 14px; border-radius: 8px;' },
          h('span', { class: 'cluster gap-2', style: 'font-size: 12.5px; font-weight: 600;' },
            icon('clock', { size: 14, style: 'color: #1E60FF;' }),
            iv.time
          ),
          h('span', { style: 'font-size: 12px; color: var(--text-muted);' }, iv.type)
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 10px;' },
          h('button', {
            class: 'btn btn--ghost btn--sm',
            type: 'button',
            onClick: () => toastSuccess(`Scorecard form opened for ${iv.cand}`)
          }, icon('file-check', { size: 14 }), 'Submit Scorecard'),
          h('div', { class: 'cluster gap-2' },
            h('button', {
              class: 'btn btn--ghost btn--sm',
              type: 'button',
              onClick: () => toastSuccess('Interview rescheduled notification sent.')
            }, 'Reschedule'),
            h('button', {
              class: 'btn btn--primary btn--sm',
              type: 'button',
              style: 'background: #1E60FF; font-weight: 700;',
              onClick: () => toastSuccess(`Launching video meeting room for ${iv.cand}…`)
            }, icon('video', { size: 14 }), 'Join Meeting')
          )
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Upcoming Scheduled Interviews'),
        h('button', {
          class: 'btn btn--primary btn--sm',
          type: 'button',
          style: 'background: #1E60FF;',
          onClick: () => toastSuccess('Interview scheduling wizard opened!')
        }, icon('calendar-plus', { size: 14 }), 'Schedule Interview')
      ),
      list
    );
    return container;
  }

  // TAB: Offers & Joinings / Offer Management
  if (tabName === 'Offers & Joinings' || tabName === 'Offer Management') {
    const offers = [
      { name: 'Nikhil Roy', role: 'Lead Full Stack', ctc: '₹26,50,000', doj: 'Oct 15, 2026', status: 'Accepted', tag: 'green' },
      { name: 'Priyanka Kapoor', role: 'UI/UX Designer', ctc: '₹22,00,000', doj: 'Nov 01, 2026', status: 'Pending Signature', tag: 'blue' },
      { name: 'Vikram Malhotra', role: 'DevOps Architect', ctc: '₹32,00,000', doj: 'Oct 20, 2026', status: 'In Negotiation', tag: 'amber' },
      { name: 'Swati Shenoy', role: 'Frontend Lead', ctc: '₹19,00,000', doj: 'Oct 12, 2026', status: 'Accepted & Verified', tag: 'green' },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    offers.forEach((o) => {
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('div', null,
            h('h4', { class: 'interactive-card__title' }, o.name),
            h('div', { class: 'interactive-card__sub' }, o.role)
          ),
          h('span', { class: `interactive-card__tag tag--${o.tag}` }, o.status)
        ),
        h('div', { style: 'background: var(--surface-2); padding: 10px 12px; border-radius: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;' },
          h('div', null, h('div', { style: 'color: var(--text-muted);' }, 'Annual CTC'), h('div', { style: 'font-weight: 700; font-size: 14px; color: #10B981;' }, o.ctc)),
          h('div', null, h('div', { style: 'color: var(--text-muted);' }, 'Expected Joining'), h('div', { style: 'font-weight: 600;' }, o.doj))
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 10px;' },
          h('button', {
            class: 'btn btn--ghost btn--sm',
            type: 'button',
            onClick: () => toastSuccess(`Generating signed offer letter PDF for ${o.name}…`)
          }, icon('download', { size: 14 }), 'Download PDF'),
          h('button', {
            class: 'btn btn--secondary btn--sm',
            type: 'button',
            onClick: () => toastSuccess(`Digital Joining onboarding kit sent to ${o.name}!`)
          }, icon('send', { size: 14 }), 'Send Kit')
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Formal Offers & Onboarding Tracker'),
        h('button', {
          class: 'btn btn--primary btn--sm',
          type: 'button',
          style: 'background: #10B981;',
          onClick: () => toastSuccess('CTC calculator and Offer template loaded!')
        }, icon('plus-circle', { size: 14 }), 'Generate New Offer')
      ),
      cards
    );
    return container;
  }

  // TAB: Talent Pool
  if (tabName === 'Talent Pool') {
    const talent = [
      { name: 'Karthik Raja', role: 'Staff Data Architect', exp: '8 Yrs', skills: ['Snowflake', 'Python', 'Apache Spark', 'AWS', 'dbt'], loc: 'Chennai' },
      { name: 'Sunita Mehra', role: 'Senior React Developer', exp: '5 Yrs', skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind'], loc: 'Bangalore' },
      { name: 'Gaurav Singhania', role: 'Cloud DevOps Specialist', exp: '6 Yrs', skills: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'GCP'], loc: 'Remote' },
      { name: 'Aishwarya Iyer', role: 'Lead Product Manager', exp: '7 Yrs', skills: ['Agile', 'B2B SaaS', 'Roadmapping', 'SQL', 'Figma'], loc: 'Chennai' },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    talent.forEach((t) => {
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('div', null,
            h('h4', { class: 'interactive-card__title' }, t.name),
            h('div', { class: 'interactive-card__sub' }, `${t.role} · ${t.exp} · ${t.loc}`)
          ),
          h('span', { class: 'interactive-card__tag tag--purple' }, 'Pre-Vetted')
        ),
        h('div', { class: 'cluster gap-1', style: 'margin-top: 4px;' },
          ...t.skills.map((s) => h('span', { class: 'skill-chip' }, s))
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 10px; margin-top: 8px;' },
          h('button', {
            class: 'btn btn--ghost btn--sm',
            type: 'button',
            onClick: () => toastSuccess(`Candidate profile opened for ${t.name}`)
          }, 'Full Profile'),
          h('button', {
            class: 'btn btn--primary btn--sm',
            type: 'button',
            style: 'background: #1E60FF;',
            onClick: () => toastSuccess(`Re-engagement email sent to ${t.name}!`)
          }, icon('mail', { size: 14 }), 'Contact Candidate')
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('div', null,
          h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Pre-Vetted Talent Archive'),
          h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 2px 0 0;' }, '186 qualified candidates across engineering, data and product.')
        ),
        h('div', { style: 'min-width: 260px;' },
          h('input', { class: 'input', placeholder: 'Search skills (React, AWS, Snowflake…)', style: 'height: 36px;' })
        )
      ),
      cards
    );
    return container;
  }

  // TAB: Reports
  if (tabName === 'Reports') {
    const funnelSteps = [
      { label: 'Job Applications Received', count: 486, pct: '100%', color: '#2563EB' },
      { label: 'AI Screening & Resume Passed', count: 194, pct: '40%', color: '#0EA5E9' },
      { label: 'Technical Rounds Cleared', count: 62, pct: '13%', color: '#7C3AED' },
      { label: 'Final Client & Manager Round', count: 24, pct: '5%', color: '#F59E0B' },
      { label: 'Formal Offers Accepted', count: 16, pct: '3.3%', color: '#10B981' },
    ];

    const funnelCard = h('div', { class: 'interactive-card' },
      h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Recruitment Conversion Funnel (Q3 2026)'),
      h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
        ...funnelSteps.map((step) => h('div', { class: 'funnel-row' },
          h('div', { class: 'split', style: 'font-size: 12.5px; font-weight: 600;' },
            h('span', null, step.label),
            h('span', { style: `color: ${step.color}; font-weight: 700;` }, `${step.count} candidates (${step.pct})`)
          ),
          h('div', { style: 'height: 7px; width: 100%; background: var(--surface); border-radius: 99px; overflow: hidden;' },
            h('div', { style: `height: 100%; width: ${step.pct}; background: ${step.color}; border-radius: 99px;` })
          )
        ))
      )
    );

    const metricsCard = h('div', { class: 'interactive-card' },
      h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Hiring Efficiency Benchmarks'),
      h('div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 12px;' },
        h('div', { style: 'padding: 12px; background: var(--surface-2); border-radius: 10px;' },
          h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, 'Average Time to Fill'),
          h('div', { style: 'font-size: 22px; font-weight: 800; color: #1E60FF;' }, '22 Days'),
          h('div', { style: 'font-size: 11px; color: #10B981;' }, '↓ 12 days faster than industry')
        ),
        h('div', { style: 'padding: 12px; background: var(--surface-2); border-radius: 10px;' },
          h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, 'Offer Acceptance Rate'),
          h('div', { style: 'font-size: 22px; font-weight: 800; color: #10B981;' }, '92.4%'),
          h('div', { style: 'font-size: 11px; color: #10B981;' }, '↑ 4.2% higher conversion')
        )
      ),
      h('button', {
        class: 'btn btn--primary btn--sm',
        type: 'button',
        style: 'background: #1E60FF; margin-top: 10px;',
        onClick: () => toastSuccess('Exporting Recruitment Analytics Report (PDF)…')
      }, icon('download', { size: 14 }), 'Download Full Analytics PDF')
    );

    container.append(
      h('div', { style: 'display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px;' },
        funnelCard,
        metricsCard
      )
    );
    return container;
  }

  return container;
}

/**
 * 2. LEAVE MANAGEMENT SUBTAB VIEWS
 */
export function buildLeaveSubtab(tabName, employees, switchSubtab) {
  const container = h('div', { class: 'subtab-view' });

  if (tabName === 'Leave Applications') {
    const apps = [
      { name: 'Arun Kumar', role: 'Senior Software Engineer', type: 'Privilege Leave (PL)', dates: 'Sep 28 - Oct 02, 2026', days: '5 Days', reason: 'Annual hometown visit with family', sla: '4h SLA remaining' },
      { name: 'Priya Sharma', role: 'Quality Analyst Lead', type: 'Casual Leave (CL)', dates: 'Oct 04, 2026', days: '1 Day', reason: 'Personal family engagement', sla: '12h SLA remaining' },
      { name: 'Vikram S', role: 'DevOps Specialist', type: 'Sick Leave (SL)', dates: 'Sep 29 - Sep 30, 2026', days: '2 Days', reason: 'Doctor advised rest for seasonal fever', sla: '6h SLA remaining' },
      { name: 'Sneha R', role: 'Product Manager', type: 'Comp-Off', dates: 'Oct 08, 2026', days: '1 Day', reason: 'Worked during weekend client deployment', sla: '18h SLA remaining' },
    ];

    const grid = h('div', { class: 'subtab-grid' });
    apps.forEach((a) => {
      const card = h('div', { class: 'interactive-card' });
      card.append(
        h('div', { class: 'interactive-card__head' },
          h('div', { class: 'cluster gap-2', style: 'align-items: center;' },
            h('div', {
              style: 'width: 36px; height: 36px; border-radius: 50%; background: #2563EB; color: #fff; font-weight: 700; display: grid; place-items: center;'
            }, a.name[0]),
            h('div', null,
              h('h4', { class: 'interactive-card__title' }, a.name),
              h('div', { class: 'interactive-card__sub' }, a.role)
            )
          ),
          h('span', { class: 'interactive-card__tag tag--amber' }, a.type)
        ),
        h('div', { style: 'background: var(--surface-2); padding: 10px 12px; border-radius: 8px; font-size: 12.5px; display: flex; flex-direction: column; gap: 4px;' },
          h('div', { class: 'split' },
            h('span', { style: 'font-weight: 600;' }, a.dates),
            h('span', { style: 'color: #1E60FF; font-weight: 700;' }, a.days)
          ),
          h('div', { style: 'color: var(--text-muted); font-size: 12px;' }, `“${a.reason}”`)
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 10px;' },
          h('span', { style: 'font-size: 11px; color: var(--text-muted);' }, a.sla),
          h('div', { class: 'cluster gap-2' },
            h('button', {
              class: 'btn btn--ghost btn--sm text-danger',
              type: 'button',
              onClick: () => {
                toastSuccess(`Leave application for ${a.name} rejected.`);
                card.style.opacity = '0.5';
                card.querySelector('.interactive-card__tag').className = 'interactive-card__tag tag--amber text-danger';
                card.querySelector('.interactive-card__tag').textContent = 'Rejected';
              }
            }, 'Reject'),
            h('button', {
              class: 'btn btn--primary btn--sm',
              type: 'button',
              style: 'background: #10B981;',
              onClick: () => {
                toastSuccess(`Leave application for ${a.name} APPROVED! Balances updated.`);
                card.querySelector('.interactive-card__tag').className = 'interactive-card__tag tag--green';
                card.querySelector('.interactive-card__tag').textContent = 'Approved ✓';
              }
            }, 'Approve')
          )
        )
      );
      grid.append(card);
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Pending Leave Applications Queue'),
        h('button', {
          class: 'btn btn--primary btn--sm',
          type: 'button',
          style: 'background: #1E60FF;',
          onClick: () => toastSuccess('Apply for leave form opened.')
        }, icon('plus-circle', { size: 14 }), 'Apply For Leave')
      ),
      grid
    );
    return container;
  }

  if (tabName === 'Leave Balances') {
    const balances = [
      { name: 'Arun Kumar', code: 'EMP0012', pl: '14 / 18', cl: '8 / 12', sl: '9 / 10', comp: '2 Days', total: '33 Days' },
      { name: 'Priya Sharma', code: 'EMP0034', pl: '12 / 18', cl: '6 / 12', sl: '10 / 10', comp: '1 Day', total: '29 Days' },
      { name: 'Vikram S', code: 'EMP0045', pl: '16 / 18', cl: '10 / 12', sl: '8 / 10', comp: '3 Days', total: '37 Days' },
      { name: 'Sneha Raman', code: 'EMP0067', pl: '15 / 18', cl: '7 / 12', sl: '9 / 10', comp: '0 Days', total: '31 Days' },
    ];

    const table = h('div', { class: 'dash-table-wrap' },
      h('table', { class: 'dash-table' },
        h('thead', null,
          h('tr', null,
            h('th', null, 'Employee Name'),
            h('th', null, 'Privilege (PL)'),
            h('th', null, 'Casual (CL)'),
            h('th', null, 'Sick (SL)'),
            h('th', null, 'Comp-Off'),
            h('th', null, 'Total Available'),
            h('th', { style: 'text-align: right;' }, 'Action')
          )
        ),
        h('tbody', null,
          ...balances.map((b) => h('tr', null,
            h('td', null, h('div', { style: 'font-weight: 700;' }, b.name), h('div', { style: 'font-size: 11.5px; color: var(--text-muted);' }, b.code)),
            h('td', null, h('span', { class: 'interactive-card__tag tag--blue' }, b.pl)),
            h('td', null, h('span', { class: 'interactive-card__tag tag--green' }, b.cl)),
            h('td', null, h('span', { class: 'interactive-card__tag tag--purple' }, b.sl)),
            h('td', null, b.comp),
            h('td', null, h('span', { style: 'font-weight: 800; color: #10B981;' }, b.total)),
            h('td', { style: 'text-align: right;' },
              h('button', {
                class: 'btn btn--ghost btn--sm',
                type: 'button',
                onClick: () => toastSuccess(`Balance adjustment modal opened for ${b.name}`)
              }, 'Adjust Quota')
            )
          ))
        )
      )
    );

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Employee Leave Balance Quota Ledger'),
        h('button', { class: 'btn btn--secondary btn--sm', type: 'button', onClick: () => toastSuccess('Exporting balances to Excel…') }, icon('download', { size: 14 }), 'Export Balances')
      ),
      table
    );
    return container;
  }

  if (tabName === 'Leave Types Master') {
    const policies = [
      { name: 'Privilege / Earned Leave (PL)', days: '18 Days / Year', rule: 'Accrues 1.5 days/month. Carryover up to 45 days. Encashable on separation.', color: 'blue' },
      { name: 'Casual Leave (CL)', days: '12 Days / Year', rule: 'Lapses at end of calendar year. Maximum 3 consecutive days.', color: 'green' },
      { name: 'Sick / Medical Leave (SL)', days: '10 Days / Year', rule: 'Requires medical practitioner certificate if exceeding 2 consecutive days.', color: 'purple' },
      { name: 'Maternity Leave', days: '26 Weeks Paid', rule: 'Statutory benefit under Maternity Benefit Act for eligible female staff.', color: 'purple' },
      { name: 'Paternity Leave', days: '15 Days Paid', rule: 'Can be availed within 6 months of childbirth across 2 tranches.', color: 'blue' },
      { name: 'Compensatory Off (Comp-Off)', days: 'As Earned', rule: '1 credit per approved weekend or official holiday worked. Valid for 60 days.', color: 'amber' },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    policies.forEach((p) => {
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('h4', { class: 'interactive-card__title' }, p.name),
          h('span', { class: `interactive-card__tag tag--${p.color}` }, p.days)
        ),
        h('p', { style: 'font-size: 12.5px; color: var(--text-muted); line-height: 1.45; margin: 0;' }, p.rule),
        h('div', { class: 'split', style: 'border-top: 1px solid var(--border); padding-top: 8px;' },
          h('span', { style: 'font-size: 11px; color: #10B981; font-weight: 700;' }, 'Active Policy'),
          h('button', {
            class: 'btn btn--ghost btn--sm',
            type: 'button',
            onClick: () => toastSuccess(`Editing policy settings for ${p.name}`)
          }, 'Configure Rules →')
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Enterprise Leave Policy Master Rules'),
        h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Add new custom leave type opened.') }, icon('plus', { size: 14 }), 'Add Leave Type')
      ),
      cards
    );
    return container;
  }

  if (tabName === 'Holidays List') {
    const holidays = [
      { name: 'Republic Day', date: 'Jan 26, 2026', day: 'Monday', type: 'National', status: 'Passed' },
      { name: 'Pongal / Makar Sankranti', date: 'Jan 15, 2026', day: 'Thursday', type: 'Regional', status: 'Passed' },
      { name: 'Tamil New Year', date: 'Apr 14, 2026', day: 'Tuesday', type: 'Regional', status: 'Passed' },
      { name: 'May Day', date: 'May 01, 2026', day: 'Friday', type: 'National', status: 'Passed' },
      { name: 'Independence Day', date: 'Aug 15, 2026', day: 'Saturday', type: 'National', status: 'Passed' },
      { name: 'Gandhi Jayanti', date: 'Oct 02, 2026', day: 'Friday', type: 'National', status: 'Upcoming in 6 Days!' },
      { name: 'Diwali (Deepavali)', date: 'Nov 01, 2026', day: 'Sunday', type: 'Festival', status: 'Upcoming' },
      { name: 'Christmas', date: 'Dec 25, 2026', day: 'Friday', type: 'Festival', status: 'Upcoming' },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    holidays.forEach((hday) => {
      const isUpcoming = hday.status.includes('Upcoming');
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('h4', { class: 'interactive-card__title' }, hday.name),
          h('span', { class: `interactive-card__tag ${isUpcoming ? 'tag--green' : 'tag--blue'}` }, hday.status)
        ),
        h('div', { class: 'cluster gap-2', style: 'font-size: 13px; font-weight: 600;' },
          icon('calendar', { size: 14, style: 'color: #1E60FF;' }),
          h('span', null, hday.date),
          h('span', { style: 'color: var(--text-muted);' }, `(${hday.day})`)
        ),
        h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, `${hday.type} Official Company Holiday`)
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, '2026 Official Holiday Calendar (India / Tamil Nadu)'),
        h('button', { class: 'btn btn--secondary btn--sm', type: 'button', onClick: () => toastSuccess('Exporting holiday calendar iCal/PDF…') }, icon('download', { size: 14 }), 'Sync to Calendar')
      ),
      cards
    );
    return container;
  }

  // Fallback for Team Calendar / Reports
  container.append(
    h('div', { class: 'interactive-card', style: 'text-align: center; padding: 48px;' },
      icon('calendar', { size: 36, style: 'color: #1E60FF; margin: 0 auto 12px;' }),
      h('h3', { style: 'font-size: 16px; font-weight: 700; margin: 0 0 6px;' }, `${tabName} Live Visualization`),
      h('p', { style: 'color: var(--text-muted); font-size: 13px; max-width: 480px; margin: 0 auto 16px;' },
        `Interactive team calendar and dynamic leave analytics are linked to IndexedDB real-time event simulation.`
      ),
      h('button', {
        class: 'btn btn--primary',
        type: 'button',
        style: 'background: #1E60FF;',
        onClick: () => toastSuccess(`Exporting ${tabName} report data…`)
      }, icon('download', { size: 15 }), `Export ${tabName} Data`)
    )
  );
  return container;
}

/**
 * 2.5 ATTENDANCE MODULE SUBTAB VIEWS (Daily Register, Monthly Muster, Regularization, Shift Roster, Reports)
 */
export function buildAttendanceSubtab(tabName, employees, switchSubtab) {
  const container = h('div', { class: 'subtab-view' });

  // 1. Daily Register
  if (tabName === 'Daily Register' || tabName.includes('Register')) {
    const records = [
      { name: 'Vignesh Palanisamy', code: 'ELR-0001', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '09:04 AM', outTime: '18:02 PM', totalHours: '8.5 hrs', ot: '0.5 hrs', status: 'On Time', mode: 'Biometric Gate 1', pill: 'ready' },
      { name: 'Kiran Verma', code: 'ELR-0002', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '09:12 AM', outTime: '18:08 PM', totalHours: '8.4 hrs', ot: '0.0 hrs', status: 'On Time', mode: 'Biometric Gate 2', pill: 'ready' },
      { name: 'Sneha Krishnan', code: 'ELR-0003', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '09:28 AM', outTime: '18:30 PM', totalHours: '8.1 hrs', ot: '0.0 hrs', status: 'Late (Grace)', mode: 'Face Terminal HQ', pill: 'hold' },
      { name: 'Suresh Kulkarni', code: 'ELR-0004', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '08:58 AM', outTime: '19:15 PM', totalHours: '9.8 hrs', ot: '1.8 hrs', status: 'On Time', mode: 'Biometric Gate 1', pill: 'ready' },
      { name: 'Deepa Patel', code: 'ELR-0005', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '09:02 AM', outTime: '18:00 PM', totalHours: '8.0 hrs', ot: '0.0 hrs', status: 'On Time', mode: 'GPS Mobile Punch', pill: 'ready' },
      { name: 'Nitin Varma', code: 'ELR-0006', dept: 'Operations', shift: 'Morning (06:00 - 14:30)', inTime: '06:05 AM', outTime: '14:35 PM', totalHours: '8.5 hrs', ot: '0.5 hrs', status: 'On Time', mode: 'Biometric Terminal', pill: 'ready' },
      { name: 'Karthik Mukherjee', code: 'ELR-0007', dept: 'Operations', shift: 'General (09:00 - 18:00)', inTime: '09:05 AM', outTime: '18:10 PM', totalHours: '8.6 hrs', ot: '0.6 hrs', status: 'On Time', mode: 'Biometric Gate 1', pill: 'ready' },
    ];

    const middleGrid = h('div', { class: 'dash-middle-grid' });

    const leftCol = h('div', { class: 'fade-left', style: 'display: flex; flex-direction: column; gap: 14px; width: 100%;' },
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('div', null,
          h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Daily Attendance Punch Register · Today'),
          h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 2px 0 0;' }, 'Live biometric, face scanner & GPS geofenced mobile in/out timestamps.')
        ),
        h('div', { class: 'cluster gap-2' },
          h('button', { class: 'btn btn--secondary btn--sm', type: 'button', onClick: () => toastSuccess('Exporting daily attendance register to XLSX…') }, icon('download', { size: 14 }), 'Export Register'),
          h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Biometric terminals refreshed successfully.') }, icon('refresh-cw', { size: 14 }), 'Sync Devices')
        )
      ),
      h('div', { class: 'dash-table-wrap' },
        h('table', { class: 'dash-table' },
          h('thead', null,
            h('tr', null,
              h('th', null, 'Employee'),
              h('th', null, 'Shift Schedule'),
              h('th', null, 'In Punch'),
              h('th', null, 'Out Punch'),
              h('th', null, 'Total Hours'),
              h('th', null, 'Overtime'),
              h('th', null, 'Verification Device'),
              h('th', null, 'Status')
            )
          ),
          h('tbody', null,
            ...records.map((r) => h('tr', null,
              h('td', null,
                h('div', { class: 'table-emp-cell' },
                  h('div', { class: 'table-emp-avatar-fallback' }, r.name[0]),
                  h('div', { class: 'table-emp-meta' },
                    h('span', { class: 'table-emp-name' }, r.name),
                    h('span', { class: 'table-emp-id' }, r.code)
                  )
                )
              ),
              h('td', null, r.shift),
              h('td', { style: 'font-weight: 700; color: #10B981;' }, r.inTime),
              h('td', { style: 'font-weight: 600;' }, r.outTime),
              h('td', { style: 'font-weight: 700;' }, r.totalHours),
              h('td', { style: 'color: #1E60FF; font-weight: 600;' }, r.ot),
              h('td', { style: 'font-size: 11.5px; color: var(--text-muted);' }, r.mode),
              h('td', null, h('span', { class: `dash-status-pill dash-status-pill--${r.pill}` }, r.status))
            ))
          )
        )
      )
    );

    const rightCol = h('div', { class: 'fade-right', style: 'display: flex; flex-direction: column; gap: 16px; width: 100%;' },
      h('div', { class: 'kpi-card' },
        h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Daily Punctuality Health'),
        h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
          h('div', { class: 'split', style: 'font-size: 12px;' }, h('span', null, 'On-Time Check-In'), h('span', { style: 'font-weight: 700; color: #10B981;' }, '94.2% (378)')),
          h('div', { style: 'height: 6px; background: var(--surface-2); border-radius: 99px; overflow: hidden;' }, h('div', { style: 'height: 100%; width: 94.2%; background: #10B981; border-radius: 99px;' })),
          h('div', { class: 'split', style: 'font-size: 12px;' }, h('span', null, 'Grace Period (15m)'), h('span', { style: 'font-weight: 700; color: #F59E0B;' }, '1.8% (6)')),
          h('div', { style: 'height: 6px; background: var(--surface-2); border-radius: 99px; overflow: hidden;' }, h('div', { style: 'height: 100%; width: 1.8%; background: #F59E0B; border-radius: 99px;' })),
          h('div', { class: 'split', style: 'font-size: 12px;' }, h('span', null, 'Missed Out-Punches'), h('span', { style: 'font-weight: 700; color: #6366F1;' }, '0.4% (2)')),
          h('div', { style: 'height: 6px; background: var(--surface-2); border-radius: 99px; overflow: hidden;' }, h('div', { style: 'height: 100%; width: 0.4%; background: #6366F1; border-radius: 99px;' }))
        )
      ),
      h('div', { class: 'kpi-card' },
        h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Shift Supervisors on Duty'),
        h('div', { style: 'display: flex; flex-direction: column; gap: 8px;' },
          h('div', { class: 'watchlist-item' },
            h('div', { class: 'cluster gap-2', style: 'align-items: center;' },
              h('div', { style: 'width: 26px; height: 26px; border-radius: 50%; background: #1E60FF; color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center;' }, 'V'),
              h('div', null, h('div', { style: 'font-weight: 600; font-size: 12px;' }, 'Vignesh Palanisamy'), h('div', { style: 'font-size: 11px; color: var(--text-muted);' }, 'General Shift · On Floor'))
            ),
            h('span', { style: 'font-size: 11px; font-weight: 700; color: #10B981;' }, 'Active')
          ),
          h('div', { class: 'watchlist-item' },
            h('div', { class: 'cluster gap-2', style: 'align-items: center;' },
              h('div', { style: 'width: 26px; height: 26px; border-radius: 50%; background: #10B981; color: #fff; font-size: 11px; font-weight: 700; display: grid; place-items: center;' }, 'N'),
              h('div', null, h('div', { style: 'font-weight: 600; font-size: 12px;' }, 'Nitin Varma'), h('div', { style: 'font-size: 11px; color: var(--text-muted);' }, 'Morning Shift · Support Eng.'))
            ),
            h('span', { style: 'font-size: 11px; font-weight: 700; color: #10B981;' }, 'Active')
          )
        )
      )
    );

    middleGrid.append(leftCol, rightCol);
    container.append(middleGrid);
    return container;
  }

  // 2. Monthly Muster
  if (tabName === 'Monthly Muster' || tabName.includes('Muster')) {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const middleGrid = h('div', { class: 'dash-middle-grid' });

    const leftCol = h('div', { class: 'fade-left', style: 'display: flex; flex-direction: column; gap: 14px; width: 100%;' },
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('div', null,
          h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Monthly Attendance Muster Roll · September 2026'),
          h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 2px 0 0;' }, 'Statutory muster roll compliant with the Factories Act and Shops & Establishments Act.')
        ),
        h('div', { class: 'cluster gap-2' },
          h('button', { class: 'btn btn--secondary btn--sm', type: 'button', onClick: () => toastSuccess('Exporting Form 25 Statutory Muster (Excel)…') }, icon('download', { size: 14 }), 'Export Form 25'),
          h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #10B981;', onClick: () => toastSuccess('Muster Roll locked for September 2026 payroll calculation!') }, icon('lock', { size: 14 }), 'Lock Muster for Payroll')
        )
      ),
      h('div', { class: 'dash-table-wrap' },
        h('div', { style: 'overflow-x: auto; max-width: 100%;' },
          h('table', { class: 'dash-table', style: 'font-size: 11.5px;' },
            h('thead', null,
              h('tr', null,
                h('th', { style: 'position: sticky; left: 0; background: var(--surface-2); z-index: 2;' }, 'Employee'),
                h('th', null, 'Total P'),
                h('th', null, 'WO'),
                h('th', null, 'Leave'),
                h('th', null, 'Paid Days'),
                ...days.slice(0, 16).map((d) => h('th', { style: 'text-align: center; width: 24px; padding: 6px 4px;' }, String(d)))
              )
            ),
            h('tbody', null,
              ...employees.slice(0, 6).map((emp) => h('tr', null,
                h('td', { style: 'position: sticky; left: 0; background: var(--surface); z-index: 1; font-weight: 700;' }, emp.name),
                h('td', { style: 'font-weight: 700; color: #10B981;' }, '22'),
                h('td', null, '4'),
                h('td', { style: 'color: #6366F1;' }, '1'),
                h('td', { style: 'font-weight: 800; color: #1E60FF;' }, '26.0'),
                ...days.slice(0, 16).map((d) => {
                  const isSun = d % 7 === 0;
                  const isLeave = d === 14;
                  const val = isSun ? 'WO' : isLeave ? 'L' : 'P';
                  const bg = isSun ? '#F1F5F9' : isLeave ? '#EDE9FE' : '#ECFDF5';
                  const col = isSun ? '#64748B' : isLeave ? '#7C3AED' : '#059669';
                  return h('td', { style: `text-align: center; padding: 4px; font-weight: 700; color: ${col}; background: ${bg}; border-radius: 4px; font-size: 10.5px;` }, val);
                })
              ))
            )
          )
        )
      )
    );

    const rightCol = h('div', { class: 'fade-right', style: 'display: flex; flex-direction: column; gap: 16px; width: 100%;' },
      h('div', { class: 'kpi-card' },
        h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Muster Status Checklist'),
        h('div', { style: 'display: flex; flex-direction: column; gap: 8px; font-size: 12px;' },
          h('div', { class: 'split' }, h('span', null, 'Biometric Reconciled'), h('span', { style: 'font-weight: 700; color: #10B981;' }, '100% ✓')),
          h('div', { class: 'split' }, h('span', null, 'Regularizations Cleared'), h('span', { style: 'font-weight: 700; color: #10B981;' }, '42/42 ✓')),
          h('div', { class: 'split' }, h('span', null, 'Leave Quota Deducted'), h('span', { style: 'font-weight: 700; color: #10B981;' }, 'Verified ✓')),
          h('div', { class: 'split' }, h('span', null, 'Payroll Sign-off'), h('span', { style: 'font-weight: 700; color: #F59E0B;' }, 'Pending Lock'))
        )
      ),
      h('div', { class: 'kpi-card' },
        h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Muster Summary Legends'),
        h('div', { style: 'display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;' },
          h('div', { class: 'cluster gap-2' }, h('span', { style: 'padding: 2px 6px; background: #ECFDF5; color: #059669; font-weight: 700; border-radius: 4px;' }, 'P'), h('span', null, 'Present (Full Day Paid)')),
          h('div', { class: 'cluster gap-2' }, h('span', { style: 'padding: 2px 6px; background: #EDE9FE; color: #7C3AED; font-weight: 700; border-radius: 4px;' }, 'L'), h('span', null, 'Approved Leave (Paid)')),
          h('div', { class: 'cluster gap-2' }, h('span', { style: 'padding: 2px 6px; background: #F1F5F9; color: #64748B; font-weight: 700; border-radius: 4px;' }, 'WO'), h('span', null, 'Weekly Off (Rest Day)')),
          h('div', { class: 'cluster gap-2' }, h('span', { style: 'padding: 2px 6px; background: #FEE2E2; color: #DC2626; font-weight: 700; border-radius: 4px;' }, 'A'), h('span', null, 'Loss of Pay / Absent'))
        )
      )
    );

    middleGrid.append(leftCol, rightCol);
    container.append(middleGrid);
    return container;
  }

  // 3. Regularization Requests
  if (tabName.includes('Regularization')) {
    const requests = [
      { id: 'REG-101', name: 'Vignesh Palanisamy', code: 'ELR-0001', dept: 'Operations', date: 'Sep 24, 2026', type: 'Missing Out-Punch', reason: 'Client sprint retrospective ran late until 20:30 IST; missed terminal swipe.', punchTime: 'Expected: 18:00 · Actual Out: 20:30', status: 'Pending Approval' },
      { id: 'REG-102', name: 'Karthik Mukherjee', code: 'ELR-0007', dept: 'Operations', date: 'Sep 23, 2026', type: 'On-Duty Client Visit', reason: 'Onsite deployment at Infosys campus; outdoor geotag verified.', punchTime: 'Full Day On-Duty', status: 'Pending Approval' },
      { id: 'REG-103', name: 'Deepa Patel', code: 'ELR-0005', dept: 'Operations', date: 'Sep 22, 2026', type: 'Biometric Scanner Timeout', reason: 'Optical scanner at Gate #2 failed to register fingerprint punch.', punchTime: 'In-Punch: 09:05 AM', status: 'Pending Approval' },
    ];

    const middleGrid = h('div', { class: 'dash-middle-grid' });

    const leftCol = h('div', { class: 'fade-left', style: 'display: flex; flex-direction: column; gap: 14px; width: 100%;' },
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('div', null,
          h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Attendance Regularization Approvals Queue'),
          h('p', { style: 'font-size: 12px; color: var(--text-muted); margin: 2px 0 0;' }, 'Review and sanction missed punch and outdoor on-duty attendance correction requests.')
        ),
        h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Bulk approved 3 regularization requests!') }, icon('check-check', { size: 14 }), 'Approve All Pending')
      ),
      h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' },
        ...requests.map((r) => {
          const card = h('div', { class: 'interactive-card' });
          card.append(
            h('div', { class: 'interactive-card__head' },
              h('div', { class: 'cluster gap-2', style: 'align-items: center;' },
                h('div', { style: 'width: 36px; height: 36px; border-radius: 50%; background: #2563EB; color: #fff; font-weight: 700; display: grid; place-items: center;' }, r.name[0]),
                h('div', null,
                  h('h4', { class: 'interactive-card__title' }, r.name),
                  h('div', { class: 'interactive-card__sub' }, `${r.dept} · ${r.code}`)
                )
              ),
              h('span', { class: 'interactive-card__tag tag--amber' }, r.type)
            ),
            h('div', { style: 'font-size: 12.5px; color: var(--text-muted); line-height: 1.45;' },
              h('strong', { style: 'color: var(--text);' }, `Date: ${r.date} — `),
              r.reason
            ),
            h('div', { style: 'font-size: 11.5px; color: #1E60FF; font-weight: 600;' }, r.punchTime),
            h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 8px;' },
              h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => { toastSuccess(`Rejected regularization for ${r.name}`); card.remove(); } }, 'Reject'),
              h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #10B981;', onClick: () => { toastSuccess(`Regularization approved for ${r.name}! Attendance ledger updated.`); card.remove(); } }, icon('check', { size: 14 }), 'Approve Correction')
            )
          );
          return card;
        })
      )
    );

    const rightCol = h('div', { class: 'fade-right', style: 'display: flex; flex-direction: column; gap: 16px; width: 100%;' },
      h('div', { class: 'kpi-card' },
        h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Regularization Policy Rules'),
        h('div', { style: 'display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: var(--text-muted);' },
          h('div', null, '• Maximum 3 regularizations permitted per employee per calendar month.'),
          h('div', null, '• Must be submitted within 48 hours of the missed punch incident.'),
          h('div', null, '• Geofence logs and biometric failure timestamps are automatically reconciled.')
        )
      )
    );

    middleGrid.append(leftCol, rightCol);
    container.append(middleGrid);
    return container;
  }

  // 4. Shift Roster
  if (tabName.includes('Roster') || tabName.includes('Shift')) {
    const shifts = [
      { name: 'General Shift (GS)', timing: '09:00 AM - 06:00 PM', assigned: 312, color: '#1E60FF' },
      { name: 'Morning Shift (MS)', timing: '06:00 AM - 02:30 PM', assigned: 48, color: '#10B981' },
      { name: 'Evening Shift (ES)', timing: '02:00 PM - 10:30 PM', assigned: 56, color: '#F59E0B' },
      { name: 'Night Shift (NS)', timing: '10:00 PM - 06:30 AM', assigned: 12, color: '#8B5CF6' },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    shifts.forEach((s) => {
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('h4', { class: 'interactive-card__title' }, s.name),
          h('span', { class: 'skill-chip', style: 'color: #1E60FF; font-weight: 700;' }, `${s.assigned} Assigned`)
        ),
        h('div', { class: 'cluster gap-2', style: 'font-size: 13px; font-weight: 600;' },
          icon('clock', { size: 14, style: `color: ${s.color};` }),
          h('span', null, s.timing)
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 8px; margin-top: 6px;' },
          h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => toastSuccess(`Viewing roster members for ${s.name}`) }, 'View Members'),
          h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess(`Shift roster allocation opened for ${s.name}`) }, 'Assign Staff')
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, 'Active Shift Roster Master & Coverage'),
        h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Shift creation dialog opened!') }, icon('plus', { size: 14 }), 'Add Shift Definition')
      ),
      cards
    );
    return container;
  }

  // 5. Reports & Analytics
  const middleGrid = h('div', { class: 'dash-middle-grid' });
  const leftCol = h('div', { class: 'fade-left', style: 'display: flex; flex-direction: column; gap: 14px; width: 100%;' },
    h('div', { class: 'interactive-card', style: 'padding: 24px;' },
      h('h3', { style: 'font-size: 16px; font-weight: 700; margin: 0 0 14px; color: var(--text);' }, 'Attendance Analytics & Trends · September 2026'),
      h('div', { style: 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;' },
        h('div', { style: 'padding: 12px; background: var(--surface-2); border-radius: 10px;' },
          h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, 'Avg Monthly Attendance'),
          h('div', { style: 'font-size: 24px; font-weight: 800; color: #10B981;' }, '94.2%'),
          h('div', { style: 'font-size: 11px; color: #10B981;' }, '↑ 1.8% vs last month')
        ),
        h('div', { style: 'padding: 12px; background: var(--surface-2); border-radius: 10px;' },
          h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, 'Overtime Total Hours'),
          h('div', { style: 'font-size: 24px; font-weight: 800; color: #1E60FF;' }, '142 hrs'),
          h('div', { style: 'font-size: 11px; color: #1E60FF;' }, '₹48,200 estimated payout')
        ),
        h('div', { style: 'padding: 12px; background: var(--surface-2); border-radius: 10px;' },
          h('div', { style: 'font-size: 12px; color: var(--text-muted);' }, 'Late Arrival Frequency'),
          h('div', { style: 'font-size: 24px; font-weight: 800; color: #F59E0B;' }, '1.4%'),
          h('div', { style: 'font-size: 11px; color: #10B981;' }, '↓ 0.6% improvement')
        )
      ),
      h('div', { class: 'cluster gap-2' },
        h('button', { class: 'btn btn--primary', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Exporting Monthly Attendance Report (PDF)…') }, icon('download', { size: 15 }), 'Download Report (PDF)'),
        h('button', { class: 'btn btn--secondary', type: 'button', onClick: () => toastSuccess('Exporting Raw Punch Log CSV…') }, icon('file-spreadsheet', { size: 15 }), 'Export Raw CSV')
      )
    )
  );

  const rightCol = h('div', { class: 'fade-right', style: 'display: flex; flex-direction: column; gap: 16px; width: 100%;' },
    h('div', { class: 'kpi-card' },
      h('h4', { style: 'font-size: 14px; font-weight: 700; margin: 0 0 10px; color: var(--text);' }, 'Compliance Auditing'),
      h('p', { style: 'font-size: 12.5px; color: var(--text-muted); line-height: 1.45; margin: 0 0 12px;' },
        'All muster logs, regularization approvals and timestamp modifications are digitally signed and audit-ready.'
      ),
      h('button', { class: 'btn btn--secondary btn--sm', type: 'button', style: 'width: 100%;', onClick: () => toastSuccess('Compliance certificate generated.') }, icon('shield-check', { size: 14 }), 'Generate Audit Certificate')
    )
  );

  middleGrid.append(leftCol, rightCol);
  container.append(middleGrid);
  return container;
}

/**
 * 3. GENERIC / ALL OTHER MODULES SUBTAB VIEWS
 */
export function buildGenericSubtab(tabName, mod, employees, switchSubtab) {
  const container = h('div', { class: 'subtab-view' });

  // Tab: Active Records
  if (tabName === 'Active Records' || tabName.includes('Register') || tabName.includes('Records')) {
    const cards = h('div', { class: 'subtab-grid' });
    employees.slice(0, 6).forEach((emp, i) => {
      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('div', null,
            h('h4', { class: 'interactive-card__title' }, `${mod.label} Record #${1000 + i}`),
            h('div', { class: 'interactive-card__sub' }, `Assigned to: ${emp.name} (${emp.department})`)
          ),
          h('span', { class: 'interactive-card__tag tag--green' }, 'Active & Verified')
        ),
        h('div', { style: 'font-size: 12px; color: var(--text-muted); background: var(--surface-2); padding: 8px 12px; border-radius: 8px;' },
          `Audit status: compliant · Last modified: Today, 11:42 AM by Admin`
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 8px;' },
          h('button', { class: 'btn btn--ghost btn--sm', type: 'button', onClick: () => toastSuccess(`Editing record #${1000 + i}`) }, 'Edit Details'),
          h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess(`Action executed on #${1000 + i}`) }, 'Manage')
        )
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, `Active ${mod.label} Records`),
        h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess(`New ${mod.label} creation dialog opened!`) }, icon('plus', { size: 14 }), `Add ${mod.label}`)
      ),
      cards
    );
    return container;
  }

  // Tab: Workflows & Approvals
  if (tabName.includes('Workflow') || tabName.includes('Approval') || tabName.includes('Actions')) {
    const queue = [
      { id: 'WF-101', title: `${mod.label} Configuration Update`, requester: 'Arun Kumar', dept: 'Development', time: '18 mins ago', priority: 'High', sla: '2h SLA' },
      { id: 'WF-102', title: `Quarterly ${mod.label} Verification Signoff`, requester: 'Priya Sharma', dept: 'QA & Testing', time: '1 hour ago', priority: 'Medium', sla: '8h SLA' },
      { id: 'WF-103', title: `Statutory Compliance Review`, requester: 'System Compliance Bot', dept: 'Legal & Audit', time: '3 hours ago', priority: 'Urgent', sla: '30 mins SLA' },
    ];

    const cards = h('div', { style: 'display: flex; flex-direction: column; gap: 12px;' });
    queue.forEach((item) => {
      const card = h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('div', null,
            h('h4', { class: 'interactive-card__title' }, `${item.id}: ${item.title}`),
            h('div', { class: 'interactive-card__sub' }, `Requested by ${item.requester} (${item.dept}) · ${item.time}`)
          ),
          h('span', { class: `interactive-card__tag ${item.priority === 'Urgent' ? 'tag--amber text-danger' : 'tag--blue'}` }, item.priority)
        ),
        h('div', { class: 'split gap-2', style: 'border-top: 1px solid var(--border); padding-top: 10px;' },
          h('span', { style: 'font-size: 11.5px; color: var(--text-muted); font-weight: 600;' }, item.sla),
          h('div', { class: 'cluster gap-2' },
            h('button', {
              class: 'btn btn--ghost btn--sm text-danger',
              type: 'button',
              onClick: () => {
                toastSuccess(`${item.id} rejected.`);
                card.remove();
              }
            }, 'Reject'),
            h('button', {
              class: 'btn btn--primary btn--sm',
              type: 'button',
              style: 'background: #10B981;',
              onClick: () => {
                toastSuccess(`${item.id} APPROVED successfully!`);
                card.remove();
              }
            }, 'Approve')
          )
        )
      );
      cards.append(card);
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, `Active ${mod.label} Approvals Inbox`),
        h('span', { class: 'interactive-card__tag tag--blue' }, `${queue.length} Pending`)
      ),
      cards
    );
    return container;
  }

  // Tab: Configuration / Rules
  if (tabName.includes('Config') || tabName.includes('Setting') || tabName.includes('Custom')) {
    const rules = [
      { title: 'Automated Real-Time Sync', desc: 'Sync state changes instantly across IndexedDB and WebSocket stream.', active: true },
      { title: 'Multi-Level Approval Gateway', desc: 'Require Department Head and HR verification before committing records.', active: true },
      { title: 'SLA Escalation Notifications', desc: 'Notify Manager if approvals are pending for more than 24 hours.', active: true },
      { title: 'Daily Audit Ledger Export', desc: 'Automatically snapshot and archive all daily transactions at 23:59 IST.', active: false },
    ];

    const cards = h('div', { class: 'subtab-grid' });
    rules.forEach((r) => {
      let isChecked = r.active;
      const toggleBtn = h('button', {
        class: `btn ${isChecked ? 'btn--primary' : 'btn--secondary'} btn--sm`,
        type: 'button',
        style: isChecked ? 'background: #10B981;' : '',
        onClick: () => {
          isChecked = !isChecked;
          toggleBtn.textContent = isChecked ? 'Enabled ✓' : 'Disabled';
          toggleBtn.style.background = isChecked ? '#10B981' : '';
          toastSuccess(`Rule "${r.title}" ${isChecked ? 'Enabled' : 'Disabled'}`);
        }
      }, isChecked ? 'Enabled ✓' : 'Disabled');

      cards.append(h('div', { class: 'interactive-card' },
        h('div', { class: 'interactive-card__head' },
          h('h4', { class: 'interactive-card__title' }, r.title),
          toggleBtn
        ),
        h('p', { style: 'font-size: 12.5px; color: var(--text-muted); margin: 0; line-height: 1.45;' }, r.desc)
      ));
    });

    container.append(
      h('div', { class: 'split gap-3', style: 'align-items: center;' },
        h('h3', { style: 'font-size: 15px; font-weight: 700; margin: 0; color: var(--text);' }, `${mod.label} Policy Configuration`),
        h('button', { class: 'btn btn--primary btn--sm', type: 'button', style: 'background: #1E60FF;', onClick: () => toastSuccess('Rule builder dialog opened.') }, icon('sliders', { size: 14 }), 'Add Business Rule')
      ),
      cards
    );
    return container;
  }

  // Fallback for Reports / Analytics / Audit
  container.append(
    h('div', { class: 'interactive-card', style: 'text-align: center; padding: 48px;' },
      icon('bar-chart-2', { size: 36, style: 'color: #1E60FF; margin: 0 auto 12px;' }),
      h('h3', { style: 'font-size: 16px; font-weight: 700; margin: 0 0 6px;' }, `${tabName} Dashboard · ${mod.label}`),
      h('p', { style: 'color: var(--text-muted); font-size: 13px; max-width: 480px; margin: 0 auto 16px;' },
        `Comprehensive ${tabName.toLowerCase()} and operational KPIs are generated dynamically from live data simulation.`
      ),
      h('div', { class: 'cluster gap-2', style: 'justify-content: center;' },
        h('button', {
          class: 'btn btn--primary',
          type: 'button',
          style: 'background: #1E60FF;',
          onClick: () => toastSuccess(`Generating ${mod.label} ${tabName} report PDF…`)
        }, icon('download', { size: 15 }), `Export ${tabName} (PDF)`),
        h('button', {
          class: 'btn btn--secondary',
          type: 'button',
          onClick: () => toastSuccess(`Exporting raw ${mod.label} CSV data…`)
        }, icon('file-spreadsheet', { size: 15 }), 'Export CSV')
      )
    )
  );

  return container;
}
