/**
 * Authentication fixtures for E2E tests
 */

export const TEST_USERS = {
  customer: {
    email: 'e2e-customer@trustbuild.test',
    password: 'TestPassword123!',
    name: 'E2E Test Customer',
    role: 'CUSTOMER',
  },
  contractor: {
    email: 'e2e-contractor@trustbuild.test',
    password: 'TestPassword123!',
    name: 'E2E Test Contractor',
    role: 'CONTRACTOR',
    businessName: 'E2E Contractor Ltd',
  },
  admin: {
    email: 'e2e-admin@trustbuild.test',
    password: 'AdminPassword123!',
    name: 'E2E Test Admin',
    role: 'ADMIN',
  },
};

export const TEST_JOBS = {
  plumbing: {
    title: 'Plumbing Repair - E2E Test',
    description: 'Fix leaking pipe in bathroom',
    budget: 500,
    category: 'Plumbing',
  },
  electrical: {
    title: 'Electrical Work - E2E Test',
    description: 'Install new outlets in kitchen',
    budget: 800,
    category: 'Electrical',
  },
};

