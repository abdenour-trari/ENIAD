// ─── Automation Engine Types ───

export interface AutomationConfig {
  email: string;
  password: string;
  downloadPath: string;
  headless: boolean;
  signal: AbortSignal;
  onLog: (level: string, message: string, step?: string) => void;
  onStepChange: (step: string) => void;
}

export interface AutomationResult {
  activationCode: string;
  filePath: string;
}

export interface StepContext {
  config: AutomationConfig;
  page: import('playwright').Page;
  browser: import('playwright').Browser;
  context: import('playwright').BrowserContext;
}

export type LogFn = (level: string, message: string, step?: string) => void;
