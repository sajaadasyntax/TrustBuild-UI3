/**
 * E2E tests for authentication flows
 */

import { test, expect } from '@playwright/test';
import { TEST_USERS } from './fixtures/auth';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Login|Sign In/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should login as customer successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in credentials
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/);
    
    // Verify dashboard elements
    await expect(page.locator('text=/dashboard|jobs|profile/i')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verify error message appears
    await expect(page.locator('text=/invalid|incorrect|wrong/i')).toBeVisible();
  });

  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/login');
    
    // Click register link
    await page.click('text=/sign up|register|create account/i');
    
    // Verify navigation
    await expect(page).toHaveURL(/\/register/);
    await expect(page.locator('input[name="name"]')).toBeVisible();
  });

  test('should require email and password', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit without filling fields
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should logout successfully', async ({ page, context }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USERS.customer.email);
    await page.fill('input[type="password"]', TEST_USERS.customer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/);
    
    // Click logout button
    await page.click('text=/logout|sign out/i');
    
    // Verify redirect to home or login
    await expect(page).toHaveURL(/\/(login)?$/);
    
    // Verify auth token is cleared
    const cookies = await context.cookies();
    const authCookie = cookies.find(c => c.name.includes('auth') || c.name.includes('token'));
    expect(authCookie).toBeFalsy();
  });
});

test.describe('Customer Registration', () => {
  test('should register new customer', async ({ page }) => {
    await page.goto('/register');
    
    const uniqueEmail = `customer-${Date.now()}@test.com`;
    
    // Fill registration form
    await page.fill('input[name="name"]', 'New Customer');
    await page.fill('input[type="email"]', uniqueEmail);
    await page.fill('input[type="password"]', 'Password123!');
    
    // Select customer role if needed
    const roleSelector = page.locator('select[name="role"], input[value="CUSTOMER"]');
    if (await roleSelector.isVisible()) {
      await roleSelector.click();
    }
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success (might show verification message or redirect)
    await expect(
      page.locator('text=/success|verify|check email|registered/i')
    ).toBeVisible({ timeout: 10000 });
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'weak');
    
    await page.click('button[type="submit"]');
    
    // Should show password strength error
    await expect(
      page.locator('text=/password.*strong|password.*8 characters/i')
    ).toBeVisible();
  });
});

test.describe('Contractor Registration', () => {
  test('should have additional fields for contractor', async ({ page }) => {
    await page.goto('/for-contractors');
    await page.click('text=/register|sign up/i');
    
    // Verify contractor-specific fields
    await expect(page.locator('input[name="businessName"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
  });
});

