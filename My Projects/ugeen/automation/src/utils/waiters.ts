import { Page } from 'playwright';
import { LogFn } from '../types';

/**
 * Wait Utilities
 * Smart waiters for timers, countdowns, progress bars, and page stability.
 */

/**
 * Wait for a countdown timer to reach zero.
 * Searches for common timer patterns in the page.
 */
export async function waitForTimer(
  page: Page,
  log: LogFn,
  maxWait = 120000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    // Look for timer-like elements
    const timerValue = await page.evaluate(() => {
      // Strategy 1: Elements with timer/countdown classes or IDs
      const selectors = [
        '[id*="timer"]', '[id*="countdown"]', '[id*="count"]',
        '[class*="timer"]', '[class*="countdown"]', '[class*="count"]',
        '[id*="seconds"]', '[id*="wait"]',
        '.countdown', '.timer', '#timer', '#countdown',
      ];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          const text = (el as HTMLElement).innerText?.trim();
          if (text) {
            // Extract number from text
            const match = text.match(/(\d+)/);
            if (match) {
              return parseInt(match[1], 10);
            }
          }
        }
      }

      // Strategy 2: Scan all visible text for countdown patterns
      const allText = document.body.innerText;
      const patterns = [
        /wait\s*(\d+)/i,
        /(\d+)\s*second/i,
        /(\d+)\s*s\b/i,
        /timer.*?(\d+)/i,
        /countdown.*?(\d+)/i,
      ];

      for (const pattern of patterns) {
        const match = allText.match(pattern);
        if (match && parseInt(match[1]) > 0 && parseInt(match[1]) < 300) {
          return parseInt(match[1], 10);
        }
      }

      return -1; // No timer found
    });

    if (timerValue === -1) {
      // No timer detected, done
      return false;
    }

    if (timerValue <= 0) {
      log('success', 'Timer reached zero', 'intermediary');
      return true;
    }

    log('info', `Waiting ${timerValue}s for timer...`, 'intermediary');
    // Wait 1 second between checks
    await page.waitForTimeout(1000);
  }

  log('warn', 'Timer wait exceeded maximum time', 'intermediary');
  return false;
}

/**
 * Wait for a progress bar to reach 100%.
 */
export async function waitForProgress(
  page: Page,
  log: LogFn,
  maxWait = 120000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const progress = await page.evaluate(() => {
      // Strategy 1: HTML5 progress element
      const progressEl = document.querySelector('progress');
      if (progressEl) {
        return (progressEl.value / progressEl.max) * 100;
      }

      // Strategy 2: Progress bar with width style
      const bars = document.querySelectorAll(
        '[role="progressbar"], [class*="progress"], .progress-bar'
      );
      for (const bar of bars) {
        const width = (bar as HTMLElement).style.width;
        if (width) {
          const match = width.match(/(\d+)/);
          if (match) return parseInt(match[1], 10);
        }

        const ariaValue = bar.getAttribute('aria-valuenow');
        if (ariaValue) return parseInt(ariaValue, 10);
      }

      return -1;
    });

    if (progress === -1) return false;

    if (progress >= 100) {
      log('success', 'Progress bar reached 100%', 'intermediary');
      return true;
    }

    log('info', `Progress: ${Math.round(progress)}%`, 'intermediary');
    await page.waitForTimeout(500);
  }

  return false;
}

/**
 * Wait for a button to become enabled/clickable.
 */
export async function waitForButtonEnabled(
  page: Page,
  element: any,
  maxWait = 120000
): Promise<boolean> {
  try {
    await element.waitFor({ state: 'visible', timeout: maxWait });

    // Wait until not disabled
    const startTime = Date.now();
    while (Date.now() - startTime < maxWait) {
      const isDisabled = await element.isDisabled().catch(() => false);
      if (!isDisabled) return true;
      await page.waitForTimeout(500);
    }
  } catch {
    return false;
  }
  return false;
}

/**
 * Wait for the page to be fully loaded and stable.
 * Checks for network idle and DOM stability.
 */
export async function waitForPageStable(
  page: Page,
  timeout = 10000
): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Network idle timeout is acceptable, page may have long-lived connections
  }

  // Additional DOM stability check
  await page.waitForTimeout(500);
}

/**
 * Check if the current page has a timer or countdown.
 */
export async function hasTimer(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const selectors = [
      '[id*="timer"]', '[id*="countdown"]', '[id*="count"]',
      '[class*="timer"]', '[class*="countdown"]', '[class*="count"]',
      '.countdown', '.timer', '#timer', '#countdown',
    ];

    for (const selector of selectors) {
      if (document.querySelector(selector)) return true;
    }

    const text = document.body.innerText;
    return /wait\s*\d+/i.test(text) || /\d+\s*second/i.test(text);
  });
}

/**
 * Check if the current page has a progress bar.
 */
export async function hasProgress(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return !!(
      document.querySelector('progress') ||
      document.querySelector('[role="progressbar"]') ||
      document.querySelector('[class*="progress"]')
    );
  });
}
