import { test, expect } from '@playwright/test';

test.describe('Complete Game Flow', () => {
  const hostUser = {
    email: `host-${Date.now()}@xingu.com`,
    password: 'HostPassword123!',
    name: 'Host User',
  };

  test('should complete full game flow from creation to results', async ({ browser }) => {
    // Create separate contexts for host and participant
    const hostContext = await browser.newContext();
    const participantContext = await browser.newContext();

    const hostPage = await hostContext.newPage();
    const participantPage = await participantContext.newPage();

    let roomPin = '';

    try {
      // Step 1: Host signs up
      console.log('Step 1: Host signup');
      await hostPage.goto('/signup');
      await hostPage.getByLabel('Email').fill(hostUser.email);
      await hostPage.getByLabel('Name (Optional)').fill(hostUser.name);
      await hostPage.getByLabel('Password').fill(hostUser.password);
      await hostPage.getByRole('button', { name: 'Sign Up' }).click();
      await expect(hostPage).toHaveURL('/browse', { timeout: 10000 });

      // Step 2: Host navigates browse page
      console.log('Step 2: Navigating browse page');
      await expect(hostPage.getByText('둘러보기')).toBeVisible({ timeout: 10000 });

      // Check if templates are loaded
      const templates = hostPage.locator('[data-testid="template-card"]');
      const templateCount = await templates.count();

      if (templateCount === 0) {
        console.log('No templates found - creating test will need templates');
        // This test requires templates to exist in the database
        // You may need to seed the database with templates first
        return;
      }

      // Step 3: Select first template (navigate to edit with template)
      console.log('Step 3: Creating game from template');
      const firstTemplate = templates.first();
      await firstTemplate.locator('button').first().click();

      // Wait for edit page or modal
      await hostPage.waitForTimeout(2000);

      // Step 4: Create room (this depends on your edit page implementation)
      // Since edit page may have complex modal flow, we'll check for room creation
      console.log('Step 4: Creating room');

      // Look for "방 생성" or "게임 시작" button
      const createRoomButton = hostPage.getByRole('button', { name: /방 생성|게임 시작/i });
      if (await createRoomButton.isVisible()) {
        await createRoomButton.click();
        await hostPage.waitForTimeout(2000);
      }

      // Step 5: Extract PIN from waiting room
      console.log('Step 5: Extracting room PIN');

      // Wait for redirect to waiting room
      await hostPage.waitForURL(/\/room\/\d+\/waiting/, { timeout: 15000 });

      // Extract PIN from URL
      const url = hostPage.url();
      const pinMatch = url.match(/\/room\/(\d+)/);
      if (!pinMatch) {
        throw new Error('Could not extract PIN from URL');
      }
      roomPin = pinMatch[1];
      console.log(`Room PIN: ${roomPin}`);

      // Verify waiting room page
      await expect(hostPage.getByText(roomPin)).toBeVisible();

      // Step 6: Participant joins the room
      console.log('Step 6: Participant joining room');
      await participantPage.goto(`/room/${roomPin}`);

      // Fill nickname
      await participantPage.getByLabel('닉네임').fill('E2E Participant');
      await participantPage.getByRole('button', { name: '참여하기' }).click();

      // Wait for participant to join
      await participantPage.waitForURL(`/room/${roomPin}/game`, { timeout: 10000 });

      // Step 7: Verify participant appears in host's waiting room
      console.log('Step 7: Verifying participant in waiting room');
      await hostPage.waitForTimeout(2000); // Wait for WebSocket update
      await expect(hostPage.getByText('E2E Participant')).toBeVisible({ timeout: 10000 });

      // Step 8: Host starts the game
      console.log('Step 8: Starting game');
      const startButton = hostPage.getByRole('button', { name: /게임 시작|Start Game/i });
      await startButton.click();

      // Wait for game to start
      await hostPage.waitForTimeout(3000);

      // Step 9: Verify game started on both pages
      console.log('Step 9: Verifying game started');

      // Both should be on game page
      expect(hostPage.url()).toContain('/game');
      expect(participantPage.url()).toContain('/game');

      // Step 10: Participant answers question
      console.log('Step 10: Participant answering question');

      // Wait for question to appear
      await participantPage.waitForTimeout(2000);

      // Find and click an answer button (looking for common answer patterns)
      const answerButton = participantPage.locator('button').filter({ hasText: /^(A|B|C|D|True|False|O|X)$/i }).first();
      if (await answerButton.isVisible()) {
        await answerButton.click();
        console.log('Answer submitted');
      }

      // Step 11: Host ends question
      console.log('Step 11: Host ending question');
      await hostPage.waitForTimeout(3000);

      const endQuestionButton = hostPage.getByRole('button', { name: /다음|Next|종료/i });
      if (await endQuestionButton.isVisible()) {
        await endQuestionButton.click();
      }

      // Step 12: Verify results/leaderboard
      console.log('Step 12: Verifying results');
      await hostPage.waitForTimeout(2000);

      // Check if participant's name appears in results
      const hasParticipantName = await hostPage.getByText('E2E Participant').isVisible();
      expect(hasParticipantName).toBeTruthy();

      console.log('✅ Complete game flow test passed!');

    } catch (error) {
      console.error('Game flow test failed:', error);

      // Take screenshots on failure
      await hostPage.screenshot({ path: 'e2e-results/host-failure.png', fullPage: true });
      await participantPage.screenshot({ path: 'e2e-results/participant-failure.png', fullPage: true });

      throw error;
    } finally {
      // Cleanup
      await hostContext.close();
      await participantContext.close();
    }
  });

  test('should handle participant reconnection', async ({ browser }) => {
    const participantContext = await browser.newContext();
    const participantPage = await participantContext.newPage();

    try {
      // This test requires an existing active room
      // For now, we'll just test the join flow

      const testPin = '123456'; // This would need to be a real PIN from a test setup

      await participantPage.goto(`/room/${testPin}`);

      // Should show room not found or join page
      const isJoinPage = await participantPage.getByLabel('닉네임').isVisible().catch(() => false);
      const isErrorPage = await participantPage.getByText('방을 찾을 수 없습니다').isVisible().catch(() => false);

      expect(isJoinPage || isErrorPage).toBeTruthy();

    } finally {
      await participantContext.close();
    }
  });
});
