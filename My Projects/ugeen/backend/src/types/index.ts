// ─── Backend Shared Types ───

export type AutomationStatus = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export type StepName =
  | 'login'
  | 'navigate'
  | 'intermediary'
  | 'download'
  | 'parse';

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'step';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  step?: StepName;
}

export interface AutomationRun {
  id: number;
  started_at: string;
  completed_at: string | null;
  status: AutomationStatus;
  activation_code: string | null;
  file_path: string | null;
  error_message: string | null;
  logs: string; // JSON stringified LogEntry[]
}

export interface AutomationState {
  status: AutomationStatus;
  currentStep: StepName | null;
  runId: number | null;
  logs: LogEntry[];
  lastCode: string | null;
}

export interface WSMessage {
  type: 'log' | 'status' | 'code' | 'error' | 'connected';
  payload: any;
}

export interface AppConfig {
  email: string;
  password: string;
  downloadPath: string;
  headless: boolean;
  port: number;
  databasePath: string;
}
