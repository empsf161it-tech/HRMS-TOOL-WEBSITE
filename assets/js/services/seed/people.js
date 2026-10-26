/* Purpose: seed generator for 240 employees (realistic Indian names, org hierarchy) and the 8 demo login users. */
import { createRng } from './rng.js';
import { branches, departments, designations } from './org.js';

const FIRST_F = ['Priya', 'Ananya', 'Divya', 'Lakshmi', 'Meena', 'Kavya', 'Deepa', 'Nisha', 'Swathi', 'Pooja', 'Shruti', 'Revathi', 'Aishwarya', 'Sneha', 'Fatima', 'Gayathri', 'Harini', 'Isha', 'Jyothi', 'Keerthana', 'Neha', 'Sangeetha', 'Tanvi', 'Vidya'];
const FIRST_M = ['Arun', 'Karthik', 'Rahul', 'Suresh', 'Vikram', 'Rajesh', 'Manoj', 'Sanjay', 'Naveen', 'Arjun', 'Ganesh', 'Imran', 'Harish', 'Prakash', 'Mohan', 'Sathish', 'Vignesh', 'Ravi', 'Dinesh', 'Faisal', 'Gopal', 'Hemanth', 'Kiran', 'Nitin'];
const LAST = ['Krishnan', 'Raman', 'Iyer', 'Nair', 'Reddy', 'Sharma', 'Patel', 'Menon', 'Pillai', 'Gupta', 'Singh', 'Kumar', 'Chandran', 'Rao', 'Joshi', 'Verma', 'Naidu', 'Desai', 'Banerjee', 'Khan', 'Subramanian', 'Mukherjee', 'Kulkarni', 'Varma', 'Shetty', 'Bhat', 'Thomas', 'Mathew', 'George', 'Ahmed'];
const TYPES = [['Full-Time', 78], ['Contract', 10], ['Intern', 5], ['Part-Time', 4], ['Temporary', 3]];
const CATS = { 1: 'Staff', 2: 'Executive', 3: 'Management', 4: 'Management' };
const pad = (n, l = 2) => String(n).padStart(l, '0');

