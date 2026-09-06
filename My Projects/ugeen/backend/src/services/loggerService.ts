import WebSocket from 'ws';
import { LogEntry, LogLevel, StepName, WSMessage } from '../types';

/**
 * Logger Service
 * Handles structured logging with timestamps, broadcasts to WebSocket clients,
 * and maintains an in-memory log buffer for the current run.
 */
class LoggerService {
  private wsServer: WebSocket.Server | null = null;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  /**
   * Attach a WebSocket server for broadcasting logs
   */
  setWSServer(wss: WebSocket.Server): void {
    this.wsServer = wss;
  }

  /**
   * Get formatted timestamp string [HH:MM:SS]
   */
  private getTimestamp(): string {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  /**
   * Core logging method
   */
  log(level: LogLevel, message: string, step?: StepName): void {
    const entry: LogEntry = {
      timestamp: this.getTimestamp(),
      level,
      message,
      step,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with color
    const prefix = `[${entry.timestamp}]`;
    switch (level) {
      case 'error':
        console.error(`${prefix} ❌ ${message}`);
        break;
      case 'warn':
        console.warn(`${prefix} ⚠️  ${message}`);
        break;
      case 'success':
        console.log(`${prefix} ✅ ${message}`);
        break;
      case 'step':
        console.log(`${prefix} 🔄 ${message}`);
        break;
      default:
        console.log(`${prefix} ℹ️  ${message}`);
    }

    // Broadcast to WebSocket clients
    this.broadcast({ type: 'log', payload: entry });
  }

  info(message: string, step?: StepName): void {
    this.log('info', message, step);
  }

  warn(message: string, step?: StepName): void {
    this.log('warn', message, step);
  }

  error(message: string, step?: StepName): void {
    this.log('error', message, step);
  }

  success(message: string, step?: StepName): void {
    this.log('success', message, step);
  }

  step(message: string, step?: StepName): void {
    this.log('step', message, step);
  }

  /**
   * Broadcast a WebSocket message to all connected clients
   */
  broadcast(message: WSMessage): void {
    if (!this.wsServer) return;

    const data = JSON.stringify(message);
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Get all logs for the current session
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear the log buffer (e.g., at the start of a new run)
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const logger = new LoggerService();
export default logger;
