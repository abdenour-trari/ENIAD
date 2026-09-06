// ─── Frontend Shared Types ───

export type AutomationStatus = 'idle' | 'running' | 'success' | 'error' | 'cancelled';

export type StepName = 'login' | 'navigate' | 'intermediary' | 'download' | 'parse';

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
  logs: string;
}

export interface StatusPayload {
  status: AutomationStatus;
  currentStep: StepName | null;
  runId: number | null;
  lastCode: string | null;
}

export interface CodePayload {
  code: string;
  filePath: string;
  date: string;
}

export interface WSMessage {
  type: 'log' | 'status' | 'code' | 'error' | 'connected';
  payload: any;
}
