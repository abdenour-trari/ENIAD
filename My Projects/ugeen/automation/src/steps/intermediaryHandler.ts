import { Page, BrowserContext } from 'playwright';
import { StepContext } from '../types';
import { findActionButton, findDownloadButton } from '../utils/selectors';
import { waitForTimer, waitForProgress, hasTimer, hasProgress, waitForPageStable, waitForButtonEnabled } from '../utils/waiters';
import { checkAbort } from '../utils/retryHelper';

/**
 * Step 3 — Generic Intermediary Page Handler
 *
 * Handles multiple redirect/ad pages between the site and the final download.
 * At each page:
 * - Detect timers/countdowns → wait until 0
 * - Detect progress bars → wait until 100%
 * - Detect hidden/disabled buttons → scroll/wait
 * - Detect action buttons → click (Continue, Next, Skip, etc.)
 * - Handle popups, new tabs, and overlays
 *
 * Loops until we reach a download page or max iterations.
 */

const MAX_INTERMEDIARY_PAGES = 15;
const PAGE_TIMEOUT = 60000; // 60s per page

export async function executeIntermediaryHandler(ctx: StepContext): Promise<void> {
  const { page, config, context } = ctx;
  const log = config.onLog;

  checkAbort(config.signal);
  config.onStepChange('intermediary');

  let pageCount = 0;
  let previousUrl = page.url();

  for (let i = 0; i < MAX_INTERMEDIARY_PAGES; i++) {
    checkAbort(config.signal);

    const currentUrl = page.url();
    pageCount++;
    log('step', `Intermediary page ${pageCount}: ${truncateUrl(currentUrl)}`, 'intermediary');

    // Check if we've reached a final download page
    if (await isDownloadPage(page)) {
      log('success', 'Reached download page!', 'intermediary');
      return;
    }

    // Handle popups and overlays first
    await closePopups(page, log);

    // Handle new tabs
    await handleNewTabs(context, page, log);

    // Wait for page stability
    await waitForPageStable(page, 5000);

    // Phase 1: Handle timers/countdowns
    if (await hasTimer(page)) {
      log('info', 'Timer detected, waiting...', 'intermediary');
      await waitForTimer(page, log, PAGE_TIMEOUT);
      await page.waitForTimeout(1000);
    }

    // Phase 2: Handle progress bars
    if (await hasProgress(page)) {
      log('info', 'Progress bar detected, waiting...', 'intermediary');
      await waitForProgress(page, log, PAGE_TIMEOUT);
      await page.waitForTimeout(1000);
    }

    checkAbort(config.signal);

    // Phase 3: Look for action buttons
    let clicked = false;

    // First try download-specific buttons
    const downloadBtn = await findDownloadButton(page);
    if (downloadBtn) {
      log('info', `Found download button: "${downloadBtn.text}"`, 'intermediary');
      try {
        await downloadBtn.element.scrollIntoViewIfNeeded();
        await waitForButtonEnabled(page, downloadBtn.element, 5000);
        await downloadBtn.element.click();
        clicked = true;
        log('success', `Clicked: "${downloadBtn.text}"`, 'intermediary');
      } catch (err: any) {
        log('warn', `Failed to click download button: ${err.message}`, 'intermediary');
      }
    }

    // Then try general action buttons
    if (!clicked) {
      const actionBtn = await findActionButton(page);
      if (actionBtn) {
        log('info', `Found action button: "${actionBtn.text}"`, 'intermediary');
        try {
          await actionBtn.element.scrollIntoViewIfNeeded();
          await waitForButtonEnabled(page, actionBtn.element, 5000);
          await actionBtn.element.click();
          clicked = true;
          log('success', `Clicked: "${actionBtn.text}"`, 'intermediary');
        } catch (err: any) {
          log('warn', `Failed to click action button: ${err.message}`, 'intermediary');
        }
      }
    }

    // If no button found, try to find any clickable element
    if (!clicked) {
      clicked = await tryClickAnyLink(page, log);
    }

    if (!clicked) {
      log('warn', 'No action button found on this page', 'intermediary');
    }

    // Wait for navigation or page change
    await page.waitForTimeout(3000);

    // Check if URL changed
    const newUrl = page.url();
    if (newUrl === previousUrl && !clicked) {
      // Page didn't change and no click was made - might be stuck
      log('warn', 'Page seems stuck, waiting longer...', 'intermediary');
      await page.waitForTimeout(5000);

      // Try once more after waiting
      if (page.url() === previousUrl) {
        log('warn', 'Still on same page, trying to scroll and find buttons...', 'intermediary');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        const retryBtn = await findActionButton(page);
        if (retryBtn) {
          await retryBtn.element.scrollIntoViewIfNeeded();
          await retryBtn.element.click();
          log('info', `Clicked after scroll: "${retryBtn.text}"`, 'intermediary');
          await page.waitForTimeout(3000);
        }
      }
    }

    previousUrl = page.url();
    await waitForPageStable(page, 5000);
  }

  log('warn', `Processed ${MAX_INTERMEDIARY_PAGES} intermediary pages, proceeding to download step`, 'intermediary');
}

