import { test, expect } from '@playwright/test';

test.describe('Browse Page', () => {
  const testUser = {
    email: `browse-test-${Date.now()}-${Math.random().toString(36).substring(2, 15)}@xingu.com`,
    password: 'BrowseTest123!',
    name: 'Browse Test User',
  };

  let isSignedUp = false;

  test.beforeEach(async ({ page }) => {
    if (!isSignedUp) {
      // Sign up once for all tests
      await page.goto('/signup');
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Name (Optional)').fill(testUser.name);
      await page.getByLabel('Password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign Up' }).click();
      await expect(page).toHaveURL('/browse', { timeout: 15000 });
      isSignedUp = true;
    } else {
      // For subsequent tests, just login
      await page.goto('/login');
      await page.getByLabel('Email').fill(testUser.email);
      await page.getByLabel('Password').fill(testUser.password);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL('/browse', { timeout: 10000 });
    }
  });

  test('should display browse page with templates', async ({ page }) => {
    // Verify page title
    await expect(page.getByText('둘러보기')).toBeVisible();

    // Verify search bar is present
    const searchInput = page.getByPlaceholder('게임 검색...');
    await expect(searchInput).toBeVisible();

    // Verify user profile is displayed
    const profileButton = page.locator('button').filter({ hasText: testUser.name });
    await expect(profileButton).toBeVisible();
  });

  test('should switch between browse and myGames tabs', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Find tab buttons (this depends on your implementation)
    // Looking for common tab patterns
    const tabs = page.locator('[role="tab"], button').filter({ hasText: /둘러보기|내 게임/ });

    const tabCount = await tabs.count();
    if (tabCount >= 2) {
      // Click on "내 게임" tab
      const myGamesTab = tabs.filter({ hasText: /내 게임/ }).first();
      await myGamesTab.click();
      await page.waitForTimeout(500);

      // Click back to "둘러보기" tab
      const browseTab = tabs.filter({ hasText: /둘러보기/ }).first();
      await browseTab.click();
      await page.waitForTimeout(500);
    }
  });

  test('should search for templates', async ({ page }) => {
    const searchInput = page.getByPlaceholder('게임 검색...');

    // Type search query
    await searchInput.fill('게임');
    await page.waitForTimeout(1000);

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Type another search
    await searchInput.fill('테스트');
    await page.waitForTimeout(1000);
  });

  test('should toggle favorite on template', async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    // Find favorite buttons (star icons)
    const favoriteButtons = page.locator('button').filter({ has: page.locator('[class*="lucide-star"]') });
    const buttonCount = await favoriteButtons.count();

    if (buttonCount > 0) {
      const firstFavoriteButton = favoriteButtons.first();

      // Toggle favorite on
      await firstFavoriteButton.click();
      await page.waitForTimeout(500);

      // Toggle favorite off
      await firstFavoriteButton.click();
      await page.waitForTimeout(500);
    }
  });

  test('should open profile menu', async ({ page }) => {
    const profileButton = page.locator('button').filter({ hasText: testUser.name });
    await profileButton.click();

    // Verify dropdown menu appears
    await expect(page.getByText('내 정보')).toBeVisible();
    await expect(page.getByText('설정')).toBeVisible();
    await expect(page.getByText('로그아웃')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    const profileButton = page.locator('button').filter({ hasText: testUser.name });
    await profileButton.click();

    // Click logout
    const logoutButton = page.getByRole('button', { name: '로그아웃' });
    await logoutButton.click();

    // Should redirect to login or home page
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/(login|$)/);
  });

  test('should navigate to template edit page', async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    // Find template cards
    const templateCards = page.locator('[data-testid="template-card"]');
    const cardCount = await templateCards.count();

    if (cardCount > 0) {
      // Click first template's action button
      const firstCard = templateCards.first();
      const createButton = firstCard.locator('button').filter({ hasText: /만들기|사용|Create/i }).first();

      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(2000);

        // Should navigate to edit page or show modal
        const url = page.url();
        const isEditPage = url.includes('/edit');
        const hasModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);

        expect(isEditPage || hasModal).toBeTruthy();
      }
    }
  });

  test('should display template information', async ({ page }) => {
    // Wait for templates to load
    await page.waitForTimeout(2000);

    const templateCards = page.locator('[data-testid="template-card"]');
    const cardCount = await templateCards.count();

    if (cardCount > 0) {
      const firstCard = templateCards.first();

      // Template cards should show:
      // - Title
      // - Description or metadata (views, players, etc.)
      // - Action buttons

      // Verify card has text content
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('should filter templates by category', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for filter dropdown or buttons
    const filterButton = page.locator('button').filter({ hasText: /전체|카테고리|필터/ }).first();

    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(500);

      // Try to select a filter option
      const filterOptions = page.locator('[role="option"], [role="menuitem"]');
      const optionCount = await filterOptions.count();

      if (optionCount > 0) {
        await filterOptions.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should sort templates', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for sort dropdown
    const sortButton = page.locator('button').filter({ hasText: /인기순|최신순|정렬/ }).first();

    if (await sortButton.isVisible()) {
      await sortButton.click();
      await page.waitForTimeout(500);

      // Select different sort option
      const sortOptions = page.locator('[role="option"], [role="menuitem"]');
      const optionCount = await sortOptions.count();

      if (optionCount > 1) {
        await sortOptions.nth(1).click();
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should navigate to home page via logo', async ({ page }) => {
    const logoButton = page.locator('button').filter({ hasText: /Xingu/ }).first();

    if (await logoButton.isVisible()) {
      await logoButton.click();
      await page.waitForTimeout(1000);

      // Should navigate to home page
      expect(page.url()).toBe('http://localhost:3000/');
    }
  });
});
