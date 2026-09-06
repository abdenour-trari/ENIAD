import { Page } from 'playwright';

/**
 * Smart Selector Strategies
 * Priority: text > role > aria-label > data-testid > xpath
 * Never use fragile CSS class selectors.
 */

/**
 * Button text patterns to look for on intermediary pages
 */
export const BUTTON_PATTERNS = [
  // English patterns
  'Continue',
  'Next',
  'Skip',
  'Get Link',
  'Create Link',
  'Download',
  'Generate',
  'Free Download',
  'Create Download Link',
  'Click here',
  'Go to',
  'Proceed',
  'Submit',
  // Arabic patterns
  'تحميل',
  'تنزيل',
  'التالي',
  'متابعة',
  'تحميل الكود',
  'تحميل كود التفعيل',
  'تسجيل الدخول',
  'طلب تحميل الرابط',
];

/**
 * Find a button or clickable element by text content
 * Uses robust selectors: text, role, then xpath
 */
export async function findButtonByText(
  page: Page,
  text: string,
  timeout = 10000
): Promise<any> {
  // Strategy 1: Playwright text selector (most reliable)
  try {
    const btn = page.getByRole('button', { name: text });
    if (await btn.count() > 0) {
      return btn.first();
    }
  } catch {}

  // Strategy 2: Link with text
  try {
    const link = page.getByRole('link', { name: text });
    if (await link.count() > 0) {
      return link.first();
    }
  } catch {}

  // Strategy 3: Any clickable element with exact text
  try {
    const el = page.locator(`text="${text}"`);
    if (await el.count() > 0) {
      return el.first();
    }
  } catch {}

  // Strategy 4: Partial text match
  try {
    const el = page.locator(`text=${text}`);
    if (await el.count() > 0) {
      return el.first();
    }
  } catch {}

  // Strategy 5: XPath with contains text
  try {
    const xpath = `//*[contains(text(), "${text}")]`;
    const el = page.locator(xpath);
    if (await el.count() > 0) {
      return el.first();
    }
  } catch {}

  return null;
}

/**
 * Find any clickable element matching the known button patterns
 */
export async function findActionButton(page: Page): Promise<{
  element: any;
  text: string;
} | null> {
  for (const pattern of BUTTON_PATTERNS) {
    const el = await findButtonByText(page, pattern);
    if (el) {
      try {
        const isVisible = await el.isVisible();
        if (isVisible) {
          return { element: el, text: pattern };
        }
      } catch {}
    }
  }
  return null;
}

/**
 * Find download trigger buttons specifically
 */
export const DOWNLOAD_PATTERNS = [
  'Free Download',
  'Create Download Link',
  'Download',
  'تحميل',
  'تنزيل',
  'Direct Download',
  'Download File',
  'Get Download Link',
];

export async function findDownloadButton(page: Page): Promise<{
  element: any;
  text: string;
} | null> {
  for (const pattern of DOWNLOAD_PATTERNS) {
    const el = await findButtonByText(page, pattern);
    if (el) {
      try {
        const isVisible = await el.isVisible();
        if (isVisible) {
          return { element: el, text: pattern };
        }
      } catch {}
    }
  }
  return null;
}
