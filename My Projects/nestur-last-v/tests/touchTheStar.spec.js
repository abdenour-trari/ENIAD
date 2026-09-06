const { test, expect } = require('@playwright/test');

test.describe('Touch the Star Game E2E Validation', () => {

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

  test('Should navigate to Touch the Star difficulty selection and start game', async ({ page }) => {
    await page.goto('/play/touch-star-difficulty');
    await page.locator('text=Authentification en cours').waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

    // Assert difficulty title & level cards
    await expect(page.locator('h1:has-text("Touch the Star")')).toBeVisible();
    await expect(page.locator('text=Facile')).toBeVisible();
    await expect(page.locator('text=Moyen')).toBeVisible();
    await expect(page.locator('text=Difficile')).toBeVisible();

    // Select Easy level
    await page.click('button:has-text("Commencer (Facile)")');

    // Assert URL and Game Page elements
    await expect(page).toHaveURL(/\/play\/touch-star-game\?difficulty=easy/);
    await expect(page.locator('span.tts-score-val')).toHaveText('0');
    await expect(page.locator('text=Touche l\'étoile aussi vite et précisément que possible.')).toBeVisible();

    // Assert Home pill button and Sound toggle
    const homeBtn = page.locator('button[aria-label*="Accueil"]');
    await expect(homeBtn).toBeVisible();

    const soundBtn = page.locator('button[aria-label*="son"]');
    await expect(soundBtn).toBeVisible();
    await soundBtn.click();
  });
});
