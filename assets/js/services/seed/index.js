/* Purpose: aggregates every seed generator into one object keyed by collection name. Phase modules add their own generators here. */
import { companies, branches, departments, designations, holidays, INDUSTRIES } from './org.js';
import { generateEmployees, generateUsers } from './people.js';
import { generateMisc } from './misc.js';

/** Generate the full deterministic demo dataset. */
export function generateSeed() {
  const employees = generateEmployees();
  return {
    companies, branches, departments, designations, holidays, industries: INDUSTRIES,
    employees, users: generateUsers(employees),
    ...generateMisc(),
  };
}
