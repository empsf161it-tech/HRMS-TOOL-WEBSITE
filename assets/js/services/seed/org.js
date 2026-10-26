/* Purpose: seed data for the organisation structure - companies, branches, departments, designations, holidays. */

export const INDUSTRIES = [
  { id: 'hospitality', label: 'Hotel / Hospitality', staff: 'Staff' },
  { id: 'manufacturing', label: 'Manufacturing', staff: 'Worker' },
  { id: 'retail', label: 'Retail', staff: 'Store staff' },
  { id: 'it', label: 'IT / Software', staff: 'Employee' },
  { id: 'education', label: 'College / University', staff: 'Faculty' },
  { id: 'construction', label: 'Construction', staff: 'Labour' },
  { id: 'healthcare', label: 'Hospital / Healthcare', staff: 'Clinical staff' },
  { id: 'logistics', label: 'Logistics', staff: 'Driver' },
];

export const companies = [
  { id: 'C1', name: 'Ellowring Technologies Pvt Ltd', short: 'Ellowring Tech', pan: 'AABCE1234F', gstin: '33AABCE1234F1Z5', pf: 'TNMAS0012345000', esi: '51000123450000999' },
  { id: 'C2', name: 'Ellowring Industries Ltd', short: 'Ellowring Industries', pan: 'AABCE5678G', gstin: '27AABCE5678G1Z2', pf: 'MHPUN0067890000', esi: '51000678900000999' },
  { id: 'C3', name: 'Ellowring Services Group', short: 'Ellowring Services', pan: 'AABCE9012H', gstin: '29AABCE9012H1Z8', pf: 'KABLR0090120000', esi: '51000901200000999' },
];

export const branches = [
  { id: 'B1', companyId: 'C1', name: 'Chennai HQ', city: 'Chennai', state: 'Tamil Nadu', industry: 'it', lat: 13.0067, lng: 80.2206, weight: 55 },
  { id: 'B2', companyId: 'C1', name: 'Bengaluru Medical Campus', city: 'Bengaluru', state: 'Karnataka', industry: 'healthcare', lat: 12.9716, lng: 77.5946, weight: 40 },
  { id: 'B3', companyId: 'C3', name: 'Mumbai Retail Hub', city: 'Mumbai', state: 'Maharashtra', industry: 'retail', lat: 19.076, lng: 72.8777, weight: 30 },
  { id: 'B4', companyId: 'C2', name: 'Delhi NCR Logistics Park', city: 'Gurugram', state: 'Haryana', industry: 'logistics', lat: 28.4595, lng: 77.0266, weight: 25 },
  { id: 'B5', companyId: 'C3', name: 'Hyderabad Projects Office', city: 'Hyderabad', state: 'Telangana', industry: 'construction', lat: 17.385, lng: 78.4867, weight: 25 },
  { id: 'B6', companyId: 'C2', name: 'Pune Manufacturing Plant', city: 'Pune', state: 'Maharashtra', industry: 'manufacturing', lat: 18.5204, lng: 73.8567, weight: 25 },
  { id: 'B7', companyId: 'C3', name: 'Kochi Harbour Hotel', city: 'Kochi', state: 'Kerala', industry: 'hospitality', lat: 9.9312, lng: 76.2673, weight: 20 },
  { id: 'B8', companyId: 'C3', name: 'Coimbatore Institute Campus', city: 'Coimbatore', state: 'Tamil Nadu', industry: 'education', lat: 11.0168, lng: 76.9558, weight: 19 },
];

/** 12 departments, each with its designations (40 in total). */
export const departmentDefs = [
  ['D1', 'Human Resources', ['HR Executive', 'HR Manager', 'Talent Acquisition Specialist', 'HR Business Partner']],
  ['D2', 'Finance', ['Accountant', 'Senior Accountant', 'Finance Manager', 'Payroll Specialist']],
  ['D3', 'Engineering', ['Software Engineer', 'Senior Software Engineer', 'Tech Lead', 'Engineering Manager']],
  ['D4', 'Operations', ['Operations Executive', 'Operations Manager', 'Shift Supervisor', 'Plant Supervisor']],
  ['D5', 'Sales', ['Sales Executive', 'Area Sales Manager', 'Key Account Manager']],
  ['D6', 'Marketing', ['Marketing Executive', 'Digital Marketing Manager', 'Content Strategist']],
  ['D7', 'IT Support', ['IT Support Engineer', 'System Administrator', 'Network Engineer']],
  ['D8', 'Customer Success', ['Customer Support Associate', 'Customer Success Manager', 'Support Team Lead']],
  ['D9', 'Legal & Compliance', ['Compliance Officer', 'Legal Associate', 'Company Secretary']],
  ['D10', 'Administration', ['Admin Executive', 'Facility Manager', 'Receptionist']],
  ['D11', 'Quality Assurance', ['QA Engineer', 'Senior QA Engineer', 'QA Lead']],
  ['D12', 'Procurement', ['Purchase Executive', 'Procurement Manager', 'Vendor Coordinator']],
];

export const departments = departmentDefs.map(([id, name]) => ({ id, name, code: name.split(/\W+/).map((w) => w[0]).join('').toUpperCase() }));

let dn = 0;
export const designations = departmentDefs.flatMap(([departmentId, , names]) => names.map((name, i) => ({
  id: `DS${++dn}`, name, departmentId, level: i + 1, isManager: /Manager|Lead|Head|Supervisor/.test(name),
})));

export const holidays = [
  ['2026-01-01', "New Year's Day"], ['2026-01-14', 'Pongal / Makar Sankranti'], ['2026-01-26', 'Republic Day'], ['2026-03-04', 'Holi'],
  ['2026-04-03', 'Good Friday'], ['2026-04-14', 'Tamil New Year / Ambedkar Jayanti'], ['2026-05-01', 'May Day'], ['2026-08-15', 'Independence Day'],
  ['2026-09-14', 'Ganesh Chaturthi'], ['2026-10-02', 'Gandhi Jayanti'], ['2026-10-20', 'Dussehra'], ['2026-11-08', 'Diwali'], ['2026-12-25', 'Christmas'],
].map(([date, name], i) => ({ id: `H${i + 1}`, date, name, type: 'National', locations: 'all' }));
