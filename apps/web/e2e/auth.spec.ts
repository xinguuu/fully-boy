import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@xingu.com`,
    password: 'TestPassword123!',
    name: 'E2E Test User',
  };

  test('should complete signup flow', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Name (Optional)').fill(testUser.name);
    await page.getByLabel('Password').fill(testUser.password);

    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page).toHaveURL('/browse', { timeout: 10000 });
    await expect(page.getByText('둘러보기')).toBeVisible();
  });

  test('should complete login flow', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL('/browse', { timeout: 10000 });
    await expect(page.getByText('둘러보기')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email').fill('invalid@xingu.com');
    await page.getByLabel('Password').fill('WrongPassword123');

    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('should validate password length on signup', async ({ page }) => {
    await page.goto('/signup');

    await page.getByLabel('Email').fill('test@xingu.com');
    await page.getByLabel('Password').fill('short');

    await page.getByRole('button', { name: 'Sign Up' }).click();

    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
  });

  test('should navigate between login and signup', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();

    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  });
});
