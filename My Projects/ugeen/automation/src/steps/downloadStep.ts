import { Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { StepContext } from '../types';
import { findDownloadButton } from '../utils/selectors';
import { waitForPageStable } from '../utils/waiters';
import { retry, checkAbort } from '../utils/retryHelper';

/**
 * Step 4 — Download
 *
 * 1. Detect download trigger button (Free Download, Create Download Link, etc.)
 * 2. Handle the Playwright download event
 * 3. Save to ./downloads/activation_code_YYYYMMDD.txt
 */
export async function executeDownloadStep(ctx: StepContext): Promise<string> {
  const { page, config } = ctx;
  const log = config.onLog;

  checkAbort(config.signal);
  config.onStepChange('download');

  // Ensure download directory exists
  if (!fs.existsSync(config.downloadPath)) {
    fs.mkdirSync(config.downloadPath, { recursive: true });
  }

  return await retry(
    async () => {
      log('step', 'Preparing to download file...', 'download');

      // Generate filename with today's date
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const fileName = `activation_code_${dateStr}.txt`;
      const filePath = path.resolve(config.downloadPath, fileName);

      // Set up download listener BEFORE clicking
      const downloadPromise = page.waitForEvent('download', { timeout: 60000 });

      // Find and click the download button
      log('step', 'Looking for download button...', 'download');
      const downloadBtn = await findDownloadButton(page);

      if (downloadBtn) {
        log('info', `Found download button: "${downloadBtn.text}"`, 'download');
        await downloadBtn.element.scrollIntoViewIfNeeded();
        await downloadBtn.element.click();
        log('info', 'Download initiated', 'download');
      } else {
        // Try clicking any remaining action buttons
        const actionBtns = await page.locator('a[href*="download"], a[href*=".txt"], button:has-text("Download")').all();
        if (actionBtns.length > 0) {
          await actionBtns[0].click();
          log('info', 'Clicked download link', 'download');
        } else {
          throw new Error('No download button found on page');
        }
      }

      // Wait for download to start
      log('step', 'Waiting for download...', 'download');
      let download;
      try {
        download = await downloadPromise;
      } catch {
        // If download event wasn't caught, the file might have been opened in-page
        // Try to get text content from the page directly
        log('warn', 'No download event caught, checking page content...', 'download');
        const pageText = await page.evaluate(() => document.body.innerText);

        if (pageText && pageText.trim().length > 0 && pageText.trim().length < 500) {
          // Might be the activation code displayed directly
          fs.writeFileSync(filePath, pageText.trim(), 'utf-8');
          log('success', `Content saved to ${fileName}`, 'download');
          return filePath;
        }

        throw new Error('Download failed - no download event and no inline content');
      }

      // Save the downloaded file
      log('step', 'Saving downloaded file...', 'download');
      await download.saveAs(filePath);

      // Verify file exists and has content
      if (!fs.existsSync(filePath)) {
        throw new Error('Downloaded file not found on disk');
      }

      const stats = fs.statSync(filePath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      log('success', `File downloaded: ${fileName} (${stats.size} bytes)`, 'download');
      return filePath;
    },
    log,
    { maxAttempts: 3, delayMs: 5000 }
  );
}
