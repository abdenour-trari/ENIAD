import { Page } from 'playwright';
import { StepContext } from '../types';
import { findButtonByText } from '../utils/selectors';
import { waitForPageStable } from '../utils/waiters';
import { retry, checkAbort } from '../utils/retryHelper';

/**
 * Step 1 — Login
 *
 * 1. Navigate to https://ugeen.live/index.html
 * 2. Click "تسجيل الدخول" (login button)
 * 3. Fill email and password
 * 4. Click Login
 * 5. Wait for redirect to dashboard.html
 * 6. Validate dashboard loaded
 */
export async function executeLoginStep(ctx: StepContext): Promise<void> {
  const { page, config } = ctx;
  const log = config.onLog;

  checkAbort(config.signal);
  config.onStepChange('login');

  await retry(
    async () => {
      // Navigate to login page
      log('step', 'Navigating to login page...', 'login');
      await page.goto('https://ugeen.live/index.html', {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      await waitForPageStable(page);
      log('info', 'Login page loaded', 'login');

      checkAbort(config.signal);

      // Click on "تسجيل الدخول" (Sign In) if it's a link/button on the landing page
      log('step', 'Looking for login button...', 'login');
      const loginLink = await findButtonByText(page, 'تسجيل الدخول');
      if (loginLink) {
        await loginLink.click();
        log('info', 'Clicked تسجيل الدخول', 'login');
        await page.waitForTimeout(2000);
        await waitForPageStable(page);
      }

      checkAbort(config.signal);

      // Fill email — try multiple strategies sequentially
      log('step', 'Filling credentials...', 'login');

      let emailFilled = false;
      const emailStrategies = [
        () => page.locator('input[placeholder*="email" i]').first(),
        () => page.locator('input[type="email"]').first(),
        () => page.locator('input[name*="email" i]').first(),
        () => page.locator('input[id*="email" i]').first(),
        () => page.getByPlaceholder('example@email.com'),
        () => page.locator('input[type="text"]').first(),
      ];

      for (const getLocator of emailStrategies) {
        try {
          const field = getLocator();
          await field.waitFor({ state: 'visible', timeout: 3000 });
          await field.click();
          await field.fill(config.email);
          emailFilled = true;
          log('info', 'Email filled', 'login');
          break;
        } catch {
          continue;
        }
      }

      if (!emailFilled) {
        throw new Error('Could not find email input field');
      }

      // Fill password — try multiple strategies sequentially
      let passwordFilled = false;
      const passwordStrategies = [
        () => page.locator('input[type="password"]').first(),
        () => page.locator('input[name*="password" i]').first(),
        () => page.locator('input[id*="password" i]').first(),
        () => page.locator('input[name*="pass" i]').first(),
      ];

      for (const getLocator of passwordStrategies) {
        try {
          const field = getLocator();
          await field.waitFor({ state: 'visible', timeout: 3000 });
          await field.click();
          await field.fill(config.password);
          passwordFilled = true;
          log('info', 'Password filled', 'login');
          break;
        } catch {
          continue;
        }
      }

      if (!passwordFilled) {
        throw new Error('Could not find password input field');
      }

      log('info', 'Credentials filled', 'login');

      checkAbort(config.signal);

      // Click submit button — "دخول" based on actual page
      log('step', 'Clicking login...', 'login');
      const submitTexts = ['دخول', 'تسجيل الدخول', 'Login', 'Sign In', 'تسجيل'];
      let submitted = false;

      for (const text of submitTexts) {
        const btn = await findButtonByText(page, text);
        if (btn) {
          try {
            await btn.click();
            submitted = true;
            log('info', `Clicked submit: "${text}"`, 'login');
            break;
          } catch {
            continue;
          }
        }
      }

      if (!submitted) {
        // Fallback: press Enter on password field
        log('warn', 'No submit button found, pressing Enter', 'login');
        await page.locator('input[type="password"]').first().press('Enter');
      }

      log('info', 'Login submitted', 'login');

      // Wait for redirect to dashboard
      log('step', 'Waiting for dashboard...', 'login');
      await page.waitForURL('**/dashboard**', { timeout: 30000 });
      await waitForPageStable(page);

      log('success', 'Dashboard loaded successfully', 'login');
    },
    log,
    { maxAttempts: 3, delayMs: 3000 }
  );
}