/** Generate employees and demo users. */
export function generateEmployees() {
  const rng = createRng(777);
  const used = new Set();
  const people = [];
  const mk = (branch, desig, over = {}) => {
    const female = rng.chance(0.42);
    let name; do { name = `${rng.pick(female ? FIRST_F : FIRST_M)} ${rng.pick(LAST)}`; } while (used.has(name)); used.add(name);
    const [first, ...rest] = name.split(' ');
    const recent = rng.chance(0.06);
    const doj = new Date(Date.UTC(2026, 9, 20) - (recent ? rng.int(1, 20) : rng.int(20, 365 * 11)) * 86400000);
    const dob = new Date(Date.UTC(rng.int(1968, 2003), rng.int(0, 11), rng.int(1, 28)));
    const n = people.length + 1;
    const e = {
      id: `E${pad(n, 4)}`, code: `ELR-${pad(n, 4)}`, name, firstName: first, lastName: rest.join(' '),
      email: `${first}.${rest.join('').replace(/\s/g, '')}@ellowring.in`.toLowerCase(),
      phone: `+91 9${rng.int(1000, 9999)}${rng.int(10000, 99999)}`, gender: female ? 'Female' : 'Male',
      dob: dob.toISOString().slice(0, 10), doj: doj.toISOString().slice(0, 10),
      companyId: branch.companyId, branchId: branch.id, departmentId: desig.departmentId, designationId: desig.id,
      designation: desig.name, managerId: null,
      employmentType: rng.weighted(TYPES), category: CATS[desig.level] || 'Staff', status: 'Active',
      ctc: Math.round((250000 + desig.level * 380000 + rng.int(0, 400000)) / 1000) * 1000, location: branch.city, ...over,
    };
    if (e.employmentType === 'Intern') e.ctc = 180000 + rng.int(0, 120000);
    const ageDays = (Date.UTC(2026, 9, 22) - doj.getTime()) / 86400000;
    if (ageDays < 180) e.status = 'Probation'; else if (rng.chance(0.03)) e.status = 'Notice';
    people.push(e); return e;
  };
  const top = designations.find((d) => d.name === 'Engineering Manager');
  const ceo = mk(branches[0], top, { name: 'Vignesh Palanisamy', firstName: 'Vignesh', lastName: 'Palanisamy', email: 'vignesh.palanisamy@ellowring.in', designation: 'Admin', category: 'Management', employmentType: 'Full-Time', status: 'Active', gender: 'Male', doj: '2014-04-01', ctc: 9600000 });
  const mgrDesigs = designations.filter((d) => d.isManager);
  const staffDesigs = designations.filter((d) => !d.isManager);
  const deptStaff = (b) => {
    const pref = { it: ['D3', 'D11', 'D7', 'D1', 'D2', 'D8'], manufacturing: ['D4', 'D11', 'D12', 'D1', 'D2'], retail: ['D5', 'D6', 'D10', 'D8'], logistics: ['D4', 'D12', 'D8', 'D10'], education: ['D1', 'D10', 'D7', 'D2'], hospitality: ['D10', 'D4', 'D8', 'D5'], healthcare: ['D10', 'D1', 'D7', 'D2'], construction: ['D4', 'D12', 'D9', 'D2'] }[b.industry];
    return rng.chance(0.7) ? staffDesigs.filter((d) => pref.includes(d.departmentId)) : staffDesigs;
  };
  branches.forEach((b) => {
    const count = b.id === 'B1' ? b.weight - 1 : b.weight;
    const head = mk(b, rng.pick(mgrDesigs), { designation: `${b.industry === 'manufacturing' ? 'Plant' : 'Branch'} Head`, category: 'Management', employmentType: 'Full-Time', status: 'Active', managerId: ceo.id });
    const managers = Array.from({ length: 3 }, () => mk(b, rng.pick(mgrDesigs), { managerId: head.id, employmentType: 'Full-Time', status: 'Active' }));
    const pool = deptStaff(b);
    for (let i = 0; i < count - 4; i++) mk(b, rng.pick(pool), { managerId: rng.pick(managers).id });
  });
  return people;
}

/** Demo login users, one per role (password Demo@123). */
export function generateUsers(employees) {
  const chennai = employees.filter((e) => e.branchId === 'B1');
  const mgr = chennai.find((e) => e.managerId && employees.some((x) => x.managerId === e.id) && e.designation !== 'Branch Head');
  const emp = employees.find((e) => e.managerId === mgr.id);
  const hr = chennai.find((e) => e.departmentId === 'D1' && e.id !== mgr.id) || chennai[3];
  const pay = employees.find((e) => e.departmentId === 'D2' && e.branchId === 'B1') || chennai[4];
  const rec = employees.find((e) => e.departmentId === 'D1' && e.id !== hr.id) || chennai[5];
  const bhr = employees.find((e) => e.branchId === 'B6' && e.departmentId === 'D1') || employees.find((e) => e.branchId === 'B6');
  const adm = chennai[1];
  const u = (id, role, e, email, extra = {}) => ({ id, role, email, password: 'Demo@123', name: e.name, employeeId: e.id, branchId: e.branchId, companyId: e.companyId, twoFactor: false, locked: false, ...extra });
  return [
    u('U1', 'super_admin', employees[0], 'superadmin@ellowring.in', { avatar: 'assets/images/vignesh.jpg', roleLabel: 'Admin' }),
    u('U2', 'hr_admin', hr, 'hr@ellowring.in'),
    u('U3', 'branch_hr', bhr, 'branchhr@ellowring.in'),
    u('U4', 'payroll_admin', pay, 'payroll@ellowring.in'),
    u('U5', 'recruiter', rec, 'recruiter@ellowring.in'),
    u('U6', 'manager', mgr, 'manager@ellowring.in'),
    u('U7', 'employee', emp, 'employee@ellowring.in'),
    u('U8', 'site_admin', adm, 'siteadmin@ellowring.in'),
  ];
}