/**
 * Check if the current page is a final download page.
 */
async function isDownloadPage(page: Page): Promise<boolean> {
  const url = page.url().toLowerCase();

  // Check URL patterns
  if (url.includes('download') && !url.includes('redirect')) {
    return true;
  }

  // Check for download buttons
  const downloadBtn = await page.evaluate(() => {
    const buttons = document.querySelectorAll('a, button');
    for (const btn of buttons) {
      const text = (btn as HTMLElement).innerText?.toLowerCase() || '';
      const href = btn.getAttribute('href') || '';
      if (
        (text.includes('free download') || text.includes('direct download')) &&
        (href.includes('.txt') || href.includes('download'))
      ) {
        return true;
      }
    }
    return false;
  });

  return downloadBtn;
}

/**
 * Close overlay popups and ad modals.
 */
async function closePopups(page: Page, log: Function): Promise<void> {
  try {
    await page.evaluate(() => {
      // Close common overlay patterns
      const closeSelectors = [
        '[class*="close"]', '[id*="close"]',
        '[class*="dismiss"]', '[aria-label="Close"]',
        '.modal-close', '.popup-close',
        'button[class*="close"]',
      ];

      for (const selector of closeSelectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const style = window.getComputedStyle(el);
          if (style.display !== 'none' && style.visibility !== 'hidden') {
            (el as HTMLElement).click();
          }
        }
      }

      // Remove fixed overlays
      const overlays = document.querySelectorAll(
        '[class*="overlay"], [class*="modal"], [class*="popup"], [id*="overlay"]'
      );
      for (const overlay of overlays) {
        const style = window.getComputedStyle(overlay);
        if (style.position === 'fixed' || style.position === 'absolute') {
          (overlay as HTMLElement).style.display = 'none';
        }
      }
    });
  } catch {
    // Popup closing is best-effort
  }
}

/**
 * Handle new tabs that might open from link clicks.
 */
async function handleNewTabs(
  context: BrowserContext,
  currentPage: Page,
  log: Function
): Promise<void> {
  const pages = context.pages();
  if (pages.length > 1) {
    // Find the newest page
    const newestPage = pages[pages.length - 1];
    if (newestPage !== currentPage) {
      log('info', 'New tab detected, switching...', 'intermediary');
      await newestPage.bringToFront();

      // Close the old page if it's not the original
      // Keep at most 2 pages
      while (context.pages().length > 2) {
        const oldPages = context.pages();
        await oldPages[0].close();
      }
    }
  }
}

/**
 * Try to find and click any link that might lead to the next step.
 */
async function tryClickAnyLink(page: Page, log: Function): Promise<boolean> {
  try {
    const clickable = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href]');
      for (const link of links) {
        const href = link.getAttribute('href') || '';
        const text = (link as HTMLElement).innerText?.trim() || '';
        if (
          href &&
          !href.startsWith('#') &&
          !href.includes('javascript:void') &&
          text.length > 0 &&
          text.length < 50
        ) {
          const style = window.getComputedStyle(link);
          if (
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            parseInt(style.width) > 0
          ) {
            return { text, found: true };
          }
        }
      }
      return { text: '', found: false };
    });

    if (clickable.found && clickable.text) {
      const link = page.locator(`a:has-text("${clickable.text}")`).first();
      if (await link.isVisible()) {
        await link.click();
        log('info', `Clicked link: "${clickable.text}"`, 'intermediary');
        return true;
      }
    }
  } catch {}

  return false;
}

/**
 * Truncate a URL for display in logs.
 */
function truncateUrl(url: string): string {
  if (url.length > 60) {
    return url.substring(0, 57) + '...';
  }
  return url;
}
