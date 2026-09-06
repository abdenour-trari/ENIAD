import { Page } from 'playwright';
import { StepContext } from '../types';
import { findButtonByText } from '../utils/selectors';
import { waitForPageStable } from '../utils/waiters';
import { retry, checkAbort } from '../utils/retryHelper';

/**
 * Step 2 — Navigate to Download
 *
 * From the dashboard:
 * 1. Click "تحميل كود التفعيل" (Download activation code)
 * 2. Wait for renew.html
 * 3. Click "طلب تحميل الرابط" (Request download link)
 * 4. Wait for response
 * 5. Click "تحميل الكود" (Download code)
 */
export async function executeNavigateStep(ctx: StepContext): Promise<void> {
  const { page, config } = ctx;
  const log = config.onLog;

  checkAbort(config.signal);
  config.onStepChange('navigate');

  await retry(
    async () => {
      // Click "تحميل كود التفعيل"
      log('step', 'Looking for activation code download link...', 'navigate');

      const activationBtn = await findButtonByText(page, 'تحميل كود التفعيل');
      if (!activationBtn) {
        throw new Error('Could not find "تحميل كود التفعيل" button on dashboard');
      }

      await activationBtn.click();
      log('info', 'Clicked تحميل كود التفعيل', 'navigate');

      // Wait for renew.html
      log('step', 'Waiting for renew page...', 'navigate');
      await page.waitForURL('**/renew**', { timeout: 30000 });
      await waitForPageStable(page);
      log('info', 'Renew page loaded', 'navigate');

      checkAbort(config.signal);

      // Click "طلب تحميل الرابط"
      log('step', 'Looking for request download button...', 'navigate');
      const requestBtn = await findButtonByText(page, 'طلب الرابط');
      if (!requestBtn) {
        throw new Error('Could not find "طلب الرابط" button');
      }

      await requestBtn.click();
      log('info', 'Clicked طلب تحميل الرابط', 'navigate');

      // Wait for page to process
      await page.waitForTimeout(3000);
      await waitForPageStable(page);

      checkAbort(config.signal);

      // Click "تحميل الكود"
      log('step', 'Looking for download code button...', 'navigate');

      // Wait a bit for button to appear
      await page.waitForTimeout(2000);

      const downloadCodeBtn = await findButtonByText(page, 'تحميل الكود');
      if (!downloadCodeBtn) {
        throw new Error('Could not find "تحميل الكود" button');
      }

      await downloadCodeBtn.click();
      log('info', 'Clicked تحميل الكود', 'navigate');

      // Wait for the page to redirect to intermediary pages
      await page.waitForTimeout(3000);
      await waitForPageStable(page);

      log('success', 'Navigation step completed, entering intermediary pages', 'navigate');
    },
    log,
    { maxAttempts: 3, delayMs: 3000 }
  );
}
