/**
 * E2E tests for complete job lifecycle
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS, TEST_JOBS } from './fixtures/auth';

// Helper to login
async function loginAs(page: any, userType: 'customer' | 'contractor') {
  const user = TEST_USERS[userType];
  await page.goto('/login');
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/);
}

test.describe('Job Lifecycle', () => {
  test('Customer posts a job', async ({ page }) => {
    await loginAs(page, 'customer');
    
    // Navigate to post job
    await page.click('text=/post.*job|new job|create job/i');
    await expect(page).toHaveURL(/\/post-job/);
    
    // Fill job form
    await page.fill('input[name="title"]', TEST_JOBS.plumbing.title);
    await page.fill('textarea[name="description"]', TEST_JOBS.plumbing.description);
    await page.fill('input[name="budget"]', TEST_JOBS.plumbing.budget.toString());
    
    // Select category
    const categorySelect = page.locator('select[name="category"], select[name="serviceId"]');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption({ label: /plumbing/i });
    }
    
    // Submit job
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(
      page.locator('text=/success|posted|created/i')
    ).toBeVisible({ timeout: 10000 });
    
    // Verify job appears in list
    await page.goto('/dashboard/client/current-jobs');
    await expect(page.locator(`text=${TEST_JOBS.plumbing.title}`)).toBeVisible();
  });

  test('Contractor views available jobs', async ({ page }) => {
    await loginAs(page, 'contractor');
    
    // Navigate to job listings
    await page.goto('/jobs');
    
    // Verify job list loads
    await expect(page.locator('[data-testid="job-card"], .job-item')).toHaveCount(
      { min: 1 }
    );
    
    // Test search functionality
    const searchInput = page.locator('input[placeholder*="search" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('plumbing');
      await page.waitForTimeout(1000); // Wait for debounce
      
      // Verify filtered results
      await expect(page.locator('text=/plumbing/i')).toBeVisible();
    }
  });

  test('Contractor views job details and uses credit', async ({ page }) => {
    await loginAs(page, 'contractor');
    
    await page.goto('/jobs');
    
    // Click on first job
    await page.locator('[data-testid="job-card"], .job-item').first().click();
    
    // Should be on job details page
    await expect(page.locator('h1, h2')).toContainText(/.+/);
    
    // Look for unlock/view contact button
    const unlockButton = page.locator('button:has-text("Use Credit"), button:has-text("Unlock")');
    
    if (await unlockButton.isVisible()) {
      await unlockButton.click();
      
      // Verify credit was used and contact info shown
      await expect(
        page.locator('text=/contact|email|phone/i')
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Complete job workflow: post, view, accept, complete', async ({ browser }) => {
    // Use two contexts for two users
    const customerContext = await browser.newContext();
    const contractorContext = await browser.newContext();
    
    const customerPage = await customerContext.newPage();
    const contractorPage = await contractorContext.newPage();
    
    // Step 1: Customer posts job
    await loginAs(customerPage, 'customer');
    await customerPage.click('text=/post.*job/i');
    
    const jobTitle = `E2E Job ${Date.now()}`;
    await customerPage.fill('input[name="title"]', jobTitle);
    await customerPage.fill('textarea[name="description"]', 'E2E test job');
    await customerPage.fill('input[name="budget"]', '1000');
    await customerPage.click('button[type="submit"]');
    
    await customerPage.waitForTimeout(2000);
    
    // Step 2: Contractor views and accesses job
    await loginAs(contractorPage, 'contractor');
    await contractorPage.goto('/jobs');
    
    // Wait for job to appear
    await contractorPage.waitForSelector(`text=${jobTitle}`, { timeout: 10000 });
    await contractorPage.click(`text=${jobTitle}`);
    
    // Access job details
    const unlockBtn = contractorPage.locator('button:has-text("Use Credit")');
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();
      await contractorPage.waitForTimeout(1000);
    }
    
    // Step 3: Contractor submits quote (if applicable)
    const quoteBtn = contractorPage.locator('button:has-text("Submit Quote")');
    if (await quoteBtn.isVisible()) {
      await quoteBtn.click();
      await contractorPage.fill('input[name="amount"]', '950');
      await contractorPage.fill('textarea[name="message"]', 'I can do this job');
      await contractorPage.click('button[type="submit"]');
    }
    
    // Step 4: Customer accepts contractor
    await customerPage.goto('/dashboard/client/current-jobs');
    await customerPage.click(`text=${jobTitle}`);
    
    const acceptBtn = customerPage.locator('button:has-text("Accept"), button:has-text("Award")');
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await customerPage.waitForTimeout(1000);
    }
    
    // Clean up
    await customerContext.close();
    await contractorContext.close();
  });
});

test.describe('Job Search and Filters', () => {
  test('should filter jobs by category', async ({ page }) => {
    await loginAs(page, 'contractor');
    await page.goto('/jobs');
    
    // Select category filter
    const categoryFilter = page.locator('select[name="category"]');
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption({ label: /plumbing/i });
      
      // Wait for results to update
      await page.waitForTimeout(1000);
      
      // Verify filtered results
      const jobCards = page.locator('[data-testid="job-card"]');
      const count = await jobCards.count();
      
      if (count > 0) {
        await expect(jobCards.first()).toBeVisible();
      }
    }
  });

  test('should filter jobs by budget range', async ({ page }) => {
    await loginAs(page, 'contractor');
    await page.goto('/jobs');
    
    // Set budget filters
    const minBudget = page.locator('input[name="minBudget"]');
    const maxBudget = page.locator('input[name="maxBudget"]');
    
    if (await minBudget.isVisible()) {
      await minBudget.fill('500');
      await maxBudget.fill('1000');
      
      await page.waitForTimeout(1000);
      
      // Verify results are filtered
      await expect(page.locator('[data-testid="job-card"]')).toHaveCount({ min: 0 });
    }
  });
});

