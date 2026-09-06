import { chromium, Browser, BrowserContext, Page } from 'playwright';
import path from 'path';
import fs from 'fs';
import { AutomationConfig, AutomationResult, StepContext } from './types';
import { executeLoginStep } from './steps/loginStep';
import { executeNavigateStep } from './steps/navigateStep';
import { executeIntermediaryHandler } from './steps/intermediaryHandler';
import { executeDownloadStep } from './steps/downloadStep';
import { executeParseStep } from './steps/parseStep';
import { checkAbort } from './utils/retryHelper';

/**
 * Main Automation Engine
 *
 * Orchestrates the full 5-step workflow:
 * 1. Login → ugeen.live
 * 2. Navigate → renew page → trigger download
 * 3. Handle intermediary pages (timers, redirects, ads)
 * 4. Download the activation code file
 * 5. Parse and extract the code
 */
export async function runAutomation(config: AutomationConfig): Promise<AutomationResult> {
  const log = config.onLog;
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;

  try {
    log('step', '🚀 Starting Playwright browser...', 'login');

    // Ensure download directory exists
    const downloadPath = path.resolve(config.downloadPath);
    if (!fs.existsSync(downloadPath)) {
      fs.mkdirSync(downloadPath, { recursive: true });
    }

    // Launch Chromium
    browser = await chromium.launch({
      headless: config.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
      ],
    });

    // Create browser context with download path
    context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 1366, height: 768 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ar-SA',
    });

    // Create the main page
    const page: Page = await context.newPage();

    // Anti-detection: remove Playwright detection markers
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      // @ts-ignore
      delete navigator.__proto__.webdriver;
    });

    log('success', 'Browser launched', 'login');

    // Build step context
    const ctx: StepContext = {
      config,
      page,
      browser,
      context,
    };

    // ─── Step 1: Login ───
    checkAbort(config.signal);
    log('step', '━━━ Step 1: Login ━━━', 'login');
    await executeLoginStep(ctx);

    // ─── Step 2: Navigate ───
    checkAbort(config.signal);
    log('step', '━━━ Step 2: Navigate to Download ━━━', 'navigate');
    await executeNavigateStep(ctx);

    // ─── Step 3: Handle Intermediary Pages ───
    checkAbort(config.signal);
    log('step', '━━━ Step 3: Handling Intermediary Pages ━━━', 'intermediary');
    await executeIntermediaryHandler(ctx);

    // ─── Step 4: Download ───
    checkAbort(config.signal);
    log('step', '━━━ Step 4: Downloading File ━━━', 'download');
    const filePath = await executeDownloadStep(ctx);

    // ─── Step 5: Parse ───
    checkAbort(config.signal);
    log('step', '━━━ Step 5: Parsing Activation Code ━━━', 'parse');
    const activationCode = await executeParseStep(ctx, filePath);

    log('success', '🎉 Automation completed successfully!');

    return {
      activationCode,
      filePath,
    };
  } catch (error: any) {
    // Take a screenshot on error for debugging
    if (browser) {
      try {
        const pages = context?.pages() || [];
        if (pages.length > 0) {
          const screenshotPath = path.resolve(
            config.downloadPath,
            `error_screenshot_${Date.now()}.png`
          );
          await pages[pages.length - 1].screenshot({ path: screenshotPath, fullPage: true });
          log('info', `Error screenshot saved: ${screenshotPath}`);
        }
      } catch {
        // Screenshot failed, that's ok
      }
    }

    throw error;
  } finally {
    // Clean up browser
    if (context) {
      try {
        await context.close();
      } catch {}
    }
    if (browser) {
      try {
        await browser.close();
      } catch {}
    }
    log('info', 'Browser closed');
  }
}

// Allow direct execution for testing
if (require.main === module) {
  const dotenv = require('dotenv');
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });

  const controller = new AbortController();

  runAutomation({
    email: process.env.EMAIL || '',
    password: process.env.PASSWORD || '',
    downloadPath: path.resolve(__dirname, '../../downloads'),
    headless: process.env.HEADLESS === 'true',
    signal: controller.signal,
    onLog: (level, message, step) => {
      console.log(`[${level}]${step ? ` [${step}]` : ''} ${message}`);
    },
    onStepChange: (step) => {
      console.log(`\n>>> Step changed to: ${step}\n`);
    },
  })
    .then((result) => {
      console.log('\n✅ Result:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Error:', err.message);
      process.exit(1);
    });
}
