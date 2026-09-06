const { test, expect } = require('@playwright/test');

test.describe('Pop the Bubble Game E2E Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Set mock learner auth session in sessionStorage
    await page.addInitScript(() => {
      window.sessionStorage.setItem('nesture-auth', JSON.stringify({
        state: {
          user: { id: 'mock-learner-id', email: 'maya@nesture.internal' },
          profile: { id: 'mock-learner-id', role: 'learner', first_name: 'Maya', learner_id: 'mock-child-id' },
          isInitializing: false,
        },
        version: 0,
      }));
    });
  });

  test('Should navigate to Pop the Bubble difficulty selection and start game', async ({ page }) => {
    await page.goto('/play/pop-bubble-difficulty');
    await page.locator('text=Authentification en cours').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

    // Assert difficulty header and level cards are visible
    await expect(page.locator('h1:has-text("Pop the Bubble")')).toBeVisible();
    await expect(page.locator('text=Facile')).toBeVisible();
    await expect(page.locator('text=Moyen')).toBeVisible();
    await expect(page.locator('text=Difficile')).toBeVisible();

    // Select Easy level
    await page.click('button:has-text("Commencer (Facile)")');

    // Assert URL and Game Page elements
    await expect(page).toHaveURL(/\/play\/pop-bubble-game\?difficulty=easy/);
    await expect(page.locator('h1:has-text("Pop the Bubble")')).toBeVisible();
    await expect(page.locator('text=Touche les bulles avec ton index.')).toBeVisible();

    // Assert score indicator is initialized to 0
    await expect(page.locator('text=0 / 10')).toBeVisible();

    // Assert Mute/Sound button is accessible and clickable
    const soundBtn = page.locator('button[aria-label*="son"]');
    await expect(soundBtn).toBeVisible();
    await soundBtn.click();
  });
});
